# 🚀 Panduan Deploy NUSA LEARN ke Vercel

Panduan step-by-step untuk deploy game NUSA LEARN ke Vercel (gratis).

---

## 📋 Prasyarat

Pastikan kamu sudah punya:
- ✅ Akun **GitHub** (gratis di https://github.com)
- ✅ Akun **Vercel** (gratis di https://vercel.com — login pakai GitHub)
- ✅ Akun **Supabase** (gratis di https://supabase.com — untuk database production)
- ✅ Kode project NUSA LEARN (download dari sandbox atau dari repo lokal)

---

## 🗺️ Arsitektur Deploy

```
[Laptop kamu]  →  [GitHub repo]  →  [Vercel build]  →  [URL production]
                                                     ↓
                                              [Supabase DB]
```

---

## TAHAP 1: Setup Database Supabase (sekali saja)

Karena Vercel serverless tidak support SQLite persistent, kita pakai PostgreSQL Supabase gratis (500MB).

### 1.1 Buat Project Supabase
1. Buka https://supabase.com → klik **Start your project**
2. Isi:
   - **Name**: `nusa-learn-db`
   - **Database Password**: buat password kuat, **simpan di tempat aman!**
   - **Region**: Southeast Asia (Singapore) — paling dekat dengan Indonesia
   - **Plan**: Free
3. Tunggu 2-3 menit sampai project aktif
4. Masuk ke **Project Settings → Database → Connection string → URI**
5. Copy connection string (format: `postgresql://postgres.[REF]:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres`)

> ⚠️ **Penting**: Pakai port **6543** (connection pooler), BUKAN 5432. Pooler cocok untuk serverless Vercel.

### 1.2 Ubah Prisma Schema ke PostgreSQL

Edit file `prisma/schema.prisma` di project, ganti bagian `datasource db`:

```prisma
datasource db {
  provider = "postgresql"   // GANTI dari "sqlite" ke "postgresql"
  url      = env("DATABASE_URL")
}
```

### 1.3 Set DATABASE_URL lokal & Seed database

```bash
# Di laptop kamu, di folder project NUSA LEARN

# Set DATABASE_URL lokal (sementara, ganti [PASSWORD])
export DATABASE_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres"

# Generate Prisma client untuk PostgreSQL
bun run db:generate

# Buat semua tabel di Supabase
bun run db:push

# Seed 574 soal + 12 badge ke Supabase
bun run seed
```

Cek di Supabase → **Table Editor** → harus muncul tabel `Question`, `Badge`, `Player`, `SessionLog` dengan data terisi (574 questions).

---

## TAHAP 2: Push Kode ke GitHub

### 2.1 Buat repo baru di GitHub
1. Buka https://github.com/new
2. Repository name: `nusa-learn`
3. **Public** atau **Private** (bebas)
4. **Jangan** centang "Add a README file" (biar tidak konflik)
5. Klik **Create repository**

### 2.2 Push kode dari laptop

```bash
# Di folder project NUSA LEARN
cd /path/ke/nusa-learn

# Inisialisasi git (kalau belum ada)
git init
git branch -M main

# Add semua file (kecuali yang di-gitignore)
git add .

# Commit pertama
git commit -m "NUSA LEARN — Educational game for SD students

Fitur:
- 9 mini-games (Choice, Story, Pattern, Build, Catch, Shop, Path, Battle, Team Battle)
- Mode Multiplayer 2-4 tim (Bergiliran & Siapa Cepat)
- Timer menjawab (15/20/30/45/60 detik)
- Menu Admin (CRUD soal + monitoring)
- Mode TV/PED untuk layar sekolah
- 5 trek musik latar
- 574 soal numerik + literasi (kelas 1-6)
- NOVA AI guide (LLM-powered hints)"

# Hubungkan ke GitHub (ganti USERNAME-KAMU)
git remote add origin https://github.com/USERNAME-KAMU/nusa-learn.git

# Push!
git push -u origin main
```

---

## TAHAP 3: Import ke Vercel (sekali saja)

### 3.1 Import project
1. Buka https://vercel.com/new
2. Klik **Import Git Repository**
3. Cari & pilih repo `nusa-learn` (kalau tidak muncul, klik "Adjust GitHub App Permissions" dulu)
4. Vercel akan auto-detect **Next.js** — biarkan default

### 3.2 Set Environment Variables (PENTING!)

Sebelum klik Deploy, scroll ke bawah ke bagian **Environment Variables**. Tambahkan:

| Key | Value | Keterangan |
|-----|-------|-----------|
| `DATABASE_URL` | `postgresql://postgres.[REF]:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres` | Connection string Supabase (sama dengan yang lokal) |
| `ADMIN_PASSWORD` | `nusa-admin-kuat-2024` | Password admin yang kamu mau (GANTI yang kuat!) |

> 💡 Kalau mau pakai default `nusa-admin` dulu, bisa skip `ADMIN_PASSWORD`. Tapi untuk production, WAJIB ganti!

### 3.3 Klik Deploy

Tunggu 2-3 menit. Vercel akan:
1. Install dependencies (`bun install` → trigger `postinstall: prisma generate`)
2. Build (`prisma generate && next build` — dari vercel.json)
3. Deploy ke URL `nusa-learn-xxx.vercel.app`

Status akan jadi **"Ready"** kalau sukses.

---

## TAHAP 4: Verifikasi Deploy

Buka URL Vercel di browser, test:

- [ ] ✅ Splash screen muncul dengan animasi
- [ ] ✅ Onboarding bisa diisi (nama, kelas, karakter)
- [ ] ✅ Home screen tampil dengan menu lengkap
- [ ] ✅ Main game bisa dimainkan (Number City Level 1)
- [ ] ✅ Multiplayer bisa di-setup (bikin 2-3 tim)
- [ ] ✅ Timer berjalan di mode multiplayer
- [ ] ✅ Admin login dengan password (klik tombol Admin di Home)
- [ ] ✅ Musik latar bunyi (klik tombol musik di kanan bawah)
- [ ] ✅ Mode TV bisa diaktifkan di Settings

Kalau ada error, lihat:
- **Vercel → Deployments → klik yang failed → tab "Build Logs"**
- **Vercel → Project → tab "Function Logs"** untuk runtime errors

---

## 🔄 Update Selanjutnya

Setelah setup awal, untuk update perubahan baru cukup:

```bash
# Di laptop kamu
cd /path/ke/nusa-learn

# Edit file-file yang mau diubah...

# Commit perubahan
git add .
git commit -m "Deskripsi perubahan"
git push
```

Vercel akan **auto-rebuild** dalam 2-3 menit. URL tetap sama.

---

## 🆘 Troubleshooting

### Build gagal "prisma generate"

Pastikan:
- `postinstall` script di package.json: `"postinstall": "prisma generate"`
- `vercel.json` ada `buildCommand: "prisma generate && next build"`
- `DATABASE_URL` env var sudah diset di Vercel

### Halaman blank putih setelah deploy

Cek Function Logs. Biasanya:
- `DATABASE_URL` belum diset → tambah di Vercel env vars
- Connection string salah format → pastikan port 6543 & pakai pooler URL

### Admin login gagal

- Default password: `nusa-admin`
- Kalau set `ADMIN_PASSWORD` env var, pakai password itu

### Musik tidak bunyi

Browser block autoplay audio. User harus klik layar dulu (sudah auto-handled via `unlockAudio()`).

### Database connection timeout

Pakai **connection pooler URL** Supabase (port 6543), BUKAN direct connection (port 5432). Pooler cocok untuk serverless Vercel.

### Soal kosong / "Tidak ada soal"

Berarti database belum di-seed. Jalankan:
```bash
export DATABASE_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres"
bun run seed
```

---

## 📊 Limit Free Tier

### Vercel (Hobby):
- ✅ Unlimited static deployments
- ✅ 100GB bandwidth/bulan
- ⚠️ Serverless function: 10s timeout per request (NOVA LLM hint butuh <10s, OK)

### Supabase (Free):
- ✅ 500MB database (cukup untuk 574 soal + ribuan player)
- ✅ 50,000 monthly active users
- ⚠️ Project auto-pause setelah 7 hari idle (tinggal klik "Restore project")

---

## 🔐 Security Checklist Production

- [ ] Ganti `ADMIN_PASSWORD` dari default `nusa-admin` ke password kuat
- [ ] Pastikan `.env` (file asli dengan password) **tidak** di-commit (sudah di-gitignore)
- [ ] Set Supabase database dengan password kuat
- [ ] Aktifkan Row Level Security di Supabase (opsional, untuk proteksi tambahan)

---

## ✅ Quick Checklist Deploy

```
1. ☐ Buat Supabase project → copy DATABASE_URL
2. ☐ Ubah prisma/schema.prisma: provider = "postgresql"
3. ☐ Set DATABASE_URL lokal → bun run db:push → bun run seed
4. ☐ Push ke GitHub
5. ☐ Import ke Vercel → set DATABASE_URL + ADMIN_PASSWORD env vars
6. ☐ Deploy → tunggu "Ready" → test URL
7. ☐ Verifikasi semua fitur jalan
```

Total waktu setup: **~20-30 menit**. Setelah itu, update tinggal `git push`!

---

Selamat deploy! 🎮🚀
