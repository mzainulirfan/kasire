# POS Redesign Plan

## Tujuan

Redesign `public/pages/pos/index.html` agar tampilan POS lebih minimalis, lebih cepat dipindai kasir, dan tetap informatif untuk transaksi aktif.

Perubahan harus menjaga `id` elemen yang sudah dipakai JavaScript di `public/assets/js/pages/pos/index.js`, supaya fitur cart, pembayaran, checkout, dan draft transaksi tetap berjalan.

## Prinsip Desain

- Fokus utama halaman adalah pencarian produk, cart aktif, dan total bayar.
- Kurangi teks deskriptif yang tidak membantu keputusan kasir.
- Gunakan layout padat, kontras jelas, dan angka penting yang lebih mudah terlihat.
- Jangan membuat halaman terasa seperti landing page; POS harus terasa seperti alat kerja.
- Tetap pakai Tailwind CSS untuk layout dan utility class, lalu gunakan `app.css` hanya untuk pola reusable atau animasi khusus.

## Masalah Tampilan Saat Ini

- Header terlalu mengambil ruang vertikal untuk fungsi POS.
- Panel produk dan cart sudah jelas, tapi informasi transaksi aktif belum cukup menonjol.
- Total pembayaran berada di panel kanan, tetapi belum menjadi titik fokus utama.
- Cart kosong dan cart berisi memakai area yang sama, namun belum ada ringkasan cepat jumlah item.
- Draft transaksi sudah ada di sistem, tetapi halaman POS belum menampilkan status draft secara eksplisit.

## Layout Baru Yang Disarankan

Gunakan layout 3 zona:

1. Header ringkas
   - Kiri: judul `POS` dan status kecil seperti `Transaksi aktif`.
   - Kanan: shortcut ke `Dashboard`, `Transactions`, `Products`.
   - Tinggi header lebih ramping dari sekarang.

2. Area kerja utama
   - Kiri: daftar produk.
   - Tengah: cart aktif.
   - Kanan: ringkasan pembayaran sticky.

3. Footer aksi mobile
   - Pada layar kecil, total dan tombol checkout dibuat selalu terlihat di bawah.
   - Panel pembayaran detail tetap bisa berada di bawah cart.

## Struktur Desktop

Rekomendasi grid:

```txt
------------------------------------------------------------
| POS | status draft                    Dashboard Sales ... |
------------------------------------------------------------
| Product Search + List | Cart Aktif        | Payment       |
|                       |                   | Summary       |
|                       |                   | Checkout      |
------------------------------------------------------------
```

Proporsi:

- Produk: 38%
- Cart: 34%
- Pembayaran: 28%

Tailwind contoh:

```html
<section class="grid min-h-0 flex-1 gap-4 xl:grid-cols-[minmax(340px,0.95fr)_minmax(360px,1fr)_minmax(320px,0.75fr)]">
```

## Informasi Yang Perlu Ditonjolkan

### Header

- `POS`
- Nama user/admin yang sedang login sebagai kasir input transaksi.
- Status transaksi:
  - `Cart kosong`
  - `Draft tersimpan`
  - `Sedang checkout`
- Navigasi tetap ringkas dengan icon + label.

Contoh informasi kasir:

```html
<div class="flex items-center gap-2 text-sm text-slate-600">
  <i class="bx bx-user-check text-lg text-blue-600" aria-hidden="true"></i>
  <span>Kasir:</span>
  <strong id="posCashierName" class="font-semibold text-slate-900">-</strong>
</div>
```

Catatan:

- `posCashierName` adalah elemen baru, jadi JS perlu mengisinya.
- Teks ini sebaiknya berada di header POS dekat status transaksi, bukan di panel pembayaran.
- Jika nama user belum tersedia, tampilkan fallback `Kasir aktif` atau `Admin`.

### Panel Produk

- Search input tetap paling atas.
- Tampilkan count produk hasil filter jika JS ditambah nanti.
- Product row cukup memuat:
  - Nama produk
  - SKU atau kategori
  - Harga
  - Stok tersisa
- Hindari card besar per produk; row compact lebih cocok untuk kasir.

### Panel Cart

- Header cart menampilkan jumlah jenis produk dan total qty.
- Item cart tetap compact:
  - Nama produk
  - Harga satuan
  - Qty stepper
  - Subtotal item
  - Tombol hapus icon saja
- Empty state lebih kecil, jangan mengambil terlalu banyak tinggi.

### Panel Pembayaran

- Total harus paling dominan.
- Urutan informasi:
  - Total
  - Subtotal
  - Diskon
  - Pajak
  - Metode pembayaran
  - Dibayar
  - Kembalian
  - Checkout
- Untuk metode non-cash, input `Dibayar` tetap disabled seperti sekarang.

## Draft Transaksi

Karena draft sudah disimpan di `localStorage`, UI POS sebaiknya memberi pengingat di halaman POS juga.

Tambahkan elemen informatif ringan:

```html
<span id="posDraftStatus" class="hidden ...">Draft tersimpan</span>
```

Catatan implementasi:

- Jika elemen baru ditambahkan, JS perlu update kecil.
- Jangan ubah mekanisme `localStorage` yang sudah ada kecuali diperlukan.
- Status draft bisa tampil di header ketika cart dipulihkan.

## Kasir Aktif

POS perlu menampilkan nama user/admin yang sedang login sebagai kasir yang menginput transaksi. Informasi ini membantu audit operasional dan memberi konteks saat beberapa admin memakai perangkat yang sama.

