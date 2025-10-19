# 🚀 Deployment & Sharing Guide

Bu dokümanda projenin nasıl paylaşılacağı ve çalıştırılacağı detaylı olarak anlatılmaktadır.

## 📦 Proje Hakkında

Bu proje **Secil Store** için geliştirilmiş bir koleksiyon yönetim platformudur. 

### Temel Özellikler:
- ✅ NextAuth.js ile güvenli kimlik doğrulama
- ✅ Koleksiyon ve ürün yönetimi
- ✅ Drag & Drop ile ürün sabitleme
- ✅ Gelişmiş filtreleme sistemi
- ✅ Responsive (mobil + desktop)
- ✅ Dark mode desteği
- ✅ 132 adet test (100% passing)
- ✅ Docker ile tek komutta çalışır

---

## 🎯 Hızlı Başlangıç

### Gereksinimler
- Docker Desktop (Windows/Mac) veya Docker Engine + Docker Compose (Linux)
- Minimum 2 GB RAM
- Minimum 5 GB disk alanı

### Adım 1: Projeyi İndirin

Projeyi GitHub'dan klonlayın:
```bash
git clone <your-repo-url>
cd secil-front-case
```

### Adım 2: Çalıştırın

Tek bir komutla uygulamayı ayağa kaldırın:
```bash
docker-compose up
```

İlk çalıştırmada:
- Dependencies indirilecek (~300-400 MB)
- Next.js build alınacak (~2-3 dakika)
- Production server başlatılacak

### Adım 3: Tarayıcıda Açın

Uygulama çalıştıktan sonra:
- 🌐 URL: http://localhost:3000
- 📧 Test Email: `admin@example.com`
- 🔑 Test Password: `admin123`

---

## 🐳 Docker Komutları

### Temel Komutlar

```bash
# Uygulamayı başlat (foreground)
docker-compose up

# Uygulamayı başlat (background)
docker-compose up -d

# Uygulamayı durdur
docker-compose down

# Logları izle
docker-compose logs -f app

# Rebuild ve başlat
docker-compose up --build
```

### İleri Seviye Komutlar

```bash
# Sadece build et (çalıştırma)
docker-compose build

# Container'a terminal ile bağlan
docker-compose exec app sh

# Container'ları, volume'leri ve network'leri temizle
docker-compose down -v

# Image boyutunu kontrol et
docker images | grep secil-front-case
```

---

## 💻 Local Development (Docker olmadan)

Docker kullanmak istemiyorsanız, yerel olarak da çalıştırabilirsiniz:

