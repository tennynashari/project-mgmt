# Deployment Checklist

## Pre-Deployment

### Server Requirements
- [ ] Ubuntu 24.04 Server tersedia
- [ ] Akses root/sudo tersedia
- [ ] Domain/subdomain sudah disiapkan (jika pakai domain)
- [ ] DNS sudah pointing ke IP server

### Software Requirements
- [ ] Nginx installed: `nginx -v`
- [ ] PostgreSQL installed: `psql --version`
- [ ] Node.js v18+ installed: `node --version`
- [ ] npm installed: `npm --version`

## Initial Setup

### User & Permissions
- [ ] User aplikasi dibuat (misalnya: projectapp)
- [ ] User bisa akses sudo (jika diperlukan)
- [ ] Login sebagai user aplikasi

### Database Setup
- [ ] Database dibuat (`project_management`)
- [ ] User database dibuat dengan password kuat
- [ ] Privileges granted ke user database
- [ ] Test koneksi database berhasil

### Application Upload
- [ ] Project folder uploaded ke `/var/www/project-mgmt`
- [ ] Ownership correct: `chown -R [user]:[user] /var/www/project-mgmt`
- [ ] Permissions correct: `chmod -R 755 /var/www/project-mgmt`

## Configuration

### Environment Variables
- [ ] File `server/.env` dibuat
- [ ] `DATABASE_URL` configured dengan credential yang benar
- [ ] `JWT_SECRET` generated (minimum 32 karakter)
- [ ] `PORT` set (default: 4000)
- [ ] `NODE_ENV` set to `production`
- [ ] `FRONTEND_URL` configured dengan domain yang benar

### Dependencies Installation
- [ ] Server dependencies installed: `cd server && npm install --production`
- [ ] Client dependencies installed: `cd client && npm install`
- [ ] Prisma client generated: `npx prisma generate`
- [ ] No error during installation

## Database Migration

- [ ] Migrations executed: `npx prisma migrate deploy`
- [ ] Migrations completed successfully
- [ ] Database seeded (opsional): `node prisma/seed.js`
- [ ] Can connect to database

## Application Build

### Frontend Build
- [ ] Client built successfully: `npm run build`
- [ ] `dist` folder created in client directory
- [ ] Build files exist in `client/dist`
- [ ] No build errors

## Process Manager Setup

### Option A: PM2
- [ ] PM2 installed globally: `npm list -g pm2`
- [ ] PM2 started with application: `pm2 start ecosystem.config.js`
- [ ] Application running: `pm2 list`
- [ ] PM2 startup configured: `pm2 startup`
- [ ] PM2 processes saved: `pm2 save`
- [ ] Logs accessible: `pm2 logs project-api`

### Option B: Systemd (Alternative)
- [ ] Service file copied to `/etc/systemd/system/`
- [ ] Service file configured (user, paths)
- [ ] Systemd reloaded: `systemctl daemon-reload`
- [ ] Service enabled: `systemctl enable project-api`
- [ ] Service started: `systemctl start project-api`
- [ ] Service running: `systemctl status project-api`

## Web Server Configuration

### Nginx Setup
- [ ] Nginx config file created: `/etc/nginx/sites-available/project-app`
- [ ] Domain name updated in config
- [ ] Path to client/dist correct
- [ ] Backend proxy configured (port 4000)
- [ ] Symlink created: `ln -s sites-available/project-app sites-enabled/`
- [ ] Nginx test passed: `nginx -t`
- [ ] Nginx reloaded: `systemctl reload nginx`

