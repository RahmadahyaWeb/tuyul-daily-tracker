# Tuyul Tracker 🧟‍♂️⚔️

**Tuyul Tracker** adalah aplikasi web modern, cepat, dan responsif berbasis **Next.js (App Router)** & **PostgreSQL (Prisma ORM)** yang dirancang khusus untuk memantau aktivitas harian puluhan hingga ratusan akun tuyul Ragnarok secara cepat, presisi, dan terstruktur, menggantikan sistem spreadsheet konvensional.

---

## ✨ Fitur Utama

- **Interactive Daily Tracker Matrix**:
  - Matriks checklist harian dengan update instan (*optimistic UI*).
  - Sticky header & sticky account column untuk navigasi nyaman di desktop, tablet, dan mobile.
  - Perhitungan persentase progres harian otomatis berdasarkan custom activity tiap akun.
  - Navigasi tanggal (*Previous Day, Today, Next Day, Date Picker*) dengan timezone konsisten `Asia/Makassar` (WITA / UTC+8).
- **Quick Batch Actions**:
  - `Complete All`: Menyelesaikan seluruh checklist untuk semua akun aktif hari ini.
  - `Reset All`: Mereset checklist seluruh akun hari ini (dilengkapi konfirmasi).
  - `Complete Account`: Menyelesaikan seluruh checklist akun tertentu.
  - `Reset Account`: Mengosongkan checklist akun tertentu (dilengkapi konfirmasi).
- **Single Toolbar Filter & Sorting**:
  - Real-time search: Nickname, Username, Owner.
  - Filter: Group (*Personal, Client A, Farm Card, dll*), Status (*Active, Paused, Finished*), Progres (*Not Started, In Progress, Completed*).
  - Sorting: *Least Progress (Prioritas Akun Tertinggal)*, *Most Progress*, *Nickname A-Z / Z-A*, *Group*.
- **Dashboard Ringkas & Need Attention**:
  - Metrik total akun, akun aktif, status pengerjaan hari ini, serta bar progres keseluruhan.
  - Widget *Need Attention* yang menyoroti akun-akun aktif yang belum 100% selesai.
- **Weekly Matrix View**:
  - Visualisasi konsistensi pengerjaan mingguan (Senin–Minggu) dengan indikator status:
    - ✅ = 100% Selesai
    - 🟡 = Sebagian Selesai (1–99%)
    - ❌ = Belum Dikerjakan (0%)
  - Klik hari apa saja untuk langsung melompat ke Daily Tracker pada tanggal tersebut.
- **Account Management & Custom Activity**:
  - CRUD Akun lengkap dengan kustomisasi checklist aktivitas harian per akun.
  - Single Group assignment per akun.
  - Fast Status Switch (*Active / Paused*).
- **AES-256-GCM Reversible Credential Security**:
  - Password akun tuyul dienkripsi dua arah secara aman di database menggunakan algoritma *AES-256-GCM*.
  - Password tidak pernah dikirim ke browser pada list query umum.
  - Password hanya didekripsi server-side saat user menekan tombol **Show / Copy Password**.
- **Master Data Management**:
  - CRUD Master Activities dengan reordering urutan dan status aktif.
  - CRUD Groups dengan counter akun terkait.
- **Private Authentication**:
  - Session cookie terproteksi HMAC-SHA256 dengan middleware Edge Next.js.
  - Role: `ADMIN`.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Server Components & Server Actions)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (Modern minimal neutral theme, mobile-friendly)
- **Icons**: Lucide React
- **ORM & Database**: Prisma ORM dengan PostgreSQL (Supabase / Neon / Vercel Postgres / Railway)
- **Validation**: Zod
- **Security**: AES-256-GCM Credential Encryption & Bcrypt password hashing
- **Deployment**: Vercel Ready

---

## 📋 Requirements

- Node.js `v18.17` atau lebih baru (direkomendasikan Node.js 20+)
- PostgreSQL database (Lokal atau Cloud: Supabase / Neon / Neon Serverless / Vercel Postgres)
- NPM / PNPM / Yarn

---

## 🚀 Installation & Setup

### 1. Clone & Masuk ke Direktori

```bash
cd tuyul-tracker
npm install
```

### 2. Konfigurasi Environment Variables

Salin file `.env.example` ke `.env`:

```bash
cp .env.example .env
```

Sesuaikan nilai variabel:

```env
# PostgreSQL Database URL
DATABASE_URL="postgresql://username:password@localhost:5432/tuyul_tracker?schema=public"

# AES-256-GCM Encryption Secret (32 bytes hex)
ENCRYPTION_SECRET="7f8b9a1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f90"

# Session Cookie Secret
SESSION_SECRET="tuyul-tracker-super-secret-session-key-change-in-production-min32chars"

# Default Admin Seed Credentials
DEFAULT_ADMIN_USERNAME="admin"
DEFAULT_ADMIN_PASSWORD="adminpassword123"

# Application Timezone
APP_TIMEZONE="Asia/Makassar"
```

