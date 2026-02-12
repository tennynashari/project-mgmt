# Project Management App (Phase 1)

## Stack
- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Database: PostgreSQL (Prisma ORM)

## Fitur Phase 1
✅ Koneksi Database PostgreSQL
✅ Model (User, Project, Task, Comment)
✅ Backend API dengan Express
✅ Authentication (Register/Login) dengan JWT
✅ Halaman Dashboard dengan statistik
✅ Fitur Project Management (CRUD + Archive)

## Setup

### 1. Database
Pastikan PostgreSQL sudah running dengan kredensial:
- Host: localhost
- Database: Project
- Username: project
- Password: project

### 2. Install Dependencies
```bash
npm install
```

### 3. Generate Prisma Client
```bash
cd server
npx prisma generate
```

### 4. Jalankan Migrasi (sudah dijalankan)
Database schema sudah dibuat. Jika perlu reset:
```bash
cd server
npx prisma migrate reset
```

## Menjalankan Aplikasi

### Development (Client + Server)
```bash
npm run dev
```

Server akan berjalan di: http://localhost:4000
Client akan berjalan di: http://localhost:5173

### Jalankan Terpisah
```bash
npm run dev:server  # Server only
npm run dev:client  # Client only
```

## Fitur Yang Sudah Diimplementasi

### Backend
- **Auth API** (`/api/auth`)
  - POST `/register` - Daftar user baru
  - POST `/login` - Login dan dapat JWT token
  
- **Dashboard API** (`/api/dashboard`)
  - GET `/` - Statistik: active projects, today's tasks, overdue tasks
  
- **Projects API** (`/api/projects`)
  - GET `/` - List semua project
  - POST `/` - Buat project baru
  - PUT `/:id` - Update project
  - DELETE `/:id` - Hapus project

### Frontend
- **Login/Register** - Form auth dengan toggle
- **Dashboard** - Tampilan statistik project dan task
- **Projects** - CRUD project lengkap dengan archive & delete
- **Protected Routes** - Otomatis redirect ke login jika belum auth

## Teknologi
- React 18 + Vite
- Tailwind CSS (modern, clean design)
- React Router untuk routing
- Prisma ORM
- JWT Authentication
- bcryptjs untuk password hashing

## Deployment

### Production Deployment di Ubuntu 24
Lihat panduan lengkap deployment di:
- **Quick Start**: [QUICK_START.md](./QUICK_START.md) - Panduan singkat
- **Complete Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md) - Panduan lengkap dengan troubleshooting

### File Deployment
- `nginx.conf` - Template konfigurasi Nginx
- `server/ecosystem.config.js` - Konfigurasi PM2 
- `deploy.sh` - Script deployment otomatis
- `backup.sh` - Script backup database

### Quick Deploy
```bash
# Setup environment
cp server/.env.example server/.env
# Edit .env dengan konfigurasi produksi

# Deploy dengan script
chmod +x deploy.sh
./deploy.sh
```

Teknologi Deployment:
- **Process Manager**: PM2
- **Web Server**: Nginx (reverse proxy)
- **SSL**: Let's Encrypt/Certbot
