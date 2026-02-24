# 🔐 Demo Login Accounts

Aplikasi ini sudah dilengkapi dengan data demo untuk testing dan eksplorasi fitur.

## 📋 Akun Login yang Tersedia

### 1. Project Manager (Full Access)

**Role:** PM (Project Manager)  
**Email:** `john@example.com`  
**Password:** `password123`

**Akses:**
- ✅ View Dashboard dengan statistics
- ✅ Create, Edit, Delete Projects
- ✅ Create, Edit, Delete Tasks
- ✅ Assign tasks ke team members
- ✅ View semua activities
- ✅ Export data ke Excel
- ✅ Manage project timeline

**Data yang sudah dibuat:**
- Owner dari 3 sample projects
- Beberapa tasks dengan berbagai status

---

### 2. Team Member #1

**Role:** Member  
**Email:** `jane@example.com`  
**Password:** `password123`

**Akses:**
- ✅ View Dashboard
- ✅ View Projects (read-only)
- ✅ View Tasks
- ✅ Update assigned tasks (jika assigned ke user ini)
- ✅ View activities
- ✅ Export data ke Excel
- ❌ Cannot create/delete projects
- ❌ Cannot create/delete tasks

---

### 3. Team Member #2

**Role:** Member  
**Email:** `bob@example.com`  
**Password:** `password123`

**Akses:**
- ✅ View Dashboard
- ✅ View Projects (read-only)
- ✅ View Tasks
- ✅ Update assigned tasks (jika assigned ke user ini)
- ✅ View activities
- ✅ Export data ke Excel
- ❌ Cannot create/delete projects
- ❌ Cannot create/delete tasks

---

## 🎯 Cara Login

1. Buka aplikasi di browser: `https://project.tazkia.web.id`
2. Pilih salah satu akun di atas
3. Masukkan **Email** dan **Password**
4. Klik **"Sign In"**
5. Anda akan diarahkan ke Dashboard

---

## 🔄 Reset Password (Production)

Untuk production, password default **HARUS** diganti:

### Opsi 1: Via Database (Manual)
```bash
# SSH ke server
cd /var/www/project-mgmt/server

# Buat script ganti password
node -e "
const bcrypt = require('bcryptjs');
const password = 'NewSecurePassword123!';
bcrypt.hash(password, 10).then(hash => console.log(hash));
"

# Copy hash hasil generate, lalu update di database:
# psql -U projectapp -d project_management
# UPDATE \"User\" SET password = 'HASH_DARI_COMMAND_ATAS' WHERE email = 'john@example.com';
```

### Opsi 2: Reset Semua Data (Re-seed)
```bash
cd /var/www/project-mgmt/server
node prisma/seed.js
# PERINGATAN: Akan menghapus SEMUA data dan reset ke sample data
```

---

## 👥 Perbedaan Role

| Fitur | PM | Member |
|-------|-----|--------|
| View Dashboard | ✅ | ✅ |
| View Projects | ✅ | ✅ |
| Create/Edit/Delete Projects | ✅ | ❌ |
| View Tasks | ✅ | ✅ |
| Create/Edit/Delete Tasks | ✅ | ❌ |
| Update Assigned Tasks | ✅ | ✅ (own tasks only) |
| View Activities | ✅ | ✅ |
| Export Excel | ✅ | ✅ |
| Manage Users | Admin only | ❌ |

---

## 📝 Notes

- Password default (`password123`) hanya untuk demo/development
- Untuk production, **WAJIB** ganti dengan password yang kuat
- Akun baru bisa dibuat via fitur Register (role default: Member)
- Role PM/Admin harus di-set manual via database
- Token JWT expired setelah beberapa waktu (sesuai config)

---

## 🛡️ Security Recommendations

1. **Ganti semua password default** setelah deployment
2. Gunakan password manager untuk password yang kuat
3. Enable 2FA jika memungkinkan (fitur belum ada, bisa ditambah)
4. Regular audit user accounts
5. Remove inactive users
6. Monitor activity logs untuk suspicious behavior

---

## 📞 Support

Jika lupa password atau ada masalah akses:
- Contact system administrator
- Request password reset via database
- Re-seed database (development only)