### 3. Generate Prisma Client & Database Migration

```bash
npx prisma generate
npx prisma db push
```

### 4. Seed Initial Data (Admin, Master Activities, Groups, Sample Accounts)

```bash
npm run db:seed
```

Data default yang akan dibuat:
- **Akun Admin**: `admin` / `adminpassword123`
- **Master Activities**:
  1. Monster Hunt 600 (`MH600`)
  2. Monster Hunt 3000 (`MH3000`)
  3. Mission Board (`MISSION`)
  4. Guild Daily (`GUILD`)
  5. TC (`TC`)
  6. Arena (`ARENA`)
  7. Final Mirage (`FM`)
- **Groups**: Personal, Client A, Farm Card
- **Sample Accounts**: Rynzo, Velric, Kaizen, ShadowFarm

### 5. Jalankan Local Development

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

---

## 🏗️ Build & Production

Untuk memvalidasi dan membuat production bundle:

```bash
npm run build
npm run start
```

---

## ☁️ Deploy ke Vercel

1. Buat database PostgreSQL di **Vercel Postgres**, **Neon.tech**, atau **Supabase**.
2. Hubungkan repository GitHub ke **Vercel**.
3. Tambahkan Environment Variables di Dashboard Vercel (**Settings > Environment Variables**):
   - `DATABASE_URL`: Connection string PostgreSQL Anda (direct connection atau pooled).
   - `ENCRYPTION_SECRET`: 64 karakter hex string (contoh generate: `openssl rand -hex 32`).
   - `SESSION_SECRET`: Random string minimal 32 karakter.
   - `DEFAULT_ADMIN_USERNAME`: `admin`
   - `DEFAULT_ADMIN_PASSWORD`: `<password_rahasia_anda>`
   - `APP_TIMEZONE`: `Asia/Makassar`
4. Deploy project.
5. Jalankan seed database dari terminal lokal atau Vercel CLI:
   ```bash
   npx prisma db push
   node prisma/seed.js
   ```

---

## 📁 Struktur Project

```
src/
├── app/
│   ├── (dashboard)/
│   │   ├── page.tsx               # Dashboard Ringkasan
│   │   ├── layout.tsx             # Authenticated Layout Shell
│   │   ├── tracker/page.tsx       # Daily Tracker Matrix
│   │   ├── weekly/page.tsx        # Weekly Consistency View
│   │   ├── accounts/
│   │   │   ├── page.tsx           # Accounts Management
│   │   │   └── [id]/page.tsx      # Account Detail & 30-Day History
│   │   ├── activities/page.tsx    # Master Activities CRUD
│   │   └── groups/page.tsx        # Groups CRUD
│   ├── login/page.tsx             # Login Page
│   ├── globals.css                # CSS Variables, Matrix Table Styles
│   └── layout.tsx                 # Root Layout & Metadata
├── components/
│   ├── layout/                    # Sidebar, Header, AppLayout
│   └── ui/                        # Button, Input, Modal, ConfirmDialog, Badge, ProgressBar, Skeleton
├── features/                      # Feature View Components (Dashboard, Tracker, Weekly, etc)
├── lib/
│   ├── auth.ts                    # Session token signing & cookies
│   ├── encryption.ts              # AES-256-GCM reversible encryption
│   ├── date-utils.ts              # Asia/Makassar timezone date helpers
│   ├── prisma.ts                  # Singleton Prisma Client
│   ├── utils.ts                   # cn & formatting helpers
│   └── validations.ts             # Zod validation schemas
├── server/
│   ├── actions/                   # Server Actions (Tracker, Accounts, Activities, Groups, Auth)
│   └── db/                        # Optimized relational database queries
└── middleware.ts                  # Protected routes edge middleware
```

---

## 🔒 Keamanan & Praktik Terbaik

- **Reversible Credential Encryption**: Kredensial akun Ragnarok dilindungi enkripsi standar militer AES-256-GCM. Kunci dekripsi hanya berada di server environment variable dan tidak pernah di-expose ke client.
- **Optimized Relational Queries**: Daily Tracker dan Weekly View memuat seluruh data relasional dalam batched query tunggal, bebas dari masalah *N+1 queries*.
- **Timezone Stability**: Menggunakan tanggal lokal `Asia/Makassar` (WITA) berformat `YYYY-MM-DD` secara deterministik untuk mencegah bug pergantian tanggal pada aktivitas malam hari.
