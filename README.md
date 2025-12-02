# 🚍 T-Go - Sistem Pemesanan Tiket Angkot Digital

<div align="center">

![T-Go Logo](public/logobeneran.png)

**Platform modern untuk pemesanan tiket angkot di Tangerang**

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-green?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

[Demo](https://t-go.vercel.app) · [Dokumentasi](./docs) · [Report Bug](https://github.com/your-username/t-go/issues) · [Request Feature](https://github.com/your-username/t-go/issues)

</div>

---

## 📋 Daftar Isi

- [Tentang Project](#-tentang-project)
- [Fitur Utama](#-fitur-utama)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Struktur Project](#-struktur-project)
- [Dokumentasi](#-dokumentasi)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

---

## 🎯 Tentang Project

**T-Go** adalah aplikasi web modern yang memudahkan masyarakat Tangerang untuk memesan tiket angkot secara digital. Aplikasi ini menyediakan:

- 🎫 Pemesanan tiket online yang mudah dan cepat
- 🗺️ Peta interaktif untuk melihat rute angkot
- 📱 Interface yang responsif dan user-friendly
- 👨‍💼 Dashboard admin untuk mengelola rute, tiket, dan pengguna
- 🔒 Sistem autentikasi yang aman

### 🎥 Demo

![T-Go Demo](public/angkott.mp4)

---

## ✨ Fitur Utama

### 👤 Untuk Pengguna

- ✅ **Registrasi & Login** - Sistem autentikasi yang aman
- 🗺️ **Peta Interaktif** - Lihat semua rute angkot di peta dengan Leaflet
- 🔍 **Pencarian Rute** - Cari rute berdasarkan tujuan atau kode rute
- 🎫 **Pemesanan Tiket** - Pesan tiket dengan mudah dan cepat
- 📱 **QR Code** - Tiket digital dengan QR code untuk validasi
- 📊 **Riwayat Tiket** - Lihat semua tiket aktif dan riwayat perjalanan
- 💳 **Multiple Payment** - Berbagai metode pembayaran (Coming Soon)
- 🔔 **Notifikasi** - Notifikasi real-time untuk tiket dan promo (Coming Soon)

### 👨‍💼 Untuk Admin

- 📊 **Dashboard Analytics** - Overview statistik lengkap
- 🛣️ **Kelola Rute** - CRUD rute angkot dengan mudah
- 🎫 **Kelola Tiket** - Monitor dan validasi tiket
- 👥 **Kelola User** - Manajemen pengguna
- 📍 **Kelola Halte** - Tambah dan edit halte/stops
- 📈 **Reporting** - Laporan pendapatan dan penggunaan

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **UI Library**: [React 19](https://reactjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Maps**: [Leaflet](https://leafletjs.com/) + [React Leaflet](https://react-leaflet.js.org/)
- **QR Code**: [qrcode.react](https://www.npmjs.com/package/qrcode.react)

### Backend & Database
- **BaaS**: [Supabase](https://supabase.com/)
- **Database**: PostgreSQL
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Real-time**: Supabase Realtime

### State Management & Data Fetching
- **State**: [Zustand](https://github.com/pmndrs/zustand)
- **Data Fetching**: [TanStack Query](https://tanstack.com/query)

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint
- **Formatting**: Prettier (recommended)
- **Version Control**: Git

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x atau lebih baru
- npm atau yarn
- Akun Supabase (gratis)

### Installation

1. **Clone repository**

```bash
git clone https://github.com/your-username/t-go.git
cd t-go
```

2. **Install dependencies**

```bash
npm install
```

3. **Setup environment variables**


```bash
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Setup database**

- Buka [Supabase Dashboard](https://app.supabase.com)
- Buat project baru
- Jalankan SQL migrations dari folder `supabase/migrations`
- Atau copy schema dari `docs/technical_documentation.md`

5. **Run development server**

```bash
npm run dev
```

6. **Open browser**

Buka [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

---

## 📁 Struktur Project

```
t-go/
├── public/                 # Static assets
│   ├── logobeneran.png
│   ├── angkotBG.jpg
│   └── angkott.mp4
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── page.tsx      # Landing page
│   │   ├── login/        # Login page
│   │   ├── register/     # Register page
│   │   ├── dashboard/    # User dashboard
│   │   │   ├── page.tsx
│   │   │   ├── map/      # Interactive map
│   │   │   ├── ticket/   # Ticket management
│   │   │   └── profile/  # User profile
│   │   ├── admin/        # Admin panel
│   │   │   ├── page.tsx
│   │   │   ├── routes/   # Route management
│   │   │   ├── tickets/  # Ticket management
│   │   │   └── users/    # User management
│   │   └── api/          # API routes
│   ├── components/
│   │   ├── ui/           # Base UI components
│   │   ├── layout/       # Layout components
│   │   └── section/      # Section components
│   ├── lib/
│   │   ├── supabase/     # Supabase clients
│   │   ├── store.ts      # Zustand store
│   │   └── utils.ts      # Utility functions
│   ├── types/
│   │   └── types.ts      # TypeScript types
│   └── hooks/            # Custom React hooks
├── .env.local            # Environment variables (gitignored)
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.ts
```

---

## 📚 Dokumentasi

Dokumentasi lengkap tersedia di folder `docs/`:

- 📊 [**Project Analysis**](docs/project_analysis.md) - Analisis lengkap project
- ✅ [**Todo List**](docs/todo_list.md) - Daftar fitur yang sudah dan belum dibuat
- 🗺️ [**Development Roadmap**](docs/development_roadmap.md) - Roadmap pengembangan
- 📖 [**Technical Documentation**](docs/technical_documentation.md) - Dokumentasi teknis
- 🚀 [**Quick Reference**](docs/quick_reference.md) - Quick reference guide

### Quick Links

- [API Documentation](docs/technical_documentation.md#api-documentation)
- [Database Schema](docs/technical_documentation.md#database-schema)
- [Deployment Guide](docs/technical_documentation.md#deployment-guide)
- [Contributing Guide](CONTRIBUTING.md)

---

## 🗺️ Roadmap

### ✅ Phase 1: MVP (Completed)
- [x] Authentication system
- [x] User dashboard
- [x] Interactive map
- [x] Ticket booking
- [x] Admin panel (basic)

### 🔄 Phase 2: Critical Features (In Progress)
- [ ] Payment integration (Midtrans/Xendit)
- [ ] Notification system (Email + Push)
- [ ] Security enhancement (Forgot password, Email verification)

### 📅 Phase 3: High Priority (Planned)
- [ ] Real-time tracking
- [ ] Rating & review system
- [ ] Enhanced admin features
- [ ] User engagement features

### 🌟 Phase 4: Enhancement (Future)
- [ ] PWA support
- [ ] Multi-language (i18n)
- [ ] Advanced analytics
- [ ] AI-powered features

Lihat [Development Roadmap](docs/development_roadmap.md) untuk detail lengkap.

---

## 🤝 Contributing

Kontribusi sangat diterima! Silakan baca [Contributing Guide](CONTRIBUTING.md) untuk detail.

### How to Contribute

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'feat: add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

### Commit Convention

Gunakan [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc)
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Lucide Icons](https://lucide.dev/)
- [shadcn/ui](https://ui.shadcn.com/)

---

<div align="center">

**Made with ❤️ for Tangerang**

⭐ Star this repo if you find it helpful!

</div>