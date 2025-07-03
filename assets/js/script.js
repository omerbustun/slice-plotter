let map;
let points = [];
let markers = [];
let contextMenuLatLng = null;
let pathLine = null;
let currentSliceData = null;
let touchTimer = null;
let isMobile = window.innerWidth <= 768;

function initMap() {
    map = L.map('map').setView([39.0, 35.0], 6);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    map.on('contextmenu', function(e) {
        contextMenuLatLng = e.latlng;
        
        const mapContainer = map.getContainer();
        const mapRect = mapContainer.getBoundingClientRect();
        
        const x = e.containerPoint.x + mapRect.left + window.scrollX;
        const y = e.containerPoint.y + mapRect.top + window.scrollY;
        
        showContextMenu(x, y);
        
        e.originalEvent.preventDefault();
    });

    if (isMobile) {
        let touchStartTime;
        let touchStartPos;
        
        map.on('touchstart', function(e) {
            touchStartTime = Date.now();
            touchStartPos = e.latlng;
            
            touchTimer = setTimeout(function() {
                if (touchStartPos) {
                    contextMenuLatLng = touchStartPos;
                    
                    const mapContainer = map.getContainer();
                    const mapRect = mapContainer.getBoundingClientRect();
                    
                    const x = window.innerWidth / 2;
                    const y = window.innerHeight / 2;
                    
                    showContextMenu(x, y);
                    
                    if (navigator.vibrate) {
                        navigator.vibrate(50);
                    }
                }
            }, 800);
        });
        
        map.on('touchend touchmove', function() {
            if (touchTimer) {
                clearTimeout(touchTimer);
                touchTimer = null;
            }
            touchStartPos = null;
        });
    }

    map.on('click', function() {
        hideContextMenu();
    });
    
    document.addEventListener('click', function(e) {
        const contextMenu = document.getElementById('contextMenu');
        if (!contextMenu.contains(e.target) && contextMenu.style.display !== 'none') {
            hideContextMenu();
        }
    });
    
    document.getElementById('contextMenu').addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    window.addEventListener('resize', function() {
        isMobile = window.innerWidth <= 768;
    });
}

function showContextMenu(x, y) {
    const contextMenu = document.getElementById('contextMenu');
    contextMenu.style.display = 'block';
    
    const menuWidth = contextMenu.offsetWidth;
    const menuHeight = contextMenu.offsetHeight;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    if (x + menuWidth > windowWidth) {
        x = windowWidth - menuWidth - 10;
    }
    if (y + menuHeight > windowHeight) {
        y = windowHeight - menuHeight - 10;
    }
    
    contextMenu.style.left = x + 'px';
    contextMenu.style.top = y + 'px';
}

function hideContextMenu() {
    document.getElementById('contextMenu').style.display = 'none';
}

function addPointAtLocation() {
    if (contextMenuLatLng) {
        addPoint(contextMenuLatLng.lat, contextMenuLatLng.lng);
        hideContextMenu();
    }
}

function addPoint(lat, lng) {
    const pointId = Date.now();
    const point = {
        id: pointId,
        lat: lat,
        lng: lng,
        antennaHeight: 0,
        name: `Nokta ${points.length + 1}`
    };
    
    points.push(point);
    
    const marker = L.marker([lat, lng]).addTo(map);
    marker.bindPopup(`${point.name}<br>Enlem: ${lat.toFixed(6)}<br>Boylam: ${lng.toFixed(6)}`);
    markers.push(marker);
    
    updatePointsList();
    updateShowSliceButton();
    updateStatus();
}

function removePoint(pointId) {
    const index = points.findIndex(p => p.id === pointId);
    if (index !== -1) {
        points.splice(index, 1);
        map.removeLayer(markers[index]);
        markers.splice(index, 1);
        
        points.forEach((point, i) => {
            point.name = `Nokta ${i + 1}`;
        });
        
        updatePointsList();
        updateShowSliceButton();
        updateStatus();
        updatePathLine();
    }
}

function updateAntennaHeight(pointId, height) {
    const point = points.find(p => p.id === pointId);
    if (point) {
        point.antennaHeight = parseFloat(height) || 0;
    }
}

function updatePointsList() {
    const pointsList = document.getElementById('pointsList');
    const pointCount = document.getElementById('pointCount');
    
    pointCount.textContent = points.length;
    
    pointsList.innerHTML = points.map(point => `
        <div class="point-item">
            <div class="point-header">
                <span class="point-title">${point.name}</span>
                <button class="btn btn-danger" onclick="removePoint(${point.id})" style="padding: 5px 10px; font-size: 12px;">✕</button>
            </div>
            <div class="point-coords">
                Enlem: ${point.lat.toFixed(6)}<br>
                Boylam: ${point.lng.toFixed(6)}
            </div>
            <div class="antenna-input">
                <label>Anten Yüksekliği:</label>
                <input type="number" value="${point.antennaHeight}" 
                       onchange="updateAntennaHeight(${point.id}, this.value)" 
                       min="0" max="1000"> m
            </div>
        </div>
    `).join('');
}

