# 📚 Panduan Deployment - File Overview

Dokumentasi lengkap untuk deployment aplikasi Project Management di Ubuntu 24.04.

## 📁 File-file Deployment

### 📖 Dokumentasi

| File | Deskripsi | Kapan Digunakan |
|------|-----------|-----------------|
| **QUICK_START.md** | Panduan singkat deployment | Untuk deployment cepat, sudah familiar dengan stack |
| **DEPLOYMENT.md** | Panduan lengkap + troubleshooting | Deployment detail, pertama kali deploy, atau ada masalah |
| **DEPLOYMENT_CHECKLIST.md** | Checklist langkah deployment | Memastikan tidak ada yang terlewat |
| **DEPLOYMENT_FILES.md** | File ini - overview semua file | Reference cepat |

### ⚙️ File Konfigurasi

| File | Deskripsi | Lokasi di Server |
|------|-----------|------------------|
| **nginx.conf** | Template konfigurasi Nginx | Copy ke `/etc/nginx/sites-available/` |
| **server/ecosystem.config.js** | Konfigurasi PM2 | Gunakan di direktori server |
| **project-api.service** | Systemd service file (alternatif PM2) | Copy ke `/etc/systemd/system/` |
| **server/.env.example** | Template environment variables server | Copy ke `server/.env` dan edit |
| **client/.env.production** | Environment variables client production | Otomatis digunakan saat build |

### 🔧 Scripts

| File | Deskripsi | Cara Pakai |
|------|-----------|------------|
| **setup.sh** | Initial setup otomatis | `chmod +x setup.sh && ./setup.sh` |
| **deploy.sh** | Deploy update aplikasi | `chmod +x deploy.sh && ./deploy.sh` |
| **backup.sh** | Backup database | `chmod +x backup.sh && ./backup.sh` |

## 🚀 Quickstart Deployment

### A. Setup Awal (Pertama Kali)

```bash
# 1. Buat user aplikasi
sudo adduser projectapp
su - projectapp

# 2. Upload project ke server
# Upload ke: /home/projectapp/project

# 3. Jalankan setup script
cd ~/project
chmod +x setup.sh
./setup.sh

# 4. Setup PM2
cd server
pm2 start ecosystem.config.js
pm2 startup  # Jalankan command yang ditampilkan
pm2 save

# 5. Setup Nginx
sudo cp ~/project/nginx.conf /etc/nginx/sites-available/project-app
sudo nano /etc/nginx/sites-available/project-app  # Edit domain
sudo ln -s /etc/nginx/sites-available/project-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 6. Setup SSL
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com

# 7. Setup Firewall
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

### B. Deploy Update (Setelah Setup Awal)

```bash
# Cukup jalankan deploy script
cd ~/project
./deploy.sh
```

## 📚 Dokumentasi yang Perlu Dibaca

### Untuk Deployment Pertama Kali
1. Baca **DEPLOYMENT.md** Section 1-10
2. Gunakan **DEPLOYMENT_CHECKLIST.md** untuk memastikan semua langkah
3. Setup **backup.sh** untuk cron job

### Untuk Update/Maintenance
1. Gunakan **deploy.sh** untuk deploy update
2. Gunakan **backup.sh** sebelum update besar
3. Lihat **DEPLOYMENT.md** Section "Maintenance & Updates"

### Troubleshooting
1. Lihat **DEPLOYMENT.md** Section "Troubleshooting"
2. Check logs: `pm2 logs` atau `sudo tail -f /var/log/nginx/error.log`

## 🔒 File Penting yang HARUS DIEDIT

### 1. server/.env
```env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname?schema=public"
JWT_SECRET="generate-random-string-32-chars-minimum"
PORT=4000
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
```

**Cara generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. nginx.conf
```nginx
server_name yourdomain.com www.yourdomain.com;  # ← GANTI INI
root /home/projectapp/project/client/dist;      # ← CEK PATH INI
```

### 3. server/ecosystem.config.js (jika pakai PM2)
Biasanya tidak perlu diedit, kecuali:
- Ingin ganti nama aplikasi
- Ingin multiple instances
- Ingin custom memory limit

### 4. project-api.service (jika pakai systemd)
```ini
User=projectapp              # ← GANTI sesuai user Anda
WorkingDirectory=/home/projectapp/project/server  # ← CEK PATH INI
EnvironmentFile=/home/projectapp/project/server/.env  # ← CEK PATH INI
```

## 🛠️ Workflow Penggunaan File

### Deployment Pertama Kali
```
1. DEPLOYMENT_CHECKLIST.md (Pre-flight check)
   ↓
