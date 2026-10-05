# Tuyul Tracker 🧟‍♂️⚔️

**Tuyul Tracker** is a modern, ultra-fast, minimal daily activity tracking web application built with **Next.js (App Router)** and **PostgreSQL** powered by **@neondatabase/serverless** HTTP driver (zero cold start, sub-millisecond execution). Designed specifically to track daily Ragnarok tuyul accounts cleanly, quickly, and efficiently.

---

## ✨ Key Features

- **Interactive Daily Tracker Matrix**:
  - Instant optimistic UI checkbox updates with background non-blocking server persistence.
  - Sticky header & sticky account column for seamless desktop, tablet, and mobile navigation.
  - Real-time client-side progress calculations per account.
  - Date navigation (*Previous Day, Today, Next Day, Custom Date Picker*) in `Asia/Makassar` (WITA / UTC+8).
- **Quick Batch Actions**:
  - `Complete All`: Complete all active account checklists for the selected day.
  - `Reset All`: Reset all checklists for today (with confirmation).
  - `Complete Account`: Complete all tasks for a specific account.
  - `Reset Account`: Reset all tasks for a specific account.
- **Single Toolbar Filter & Sorting**:
  - Real-time search: Nickname, Username, Owner.
  - Filters: Group (*Personal, Client A, Farm Card, etc.*), Status (*Active, Paused, Finished*), Progress (*Not Started, In Progress, Completed*).
  - Sorting: *Least Progress (Priority)*, *Most Progress*, *Nickname A-Z / Z-A*, *Group*.
- **Executive Dashboard & Need Attention**:
  - Summary metrics: total accounts, active accounts, completion rate, progress bar.
  - *Need Attention* quick widget showing accounts that haven't reached 100%.
- **Weekly Matrix View**:
  - 7-day consistency visualization (Monday–Sunday) with visual status indicators:
    - ✅ = 100% Completed
    - 🟡 = In Progress (1–99%)
    - ❌ = Not Started (0%)
  - Click any day to jump directly to that date in the Daily Tracker.
- **Account Management & Custom Checklist**:
  - Full account management with custom daily activity assignments per account.
  - Single Group assignment.
  - Fast status switch (*Active / Paused*).
- **AES-256-GCM Reversible Credential Security**:
  - Securely encrypted account passwords in PostgreSQL using *AES-256-GCM*.
  - Decrypted only on-demand server-side when clicking **Show / Copy Password**.
- **Master Data Management**:
  - Manage master activities with sorting and active toggles.
  - Manage groups with account counters.
- **Private Authentication**:
  - HMAC-SHA256 protected session cookies with Next.js edge proxy middleware.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Server Components & Server Actions)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (Clean Light Theme)
- **Icons**: Lucide React
- **Database Driver**: `@neondatabase/serverless` (Direct serverless HTTP SQL queries — No Prisma)
- **Database**: PostgreSQL (Neon Serverless, Singapore `ap-southeast-1` recommended)
- **Validation**: Zod
- **Security**: AES-256-GCM Credential Encryption & Bcrypt password hashing
- **Deployment**: Vercel

---

## 📋 Requirements

- Node.js `v18.17` or later (Node.js 20+ recommended)
- PostgreSQL database (Neon Serverless PostgreSQL recommended)

---

## 🚀 Installation & Setup

### 1. Clone & Install

```bash
cd tuyul-tracker
npm install
```

### 2. Environment Variables

Create or update `.env`:

```env
# Neon PostgreSQL Connection String
DATABASE_URL="postgresql://user:password@ep-xxxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

# AES-256-GCM Encryption Secret (64 hex characters)
ENCRYPTION_SECRET="7f8b9a1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f90"

# Session Cookie Secret
SESSION_SECRET="tuyul-tracker-super-secret-session-key-change-in-production-min32chars"

# Default Admin Credentials
DEFAULT_ADMIN_USERNAME="admin"
DEFAULT_ADMIN_PASSWORD="adminpassword123"

# Application Timezone
APP_TIMEZONE="Asia/Makassar"
```

### 3. Initialize Database & Seed

```bash
npm run db:init
```

Default credentials created:
- **Admin**: `admin` / `adminpassword123`
- **Master Activities**: MH600, MH3000, Mission Board, Guild Daily, TC, Arena, Final Mirage
- **Sample Groups**: Personal, Client A, Farm Card

### 4. Run Local Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏗️ Production Build

```bash
npm run build
npm run start
```

---

## ☁️ Vercel Deployment

1. Push your repository to GitHub.
2. In Vercel Project Settings > **Environment Variables**, add:
   - `DATABASE_URL`
   - `ENCRYPTION_SECRET`
   - `SESSION_SECRET`
   - `DEFAULT_ADMIN_USERNAME`
   - `DEFAULT_ADMIN_PASSWORD`
   - `APP_TIMEZONE`
3. Trigger redeployment. Database connection uses ultra-low latency `@neondatabase/serverless` over HTTP with zero cold starts.

