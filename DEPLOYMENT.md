# Panduan Deployment - Ubuntu 24.04

## Prasyarat
- Ubuntu 24.04
- Nginx (sudah terinstall)
- PostgreSQL (sudah terinstall)
- Node.js v18+ (sudah terinstall)
- Domain atau IP server

## 1. Setup User Aplikasi

```bash
# Buat user baru untuk aplikasi (misal: projectapp)
sudo adduser projectapp

# Tambahkan ke grup sudo (opsional)
sudo usermod -aG sudo projectapp

# Login sebagai user baru
su - projectapp
```

## 2. Setup Database PostgreSQL

```bash
# Login sebagai postgres user
sudo -u postgres psql

# Di dalam PostgreSQL console:
CREATE DATABASE project_management;
CREATE USER projectapp WITH ENCRYPTED PASSWORD 'password_anda_yang_kuat';
GRANT ALL PRIVILEGES ON DATABASE project_management TO projectapp;

# Keluar dan connect ke database yang baru dibuat
\q
```

**Untuk PostgreSQL 15+, set permission schema public:**

```bash
# Login sebagai postgres dan connect ke database
sudo -u postgres psql -d project_management

# Di dalam PostgreSQL console:
GRANT ALL ON SCHEMA public TO projectapp;
GRANT CREATE ON SCHEMA public TO projectapp;
ALTER SCHEMA public OWNER TO projectapp;

# Grant default privileges untuk tabel dan sequence yang akan dibuat
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO projectapp;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO projectapp;

# Keluar dari PostgreSQL
\q
```

**Verifikasi permission:**
```bash
# Test koneksi sebagai user projectapp
psql -U projectapp -d project_management -h localhost -c "\dn+"
# Seharusnya berhasil tanpa error
```

## 3. Upload & Setup Aplikasi

```bash
# Buat direktori untuk aplikasi
sudo mkdir -p /var/www/project-mgmt
sudo chown -R projectapp:projectapp /var/www/project-mgmt

# Upload project ke server (gunakan salah satu metode):
# - SCP: scp -r project/* user@server:/var/www/project-mgmt/
# - Git: cd /var/www/project-mgmt && git clone <repository-url> .
# - FTP/SFTP: Upload ke /var/www/project-mgmt

# Masuk ke direktori project
cd /var/www/project-mgmt

# Install dependencies untuk server
cd server
npm install --production

# Install dependencies untuk client
cd ../client
npm install

# CATATAN: Jangan build dulu! Build dilakukan di Section 6
# setelah setup .env.production
```

## 4. Setup Environment Variables

```bash
# Buat file .env di direktori server
cd /var/www/project-mgmt/server
nano .env
```

Isi file `.env`:
```env
# Database
DATABASE_URL="postgresql://projectapp:password_anda_yang_kuat@localhost:5432/project_management?schema=public"

# JWT Secret - WAJIB DIGANTI dengan hasil generate di bawah!
JWT_SECRET="GANTI_DENGAN_HASIL_GENERATE_DI_BAWAH"

# Server Config
PORT=4000
NODE_ENV=production

# Frontend URL (sesuaikan dengan domain Anda)
FRONTEND_URL=https://yourdomain.com
```

**⚠️ PENTING: Generate JWT Secret yang Aman**

Jalankan command ini untuk generate JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Output akan seperti ini (contoh):
```
a7f3b9c2e8d4f1a6c5b8d9e2f7a3c6b1d4e7f9a2c5b8d1e4f7a9c2e5b8d1f4
```

Copy hasil tersebut dan paste ke `JWT_SECRET` di file `.env`:
```env
JWT_SECRET="a7f3b9c2e8d4f1a6c5b8d9e2f7a3c6b1d4e7f9a2c5b8d1e4f7a9c2e5b8d1f4"
```

## 5. Setup Database Schema dengan Prisma

