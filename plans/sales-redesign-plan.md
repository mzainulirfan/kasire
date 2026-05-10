# Sales Redesign Plan

## Tujuan

Redesign `public/pages/sales/index.html` agar daftar transaksi lebih informatif, minimalis, dan mudah dipindai tanpa mengganggu alur melihat detail receipt.

Perubahan harus menjaga elemen yang sudah dipakai JavaScript di `public/assets/js/pages/sales/index.js`, terutama search, table, wrapper, message, dan empty state.

## Prinsip Desain

- Halaman harus terasa seperti riwayat transaksi operasional, bukan halaman marketing.
- Informasi paling penting harus terlihat cepat: jumlah transaksi, total penjualan, transaksi terbaru, dan akses ke detail.
- Search tetap menjadi kontrol utama.
- Tabel tetap dipakai di desktop karena cocok untuk data transaksi.
- Mobile perlu tampilan yang tidak memaksa horizontal scroll terlalu ekstrem.
- Gunakan Tailwind CSS untuk layout dan spacing, lalu `app.css` hanya untuk pola reusable jika diperlukan.

## Masalah Tampilan Saat Ini

- Hanya ada tabel; tidak ada ringkasan transaksi di bagian atas.
- User tidak langsung tahu total transaksi atau total nominal dari data yang sedang tampil.
- Header card masih memuat deskripsi yang kurang bernilai untuk kasir/admin.
- Search sudah ada, tetapi tidak ada feedback jumlah hasil filter.
- Tabel desktop cukup jelas, tapi informasi angka penting seperti total belum cukup menonjol.
- Empty state masih generik dan belum memberi aksi lanjut yang kuat.

## Layout Baru Yang Disarankan

Gunakan 3 zona utama:

1. Header halaman ringkas
   - Judul `Transactions`.
   - Ringkasan kecil seperti `Riwayat penjualan POS`.
   - Tombol `Buka POS` di kanan.

2. Summary bar
   - Total transaksi.
   - Total penjualan.
   - Transaksi terbaru.
   - Metode pembayaran dominan atau jumlah transaksi cash/non-cash.

3. Data area
   - Toolbar search dan count hasil.
   - Tabel transaksi.
   - Empty state yang lebih ringkas dan actionable.

## Struktur Desktop

Rekomendasi:

```txt
------------------------------------------------------------
| Transactions                         [Buka POS]           |
| Riwayat penjualan POS                                    |
------------------------------------------------------------
| Total Transaksi | Total Penjualan | Terbaru | Pembayaran  |
------------------------------------------------------------
| Search invoice/customer/kasir                  25 hasil   |
------------------------------------------------------------
| Invoice | Customer | Kasir | Metode | Total | Tanggal |   |
------------------------------------------------------------
```

## Struktur Mobile

Opsi aman:

- Tetap pakai tabel dengan `overflow-x-auto`, tetapi header dan summary dibuat responsive.
- Summary cards menjadi 2 kolom atau 1 kolom.
- Search full width.

Opsi lanjutan:

- Tambahkan render card list khusus mobile lewat JS.
- Ini lebih nyaman, tetapi butuh perubahan JS lebih besar. Untuk tahap pertama, cukup perbaiki tabel dan summary.

## Informasi Yang Perlu Ditonjolkan

### Header

- `Transactions`
- Subtitle pendek: `Riwayat penjualan POS`
- Tombol `Buka POS`

### Summary Cards

Tambahkan elemen baru:

- `salesTotalCount`
- `salesTotalAmount`
- `salesLatestDate`
- `salesPaymentSummary`

Isi yang disarankan:

- Total transaksi dari data yang sedang tampil.
- Total penjualan dari data yang sedang tampil.
- Tanggal transaksi terbaru.
- Ringkasan metode pembayaran, misalnya `Cash 8 | Non-cash 12`.

Catatan:

- Summary bisa berdasarkan hasil filter agar user melihat konteks data yang sedang dicari.
- Jika ingin summary semua data, tambahkan label eksplisit seperti `Semua transaksi`.

### Toolbar

Tambahkan elemen:

- `salesResultCount`

Fungsi:

- Menampilkan `25 transaksi` atau `0 hasil`.
- Saat search aktif, bisa tampil `5 hasil ditemukan`.

### Tabel

Kolom tetap:

- Invoice
- Customer
- Kasir
- Pembayaran
- Total
- Tanggal
- Aksi

Penyempurnaan tampilan:

- Invoice bold.
- Total bold dan rata kanan.
- Metode pembayaran dibuat badge kecil.
- Tombol aksi bisa icon + `View`, tetap jelas.
- Tanggal bisa dibuat dua baris jika JS diubah: tanggal dan jam.

## Elemen ID Yang Harus Dipertahankan

Jangan hapus atau rename:

- `salesMessage`
- `salesSearch`
- `salesTableWrapper`
- `salesTable`
- `salesEmptyState`

Elemen baru yang aman ditambahkan:

- `salesTotalCount`
- `salesTotalAmount`
- `salesLatestDate`
- `salesPaymentSummary`
- `salesResultCount`

Jika elemen baru ditambahkan, JS harus mengecek keberadaannya agar tidak error.

## Rencana Implementasi Bertahap

1. Rapikan HTML
   - Pisahkan header halaman dari card tabel.
   - Tambahkan summary cards.
   - Tambahkan toolbar search dan result count.
   - Pertahankan tabel dan empty state.

2. Update JavaScript ringan
   - Tambahkan selector elemen summary baru.
   - Hitung summary dari `items` yang sedang dirender.
   - Update result count saat search berubah.
   - Buat payment method badge pada kolom pembayaran.

3. Perkuat table readability
   - Total dibuat rata kanan dan bold.
   - Aksi tetap di kanan.
   - Baris hover tetap halus.

4. Perbaiki empty state
   - Jika tidak ada transaksi sama sekali: tampilkan pesan `Belum ada transaksi`.
   - Jika search tidak menemukan data: tampilkan `Transaksi tidak ditemukan`.
   - Aksi utama tetap `Buka POS` di header.

5. Validasi responsif
   - Desktop: summary dan tabel tidak overlap.
   - Tablet: summary turun ke grid 2 kolom.
   - Mobile: search full width, tabel tetap bisa scroll horizontal.

## Risiko Dan Mitigasi

- Risiko: tabel tidak terisi karena ID berubah.
  - Mitigasi: pertahankan semua ID lama.

- Risiko: summary salah menghitung saat filter aktif.
  - Mitigasi: hitung summary dari array `items` yang sama dengan tabel.

- Risiko: data kosong menyebabkan tanggal terbaru error.
  - Mitigasi: tampilkan `-` ketika tidak ada transaksi.

- Risiko: tampilan terlalu ramai.
  - Mitigasi: summary cukup 4 kartu kecil, teks singkat, dan warna netral.

## Checklist Setelah Redesign

- Buka `/sales`, data transaksi berhasil tampil.
- Search invoice/customer/kasir/metode tetap berfungsi.
- Empty state tampil benar ketika data kosong.
- Empty state tampil benar ketika search tidak menemukan data.
- Summary count dan total berubah mengikuti hasil filter.
- Link `View` tetap menuju `/sales/:id`.
- Tombol `Buka POS` tetap menuju `/pos`.
- Tidak ada error JavaScript saat data transaksi kosong.
- Tabel tetap nyaman dibaca di desktop.
- Mobile tidak mengalami overlap antar elemen.