Rekomendasi UI:

- Tampilkan di header POS sebagai metadata ringkas.
- Format label: `Kasir: Nama Admin`.
- Gunakan ikon `bx-user-check` atau `bx-user-circle`.
- Jangan tampilkan sebagai card besar; cukup satu baris kecil.
- Pada mobile, label boleh pindah ke baris kedua header.

Sumber data:

- Prioritaskan data user dari endpoint/session yang sudah dipakai header aplikasi.
- Jika `router.js` sudah mengambil user aktif untuk header, pertimbangkan membuat helper reusable atau event kecil agar POS bisa menerima nama user tanpa fetch ganda.
- Jika implementasi paling sederhana dibutuhkan, POS boleh fetch endpoint user aktif yang sama saat init halaman.

Elemen baru yang disarankan:

```html
<strong id="posCashierName">-</strong>
```

Update JS:

```js
const posCashierName = document.getElementById("posCashierName");

if (posCashierName) {
  posCashierName.textContent = user.fullName || user.name || user.email || "Admin";
}
```

Catatan implementasi:

- Gunakan guard `if (posCashierName)` agar JS tetap aman jika elemen belum ada.
- Jangan mengirim nama kasir dari input bebas pengguna.
- Jika transaksi backend mendukung `cashierId` atau `cashierName`, gunakan user dari session saat checkout, bukan nilai dari DOM.
- Jika backend belum menyimpan kasir pada transaksi, tahap awal cukup tampilkan di UI.

## Elemen ID Yang Harus Dipertahankan

Jangan hapus atau rename elemen berikut:

- `posMessage`
- `posProductSearch`
- `posProductGrid`
- `posProductEmptyState`
- `posCustomer`
- `posCartItems`
- `posCartEmptyState`
- `posDiscountId`
- `posDiscountMeta`
- `posTax`
- `posPaymentMethod`
- `posPaidAmount`
- `posSubtotal`
- `posTotal`
- `posChange`
- `posCheckoutButton`

Elemen baru yang boleh ditambahkan:

- `posDraftStatus`
- `posCashierName`

Jika wrapper atau posisi diubah, ID tetap harus ada agar JS lama tetap jalan.

## Rencana Implementasi Bertahap

1. Rapikan struktur HTML
   - Ubah layout dari 2 panel menjadi 3 panel pada desktop.
   - Pertahankan layout 1 kolom pada mobile.
   - Kurangi padding dan teks yang tidak penting.

2. Perkuat panel pembayaran
   - Besarkan tampilan `posTotal`.
   - Jadikan tombol checkout selalu dekat dengan total.
   - Buat ringkasan pembayaran lebih mudah dipindai.

3. Buat cart lebih informatif
   - Tambahkan area ringkasan cart.
   - Jika perlu, tambah elemen baru seperti `posCartSummary`.
   - Update JS hanya untuk mengisi elemen tambahan, tanpa mengubah logika checkout.

4. Tambahkan indikator draft di halaman POS
   - Tampilkan status ketika draft berhasil dipulihkan.
   - Jangan tampilkan jika cart kosong.

5. Tambahkan informasi kasir aktif
   - Tambahkan `posCashierName` di header POS.
   - Isi nama dari user/admin yang sedang login.
   - Gunakan fallback jika nama tidak tersedia.
   - Jika checkout backend sudah mendukung metadata kasir, simpan kasir dari session di sisi server.

6. Validasi responsif
   - Desktop: 3 panel harus terlihat tanpa overlap.
   - Tablet: produk di atas, cart dan pembayaran di bawah jika ruang tidak cukup.
   - Mobile: checkout dan total harus tetap mudah ditemukan.

## Risiko Dan Mitigasi

- Risiko: JS gagal karena ID berubah.
  - Mitigasi: pertahankan semua ID yang sudah dipakai.

- Risiko: panel terlalu padat di mobile.
  - Mitigasi: gunakan breakpoint `xl` untuk 3 kolom, mobile tetap 1 kolom.

- Risiko: total kurang terlihat.
  - Mitigasi: buat `posTotal` memakai ukuran font lebih besar dan berada di bagian atas payment panel.

- Risiko: draft terlihat seperti transaksi tersimpan permanen.
  - Mitigasi: gunakan label `Draft tersimpan`, bukan `Transaksi tersimpan`.

- Risiko: nama kasir diambil dari DOM lalu dianggap sebagai data transaksi tepercaya.
  - Mitigasi: untuk penyimpanan transaksi, ambil kasir dari session/backend, bukan dari teks `posCashierName`.

- Risiko: fetch user aktif gagal sehingga header POS kosong.
  - Mitigasi: tampilkan fallback `Admin` atau `Kasir aktif`.

## Checklist Setelah Redesign

- Buka `/pos`, produk berhasil tampil.
- Search produk tetap berfungsi.
- Tambah item ke cart tetap berfungsi.
- Qty plus/minus dan hapus item tetap berfungsi.
- Subtotal, diskon, pajak, total, dibayar, dan kembalian tetap berubah benar.
- Pindah ke `/dashboard`, lalu balik ke `/pos`, draft cart tetap dipulihkan.
- Checkout berhasil menghapus draft.
- Nama user/admin login tampil sebagai kasir aktif di header POS.
- Jika data user aktif gagal dimuat, fallback kasir tetap tampil tanpa error JS.
- Sidebar POS tetap menampilkan indikator draft saat ada transaksi tertunda.
- Tidak ada horizontal scroll yang tidak perlu di desktop dan mobile.
