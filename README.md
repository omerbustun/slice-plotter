# Kesit Çizdirici

RF propagasyon analizinde kullanmak üzere konumlar arası yükseklik kesitlerini çizen web tabanlı araç.

## Özellikler

- 🗺️ Etkileşimli harita
- � Mobil uyumlu tasarım (dokunmatik destekli)
- �📍 Nokta eklemek için haritaya sağ tıklayın (masaüstü) veya uzun basın (mobil)
- 🏔️ Küresel arazi veritabanından gerçek yükseklik verileri
- 📊 Detaylı yükseklik profili görselleştirmesi
- 📈 Her nokta için anten yüksekliği konfigürasyonu
- 💾 Yükseklik profillerini resim olarak dışa aktarma

## Erişim Yolları

### 🌐 Canlı Sürüm (Önerilen)

[kesit.ustun.io](https://kesit.ustun.io) - Barındırılan sürümü kullanın

### 📥 Yerel Kullanım

Projeyi indirin ve `index.html` dosyasını tarayıcınızda açın

### 🐳 Docker ile Barındırma

Kendi sunucunuzda çalıştırmak için Docker kullanın (aşağıya bakın)

## Kullanım

1. **Nokta Ekleme**:
   - **Masaüstü**: Nokta eklemek için haritaya sağ tıklayın
   - **Mobil**: Nokta eklemek için haritada istediğiniz yere uzun basın (0.8 saniye)
2. **Anten Yükseklikleri**: Kenar çubuğunda her nokta için anten yüksekliği ayarlayın
3. **Profil Görüntüleme**: Yükseklik profili oluşturmak için "Kesit Göster"e tıklayın (en az 2 nokta gerekir)
4. **Dışa Aktarma**: Yükseklik profilini resim olarak kaydedin

## Docker ile Çalıştırma

### Docker Compose ile (Önerilen)

```bash
docker-compose up -d
```

Uygulama `http://localhost:8080` adresinde erişilebilir olacak.

### Manuel Docker ile

```bash
# İmaj oluştur
docker build -t slice-plotter .

# Konteyner çalıştır
docker run -d -p 8080:80 --name slice-plotter slice-plotter
```

## Teknik Detaylar

- **Yükseklik Verileri**: Gerçek arazi verileri için Open Elevation API kullanır
- **Harita**: Leaflet ve OpenStreetMap ile güçlendirilmiştir
- **Grafikler**: Özel SVG tabanlı yükseklik grafikleri
- **Mobil Destek**: Responsive tasarım ve dokunmatik etkileşim
- **Docker**: Nginx Alpine tabanlı hafif konteyner
