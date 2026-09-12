# 🔄 Panduan Merge Kode Baru ke Repo GitHub yang Sudah Ada

> **Skenario**: Kamu sudah punya repo `nusa-learn` di GitHub (dari deploy kemarin). Sekarang mau update dengan kode terbaru dari sandbox.

---

## ⚠️ Potensi Konflik yang Sudah Diperbaiki

Kode terbaru sudah disiapkan agar aman digabung dengan repo lama:

| File | Status |
|------|--------|
| `.env` | Dihapus dari tracking (di-ignore). Kalau repo lama punya, akan ter-overwrite oleh gitignore. |
| `prisma/schema.prisma` | Provider = `postgresql` (cocok Supabase). Kalau repo lama pakai SQLite, akan ter-overwrite. |
| `vercel.json` | Baru — build command `prisma generate && next build`. |
| `package.json` | Tambah `postinstall: prisma generate` + `engines` field. |
| `.gitignore` | Update — ignore `.env`, `db/*.db`, `worklog.md`, folder sandbox. |
| `next.config.ts` | Tambah komentar jelas tentang `output: standalone`. |
| `src/lib/db.ts` | Optimasi — disable query logging di production. |
| `.nvmrc` | Baru — Node 20 untuk kompatibilitas Vercel. |
| `.env.example` | Template env vars (DATABASE_URL, ADMIN_PASSWORD). |

---

## 🚀 Cara Merge (Pilih Salah Satu)

### OPSI A: Overwrite Total (Cepat, Rekomendasi)

Kalau kamu tidak ada perubahan kustom di repo lama yang mau dipertahankan:

```bash
# 1. Clone repo lama dari GitHub
git clone https://github.com/USERNAME-KAMU/nusa-learn.git
cd nusa-learn

# 2. Backup dulu (kalau mau)
git branch backup-sebelum-merge

# 3. Hapus semua file lama (kecuali .git)
find . -mindepth 1 -not -path './.git*' -delete

# 4. Copy semua file dari kode sandbox ke folder ini
#    (download dulu dari sandbox, lalu copy isi folder ke sini)
cp -r /path/ke/sandbox/* .
cp -r /path/ke/sandbox/.gitignore .
cp -r /path/ke/sandbox/.env.example .

# 5. Stage semua perubahan
git add -A

# 6. Kalau ada file yang dihapus dari tracking (mis. .env), git akan menanyakanya
#    Konfirmasi dengan: git status lalu git add -A lagi

# 7. Commit
git commit -m "Update ke NUSA LEARN v2.0 — Multiplayer + Timer + Admin + TV Mode

- Hapus game Pertarungan Kelompok dari Arcade
- Switch Prisma ke PostgreSQL (Supabase)
- Tambah vercel.json + postinstall prisma generate
- Optimasi .gitignore (untrack .env, db/*.db, sandbox files)
- Tambah .nvmrc untuk Node 20 compatibility
- Optimasi src/lib/db.ts (disable query log di production)
- Tambah engines field di package.json"

# 8. Push ke GitHub → Vercel auto-deploy!
git push origin main
```

### OPSI B: Merge dengan Conflict Resolution

Kalau kamu ada perubahan kustom di repo lama yang mau dipertahankan:

```bash
# 1. Clone repo lama
git clone https://github.com/USERNAME-KAMU/nusa-learn.git
cd nusa-learn

# 2. Buat branch baru untuk merge
git checkout -b update-v2

# 3. Copy file-file baru dari sandbox (OVERWRITE yang ada)
#    Download dari sandbox, lalu copy SEMUA file kecuali .git/
cp -r /path/ke/sandbox/* .
cp /path/ke/sandbox/.gitignore .
cp /path/ke/sandbox/.env.example .

# 4. Cek status — akan ada modified files (M) dan untracked files (??)
git status

# 5. Stage semua
git add -A

# 6. Kalau ada konflik (terutama di package.json atau prisma/schema.prisma):
#    - Buka file yang konflik
#    - Cari tanda <<<<<<< HEAD, =======, >>>>>>>
#    - Pilih versi baru (kode dari sandbox)
#    - Hapus tanda konflik
#    - Save file

# 7. Setelah resolve, stage dan commit
git add -A
git commit -m "Merge NUSA LEARN v2.0 — Multiplayer + Timer + Admin"

# 8. Push branch
git push origin update-v2

# 9. Buat Pull Request di GitHub, lalu merge ke main
#    Atau langsung merge lokal:
git checkout main
git merge update-v2
git push origin main
```