### Nginx Verification
- [ ] Can access frontend via domain/IP
- [ ] Frontend loads without errors
- [ ] API requests working (/api/*)
- [ ] Static files loading correctly
- [ ] No 404 errors on refresh (React Router working)

## Security

### SSL/HTTPS (Recommended)
- [ ] Certbot installed
- [ ] SSL certificate generated: `certbot --nginx -d domain.com`
- [ ] HTTPS working
- [ ] HTTP redirects to HTTPS
- [ ] Certificate auto-renewal configured

### Firewall
- [ ] UFW installed
- [ ] Nginx Full allowed: `ufw allow 'Nginx Full'`
- [ ] SSH allowed: `ufw allow OpenSSH`
- [ ] UFW enabled: `ufw enable`
- [ ] Firewall status checked: `ufw status`

### Security Best Practices
- [ ] Database port (5432) NOT exposed publicly
- [ ] `.env` file permissions set: `chmod 600 server/.env`
- [ ] Strong database password used
- [ ] Strong JWT_SECRET generated
- [ ] Running as non-root user
- [ ] `NODE_ENV=production` set

## Testing

### Backend Testing
- [ ] Backend accessible at localhost:4000
- [ ] Health check endpoint working (jika ada)
- [ ] Can register new user
- [ ] Can login and get JWT token
- [ ] Protected routes working with JWT

### Frontend Testing
- [ ] Frontend accessible via domain/IP
- [ ] Can navigate to different pages
- [ ] Login page working
- [ ] Register page working
- [ ] Dashboard loads after login
- [ ] Projects page working
- [ ] Logout working

### API Testing
- [ ] API requests going through Nginx proxy
- [ ] CORS configured correctly
- [ ] Authentication working end-to-end
- [ ] CRUD operations working
- [ ] Error handling working

## Monitoring & Maintenance

### Logging
- [ ] Application logs accessible
- [ ] Nginx access logs: `/var/log/nginx/access.log`
- [ ] Nginx error logs: `/var/log/nginx/error.log`
- [ ] Application logs: `pm2 logs` or `journalctl -u project-api`
- [ ] Logs directory created: `server/logs`

### Backup
- [ ] Backup script configured: `backup.sh`
- [ ] Backup script executable: `chmod +x backup.sh`
- [ ] Backup directory created: `~/backups`
- [ ] Manual backup tested
- [ ] Cron job setup for automatic backup
- [ ] Backup restoration tested

### Auto-Start
- [ ] Application starts on server reboot
- [ ] Nginx starts on server reboot
- [ ] PostgreSQL starts on server reboot
- [ ] Tested by rebooting server

## Documentation

- [ ] Deployment documented
- [ ] Credentials stored securely (not in git)
- [ ] Team members have access info
- [ ] Monitoring procedures documented
- [ ] Update procedures documented

## Post-Deployment

### Performance
- [ ] Application responsive
- [ ] No memory leaks
- [ ] Database queries optimized
- [ ] Static files cached properly

### Monitoring Setup
- [ ] Setup monitoring (optional): PM2 Plus, New Relic, etc.
- [ ] Setup alerts for downtime
- [ ] Setup log monitoring
- [ ] Setup resource monitoring (CPU, Memory, Disk)

## Final Checks

- [ ] ✅ Application accessible from internet
- [ ] ✅ All features working as expected
- [ ] ✅ HTTPS enabled and working
- [ ] ✅ Backup system working
- [ ] ✅ Auto-restart configured
- [ ] ✅ Logs being collected
- [ ] ✅ Security measures in place
- [ ] ✅ Documentation complete

---

## Rollback Plan

In case of issues:

1. **Stop new application**
   ```bash
   pm2 stop project-api
   # or: sudo systemctl stop project-api
   ```

2. **Restore database backup**
   ```bash
   psql project_management < backup_file.sql
   ```

3. **Revert to previous version**
   ```bash
   git checkout [previous-commit]
   ./deploy.sh
   ```

4. **Check logs for errors**
   ```bash
   pm2 logs project-api
   sudo tail -f /var/log/nginx/error.log
   ```

---

**Status**: [ ] Deployment Complete and Verified

**Deployment Date**: _______________

**Deployed By**: _______________

**Notes**: 
_______________________________________
_______________________________________
_______________________________________