2. setup.sh (Automated setup)
   ↓
3. DEPLOYMENT.md Section 6-10 (PM2, Nginx, SSL)
   ↓
4. DEPLOYMENT_CHECKLIST.md (Post-deployment check)
   ↓
5. Setup backup.sh cron job
```

### Deploy Update
```
1. backup.sh (Backup database)
   ↓
2. deploy.sh (Deploy update)
   ↓
3. Test (Buka website, test features)
```

### Troubleshooting
```
Problem terjadi
   ↓
1. Check logs (pm2 logs / nginx logs)
   ↓
2. DEPLOYMENT.md → Section Troubleshooting
   ↓
3. Restore backup jika perlu (backup.sh)
```

## 📊 Process Manager Options

### Option A: PM2 (Recommended untuk development/small server)
**Kelebihan:**
- Easy to use
- Built-in monitoring
- Log management
- Auto-restart
- Zero-downtime reload

**File yang digunakan:**
- `server/ecosystem.config.js`
- Command: `pm2 start ecosystem.config.js`

### Option B: Systemd (Recommended untuk production/large server)
**Kelebihan:**
- Native Linux service
- Better security
- Resource control
- Integrated dengan system
- More reliable

**File yang digunakan:**
- `project-api.service`
- Copy ke `/etc/systemd/system/`

## 🔄 Maintenance Commands

### Everyday Commands
```bash
# View application status
pm2 status                  # or: systemctl status project-api

# View logs
pm2 logs project-api        # or: journalctl -u project-api -f

# Restart application
pm2 restart project-api     # or: sudo systemctl restart project-api

# Restart Nginx
sudo systemctl reload nginx
```

### Database Backup
```bash
# Manual backup
./backup.sh

# Setup auto backup (daily at 2 AM)
crontab -e
# Add: 0 2 * * * /home/projectapp/project/backup.sh
```

### Deploy Updates
```bash
cd ~/project
./deploy.sh
```

## 🆘 Emergency Commands

### Stop Everything
```bash
pm2 stop project-api              # or: sudo systemctl stop project-api
sudo systemctl stop nginx
```

### Restore Backup
```bash
# Find backup
ls -lht ~/backups/

# Restore
gunzip backup_file.sql.gz
psql project_management < backup_file.sql
```

### View All Logs
```bash
# Application
pm2 logs project-api --lines 100

# Nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# System
journalctl -u project-api -n 100
```

## 📞 Support & Resources

### Documentation
- **Full Guide**: DEPLOYMENT.md
- **Quick Start**: QUICK_START.md  
- **Checklist**: DEPLOYMENT_CHECKLIST.md

### Logs Location
- **PM2**: `~/project/server/logs/`
- **Nginx**: `/var/log/nginx/`
- **Systemd**: `journalctl -u project-api`

### Config Locations
- **Nginx**: `/etc/nginx/sites-available/project-app`
- **PM2**: `~/project/server/ecosystem.config.js`
- **Systemd**: `/etc/systemd/system/project-api.service`
- **Environment**: `~/project/server/.env`

---

**Versi Dokumentasi**: 1.0
**Last Updated**: February 2026
**Untuk**: Ubuntu 24.04 + Node.js + PostgreSQL + Nginx
