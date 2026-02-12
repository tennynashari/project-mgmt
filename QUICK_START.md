# Quick Start - Deployment Ubuntu 24

## Langkah Cepat Deployment

### 1. Buat User Baru
```bash
sudo adduser projectapp
su - projectapp
```

### 2. Upload Project ke Server
Upload folder project ke `/home/projectapp/project`

### 3. Setup Database
```bash
sudo -u postgres psql
```
```sql
CREATE DATABASE project_management;
CREATE USER projectapp WITH ENCRYPTED PASSWORD 'PasswordKuatAnda123!';
GRANT ALL PRIVILEGES ON DATABASE project_management TO projectapp;
\c project_management
GRANT ALL ON SCHEMA public TO projectapp;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO projectapp;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO projectapp;
\q
```

### 4. Setup Environment
```bash
cd ~/project/server
cp .env.example .env
nano .env
```

Edit file `.env`:
```env
DATABASE_URL="postgresql://projectapp:PasswordKuatAnda123!@localhost:5432/project_management?schema=public"
JWT_SECRET="GENERATE_DENGAN_COMMAND_DI_BAWAH"
PORT=4000
NODE_ENV=production
FRONTEND_URL=https://domain-anda.com
```

Generate JWT Secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5. Install & Build
```bash
cd ~/project

# Install & setup server
cd server
npm install --production
npx prisma generate
npx prisma migrate deploy
node prisma/seed.js

# Install & build client
cd ../client
npm install
npm run build
```

### 6. Setup PM2
```bash
sudo npm install -g pm2
cd ~/project/server
pm2 start ecosystem.config.js
pm2 startup
# Jalankan command yang ditampilkan
pm2 save
```

### 7. Setup Nginx
```bash
sudo nano /etc/nginx/sites-available/project-app
```

Copy isi dari file `nginx.conf` di project, lalu:
- Ganti `yourdomain.com` dengan domain Anda
- Pastikan path `/home/projectapp/project/client/dist` benar

```bash
sudo ln -s /etc/nginx/sites-available/project-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 8. Setup SSL (Recommended)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 9. Setup Firewall
```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

## ✅ Selesai!

Akses aplikasi di: `https://yourdomain.com`

## Command Berguna

```bash
# Status aplikasi
pm2 status
pm2 logs project-api

# Restart aplikasi
pm2 restart project-api
sudo systemctl reload nginx

# Deploy update (gunakan script)
cd ~/project
chmod +x deploy.sh
./deploy.sh

# Backup database (setup cron)
chmod +x backup.sh
# Setup cron: crontab -e
# Tambahkan: 0 2 * * * /home/projectapp/project/backup.sh
```

## Troubleshooting Cepat

**Backend error**: `pm2 logs project-api`
**Database error**: Cek DATABASE_URL di `.env`
**Frontend 404**: Pastikan `npm run build` berhasil dan path Nginx benar
**Permission denied**: `sudo chown -R projectapp:projectapp ~/project`

---

**Panduan lengkap**: Lihat file [DEPLOYMENT.md](./DEPLOYMENT.md)