function updateShowSliceButton() {
    const showSliceBtn = document.getElementById('showSliceBtn');
    showSliceBtn.disabled = points.length < 2;
}

function updateStatus() {
    const status = document.getElementById('status');
    if (points.length === 0) {
        status.textContent = 'Nokta eklemek için haritaya sağ tıklayın (mobilde uzun basın)';
    } else if (points.length === 1) {
        status.textContent = 'Kesit göstermek için en az bir nokta daha ekleyin';
    } else {
        status.textContent = `${points.length} nokta eklendi - kesit göstermeye hazır`;
    }
}

function updatePathLine() {
    if (pathLine) {
        map.removeLayer(pathLine);
    }
    
    if (points.length >= 2) {
        const latlngs = points.map(p => [p.lat, p.lng]);
        pathLine = L.polyline(latlngs, {color: 'red', weight: 3}).addTo(map);
    }
}

async function showSlice() {
    if (points.length < 2) return;
    
    const showSliceBtn = document.getElementById('showSliceBtn');
    document.getElementById('status').textContent = 'Yükseklik verileri yükleniyor...';
    showSliceBtn.disabled = true;
    showSliceBtn.classList.add('loading');
    document.getElementById('btnText').style.display = 'none';
    document.getElementById('btnLoader').style.display = 'inline';
    
    updatePathLine();
    
    try {
        const elevationData = await getRealElevationData();
        currentSliceData = elevationData;
        
        document.getElementById('sliceModal').style.display = 'block';
        
        drawElevationChart(
            elevationData.smoothDistances, 
            elevationData.smoothElevations, 
            elevationData.pointDistances, 
            elevationData.pointElevations, 
            elevationData.antennaHeights,
            'elevationChartModal'
        );
        
        document.getElementById('sliceInfoModal').innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div style="padding: 15px; background: #f8f9fa; border-radius: 5px;">
                    <h4 style="margin: 0 0 10px 0;">Yol Bilgileri</h4>
                    <p><strong>Toplam Mesafe:</strong> ${elevationData.totalDistance.toFixed(2)} km</p>
                    <p><strong>Nokta Sayısı:</strong> ${points.length}</p>
                    <p><strong>Veri Kaynağı:</strong> <span class="success-indicator">Open Elevation API</span></p>
                </div>
                <div style="padding: 15px; background: #f8f9fa; border-radius: 5px;">
                    <h4 style="margin: 0 0 10px 0;">Yükseklik İstatistikleri</h4>
                    <p><strong>Maksimum Yükseklik:</strong> ${Math.max(...elevationData.smoothElevations).toFixed(0)} m</p>
                    <p><strong>Minimum Yükseklik:</strong> ${Math.min(...elevationData.smoothElevations).toFixed(0)} m</p>
                    <p><strong>Yükseklik Aralığı:</strong> ${(Math.max(...elevationData.smoothElevations) - Math.min(...elevationData.smoothElevations)).toFixed(0)} m</p>
                </div>
            </div>
        `;
        
        document.getElementById('sliceStats').innerHTML = `
            <div style="font-size: 0.9em; color: #666;">
                ${new Date().toLocaleString('tr-TR')} tarihinde oluşturuldu | 
                Kesit Çizdirici
            </div>
        `;
        
        document.getElementById('status').textContent = 'Yükseklik profili başarıyla yüklendi';
        
    } catch (error) {
        console.error('Yükseklik verileri yüklenirken hata:', error);
        document.getElementById('status').textContent = 'Yükseklik verileri yüklenemedi - internet bağlantısını kontrol edin';
    }
    
    showSliceBtn.disabled = false;
    showSliceBtn.classList.remove('loading');
    document.getElementById('btnText').style.display = 'inline';
    document.getElementById('btnLoader').style.display = 'none';
}

function closeSliceModal() {
    document.getElementById('sliceModal').style.display = 'none';
}

function clearAll() {
    points = [];
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    if (pathLine) {
        map.removeLayer(pathLine);
        pathLine = null;
    }
    
    updatePointsList();
    updateShowSliceButton();
    updateStatus();
    closeSliceModal();
    currentSliceData = null;
}

window.onload = function() {
    initMap();
    
    document.getElementById('sliceModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeSliceModal();
        }
    });
};