---

## ⚙️ Setelah Merge — Setup Vercel (Kalau Belum)

### 1. Cek Environment Variables di Vercel

Masuk ke **Vercel Dashboard → project → Settings → Environment Variables**.

Pastikan ada:

| Key | Value | Wajib? |
|-----|-------|--------|
| `DATABASE_URL` | `postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true` | ✅ Ya |
| `ADMIN_PASSWORD` | Password admin yang kamu mau (default: `nusa-admin`) | ⚠️ Rekomendasi |

> 💡 Pakai port **6543** (connection pooler), BUKAN 5432. Pooler cocok untuk serverless Vercel.

### 2. Re-seed Database Supabase (Kalau Soal Kosong)

Setelah deploy, kalau halaman game menampilkan "Tidak ada soal", database belum di-seed:

```bash
# Set DATABASE_URL lokal = connection string Supabase production
export DATABASE_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Generate Prisma client untuk PostgreSQL
bun run db:generate

# Buat semua tabel di Supabase
bun run db:push

# Seed 574 soal + 12 badge
bun run seed
```

### 3. Verifikasi Deploy

Buka URL Vercel, test:
- ✅ Splash screen muncul
- ✅ Main game bisa dimainkan
- ✅ Soal muncul (dari Supabase)
- ✅ Admin login (klik Admin di Home)
- ✅ Multiplayer bisa di-setup
- ✅ Musik bunyi

---

## 🆘 Troubleshooting Konflik Merge

### Konflik di `package.json`

```
<<<<<<< HEAD
  "scripts": {
    "dev": "next dev",
=======
  "scripts": {
    "dev": "next dev -p 3000 2>&1 | tee dev.log",
>>>>>>> update-v2
```

**Solusi**: Ambil versi baru (kode sandbox), karena sudah include `postinstall: prisma generate`.

### Konflik di `prisma/schema.prisma`

```
<<<<<<< HEAD
  provider = "sqlite"
=======
  provider = "postgresql"
>>>>>>> update-v2
```

**Solusi**: Ambil `postgresql` (cocok Supabase).

### Konflik di `.gitignore`

Ambil versi baru (lebih lengkap, sudah include `.env`, `db/*.db`, dll).

### Error "Prisma generate" di Vercel build

Pastikan:
- `postinstall` script ada di package.json: `"postinstall": "prisma generate"` ✅
- `vercel.json` ada: `"buildCommand": "prisma generate && next build"` ✅
- `DATABASE_URL` env var sudah diset di Vercel ✅

### Error "Cannot find module '@prisma/client'"

Jalankan `bun install` lagi lokal, lalu commit `bun.lock` (atau `package-lock.json`).

---

## ✅ Ceklis Akhir Sebelum Push

- [ ] Repo lokal terhubung ke GitHub (`git remote -v`)
- [ ] `prisma/schema.prisma` = `postgresql`
- [ ] `vercel.json` ada di root
- [ ] `package.json` ada `postinstall: prisma generate`
- [ ] `.env` TIDAK ter-commit (`git ls-files | grep .env` harus kosong)
- [ ] `.env.example` ter-commit (sebagai template)
- [ ] `db/*.db` TIDAK ter-commit
- [ ] `worklog.md` TIDAK ter-commit
- [ ] Lint clean (`bun run lint`)
- [ ] Build sukses (`bun run build` — opsional, Vercel yang akan build)

---

## 📞 Kalau Masih Error

Kirim info berikut ke aku:
1. Screenshot **Build Logs** Vercel (kalau build gagal)
2. Screenshot **Function Logs** Vercel (kalau runtime error)
3. Output `git status` dan `git log --oneline -5` lokal
4. Screenshot konflik merge (kalau ada)

Aku bantu troubleshoot! 🚀
