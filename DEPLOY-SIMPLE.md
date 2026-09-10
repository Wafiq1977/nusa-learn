# 🚀 Panduan Deploy NUSA LEARN — Tinggal `git push`

> **Status**: Vercel project + Supabase database sudah dikonfigurasi sebelumnya.
> Sekarang tinggal connect repo & push perubahan → Vercel auto-deploy.

---

## ⚡ Setup Sekali Saja (5 menit)

### 1. Hubungkan Repo Lokal ke GitHub

```bash
# Di laptop kamu, di folder project NUSA LEARN (yang sudah didownload dari sandbox)
cd /path/ke/nusa-learn

# Kalau belum ada git, inisialisasi
git init
git branch -M main

# Tambah remote GitHub (ganti USERNAME-KAMU dengan username GitHub-mu)
git remote add origin https://github.com/USERNAME-KAMU/nusa-learn.git

# Hubungkan ke repo yang sudah ada di Vercel
git pull origin main --allow-unrelated-histories  # kalau repo GitHub sudah ada isinya
# ATAU kalau repo GitHub kosong, langsung push:
git add .
git commit -m "NUSA LEARN v2.0 — Multiplayer + Admin + TV Mode + Timer"
git push -u origin main
```

### 2. Pastikan Vercel Auto-Deploy Aktif

1. Buka https://vercel.com/dashboard
2. Klik project `nusa-learn`
3. Masuk ke **Settings → Git**
4. Pastikan **"Connected Git Repository"** menunjuk ke repo `nusa-learn` kamu
5. Pastikan **"Production Branch"** = `main`
6. Pastikan **"Auto Deploy"** = ON

### 3. Set Environment Variables di Vercel (kalau belum)

Masuk ke **Settings → Environment Variables**. Pastikan ada:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | `postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `ADMIN_PASSWORD` | Password admin yang kamu mau (default: `nusa-admin`) |

> Kalau sudah diset kemarin, skip langkah ini.

---

## 🔄 Workflow Sehari-hari: Tinggal `git push`

Setelah setup awal di atas selesai, untuk update perubahan baru cukup:

```bash
# Di laptop kamu, di folder project
cd /path/ke/nusa-learn

# Setelah edit file-file yang mau diubah...

# Stage semua perubahan
git add .

# Commit dengan pesan deskriptif
git commit -m "Tambah fitur X / perbaiki bug Y"

# Push ke GitHub → Vercel akan AUTO-REBUILD dalam 2-3 menit
git push
```

**Vercel otomatis akan:**
1. Detect push ke branch `main`
2. Run `bun install` (dengan `postinstall: prisma generate`)
3. Run `prisma generate && next build` (dari vercel.json)
4. Deploy ke URL production yang sama
5. Kirim notifikasi sukses/gagal ke email & GitHub

---

## ✅ Verifikasi Setelah Push

Buka https://vercel.com/dashboard → project `nusa-learn` → tab **Deployments**:
- Lihat deployment terbaru (commit pesan kamu muncul)
- Status: **Building** → **Ready** (2-3 menit)
- Klik URL untuk test aplikasi

**Test cepat:**
- Splash screen muncul ✅
- Login admin (klik Admin di Home, masukkan password)
- Main multiplayer
- Cek soal muncul (dari Supabase)

---

## 🛠️ Untuk Development Lokal

Pilih salah satu:

### Opsi A: Pakai Supabase (rekomendasi, sama dengan production)

```bash
# Set DATABASE_URL lokal pakai connection string Supabase
# Edit file .env di folder project:
echo 'DATABASE_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"' > .env

# Generate Prisma client
bun run db:generate

# (Kalau database belum di-seed) jalankan sekali:
bun run seed

# Jalankan dev server
bun run dev
```

### Opsi B: Pakai SQLite lokal (offline, untuk testing cepat)

```bash
# 1. Edit prisma/schema.prisma: ganti "postgresql" → "sqlite"
# 2. Set .env: DATABASE_URL="file:./db/custom.db"
# 3. Generate + push + seed:
bun run db:generate
bun run db:push
bun run seed

# 4. Jalankan dev server
bun run dev

# 5. SEBELUM commit & push ke GitHub:
#    - Ubah balik prisma/schema.prisma: ganti "sqlite" → "postgresql"
#    - Pastikan .env tetap berisi SQLite (jangan commit .env!)
```

---

## 🆘 Troubleshooting

### Build Vercel gagal

Cek tab **Build Logs** di deployment yang failed. Yang sering:

| Error | Solusi |
|-------|--------|
| `Prisma could not find datasource` | `DATABASE_URL` env var belum diset di Vercel |
| `prisma generate` error | Pastikan `postinstall` script ada (sudah ada ✅) |
| `Module not found '@/...'` | Cache Vercel corrupt → Redeploy di Deployments → ⋮ → Redeploy |
| Build timeout | Kurangi file static / optimize imports |

### Runtime error (halaman blank)

Cek **Function Logs** di Vercel. Yang sering:
- `Database connection refused` → DATABASE_URL salah format atau Supabase project di-pause (klik Restore di Supabase Dashboard)
- `Admin password salah` → cek env var `ADMIN_PASSWORD` di Vercel

### Soal kosong / tidak muncul

Database belum di-seed. Jalankan dari laptop:
```bash
# Set DATABASE_URL lokal = connection string Supabase production
export DATABASE_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
bun run seed
```

---

## 📋 Ceklis Cepat

- [ ] Repo lokal terhubung ke GitHub (`git remote -v` menunjukkan `origin`)
- [ ] Vercel project import dari repo GitHub (auto-deploy ON)
- [ ] Environment vars di Vercel: `DATABASE_URL`, `ADMIN_PASSWORD`
- [ ] `prisma/schema.prisma` menggunakan `provider = "postgresql"` (sudah ✅)
- [ ] `vercel.json` ada di root project (sudah ✅)
- [ ] `postinstall: prisma generate` di package.json (sudah ✅)
- [ ] `.env.example` ada sebagai template (sudah ✅)

Setelah semua ✅, tinggal `git push` setiap ada perubahan!

---

## 📞 Kalau Ada Error

Kirim screenshot error dari:
1. **Build Logs** Vercel (kalau build gagal)
2. **Function Logs** Vercel (kalau runtime error)
3. **Browser console** (F12) kalau ada error di aplikasi

Aku bantu troubleshoot! 🚀
