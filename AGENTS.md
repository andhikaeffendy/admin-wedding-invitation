<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Wedding Admin CMS — V3 Agent Rules

> **App:** `wedding-admin` · Port 3001  
> **Role:** Multi-tenant admin dashboard for wedding invitation management  
> **Audit Score:** 4.9/10 🔴 (see monorepo AGENTS.md for CRITICAL findings)

### Tech Stack (Detected)

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.2.7 |
| Language | TypeScript | ^5 |
| Styling | Tailwind CSS | v4 |
| Animation | Framer Motion | ^12.40 |
| Icons | Lucide React | ^1.17 |
| Validation | Zod + react-hook-form | ^4.4 / ^7.78 |
| QR Scanner | html5-qrcode | ^2.3 |
| QR Generator | qrcode.react | ^4.2 |
| Excel | xlsx (⚠️ HIGH vuln → update to ≥0.19.3) | ^0.18.5 |
| WebSocket | ws | ^8.21 |
| Database (prod) | Supabase Postgres + Prisma | ^5.22 |
| Database (dev) | JSON file | `../shared/store.json` |
| Auth | Built-in role-based (⚠️ localStorage, not Supabase Auth) | — |

### Design System (In Place)

| Token Category | Location |
|---------------|----------|
| Color scales (5 × 11 steps) | `src/app/globals.css` `@theme inline` |
| Semantic + dark mode tokens | `src/app/globals.css` `:root` + `@media dark` |
| Typography (clamp responsive) | `--text-display` through `--text-overline` |
| Spacing / Radius / Elevation / Motion | All in `:root` |
| Component classes (9-state) | `.btn-primary-admin`, `.btn-secondary-admin`, `.btn-outline-admin`, `.btn-danger-admin`, `.btn-ghost-admin`, `.card-admin`, `.input-admin`, `.label-admin`, `.badge-*`, `.table-admin`, `.empty-state`, `.progress-bar`, `.toast`, `.skeleton` |
| AriaLive region | `src/components/AriaLiveRegion.tsx` |
| Focus styles | Global `:focus-visible` 3px gold ring |
| Skip navigation | `.skip-to-content` in `layout.tsx` |

### File Structure (Exact)

```
src/
├── app/
│   ├── layout.tsx              ← Root layout (AuthProvider + skip-to-content)
│   ├── page.tsx                ← Root redirect
│   ├── globals.css             ← V3 design tokens (22KB)
│   ├── error.tsx               ← Error boundary
│   ├── loading.tsx             ← Loading state
│   ├── not-found.tsx           ← 404 page
│   └── admin/
│       ├── layout.tsx          ← Admin shell (sidebar + top bar + content)
│       │                         ARIA: ✅ nav, aria-current, aria-expanded, aria-controls
│       ├── page.tsx            ← Redirect to dashboard
│       ├── error.tsx           ← Admin error boundary
│       ├── loading.tsx         ← Loading spinner
│       ├── not-found.tsx       ← 404 for admin routes
│       ├── login/page.tsx      ← One-click login (⚠️ security risk in production)
│       ├── dashboard/page.tsx  ← Stats + progress + template demos
│       ├── clients/page.tsx    ← Multi-event dashboard
│       ├── invitations/
│       │   ├── page.tsx        ← Invitation list
│       │   └── [id]/
│       │       ├── builder/page.tsx   ← 7-step wizard
│       │       ├── guests/page.tsx    ← Guest CRUD + import
│       │       ├── media/page.tsx     ← Media library
│       │       └── send/page.tsx      ← WhatsApp share
│       ├── scanner/page.tsx    ← QR scanner (camera + manual)
│       ├── exports/page.tsx    ← CSV/Excel export
│       ├── settings/page.tsx   ← App settings
│       ├── setup/page.tsx      ← Database initialization
│       ├── seating/page.tsx    ← Seating plan
│       ├── vendors/page.tsx    ← Vendor management
│       ├── timeline/page.tsx   ← Event timeline
│       ├── budget/page.tsx     ← Budget tracker
│       ├── followup/page.tsx   ← Guest follow-up
│       └── reports/page.tsx    ← Post-event reports
├── components/
│   ├── CameraScanner.tsx       ← html5-qrcode live camera
│   └── AriaLiveRegion.tsx      ← Screen reader announcement hook
└── lib/
    ├── types.ts                ← All TypeScript interfaces
    ├── accounts.ts             ← ⚠️ Hardcoded passwords (admin123, etc.)
    ├── auth-context.tsx        ← ⚠️ localStorage auth (no JWT)
    ├── shared-store.ts         ← JSON file read/write (dev)
    ├── wo-store.ts             ← Extended WO operations
    ├── storage.ts              ← Supabase/LocalStorage file upload
    ├── templates.ts            ← Template list + metadata
    ├── dummy-data.ts           ← Default data
    ├── whatsapp-share.ts       ← WhatsApp sharing
    ├── supabase/
    │   ├── client.ts           ← Supabase client
    │   ├── db.ts               ← Supabase DB layer (fallback to JSON)
    │   └── init.ts             ← Database initialization
    ├── prisma/
    │   ├── client.ts           ← Prisma client
    │   └── db.ts               ← Prisma DB layer
    ├── scanner/
    │   └── offline-queue.ts    ← Offline QR scan queue + sync
    └── excel/
        └── import-export.ts    ← XLSX/CSV import-export

database/
└── migration.sql               ← Supabase migration + 19 RLS policies
prisma/
└── schema.prisma               ← 9 models (Invitation, Guest, Vendor, SeatingTable, TimelineItem, BudgetCategory, Wish, BankAccount, SouvenirStock)
```