```bash
cd /var/www/project-mgmt/server

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# (Opsional) Seed database dengan data awal
node prisma/seed.js
```

## 6. Setup Frontend untuk Production

**PENTING: Lakukan ini SEBELUM build frontend!**

File `.env.production` sudah tersedia di repository. Verifikasi isinya:

```bash
# Cek apakah file ada
cd /var/www/project-mgmt/client
cat .env.production
```

Harusnya berisi:
```env
# Kosongkan karena semua endpoint sudah include /api/ prefix
VITE_API_URL=
```

**Jika file tidak ada, buat manual:**
```bash
cd /var/www/project-mgmt/client
nano .env.production
```

Isi dengan:
```env
# Kosongkan karena semua endpoint sudah include /api/ prefix
VITE_API_URL=
```

**Penjelasan:**
- Frontend akan menggunakan `/api` sebagai base URL
- Nginx akan proxy `/api/` ke `http://localhost:4000/`
- Ini membuat frontend dan backend di domain yang sama (no CORS issues)

**Verifikasi file `src/api.js` sudah benar:**
```bash
cat src/api.js
```

Harusnya ada kode seperti ini:
```javascript
const API_URL = import.meta.env.VITE_API_URL !== undefined 
  ? import.meta.env.VITE_API_URL 
  : "http://localhost:4000";
```

**PENTING:** 
- Di production: `VITE_API_URL=` (kosong, tanpa nilai) → request ke `/api/` langsung
- Di development: fallback ke `http://localhost:4000`

**Sekarang build frontend untuk production:**
```bash
cd /var/www/project-mgmt/client
npm run build
```

Build akan menghasilkan folder `dist/` yang berisi static files.

**Verifikasi build berhasil:**
```bash
ls -lh dist/
# Harusnya ada: index.html, assets/, dll

# Pastikan tidak ada referensi localhost:4000 di build
grep -r "localhost:4000" dist/
# Harusnya kosong (tidak ada hasil)

# Verify API calls di JavaScript bundle
grep -r "api.*auth" dist/assets/*.js | head -5
# Harusnya request ke /api/auth, bukan localhost
```

## 7. Setup PM2 untuk Menjalankan Backend

```bash
# Install PM2 globally (jika belum ada)
sudo npm install -g pm2

# Start aplikasi dengan PM2
cd /var/www/project-mgmt/server
pm2 start index.js --name "project-api"

# Setup PM2 untuk auto-start saat reboot
pm2 startup
# Jalankan command yang ditampilkan oleh PM2

# Save current PM2 processes
pm2 save

# Perintah PM2 yang berguna:
# pm2 list           - Lihat semua process
# pm2 logs project-api  - Lihat logs
# pm2 restart project-api - Restart aplikasi
# pm2 stop project-api   - Stop aplikasi
# pm2 delete project-api - Hapus dari PM2
```

### Alternatif: Menggunakan Systemd Service

Jika tidak ingin menggunakan PM2, bisa menggunakan systemd service:

```bash
# Copy service file
sudo cp /var/www/project-mgmt/project-api.service /etc/systemd/system/

# Edit jika perlu (sesuaikan user dan path)
sudo nano /etc/systemd/system/project-api.service

# Reload systemd
sudo systemctl daemon-reload

# Enable service (auto-start on boot)
sudo systemctl enable project-api

# Start service
sudo systemctl start project-api

# Check status
sudo systemctl status project-api

# Perintah systemd yang berguna:
# sudo systemctl restart project-api - Restart service
# sudo systemctl stop project-api    - Stop service
# sudo journalctl -u project-api -f  - View logs
```

## 8. Setup Nginx

```bash
# Buat konfigurasi Nginx
sudo nano /etc/nginx/sites-available/project-app
```

Isi file konfigurasi:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;  # Ganti dengan domain Anda
    
    # Frontend - React App
    root /var/www/project-mgmt/client/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;

    # Frontend routes - React Router
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:4000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/project-app /etc/nginx/sites-enabled/

