# Sidebar Redesign Plan

## Tujuan

Redesign `public/partials/sidebar.html` agar identitas sistem lebih jelas sebagai `KASIRE`, bukan lagi aplikasi manajemen user umum.

Sidebar harus tetap ringan, mudah dipindai, dan cocok untuk sistem kasir yang dipakai berulang oleh admin atau kasir. Perubahan perlu mempertahankan atribut `data-menu` karena dipakai oleh `public/assets/js/router.js` untuk menentukan menu aktif.

## Masalah Tampilan Saat Ini

- Brand masih tertulis `Data User` dengan subtitle `Management App`, tidak sesuai dengan sistem kasir.
- Ikon brand memakai `bx-id-card`, sehingga konteks visual lebih terasa seperti data pengguna daripada POS atau retail.
- Label menu masih campur antara Bahasa Inggris dan Indonesia, misalnya `Transactions`, `Users Management`, `Category`, `Discount`, dan `Setting`.
- Tidak ada pemisahan kelompok menu, sehingga fitur operasional POS, katalog, dan akun terlihat sejajar semua.
- State badge draft POS sudah ada, tetapi belum punya konteks visual yang cukup jelas untuk pengguna.
- Pada mobile, sidebar menjadi horizontal scroll; ini sudah fungsional, tetapi label panjang seperti `Users Management` bisa memakan ruang terlalu besar.

## Brand Yang Disarankan

Gunakan identitas berikut:

- Nama sistem: `KASIRE`
- Subtitle: `Point of Sale`
- Ikon brand: `bx-store`, `bx-cart-alt`, atau `bx-receipt`
- Warna utama tetap mengikuti sistem saat ini: biru `#2563eb`

Contoh struktur brand:

```html
<div class="mb-6 flex items-center gap-3">
  <span class="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-200">
    <i class="bx bx-store text-2xl" aria-hidden="true"></i>
  </span>
  <div class="min-w-0">
    <p class="truncate text-base font-bold tracking-tight text-slate-950">KASIRE</p>
    <p class="truncate text-xs font-medium text-slate-500">Point of Sale</p>
  </div>
</div>
```

## Label Navigasi

Gunakan label yang konsisten, pendek, dan sesuai konteks sistem kasir.

| Saat Ini | Usulan | Alasan |
| --- | --- | --- |
| Dashboard | Dashboard | Sudah umum dan jelas |
| POS | POS | Istilah utama sistem kasir |
| Transactions | Transaksi | Lebih konsisten dengan Bahasa Indonesia |
| Users Management | Pengguna | Lebih pendek untuk mobile |
| Products | Produk | Konsisten Bahasa Indonesia |
| Category | Kategori | Konsisten Bahasa Indonesia |
| Discount | Diskon | Konsisten Bahasa Indonesia |
| Setting | Pengaturan | Lebih natural |

## Pengelompokan Menu

Pada desktop, bagi navigasi menjadi beberapa kelompok supaya alur kerja lebih jelas:

1. Operasional
   - Dashboard
   - POS
   - Transaksi

2. Master Data
   - Produk
   - Kategori
   - Diskon
   - Pengguna

3. Sistem
   - Pengaturan

Catatan mobile:

- Jika heading kelompok membuat horizontal nav terlalu ramai, heading hanya ditampilkan pada `lg`.
- Pada mobile, menu tetap satu baris horizontal scroll seperti saat ini.

## Struktur Desktop Yang Disarankan

```txt
--------------------------------
| [icon] KASIRE                 |
|        Point of Sale          |
|                              |
| Operasional                  |
|   Dashboard                  |
|   POS        [draft badge]   |
|   Transaksi                  |
|                              |
| Master Data                  |
|   Produk                     |
|   Kategori                   |
|   Diskon                     |
|   Pengguna                   |
|                              |
| Sistem                       |
|   Pengaturan                 |
--------------------------------
```

## Improve UI/UX Yang Disarankan

### 1. Brand Lebih Relevan

- Ubah `Data User` menjadi `KASIRE`.
- Ubah `Management App` menjadi `Point of Sale`.
- Ubah ikon `bx-id-card` menjadi ikon retail seperti `bx-store`.

### 2. Menu Lebih Mudah Dipindai

- Gunakan label pendek.
- Kelompokkan menu berdasarkan pekerjaan pengguna.
- Letakkan `Pengguna` setelah menu katalog karena bukan flow utama transaksi harian.