### 4 User Roles + Access Matrix

| Role | Dashboard | Invitations | Guests | Builder | Media | Scanner | Export | Settings | Setup |
|------|-----------|-------------|--------|---------|-------|---------|--------|----------|-------|
| 👑 Super Admin | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 🛡️ Editor | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| 📷 Scanner | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| 👁️ Viewer | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |

### 13 API Routes

```
/api/data/dashboard      ← GET  stats
/api/data/invitations    ← GET/POST
/api/data/invitations/[id] ← GET/PUT/DELETE
/api/data/guests         ← GET/POST
/api/data/scan           ← POST  process QR scan
/api/data/exports        ← GET   download CSV/XLSX
/api/data/budget         ← GET/PUT
/api/data/vendors        ← GET/POST
/api/data/timeline       ← GET/PUT
/api/data/seating        ← GET/PUT
/api/data/reports        ← GET
/api/data/followup       ← GET
/api/data/setup          ← POST  database initialization
```

### Agent Routing (App-Specific)

| Task | Route |
|------|-------|
| Simple question | Main only |
| Feature implementation | Planner → Architect → Data → Imager → Coder → Tester → Reviewer |
| Bug/error | Debugger → Coder → Tester → Reviewer |
| UI/UX improvement | Imager → Planner → Coder → Tester → Reviewer |
| Database change | Data → Security → Reviewer |
| Security fix | Security → Ops → Reviewer → Human Approval Gate |
| Audit | Architect → Imager/Data/Security/Ops/Tester → Reviewer |
| Documentation | Docs → Reviewer |

### Execution Rules

- Always read existing files before making changes
- Follow existing naming: camelCase (TS/JS), kebab-case (folders)
- API routes → `src/app/api/`
- Components → `src/components/` or co-located
- All data operations through API routes in `src/app/api/data/`
- **DO NOT** delete database records without human approval
- **DO NOT** change authentication/authorization behavior without approval
- **DO NOT** send email/SMS/WhatsApp to real users without approval
- **ALWAYS** use design tokens — ZERO hardcoded values

### UI/UX Quality Mode

Activate when: UI, UX, design, redesign, layout, responsive, modern, premium, dashboard, admin, CMS, elegant, polished.

- Imager defines design direction BEFORE Coder implements
- All 9 component states required
- All 6 responsive breakpoints required
- WCAG 2.2 AA minimum (admin sidebar has full ARIA, pages need skeleton + empty states)
- Dark mode supported via `prefers-color-scheme`

### Security Notes (⚠️ ACTIVE RISKS)

| Risk | Severity | Status |
|------|----------|--------|
| Hardcoded DB credentials in .env | 🔴 CRITICAL | Needs rotation |
| Plaintext passwords in accounts.ts | 🔴 CRITICAL | Needs Supabase Auth |
| localStorage auth (no JWT) | 🔴 CRITICAL | Needs Supabase Auth |
| Password in localStorage | 🔴 CRITICAL | Strip password from stored object |
| No CSRF on API routes | 🔴 CRITICAL | Needs middleware |
| No rate limiting on login | 🔴 CRITICAL | Needs middleware |
| xlsx prototype pollution | 🟡 HIGH | Update to ≥0.19.3 |
| Predictable guest tokens | 🟡 WARNING | Use crypto.randomUUID() |
| Quick-login exposes all accounts | 🟡 WARNING | Disable in production |

### Human Approval Gate

Require explicit approval before:
- Deleting files or database records
- Dropping tables/columns
- Changing production config
- Sending email/SMS/WhatsApp to real users
- Changing authentication/authorization behavior
- Adding external UI libraries/packages
- Large refactor outside requested scope

### Final Review Checklist

- [ ] Read the actual user task
- [ ] Preserved existing project rules
- [ ] Used smallest effective workflow
- [ ] No hallucination (invented files/APIs/schema)
- [ ] Assumptions labeled
- [ ] Design tokens used (ZERO hardcoded values)
- [ ] Component states covered (9 if UI)
- [ ] WCAG 2.2 AA verified
- [ ] Build + TypeScript pass
- [ ] Security gate satisfied (no CRITICAL introduced)
- [ ] Validation steps included