# Test konfigurasi Nginx
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## 9. Setup SSL dengan Let's Encrypt (Opsional tapi Direkomendasikan)

```bash
# Install Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Generate SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Certbot akan otomatis update konfigurasi Nginx

# Test auto-renewal
sudo certbot renew --dry-run
```

## 10. Firewall Setup

```bash
# Allow Nginx
sudo ufw allow 'Nginx Full'

# Allow SSH (jika belum)
sudo ufw allow OpenSSH

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

## 11. Set Permissions yang Benar

```bash
# Set ownership
sudo chown -R projectapp:projectapp /var/www/project-mgmt

# Set permissions untuk direktori
find /var/www/project-mgmt -type d -exec chmod 755 {} \;

# Set permissions untuk file
find /var/www/project-mgmt -type f -exec chmod 644 {} \;

# Set execute permission untuk node_modules binaries
chmod -R 755 /var/www/project-mgmt/server/node_modules/.bin
chmod -R 755 /var/www/project-mgmt/client/node_modules/.bin
```

## 12. Testing

```bash
# Test backend
curl http://localhost:4000/health

# Check PM2 status
pm2 status

# Check Nginx status
sudo systemctl status nginx

# View logs
pm2 logs project-api
sudo tail -f /var/log/nginx/error.log
```

## Maintenance & Updates

### Update Aplikasi (Production):

**Cara 1: Manual Update (Recommended untuk perubahan kecil)**
```bash
# 1. Login ke server sebagai user projectapp
ssh projectapp@your-server

# 2. Masuk ke direktori project
cd /var/www/project-mgmt

# 3. Pull perubahan terbaru (jika pakai Git)
git pull origin main  # atau branch yang sesuai

# 4. Update backend dependencies (jika ada perubahan di package.json)
cd server
npm install --production

# 5. Update database schema (jika ada perubahan di Prisma)
npx prisma generate
npx prisma migrate deploy

# 6. Restart backend
pm2 restart project-api

# 7. Update dan rebuild frontend
cd ../client
npm install  # jika ada perubahan dependencies
npm run build

# 8. Fix permissions jika perlu
sudo chown -R projectapp:projectapp /var/www/project-mgmt/client/dist

# 9. Reload Nginx (jika ada perubahan konfigurasi)
sudo systemctl reload nginx

# 10. Verify
pm2 logs project-api --lines 20
curl http://localhost:4000/
```

**Cara 2: Update dari Local (Upload perubahan dari development)**
```bash
# Di komputer local (development)
# 1. Build production di local
cd client
npm run build

# 2. Upload file yang berubah ke server via SCP/SFTP
# Upload ke /var/www/project-mgmt/

# Di server
# 3. Fix permissions
sudo chown -R projectapp:projectapp /var/www/project-mgmt

# 4. Restart services
cd /var/www/project-mgmt/server
pm2 restart project-api
```

**Cara 3: Automated Update Script (Advanced)**

Buat file `update.sh`:
```bash
#!/bin/bash
# File: /var/www/project-mgmt/update.sh

set -e  # Exit on error

echo "🔄 Starting application update..."

# Navigate to project directory
cd /var/www/project-mgmt

# Pull latest changes
echo "📥 Pulling latest code..."
git pull origin main

# Backend updates
echo "🔧 Updating backend..."
cd server
npm install --production
npx prisma generate
npx prisma migrate deploy

# Frontend updates
echo "🎨 Rebuilding frontend..."
cd ../client
npm install
npm run build

# Fix permissions
echo "🔐 Fixing permissions..."
sudo chown -R projectapp:projectapp /var/www/project-mgmt

# Restart services
echo "🔄 Restarting services..."
pm2 restart project-api

# Verify
echo "✅ Checking status..."
pm2 status

