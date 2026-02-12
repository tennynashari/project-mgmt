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

# Untuk PostgreSQL 15+, perlu grant tambahan:
\c project_management
GRANT ALL ON SCHEMA public TO projectapp;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO projectapp;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO projectapp;

# Keluar dari PostgreSQL
\q
```

## 3. Upload & Setup Aplikasi

```bash
# Sebagai user projectapp
cd ~

# Upload project ke server (gunakan salah satu metode):
# - SCP: scp -r project user@server:~/
# - Git: git clone <repository-url>
# - FTP/SFTP

# Masuk ke direktori project
cd project

# Install dependencies untuk server
cd server
npm install --production

# Install dependencies untuk client
cd ../client
npm install

# Build client untuk production
npm run build
```

## 4. Setup Environment Variables

```bash
# Buat file .env di direktori server
cd ~/project/server
nano .env
```

Isi file `.env`:
```env
# Database
DATABASE_URL="postgresql://projectapp:password_anda_yang_kuat@localhost:5432/project_management?schema=public"

# JWT Secret (generate random string yang kuat)
JWT_SECRET="your_super_secret_jwt_key_here_minimum_32_chars"

# Server Config
PORT=4000
NODE_ENV=production

# Frontend URL (sesuaikan dengan domain Anda)
FRONTEND_URL=https://yourdomain.com
```

**Generate JWT Secret:**
```bash
# Generate random secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 5. Setup Database Schema dengan Prisma

```bash
cd ~/project/server

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# (Opsional) Seed database dengan data awal
node prisma/seed.js
```

## 6. Setup PM2 untuk Menjalankan Backend

```bash
# Install PM2 globally (jika belum ada)
sudo npm install -g pm2

# Start aplikasi dengan PM2
cd ~/project/server
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
sudo cp ~/project/project-api.service /etc/systemd/system/

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

## 7. Setup Nginx

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
    root /home/projectapp/project/client/dist;
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

## 8. Update Frontend API URL

Sebelum build frontend, pastikan API URL sudah benar:

```bash
nano ~/project/client/src/api.js
```

Update base URL:
```javascript
const API_URL = '/api';  // Karena Nginx proxy ke /api/
```

Lalu rebuild:
```bash
cd ~/project/client
npm run build
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
sudo chown -R projectapp:projectapp ~/project

# Set permissions untuk direktori
find ~/project -type d -exec chmod 755 {} \;

# Set permissions untuk file
find ~/project -type f -exec chmod 644 {} \;

# Set execute permission untuk node_modules binaries
chmod -R 755 ~/project/server/node_modules/.bin
chmod -R 755 ~/project/client/node_modules/.bin
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

### Update Aplikasi:
```bash
cd ~/project

# Pull changes (jika pakai Git)
git pull

# Update dependencies jika ada perubahan
cd server
npm install --production

cd ../client
npm install

# Rebuild frontend
npm run build

# Restart backend
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
cd ~/project/client
npm run build

# Cek path di Nginx config sesuai dengan lokasi dist
ls -la ~/project/client/dist/
```

### Database connection error:
```bash
# Test koneksi database
psql -U projectapp -d project_management -h localhost

# Cek DATABASE_URL di .env
# Pastikan user dan password benar
```

### Permission denied:
```bash
# Reset permissions
sudo chown -R projectapp:projectapp ~/project
chmod -R 755 ~/project
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
cd ~/project && git pull
cd client && npm run build
pm2 restart project-api
```
