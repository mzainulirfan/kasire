# Dashboard Redesign Plan

## Tujuan

Redesign `public/pages/dashboard/index.html` agar dashboard `KASIRE` lebih informatif, minimalis, dan relevan untuk sistem kasir.

Dashboard sebaiknya menjadi halaman ringkasan operasional, bukan halaman utama untuk mengelola user. Informasi utama yang perlu cepat terbaca adalah penjualan, transaksi terbaru, kondisi produk, stok, dan ringkasan data pendukung.

Perubahan harus mempertahankan ID elemen yang dipakai oleh `public/assets/js/pages/dashboard/index.js`, supaya data tetap ter-render tanpa merusak fungsi pencarian user, tabel transaksi terbaru, tabel produk terbaru, dan modal hapus user.

## Masalah Tampilan Saat Ini

- Stat card sudah ada, tetapi urutannya masih terasa seperti aplikasi data user karena `Total User` berada paling awal.
- Tabel `Daftar User` mengambil ruang paling besar, padahal user bukan aktivitas utama sistem POS.
- Dashboard belum menonjolkan konteks kasir seperti omzet, transaksi terakhir, produk terbaru, dan stok.
- Tabel kanan sudah ringkas, tetapi ukuran kolom belum sepenuhnya nyaman untuk data panjang seperti invoice, nama customer, nama produk, dan harga.
- Layout dua kolom `2xl` membuat tabel user terlalu dominan pada layar besar.
- Copywriting masih campur `User`, `Product`, `Income`; perlu konsisten dengan bahasa sistem.
- Tidak ada area ringkasan cepat yang memberi insight seperti produk aktif, stok total, kategori, dan transaksi terbaru dalam satu pandangan.

## Prinsip Desain

- Minimalis: kurangi teks penjelasan panjang, gunakan label singkat dan angka yang jelas.
- Informatif: angka utama harus lebih mudah dipindai daripada tabel.
- Operasional: utamakan data yang membantu admin/kasir memahami kondisi toko.
- Tabel padat: hindari tabel terlalu lebar jika datanya hanya ringkasan.
- Responsif: desktop memakai layout grid yang seimbang, mobile tetap satu kolom dengan tabel scroll bila perlu.
- Pertahankan Tailwind utility classes; tambahkan CSS khusus hanya jika dipakai berulang.

## Prioritas Informasi

Urutan informasi yang disarankan:

1. Omzet / Total Pendapatan
2. Total Transaksi
3. Total Produk
4. Total Stok
5. Kategori Produk
6. Total Pengguna

Catatan:

- `totalIncome`, `totalProducts`, `totalProductStock`, `totalProductCategories`, dan `totalUsers` sudah tersedia.
- `Total Transaksi` belum punya elemen ID khusus di HTML saat ini, tetapi bisa ditambahkan jika JS ikut diperbarui.
- Jika ingin implementasi tanpa perubahan JS besar, stat `Total Transaksi` bisa ditunda atau dihitung dengan elemen baru dari `allSales.length`.

## Layout Baru Yang Disarankan

Gunakan 3 zona:

1. Ringkasan KPI
   - Baris card ringkas berisi pendapatan, transaksi, produk, stok, kategori, pengguna.
   - Card dibuat lebih padat dengan angka kuat dan label kecil.

2. Aktivitas Operasional
   - Kiri: `Transaksi Terbaru`, lebih dominan daripada sekarang.
   - Kanan: `Produk Terbaru` dan/atau ringkasan stok.

3. Data Pendukung
   - `Pengguna` menjadi panel sekunder di bawah, bukan fokus utama.
   - Tetap ada pencarian dan aksi hapus karena fungsi sudah ada.

Struktur desktop:

```txt
------------------------------------------------------------
| KPI: Pendapatan | Transaksi | Produk | Stok | Kategori   |
------------------------------------------------------------
| Transaksi Terbaru                    | Produk Terbaru    |
| table lebar                          | table ringkas     |
------------------------------------------------------------
| Pengguna / Admin system                                  |
| search + table ringkas                                    |
------------------------------------------------------------
```

Struktur mobile:

```txt
KPI cards 2 kolom
Transaksi Terbaru
Produk Terbaru
Pengguna
```

## Ukuran Dan Desain Tabel

### 1. Tabel Transaksi Terbaru

Tabel ini perlu lebih prioritas karena dashboard POS paling sering dipakai untuk memantau transaksi.

Rekomendasi wrapper:

```html
<div id="latestSalesTableWrapper" class="overflow-x-auto rounded-xl border border-slate-200">
  <table class="w-full min-w-[640px] table-fixed border-collapse text-left text-sm">
```

Rekomendasi kolom:

