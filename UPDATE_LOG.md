# 🚀 T-GO Update Log

## Session Updates - 4 Januari 2026

Dokumen ini mencakup semua perubahan dan perbaikan yang dilakukan pada sesi pengembangan ini.

---

## 📋 Daftar Perubahan

### 1. Fix: Route Stops Column Name Mismatch

**File:** `supabase/migrations/20240117_fix_schema_with_stops.sql`

**Masalah:** Dropdown "Titik Jemput" dan "Tujuan Akhir" di `BookingModal` kosong karena nama kolom di database (`name`) tidak sesuai dengan yang diharapkan frontend (`stop_name`).

**Solusi:** Mengubah nama kolom dari `name` menjadi `stop_name` di tabel `route_stops`.

```sql
-- Jika tabel sudah ada, jalankan:
ALTER TABLE public.route_stops RENAME COLUMN name TO stop_name;
```

---

### 2. Feature: Admin Analytics Dashboard

**File:** `supabase/migrations/20240117_add_admin_analytics.sql`

**Deskripsi:** Menambahkan fungsi RPC `get_admin_analytics` untuk halaman Admin Analytics.

**Fitur:**

- 📊 Statistik: Total Pendapatan, Tiket Terjual, Total Penumpang, Okupansi
- 📈 Trend Persentase: Perbandingan dengan periode sebelumnya (real, bukan statis)
- 📉 Grafik Pendapatan: Dengan aggregasi dinamis
- 🏆 Top 5 Rute Terpopuler

**Aggregasi Dinamis:**
| Periode | Pengelompokan | Contoh Label |
|---------|---------------|--------------|
| 24 Jam | Per Jam | `14:00`, `15:00` |
| 7 Hari | Per Hari | `Mon`, `Tue` |
| 30 Hari | Per Hari | `01 Jan`, `02 Jan` |
| Tahun Ini | Per Bulan | `Oct 2025`, `Nov 2025` |

---

### 3. Fix: Bar Chart Height Calculation

**File:** `src/app/admin/analytics/page.tsx`

**Masalah:** Bar chart sangat kecil karena tinggi dihitung berdasarkan total revenue, bukan nilai maksimum dalam dataset.

**Solusi:** Mengubah rumus perhitungan tinggi bar agar proporsional terhadap nilai maksimum:

```tsx
const maxValue = Math.max(...revenueData.map(d => d.value));
style={{ height: `${(data.value / maxValue) * 100}%` }}
```

---

### 4. Feature: Dynamic Time Range Filter

**File:**

- `supabase/migrations/20240117_add_admin_analytics.sql`
- `src/app/admin/analytics/page.tsx`

**Deskripsi:** Dropdown filter waktu (24h, 7d, 30d, year) sekarang berfungsi dengan benar.

**Perubahan:**

- RPC function menerima parameter `p_time_range`
- Frontend mengirim `timeRange` ke backend
- Judul grafik dinamis sesuai periode yang dipilih

---

### 5. Feature: Real Trend Percentages

**File:**

- `supabase/migrations/20240117_add_admin_analytics.sql`
- `src/app/admin/analytics/page.tsx`

**Sebelum:** Angka trend (+12.5%, +8.2%, dll) statis/hardcoded.

**Sesudah:** Trend dihitung secara real dengan membandingkan:

- Periode saat ini vs Periode sebelumnya
- Contoh: 7 hari ini vs 7 hari sebelumnya

**Response dari RPC:**

```json
{
  "stats": {
    "totalRevenue": 8280000,
    "revenueTrend": 15.3, // Real calculation
    "ticketsTrend": -2.1, // Negative = turun
    "passengersTrend": 8.5
  }
}
```

---

### 6. Feature: Dummy Data Seeder (90 Hari)

**File:** `supabase/migrations/20240117_seed_dummy_tickets.sql`

**Deskripsi:** Script untuk mengisi data dummy tiket selama 90 hari (3 bulan) ke belakang.

**Karakteristik Data:**

- 🎲 2-8 tiket per hari (random)
- 👥 1-4 penumpang per tiket
- 🚌 Variasi rute R01 dan R02
- 📈 Tren pertumbuhan: Bulan terakhir lebih ramai
- 🗓️ Weekend boost: Lebih banyak tiket di Sabtu/Minggu
- 🧹 Auto-cleanup data dummy lama sebelum insert baru

---

## 🛠️ Cara Menerapkan Perubahan

### Langkah 1: Jalankan SQL Migrations

Buka **Supabase Dashboard** → **SQL Editor** dan jalankan file-file berikut secara berurutan:

1. `supabase/migrations/20240117_fix_schema_complete.sql` - Setup tabel routes & tickets
2. `supabase/migrations/20240117_fix_schema_with_stops.sql` - Setup tabel route_stops
3. `supabase/migrations/20240117_add_wallet_system.sql` - Setup wallet & transactions
4. `supabase/migrations/20240117_add_admin_analytics.sql` - Setup analytics RPC function
5. `supabase/migrations/20240117_seed_dummy_tickets.sql` - (Opsional) Generate dummy data

### Langkah 2: Restart Development Server

```bash
npm run dev
```

### Langkah 3: Verifikasi

- Buka halaman Admin Analytics
- Coba semua filter waktu (24h, 7d, 30d, Year)
- Pastikan trend (%) berubah sesuai periode
- Pastikan grafik "Tahun Ini" menampilkan 1 batang per bulan

---

## 📁 File yang Dimodifikasi

| File                                                     | Tipe | Deskripsi                 |
| -------------------------------------------------------- | ---- | ------------------------- |
| `supabase/migrations/20240117_fix_schema_with_stops.sql` | SQL  | Fix kolom `stop_name`     |
| `supabase/migrations/20240117_add_admin_analytics.sql`   | SQL  | RPC function analytics    |
| `supabase/migrations/20240117_seed_dummy_tickets.sql`    | SQL  | Seeder data dummy 90 hari |
| `src/app/admin/analytics/page.tsx`                       | TSX  | Dashboard analytics UI    |

---

## ⚠️ Catatan Penting

1. **Urutan Eksekusi SQL:** Pastikan menjalankan migrations sesuai urutan karena ada foreign key dependencies.

2. **Drop Function:** Jika mengalami error saat update `get_admin_analytics`, jalankan dulu:

   ```sql
   DROP FUNCTION IF EXISTS get_admin_analytics(VARCHAR);
   DROP FUNCTION IF EXISTS get_admin_analytics();
   ```

3. **Rename Column:** Jika tabel `route_stops` sudah ada dengan kolom `name`, jalankan:
   ```sql
   ALTER TABLE public.route_stops RENAME COLUMN name TO stop_name;
   ```

---

## 🎉 Hasil Akhir

Dashboard Analytics sekarang menampilkan:

- ✅ Data statistik real-time
- ✅ Trend persentase yang dihitung dari data transaksi
- ✅ Grafik dengan aggregasi dinamis (jam/hari/bulan)
- ✅ Filter waktu yang berfungsi (24h, 7d, 30d, year)
- ✅ Top 5 rute terpopuler

---

_Dokumen ini dibuat pada 4 Januari 2026_
