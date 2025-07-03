function drawElevationChart(distances, elevations, pointDistances, pointElevations, antennaHeights, targetElementId = 'elevationChart') {
    const chart = document.getElementById(targetElementId);
    chart.innerHTML = '';
    
    const width = chart.offsetWidth;
    const height = chart.offsetHeight;
    const padding = 40;
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.style.position = 'absolute';
    svg.style.top = '0';
    svg.style.left = '0';
    
    const maxDistance = Math.max(...distances);
    const maxElevation = Math.max(...elevations) + 100;
    const minElevation = Math.min(...elevations) - 50;
    
    let pathData = `M ${padding} ${height - padding}`;
    
    distances.forEach((distance, i) => {
        const x = padding + (distance / maxDistance) * (width - 2 * padding);
        const y = height - padding - ((elevations[i] - minElevation) / (maxElevation - minElevation)) * (height - 2 * padding);
        pathData += ` L ${x} ${y}`;
    });
    
    pathData += ` L ${width - padding} ${height - padding} Z`;
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    path.setAttribute('fill', 'rgba(139, 188, 143, 0.7)');
    path.setAttribute('stroke', '#2E7D32');
    path.setAttribute('stroke-width', 2);
    svg.appendChild(path);
    
    pointDistances.forEach((distance, i) => {
        const x = padding + (distance / maxDistance) * (width - 2 * padding);
        const groundY = height - padding - ((pointElevations[i] - minElevation) / (maxElevation - minElevation)) * (height - 2 * padding);
        const antennaY = height - padding - ((pointElevations[i] + antennaHeights[i] - minElevation) / (maxElevation - minElevation)) * (height - 2 * padding);
        
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x);
        line.setAttribute('y1', groundY);
        line.setAttribute('x2', x);
        line.setAttribute('y2', antennaY);
        line.setAttribute('stroke', '#FF5722');
        line.setAttribute('stroke-width', 3);
        svg.appendChild(line);
        
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', antennaY);
        circle.setAttribute('r', 5);
        circle.setAttribute('fill', '#FF5722');
        circle.setAttribute('stroke', 'white');
        circle.setAttribute('stroke-width', 2);
        svg.appendChild(circle);
        
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x);
        text.setAttribute('y', antennaY - 10);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-size', '12');
        text.setAttribute('fill', '#333');
        text.textContent = `N${i + 1}`;
        svg.appendChild(text);
    });
    
    chart.appendChild(svg);
}

function saveSliceAsImage() {
    if (!currentSliceData) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#667eea';
    ctx.fillRect(0, 0, canvas.width, 80);
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Kesit Çizdirici Yükseklik Profili', canvas.width / 2, 35);
    
    ctx.font = '16px Arial';
    ctx.fillText(`${new Date().toLocaleString('tr-TR')} tarihinde oluşturuldu`, canvas.width / 2, 60);
    
    const chartX = 50;
    const chartY = 100;
    const chartWidth = canvas.width - 100;
    const chartHeight = 400;
    
    drawElevationToCanvas(ctx, chartX, chartY, chartWidth, chartHeight, currentSliceData);
    
    const infoY = chartY + chartHeight + 30;
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(50, infoY, canvas.width - 100, 200);
    
    ctx.fillStyle = '#333';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Yol Bilgileri', 80, infoY + 30);
    
    ctx.font = '14px Arial';
    ctx.fillText(`Toplam Mesafe: ${currentSliceData.totalDistance.toFixed(2)} km`, 80, infoY + 60);
    ctx.fillText(`Nokta Sayısı: ${points.length}`, 80, infoY + 85);
    ctx.fillText(`Maks. Yükseklik: ${Math.max(...currentSliceData.smoothElevations).toFixed(0)} m`, 80, infoY + 110);
    ctx.fillText(`Min. Yükseklik: ${Math.min(...currentSliceData.smoothElevations).toFixed(0)} m`, 80, infoY + 135);
    
    ctx.fillText('Nokta Detayları:', 600, infoY + 30);
    points.forEach((point, i) => {
        ctx.fillText(`${point.name}: ${point.lat.toFixed(6)}, ${point.lng.toFixed(6)} (${point.antennaHeight}m)`, 600, infoY + 60 + (i * 20));
    });
    
    const link = document.createElement('a');
    link.download = `yukseklik_kesit_${new Date().toISOString().split('T')[0]}.png`;
    link.href = canvas.toDataURL();
    link.click();
}

function drawElevationToCanvas(ctx, x, y, width, height, data) {
    const padding = 40;
    const plotWidth = width - 2 * padding;
    const plotHeight = height - 2 * padding;
    
    const maxDistance = Math.max(...data.smoothDistances);
    const maxElevation = Math.max(...data.smoothElevations) + 100;
    const minElevation = Math.min(...data.smoothElevations) - 50;
    
    const gradient = ctx.createLinearGradient(0, y, 0, y + height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.7, '#98FB98');
    gradient.addColorStop(1, '#8FBC8F');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(x + padding, y + padding, plotWidth, plotHeight);
    
    ctx.beginPath();
    ctx.moveTo(x + padding, y + height - padding);
    
    data.smoothDistances.forEach((distance, i) => {
        const plotX = x + padding + (distance / maxDistance) * plotWidth;
        const plotY = y + height - padding - ((data.smoothElevations[i] - minElevation) / (maxElevation - minElevation)) * plotHeight;
        ctx.lineTo(plotX, plotY);
    });
    
    ctx.lineTo(x + width - padding, y + height - padding);
    ctx.closePath();
    ctx.fillStyle = 'rgba(139, 188, 143, 0.7)';
    ctx.fill();
    ctx.strokeStyle = '#2E7D32';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    data.pointDistances.forEach((distance, i) => {
        const plotX = x + padding + (distance / maxDistance) * plotWidth;
        const groundY = y + height - padding - ((data.pointElevations[i] - minElevation) / (maxElevation - minElevation)) * plotHeight;
        const antennaY = y + height - padding - ((data.pointElevations[i] + data.antennaHeights[i] - minElevation) / (maxElevation - minElevation)) * plotHeight;
        
        ctx.beginPath();
        ctx.moveTo(plotX, groundY);
        ctx.lineTo(plotX, antennaY);
        ctx.strokeStyle = '#FF5722';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(plotX, antennaY, 6, 0, 2 * Math.PI);
        ctx.fillStyle = '#FF5722';
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`N${i + 1}`, plotX, antennaY - 10);
    });
    
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + padding, y + padding);
    ctx.lineTo(x + padding, y + height - padding);
    ctx.lineTo(x + width - padding, y + height - padding);
    ctx.stroke();
    
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Mesafe (km)', x + width / 2, y + height - 10);
    
    ctx.save();
    ctx.translate(x + 15, y + height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Yükseklik (m)', 0, 0);
    ctx.restore();
}