### 1. Node.js Kurulumu
- Node.js 18+ gereklidir
- [nodejs.org](https://nodejs.org) adresinden indirin

### 2. Dependencies Kurulumu
```bash
npm install
```

### 3. Development Server
```bash
npm run dev
```

Uygulama http://localhost:3000 adresinde çalışacaktır.

### 4. Production Build
```bash
npm run build
npm start
```

---

## 🧪 Testleri Çalıştırma

### Docker İçinde Test
```bash
# Container'a bağlan
docker-compose exec app sh

# Testleri çalıştır
npm test
```

### Yerel Ortamda Test
```bash
# Tüm testleri çalıştır
npm test

# Watch mode
npm test -- --watch

# Coverage raporu
npm test -- --coverage
```

**Test İstatistikleri:**
- 📊 Toplam: 132 test
- ✅ Başarılı: 132 (100%)
- 🚫 Başarısız: 0
- 📝 Test Dosyaları: 4
  - `login.test.tsx` - 27 tests
  - `collections.test.tsx` - 36 tests
  - `edit.test.tsx` - 39 tests
  - `edit-interactions.test.tsx` - 30 tests

---

## 📤 Projeyi Paylaşma Yöntemleri

### Yöntem 1: GitHub Repository (Önerilen)

#### Adım 1: GitHub Repository Oluşturun
1. https://github.com/new adresine gidin
2. Repository adı: `secil-collection-platform` (veya istediğiniz ad)
3. Public olarak oluşturun
4. README, .gitignore eklemeyin (projede zaten var)

#### Adım 2: Kodu Push Edin
```bash
# Git reposu oluştur (eğer yoksa)
git init

# Tüm dosyaları stage'e al
git add .

# Commit oluştur
git commit -m "feat: Complete collection management platform with Docker support"

# GitHub reposunu ekle (YOUR_USERNAME'i kendinize göre değiştirin)
git remote add origin https://github.com/YOUR_USERNAME/secil-collection-platform.git

# Push et
git branch -M main
git push -u origin main
```

#### Adım 3: README'yi Düzenleyin
- GitHub'da repo sayfasında README.md görünecektir
- Kurulum talimatlarını vurgulayın
- Demo GIF/screenshot ekleyebilirsiniz

#### Adım 4: Repository Linkini Paylaşın
```
https://github.com/YOUR_USERNAME/secil-collection-platform
```

**Mail İçeriği Örneği:**
```
Konu: Secil Store - Collection Management Platform - Case Çalışması

Merhaba,

Case çalışmam tamamlanmıştır. Projeye aşağıdaki linkten erişebilirsiniz:

🔗 GitHub Repository: https://github.com/YOUR_USERNAME/secil-collection-platform

📋 Proje Detayları:
- ✅ Next.js 14 + TypeScript
- ✅ Docker ile tek komutta çalışır
- ✅ 132 test (100% passing)
- ✅ Responsive design (mobile + desktop)
- ✅ Dark mode support
- ✅ Drag & drop functionality
- ✅ Advanced filtering system

🚀 Çalıştırma:
1. git clone https://github.com/YOUR_USERNAME/secil-collection-platform
2. cd secil-collection-platform
3. docker-compose up

Uygulama http://localhost:3000 adresinde çalışacaktır.

Test hesabı:
- Email: admin@example.com
- Şifre: admin123

İyi çalışmalar dilerim.
```

---

### Yöntem 2: GitLab

GitLab kullanıyorsanız:

```bash
# GitLab reposunu ekle
git remote add origin https://gitlab.com/YOUR_USERNAME/secil-collection-platform.git

# Push et
git push -u origin main
```

---

### Yöntem 3: ZIP Dosyası (Önerilmez)

Eğer Git kullanmak istemiyorsanız:

#### Adım 1: Gereksiz Dosyaları Silin
```bash
# node_modules ve build dosyalarını sil
rm -rf node_modules
rm -rf .next
rm -rf out
```

#### Adım 2: ZIP Oluşturun
- Proje klasörünü sağ tık > "Sıkıştır" / "Compress"
- `secil-collection-platform.zip` adıyla kaydedin

#### Adım 3: Dosya Paylaşım Servisi Kullanın
- Google Drive
- Dropbox
- WeTransfer
- OneDrive

**Not:** Bu yöntem önerilmez çünkü:
- Dosya boyutu çok büyük olabilir
- Version control yok
- İndiren kişi tüm dependencies'i kendisi kurmak zorunda

---

## 🌐 Online Deployment (Opsiyonel)

Projeyi canlı olarak da yayınlayabilirsiniz:

### Vercel (Önerilen - Ücretsiz)

```bash
# Vercel CLI kur
npm install -g vercel

# Deploy et
vercel
```

Vercel otomatik olarak:
- Build alır
- Deploy eder
- Size bir URL verir (örn: secil-platform.vercel.app)

Bu URL'yi de mail ile paylaşabilirsiniz.

### Docker Hub

Docker image'ınızı Docker Hub'a yükleyebilirsiniz:

```bash
# Docker Hub'a login
docker login

# Image'ı tag'le
docker tag secil-front-case YOUR_USERNAME/secil-platform:latest

# Push et
docker push YOUR_USERNAME/secil-platform:latest
```

Paylaşım:
```bash
docker pull YOUR_USERNAME/secil-platform:latest
docker run -p 3000:3000 YOUR_USERNAME/secil-platform:latest
```

---

## 📋 Checklist: Paylaşmadan Önce

- [ ] README.md güncel mi?
- [ ] Docker ile çalışıyor mu? (`docker-compose up`)
- [ ] Testler geçiyor mu? (`npm test`)
- [ ] .env.example dosyası var mı?
- [ ] Gereksiz dosyalar commit edilmemiş mi? (node_modules, .next, .env)
- [ ] Git history temiz mi?
- [ ] Repository public olarak ayarlandı mı?
- [ ] Test kullanıcı bilgileri README'de yazmış mı?

---

## 🎓 Sunum Önerileri

### Mail'de Vurgulayın:

1. **Docker ile Tek Komutta Çalışır:**
   ```bash
   docker-compose up
   ```

2. **Test Coverage:**
   - 132 test, 100% passing
   - Jest + React Testing Library

3. **Teknoloji Stack:**
   - Next.js 14 (App Router)
   - TypeScript
   - Tailwind CSS
   - Docker

4. **Özellikler:**
   - Drag & Drop (vanilla JS, no external library)
   - Touch support for mobile
   - Advanced filtering
   - Dark mode
   - Responsive design

### Ek Materyaller (Opsiyonel):

1. **Screenshot'lar:**
   - Login sayfası
   - Collections listesi
   - Edit page (drag-drop demo)
   - Mobile görünüm

2. **GIF/Video:**
   - Drag & drop işlemini gösteren GIF
   - Loom/YouTube ile 2-3 dakikalık demo

3. **Architecture Diagram:**
   - Klasör yapısı
   - Data flow
   - Component hierarchy

---

## 🆘 Sorun Giderme

### Docker Sorunları

**Problem:** `docker-compose up` çalışmıyor
```bash
# Docker servisini başlat
# Windows: Docker Desktop'ı aç
# Linux: sudo systemctl start docker

# Docker Compose güncel mi?
docker-compose --version  # 2.0+ olmalı
```

**Problem:** Port 3000 kullanımda
```bash
# Port'u değiştir (docker-compose.yml)
ports:
  - "3001:3000"  # Sol tarafı değiştir
```

**Problem:** Disk alanı yetmiyor
```bash
# Kullanılmayan image'ları temizle
docker system prune -a

# Kullanılmayan volume'leri temizle
docker volume prune
```

### Build Sorunları

**Problem:** npm install hata veriyor
```bash
# Cache temizle
npm cache clean --force

# node_modules'i sil ve yeniden kur
rm -rf node_modules package-lock.json
npm install
```

**Problem:** TypeScript hataları
```bash
# Type check
npm run type-check

# Build test et
npm run build
```

---

## 📞 İletişim

Sorularınız için:
- 📧 Email: [your-email]
- 💼 LinkedIn: [your-profile]
- 🐙 GitHub: [your-username]

---

## 📄 Lisans

Bu proje test case çalışması olarak geliştirilmiştir.

---

**Son Kontrol:**
- ✅ Docker ile çalışıyor
- ✅ Testler geçiyor (132/132)
- ✅ README detaylı
- ✅ Kod clean ve documented
- ✅ Production-ready

**Teslim Zamanı! 🚀**