| Kolom | Width | Catatan |
| --- | ---: | --- |
| Invoice | 42% | Berisi invoice + tanggal, harus cukup untuk truncate aman |
| Customer | 30% | Nama customer bisa panjang, gunakan truncate |
| Total | 28% | Rata kanan agar angka mudah dibandingkan |

Perbaikan:

- Tambahkan `overflow-x-auto`; saat ini wrapper tidak scroll horizontal.
- Total sebaiknya `text-right tabular-nums`.
- Batasi isi table ke 5 transaksi seperti JS saat ini.
- Header section cukup `Transaksi Terbaru`, subtitle pendek atau hilangkan jika ruang sempit.

### 2. Tabel Produk Terbaru

Tabel produk harus ringkas dan tidak menimbulkan horizontal scrolling pada panel samping dashboard. Nama produk tetap ditampilkan, tetapi kolomnya perlu lebih hemat ruang dengan truncate yang tegas.

Rekomendasi wrapper:

```html
<div id="latestProductTableWrapper" class="rounded-xl border border-slate-200">
  <table class="w-full table-fixed border-collapse text-left text-sm">
```

Rekomendasi kolom:

| Kolom | Width | Catatan |
| --- | ---: | --- |
| Produk | 42% | Nama + SKU dengan truncate, jangan biarkan kolom ini mendorong scroll |
| Harga | 34% | Rata kanan, angka stabil |
| Stok | 24% | Rata kanan atau badge kecil |

Perbaikan:

- Hilangkan `min-w-[560px]` pada tabel produk agar tidak memaksa horizontal scrolling.
- Pastikan wrapper produk tidak memakai `overflow-x-auto` kecuali ada kebutuhan khusus.
- Kurangi lebar kolom nama produk; prioritaskan harga dan stok agar mudah dibaca.
- Harga dan stok sebaiknya rata kanan.
- Jika stok rendah bisa diberi warna, tetapi butuh tambahan logic JS.
- Hindari card produk besar; tabel ringkas lebih cocok untuk dashboard kerja.

### 3. Tabel Pengguna

Tabel user tetap dipertahankan karena JS sudah mengelola pencarian dan delete modal, tetapi posisinya menjadi sekunder.

Rekomendasi wrapper:

```html
<div id="tableWrapper" class="overflow-x-auto rounded-xl border border-slate-200">
  <table class="w-full min-w-[720px] table-fixed border-collapse text-left text-sm">
```

Rekomendasi kolom:

| Kolom | Width | Catatan |
| --- | ---: | --- |
| Pengguna | 34% | Nama + email, avatar tetap |
| Kontak | 32% | Email/telepon, bisa truncate |
| Terdaftar | 22% | Tanggal + ID |
| Aksi | 12% | Tombol hapus icon atau pendek |

Perbaikan:

- Hilangkan kolom `Alamat` dari tabel pengguna agar tabel lebih ringkas dan tidak terlalu lebar.
- Turunkan `min-w` dari `960px` ke sekitar `720px` agar lebih nyaman pada laptop.
- Fungsi pencarian tetap boleh mencari alamat karena data masih ada di JS; hanya kolom alamat yang tidak ditampilkan.
- Jika tombol `Hapus` terasa terlalu lebar, bisa dibuat icon-only dengan `title`, tetapi pastikan aksesibilitas tetap ada.
- Section title ubah dari `Daftar User` menjadi `Pengguna Sistem`.
- Deskripsi dibuat pendek: `Kelola akses pengguna yang tersimpan.`

## KPI Cards

KPI card saat ini memakai `xl:grid-cols-5`. Untuk dashboard yang lebih informatif, gunakan 5-6 card dengan ukuran seragam.

Rekomendasi:

```html
<section class="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
```

Card yang disarankan:

- `Pendapatan` menggunakan `totalIncome`
- `Transaksi` menggunakan ID baru seperti `totalSales`
- `Produk` menggunakan `totalProducts`
- `Total Stok` menggunakan `totalProductStock`
- `Kategori` menggunakan `totalProductCategories`
- `Pengguna` menggunakan `totalUsers`

Jika tidak ingin update JS pada tahap pertama:

- Tetap gunakan 5 card yang ada.
- Urutkan ulang menjadi `Income`, `Total Product`, `Stok Product`, `Kategori Product`, `Total User`.
- Ubah label menjadi `Pendapatan`, `Produk`, `Total Stok`, `Kategori`, `Pengguna`.

## Elemen ID Yang Harus Dipertahankan

Jangan hapus atau rename ID berikut tanpa mengubah `public/assets/js/pages/dashboard/index.js`:

- `totalUsers`
- `totalProducts`
- `totalProductStock`
- `totalProductCategories`
- `totalIncome`
- `userSearch`
- `searchControl`
- `addDataControl`
- `dashboardMessage`
- `tableWrapper`
- `userTable`
- `emptyState`
- `latestSalesTableWrapper`
- `latestSalesTable`
- `latestSalesEmptyState`
- `latestProductTableWrapper`
- `latestProductTable`
- `latestProductEmptyState`
- `deleteModal`
- `deleteModalTitle`
- `deleteModalText`
- `cancelDeleteButton`
- `confirmDeleteButton`

ID berikut ada di JS tetapi tidak ada di HTML saat ini. Bisa dihapus dari JS atau ditambahkan bila diperlukan:

- `latestUser`
- `latestSavedAt`

## Update JS Yang Disarankan

Jika redesign menambah `Total Transaksi`, update `public/assets/js/pages/dashboard/index.js`:

```js
const totalSales = document.getElementById("totalSales");
```

Saat render:

```js
if (totalSales) {
  totalSales.textContent = allSales.length;
}
```

Untuk angka harga dan stok di tabel:

- Tambahkan class `text-right tabular-nums` pada cell total, harga, dan stok.
- Bisa ubah `createTableCell(text, className = "")` agar menerima class tambahan seperti sekarang.

Contoh pemakaian:

```js
row.appendChild(createTableCell(formatCurrency(sale.total), "text-right tabular-nums"));
row.appendChild(createTableCell(formatCurrency(product.price), "text-right tabular-nums"));
row.appendChild(createTableCell(String(product.stock), "text-right tabular-nums"));
```

## Rencana Implementasi Bertahap

1. Rapikan KPI cards
   - Ubah label ke Bahasa Indonesia.
   - Urutkan KPI berdasarkan kepentingan POS.
   - Buat card lebih padat dan seragam.

2. Ubah layout utama dashboard
   - Jadikan `Transaksi Terbaru` panel utama.
   - Letakkan `Produk Terbaru` sebagai panel samping.
   - Pindahkan `Pengguna Sistem` ke bawah sebagai data pendukung.

3. Sesuaikan ukuran tabel
   - `Transaksi Terbaru`: `min-w-[640px]`, kolom 42/30/28.
   - `Produk Terbaru`: tanpa `min-w`, kolom 42/34/24, tidak memunculkan horizontal scroll.
   - `Pengguna Sistem`: `min-w-[720px]`, kolom 34/32/22/12, tanpa kolom alamat.

4. Perbaiki cell alignment
   - Total transaksi rata kanan.
   - Harga dan stok rata kanan.
   - Nama produk, invoice, customer, dan kontak pengguna gunakan truncate.
   - Jangan render `createAddressCell(user)` di tabel dashboard.

5. Minimalisasi copywriting
   - Hapus deskripsi panjang yang tidak membantu.
   - Gunakan judul pendek: `Transaksi Terbaru`, `Produk Terbaru`, `Pengguna Sistem`.
   - Tombol `Lihat` bisa tetap ada, tetapi ukurannya compact.

6. Pertahankan empty state dan modal
   - Empty state tetap ada untuk user, transaksi, dan produk.
   - Modal hapus user tetap di bagian bawah file.
   - Jangan ubah ID modal.

7. Uji manual
   - Buka `/dashboard`.
   - Pastikan KPI terisi.
   - Pastikan tabel transaksi dan produk menampilkan maksimal 5 item.
   - Pastikan search user tetap memfilter.
   - Pastikan delete modal user tetap bisa dibuka dan ditutup.
   - Cek desktop, laptop, tablet, dan mobile.

## Risiko Implementasi

- Jika elemen ID dipindah tapi dihapus, JS dashboard akan error.
- Jika tabel dibuat terlalu sempit tanpa truncate, teks invoice/produk bisa merusak layout.
- Jika kolom alamat dihapus dari HTML tetapi JS masih menambahkan `createAddressCell(user)`, jumlah cell tidak sesuai header tabel.
- Jika `Total Transaksi` ditambahkan tanpa guard JS, halaman bisa error pada render awal.
- Jika panel user terlalu disembunyikan, fungsi pencarian dan hapus user bisa terasa hilang dari dashboard.

## Definisi Selesai

- Dashboard terlihat sebagai dashboard POS, bukan halaman user management.
- KPI utama lebih cepat terbaca dan relevan dengan `KASIRE`.
- Tabel produk tidak memunculkan horizontal scrolling pada panel dashboard.
- Tabel pengguna tidak menampilkan kolom alamat.
- Tabel transaksi, produk, dan pengguna punya lebar yang jelas dan tidak saling mendominasi.
- Layout mobile tetap usable dengan horizontal scroll hanya pada tabel yang memang membutuhkan lebar tambahan.
- Semua ID yang dipakai JS tetap tersedia.
- Search user, latest sales, latest products, empty state, dan modal hapus user tetap berfungsi.