### 3. State Aktif Lebih Jelas

- Pertahankan class `sidebar-link-active`.
- Tambahkan indikator visual halus di sisi kiri item aktif pada desktop jika diperlukan.
- Pastikan active state tetap kontras tinggi dan tidak bergantung hanya pada warna teks.

### 4. Badge Draft POS Lebih Bermakna

- Badge draft POS tetap memakai `data-pos-draft-badge`.
- Tambahkan `aria-label="Ada transaksi POS yang belum selesai"` pada badge.
- Pertahankan `title` yang sudah ada agar hover desktop tetap informatif.

### 5. Mobile Lebih Ringkas

- Hindari label menu terlalu panjang.
- Pastikan setiap link memakai `shrink-0` atau pola CSS setara agar item tidak terjepit.
- Brand tetap terlihat di atas nav, tetapi tidak terlalu tinggi agar ruang konten tidak terdorong.

### 6. Aksesibilitas

- Gunakan `aria-label="Navigasi utama"` pada `<nav>`.
- Ikon tetap `aria-hidden="true"` karena label teks sudah ada.
- Jika menambah heading kelompok, gunakan teks kecil non-interaktif dan jangan membuatnya terlihat seperti tombol.

## Elemen Yang Harus Dipertahankan

Jangan ubah atau hapus atribut berikut tanpa menyesuaikan `public/assets/js/router.js`:

- `data-menu="dashboard"`
- `data-menu="pos"`
- `data-menu="sales"`
- `data-menu="form"`
- `data-menu="products"`
- `data-menu="categories"`
- `data-menu="discounts"`
- `data-menu="settings"`
- `data-pos-draft-badge`

Class berikut juga harus tetap kompatibel dengan CSS dan router:

- `sidebar-link`
- `sidebar-link-active`

## Rencana Implementasi

1. Update brand block
   - Ganti ikon ke `bx-store`.
   - Ganti judul menjadi `KASIRE`.
   - Ganti subtitle menjadi `Point of Sale`.
   - Tambahkan `min-w-0` dan `truncate` agar aman pada viewport kecil.

2. Update label menu
   - `Transactions` menjadi `Transaksi`.
   - `Users Management` menjadi `Pengguna`.
   - `Products` menjadi `Produk`.
   - `Category` menjadi `Kategori`.
   - `Discount` menjadi `Diskon`.
   - `Setting` menjadi `Pengaturan`.

3. Tambahkan grouping desktop
   - Bungkus link menjadi grup `Operasional`, `Master Data`, dan `Sistem`.
   - Heading grup hanya tampil pada `lg` agar mobile tetap compact.
   - Pastikan layout horizontal mobile tetap bekerja.

4. Improve atribut aksesibilitas
   - Tambahkan `aria-label` pada `<nav>`.
   - Tambahkan `aria-label` pada badge draft POS.
   - Pertahankan `title` untuk tooltip browser default.

5. Review CSS sidebar
   - Cek apakah `.sidebar-link` perlu `shrink: 0` untuk mobile.
   - Jika grouping ditambahkan, pastikan gap desktop dan mobile tetap rapi.
   - Pastikan active state tetap muncul setelah `router.js` mengganti class link.

6. Uji manual
   - Buka Dashboard, POS, Transaksi, Produk, Kategori, Diskon, Pengguna, dan Pengaturan.
   - Pastikan menu aktif berubah sesuai route.
   - Pastikan badge draft POS masih muncul ketika `localStorage` punya `kasire.posDraft.v1`.
   - Cek tampilan mobile agar horizontal nav tidak rusak.

## Risiko Implementasi

- Jika link dibungkus terlalu dalam dengan struktur yang tidak sesuai CSS, horizontal nav mobile bisa menjadi tidak nyaman.
- Jika `data-menu` berubah, active menu dari `router.js` akan rusak.
- Jika badge draft POS dipindahkan keluar dari link POS, posisi absolute dari CSS saat ini bisa tidak sesuai.

## Definisi Selesai

- Sidebar menampilkan brand `KASIRE` dan subtitle `Point of Sale`.
- Semua label menu relevan dan konsisten untuk sistem kasir.
- Menu tetap aktif sesuai route.
- Badge draft POS tetap berfungsi.
- Tampilan mobile dan desktop tetap rapi tanpa teks terpotong secara buruk.
