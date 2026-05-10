# Product Redesign Plan

## Tujuan

Redesign `public/pages/product/index.html` agar halaman product lebih informatif, minimalis, dan nyaman dipakai untuk operasional inventory tanpa merusak fitur list, search, view detail, tambah product, edit product, dan hapus product.

Perubahan harus menjaga elemen yang dipakai JavaScript di `public/assets/js/pages/product/index.js`.

## Prinsip UI/UX

- Halaman product harus terasa seperti inventory workspace, bukan landing page.
- Informasi penting harus cepat terlihat: total product, stok tersedia, kategori, dan kondisi stok.
- Search dan tombol tambah product harus mudah ditemukan.
- Aksi product harus lengkap dan jelas: view, edit, hapus.
- Tabel tetap dipakai untuk desktop karena data product bersifat tabular.
- Tampilan mobile harus tetap bisa dipakai tanpa overlap, minimal dengan horizontal table scroll.
- Gunakan Tailwind CSS untuk layout dan utility class. Gunakan `app.css` hanya untuk komponen reusable atau state khusus.
- Jangan menambah dekorasi visual yang tidak membantu operasional.

## Masalah Tampilan Saat Ini

- Header halaman belum terpisah dari card tabel, sehingga hierarchy kurang jelas.
- Stat card sudah ada, tetapi belum menampilkan insight yang paling membantu inventory seperti stok kosong atau stok rendah.
- Search berada di card tabel, namun belum ada feedback jumlah hasil.
- Tabel cukup lengkap, tetapi total/harga/stok belum cukup mudah dipindai.
- Status hanya membedakan `Aktif` dan `Stok kosong`; belum membantu mendeteksi stok rendah.
- Empty state masih generik dan belum menonjolkan aksi `Tambah Product`.
- UI masih cukup verbose: `Data diambil dari SQLite` tidak membantu user operasional.

## Layout Baru Yang Disarankan

Gunakan 3 zona utama:

1. Header halaman
   - Judul `Products`.
   - Subtitle pendek: `Kelola product dan stok`.
   - Tombol utama `Tambah Product`.

2. Summary inventory
   - Total product.
   - Total stok tersedia.
   - Total kategori.
   - Stok kosong atau stok rendah.

3. Data area
   - Toolbar search dan jumlah hasil.
   - Tabel product.
   - Empty state ringkas.
   - Delete modal tetap dipertahankan.

## Struktur Desktop

```txt
------------------------------------------------------------
| Products                              [Tambah Product]    |
| Kelola product dan stok                                  |
------------------------------------------------------------
| Total Product | Stok Tersedia | Kategori | Stok Kosong    |
------------------------------------------------------------
| Search product/SKU/kategori                    25 hasil   |
------------------------------------------------------------
| Product | SKU | Kategori | Harga | Stok | Status | Aksi   |
------------------------------------------------------------
```

## Struktur Mobile

- Header menjadi stack vertikal.
- Summary card menjadi 2 kolom atau 1 kolom.
- Search full width.
- Tabel tetap `overflow-x-auto` untuk tahap pertama.
- Tombol `Tambah Product` full width jika ruang kecil.

## Informasi Yang Perlu Ditonjolkan

### Header

- `Products`
- `Kelola product dan stok`
- Tombol `Tambah Product`

### Summary Cards

ID lama yang sudah ada:

- `totalProducts`
- `availableStock`
- `totalCategories`

Tambahkan elemen baru:

- `emptyStockProducts`
- `productResultCount`

Opsional jika ingin insight lebih kuat:

- `lowStockProducts`

Rekomendasi summary:

- Total Product: jumlah semua product.
- Stok Tersedia: total stok seluruh product.
- Kategori: jumlah kategori unik.
- Stok Kosong: jumlah product dengan stok `0`.

### Toolbar

- Search placeholder lebih eksplisit: `Cari nama, SKU, kategori...`.
- Tampilkan jumlah hasil filter melalui `productResultCount`.
- Search dan count berada dalam satu toolbar yang bersih.

### Tabel

Kolom tetap:

- Product
- SKU
- Kategori
- Harga
- Stok
- Status
- Aksi

Penyempurnaan:

- Product cell tetap pakai thumbnail.
- Harga rata kanan atau bold agar mudah dipindai.
- Stok rata kanan atau memakai badge kecil.
- Status lebih informatif:
  - `Aktif` untuk stok aman.
  - `Stok rendah` jika stok kecil.
  - `Stok kosong` jika stok 0.
- Aksi tetap icon + teks: `View`, `Edit`, `Hapus`.

## Edit Product

Tambahkan tombol `Edit` pada setiap row product.

Rekomendasi route:

```txt
/products/:id/edit
```

Scope implementasi edit product:

- Tambahkan tombol `Edit` di action cell halaman product list.
- Tambahkan route frontend untuk edit product.
- Reuse `public/pages/product/form.html` jika memungkinkan.
- Update `public/assets/js/pages/product/form.js` agar bisa mode create dan edit.
- Tambahkan endpoint backend `PUT /api/products/:id` atau gunakan endpoint update yang sudah ada jika tersedia.
- Setelah edit berhasil, arahkan kembali ke `/products` dan tampilkan flash message.

Catatan UX:

- Urutan aksi row: `View`, `Edit`, `Hapus`.
- `Hapus` tetap memakai warna danger.
- `Edit` memakai style netral/primary ringan agar mudah dikenali tanpa terlalu dominan.
- Pada layar kecil, aksi boleh tetap horizontal dengan table scroll.

## Elemen ID Yang Harus Dipertahankan

Jangan hapus atau rename:

- `totalProducts`
- `availableStock`
- `totalCategories`
- `productMessage`
- `productSearch`
- `productTableWrapper`
- `productTable`
- `productEmptyState`
- `deleteProductModal`
- `deleteProductTitle`
- `deleteProductText`
- `cancelDeleteProductButton`
- `confirmDeleteProductButton`

Elemen baru yang aman ditambahkan:

- `emptyStockProducts`
- `productResultCount`

Jika elemen baru ditambahkan, JS harus mengecek keberadaannya agar tidak error.

## Rencana Implementasi Bertahap

1. Rapikan HTML
   - Pisahkan header halaman dari table card.
   - Pindahkan tombol `Tambah Product` ke header utama.
   - Tambahkan summary card `Stok Kosong`.
   - Tambahkan result count di toolbar.
   - Hapus teks yang tidak membantu seperti `Data diambil dari SQLite`.

2. Update JavaScript ringan
   - Tambahkan selector `emptyStockProducts` dan `productResultCount`.
   - Hitung empty stock dari `allProducts`.
   - Update result count berdasarkan product yang sedang tampil.
   - Tambahkan tombol edit di action cell.
   - Jangan ubah endpoint atau alur delete.

3. Perbaiki readability tabel
   - Harga dibuat bold dan rata kanan.
   - Stok dibuat lebih mudah dilihat.
   - Status dibedakan untuk stok kosong dan stok rendah.
   - Pastikan aksi tetap berada di kanan.

4. Tambahkan alur edit product
   - Update router agar `/products/:id/edit` memuat form product dalam mode edit.
   - Update form JS untuk load data product existing.
   - Tambahkan submit update ke backend.
   - Tampilkan flash message setelah update berhasil.

5. Perbaiki empty state
   - Jika data kosong: tampilkan `Belum ada data product`.
   - Jika search kosong hasil: tampilkan `Product tidak ditemukan`.
   - Aksi tambah tetap jelas di header.

6. Validasi responsif
   - Desktop: summary 4 kolom.
   - Tablet: summary 2 kolom.
   - Mobile: summary 1-2 kolom, search full width, tabel scroll.

## Risiko Dan Mitigasi

- Risiko: JS gagal karena ID berubah.
  - Mitigasi: pertahankan semua ID lama.

- Risiko: status stok rendah tidak sesuai kebutuhan bisnis.
  - Mitigasi: mulai dengan threshold sederhana, misalnya stok `1-5`.

- Risiko: summary membingungkan saat search aktif.
  - Mitigasi: summary utama tetap berdasarkan semua product, sedangkan `productResultCount` berdasarkan filter.

- Risiko: edit product membutuhkan perubahan router, form JS, dan backend di luar redesign list.
  - Mitigasi: implementasikan bertahap dan reuse form product agar UI tidak duplikatif.

- Risiko: halaman terlalu ramai.
  - Mitigasi: gunakan 4 summary card ringkas dan warna netral.

## Checklist Setelah Redesign

- Buka `/products`, product berhasil tampil.
- Search nama, SKU, kategori, dan status tetap berfungsi.
- Result count berubah saat search.
- Summary total product, stok tersedia, kategori, dan stok kosong benar.
- Link `View` tetap menuju `/products/:id`.
- Link `Edit` menuju route edit yang valid.
- Form edit berhasil memuat data product existing.
- Submit edit berhasil menyimpan perubahan product.
- Tombol `Tambah Product` tetap menuju `/products/new`.
- Tombol `Hapus` tetap membuka modal delete.
- Confirm delete tetap menghapus product dan refresh table.
- Empty state tampil benar saat data kosong.
- Empty state tampil benar saat search tidak menemukan hasil.
- Tidak ada error JavaScript saat product kosong.
- Layout desktop tidak overlap.
- Layout mobile tetap bisa digunakan dengan horizontal table scroll.