echo "✅ Update completed successfully!"
echo "📊 Check logs: pm2 logs project-api"
```

Cara pakai:
```bash
# Jadikan executable
chmod +x /var/www/project-mgmt/update.sh

# Jalankan update
./update.sh
```

**Rollback jika terjadi error:**
```bash
# Rollback Git
git log --oneline  # lihat commit history
git reset --hard COMMIT_HASH  # rollback ke commit tertentu

# Rebuild
cd client && npm run build
pm2 restart project-api
```

### Backup Database:
```bash
# Backup
pg_dump project_management > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore
psql project_management < backup_file.sql
```

### Monitor Aplikasi:
```bash
# PM2 monitoring
pm2 monit

# View logs
pm2 logs project-api --lines 100

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## Troubleshooting

### Backend tidak jalan:
```bash
pm2 logs project-api
# Periksa error di logs
# Cek koneksi database di .env
# Pastikan PORT 4000 tidak dipakai aplikasi lain: netstat -tulpn | grep 4000
```

### Frontend blank/error 404:
```bash
# Pastikan build berhasil
cd /var/www/project-mgmt/client
npm run build

# Cek path di Nginx config sesuai dengan lokasi dist
ls -la /var/www/project-mgmt/client/dist/
```

### Database connection error:
```bash
# Test koneksi database
psql -U projectapp -d project_management -h localhost

# Cek DATABASE_URL di .env
# Pastikan user dan password benar
```

### Permission denied for schema public:
```bash
# Error ini terjadi karena permission PostgreSQL belum lengkap
# Fix dengan memberikan permission yang benar:

sudo -u postgres psql -d project_management <<EOF
GRANT ALL ON SCHEMA public TO projectapp;
GRANT CREATE ON SCHEMA public TO projectapp;
ALTER SCHEMA public OWNER TO projectapp;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO projectapp;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO projectapp;
EOF

# Lalu coba migrate lagi
cd /var/www/project-mgmt/server
npx prisma migrate deploy
```

### Migration failed / Database schema issues:
```bash
# Reset database (HATI-HATI: Akan hapus semua data!)
cd /var/www/project-mgmt/server

# Drop dan recreate database
sudo -u postgres psql <<EOF
DROP DATABASE IF EXISTS project_management;
CREATE DATABASE project_management;
ALTER DATABASE project_management OWNER TO projectapp;
EOF

# Set permissions
sudo -u postgres psql -d project_management <<EOF
GRANT ALL ON SCHEMA public TO projectapp;
GRANT CREATE ON SCHEMA public TO projectapp;
ALTER SCHEMA public OWNER TO projectapp;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO projectapp;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO projectapp;
EOF

# Run migrations
npx prisma migrate deploy
```

### Permission denied:
```bash
# Reset permissions
sudo chown -R projectapp:projectapp /var/www/project-mgmt
chmod -R 755 /var/www/project-mgmt
```

## Security Checklist

- ✅ Gunakan password yang kuat untuk database
- ✅ Generate JWT_SECRET yang random dan panjang
- ✅ Setup SSL/HTTPS
- ✅ Update system secara berkala: `sudo apt update && sudo apt upgrade`
- ✅ Setup firewall dengan UFW
- ✅ Jangan expose database port ke public
- ✅ Backup database secara berkala
- ✅ Monitor logs untuk aktivitas mencurigakan
- ✅ Gunakan user non-root untuk menjalankan aplikasi
- ✅ Set NODE_ENV=production

## Quick Reference Commands

```bash
# Restart semua service
pm2 restart project-api
sudo systemctl reload nginx

# View all logs
pm2 logs project-api
sudo tail -f /var/log/nginx/error.log

# Check all services
pm2 status
sudo systemctl status nginx
sudo systemctl status postgresql

# Database backup
pg_dump project_management > backup.sql

# Update dan restart aplikasi
cd /var/www/project-mgmt && git pull
cd client && npm run build
pm2 restart project-api
```
