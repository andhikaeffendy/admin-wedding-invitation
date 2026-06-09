# 🔧 Wedding Admin CMS — Full Wedding Management System

> Panel administrasi lengkap untuk mengelola undangan pernikahan digital.  
> Dibangun dengan Next.js 16, Tailwind CSS, dan Framer Motion.

**[🔗 Live Demo](https://admin-wedding-invitation.vercel.app)** — **[📂 GitHub](https://github.com/andhikaeffendy/admin-wedding-invitation)**

---

## 🚀 Quick Deploy (Vercel)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/andhikaeffendy/admin-wedding-invitation)

### Manual Deploy

```bash
# 1. Clone
git clone https://github.com/andhikaeffendy/admin-wedding-invitation.git
cd admin-wedding-invitation

# 2. Install
npm install

# 3. Run dev (bersamaan dengan wedding-invitation di port 3000)
npm run dev -- -p 3001
# → http://localhost:3001

# 4. Build
npm run build

# 5. Deploy to Vercel
vercel --prod
```

---

## 👤 Akun Demo (Siap Pakai)

Buka **`/admin/login`** — klik kartu akun untuk login instan:

| Role | Nama | Email | Password | Akses |
|------|------|-------|----------|-------|
| 👑 **Super Admin** | Andhika Pratama | `admin@wedding.com` | `admin123` | **Semua fitur** — kelola semua undangan, vendor, budget, report |
| 🛡️ **Editor** | Laila Nur Azizah | `editor@wedding.com` | `editor123` | Edit undangan, tamu, media, vendor, timeline, budget |
| 📷 **Scanner** | Panitia Scanner | `scanner@wedding.com` | `scanner123` | **Hanya** scan QR check-in & souvenir + lihat tamu |
| 👁️ **Viewer** | Guest Viewer | `viewer@wedding.com` | `viewer123` | **Hanya** monitoring dashboard & timeline |

> 💡 **One-Click Login**: Klik kartu akun di halaman login untuk masuk tanpa isi email/password.

---

## 📊 Fitur Admin CMS (14 Menu)

### 🏠 Core
| Menu | Fitur |
|------|-------|
| **Dashboard** | Stats realtime: total tamu, RSVP, check-in, souvenir, progress bar |
| **Multi-Event** | Overview semua wedding client — upcoming & past events |

### 💌 Wedding Management
| Menu | Fitur |
|------|-------|
| **Undangan** | CRUD undangan, **pilih template** (5 preset) saat create, publish/archive |
| **Tamu** | CRUD tamu, import Excel, WhatsApp share link personal, filter kategori |
| **Seating Plan** | Assign meja ke tamu (VIP, keluarga, teman), kapasitas per meja, progress bar |
| **Media Library** | Upload gambar **per undangan**, filter by role, preview lightbox |

### 📷 Operations
| Menu | Fitur |
|------|-------|
| **QR Scanner** | Camera scan + manual search, check-in → souvenir → blocked flow, **+1 detection**, **offline queue** |
| **Follow-up** | WhatsApp blast ke tamu belum RSVP, satu klik kirim pesan personal |

### 🛍️ Vendor & Budget
| Menu | Fitur |
|------|-------|
| **Vendor** | Track vendor (venue, katering, dekorasi, foto, dll), payment status, total cost |
| **Timeline** | Jadwal detail hari-H (06:00 - 17:00), printable |
| **Budget** | 7 kategori budget tracker, progress bar, realtime spent vs allocated |

### 📊 Reporting
| Menu | Fitur |
|------|-------|
| **Report** | Post-event report: no-show, peak hour, souvenir, budget summary, printable |
| **Export** | CSV + XLSX export, 14 kolom lengkap, preview table |

---

## 🎨 Template Preset (5 Tema)

| # | Template | Palet | Status |
|---|----------|-------|--------|
| 1 | **Modern Organic Luxury** | Forest Green, Olive, Sage, Cream, Gold | ✅ Free |
| 2 | Classic Rose Gold | Dusty Pink, Rose Gold, Cream | 🔒 Premium |
| 3 | Minimal Monochrome | Warm Mono, Gold accent | 🔒 Premium |
| 4 | Tropical Paradise | Coral, Teal, White | 🔒 Premium |
| 5 | Royal Purple | Deep Purple, Gold, Black | 🔒 Premium |

> Template dipilih saat membuat undangan baru. Bisa dikustomisasi penuh via Builder.

---

## 🗄️ Database & Storage

```
                    ┌─────────────────────┐
                    │   shared/store.json  │  ← Single Source of Truth
                    │   (JSON database)    │
                    └──────────┬──────────┘
                               │
            ┌──────────────────┼──────────────────┐
            ▼                  ▼                  ▼
     invitations          guests[]          vendors[]
     wishes[]          seating_tables      budget{}
     bank_accounts[]   souvenir_stock      timeline[]
```

> **Tanpa database server.** Semua data disimpan di `shared/store.json`.  
> Untuk production, ganti dengan Supabase (lihat [database/migration.sql](database/migration.sql)).

---

## 🔗 System Architecture

```
┌─────────────────┐     read (API)       ┌──────────────────┐
│  wedding-invite  │ ◄────────────────── │  shared/store.json│
│  (public)        │                     │  (single source)  │
│  Vercel/3000     │                     └────────┬─────────┘
└─────────────────┘                               │ write (API)
                                           ┌──────┴──────────┐
                                           │  wedding-admin  │
                                           │  (CMS)           │
                                           │  Vercel/3001     │
                                           └─────────────────┘
```

> **Kedua project harus berjalan bersamaan.** Admin menulis, undangan publik membaca.

---

## 📡 API Routes (6 endpoint)

| Endpoint | Method | Fungsi |
|----------|--------|--------|
| `/api/data/invitations` | GET/POST | List & create undangan |
| `/api/data/invitations/[id]` | GET/PATCH | Detail & update undangan |
| `/api/data/guests` | GET/POST | List & tambah tamu |
| `/api/data/dashboard` | GET | Stats dashboard |
| `/api/data/scan` | POST | Proses QR scan (checkin/souvenir) |
| `/api/data/seating` | GET/PUT | Seating plan |
| `/api/data/vendors` | GET/POST/PATCH | Vendor management |
| `/api/data/timeline` | GET/PUT | Timeline rundown |
| `/api/data/budget` | GET/PUT | Budget tracker |
| `/api/data/reports` | GET | Post-event report |
| `/api/data/followup` | GET | Auto follow-up list |

---

## 🧪 Test QR Scanner

Token tes di halaman scanner:
- `tok-f6g7h8i9j0` → SUCCESS_CHECKIN (belum check-in)
- `tok-a1b2c3d4e5` → ALREADY_COMPLETED (sudah 2x)

---

## 📝 Environment Variables

Copy `.env.example` ke `.env.local`:

```env
# URL undangan publik
NEXT_PUBLIC_WEDDING_URL=https://wedding-invitation.vercel.app

# Optional: Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## 🏗️ Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| Icons | Lucide React |
| QR Scan | html5-qrcode |
| Excel | SheetJS (xlsx) |
| Database | JSON file / Supabase |
| Deployment | Vercel |

---

## 📂 Project Structure

```
src/
├── app/admin/
│   ├── dashboard/        # Dashboard stats
│   ├── clients/          # Multi-event overview
│   ├── invitations/      # CRUD undangan + template selection
│   │   └── [id]/{builder,guests,media}/
│   ├── seating/          # Seating plan
│   ├── vendors/          # Vendor management
│   ├── timeline/         # Timeline rundown
│   ├── budget/           # Budget tracker
│   ├── scanner/          # QR scanner + offline queue
│   ├── followup/         # Auto follow-up WhatsApp
│   ├── reports/          # Post-event report
│   ├── exports/          # CSV/XLSX export
│   └── login/            # Login + account cards
├── app/api/data/         # 11 API route handlers
├── lib/
│   ├── shared-store.ts   # JSON file CRUD
│   ├── wo-store.ts       # WO features CRUD
│   ├── accounts.ts       # Account definitions
│   ├── auth-context.tsx  # Auth provider
│   ├── storage.ts        # Image upload
│   ├── templates.ts      # 5 template presets
│   ├── excel/            # Import/export Excel
│   ├── scanner/          # Offline queue
│   └── whatsapp-share.ts # WhatsApp helper
├── components/
│   └── CameraScanner.tsx # Live camera QR scanner
└── database/
    └── migration.sql     # Supabase migration + RLS
```

---

## 📄 License

MIT — © 2026 Andhika Effendy
