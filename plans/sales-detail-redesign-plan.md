# Sales Detail Redesign Plan

## Tujuan

Redesign `public/pages/sales/detail.html` agar detail transaksi lebih informatif, minimalis, dan siap dicetak sebagai struk thermal.

Halaman layar boleh menampilkan aksi dan ringkasan tambahan, tetapi print preview harus hanya berisi isi transaksi/struk. Jangan ikut mencetak sidebar, header aplikasi, tombol, background halaman, alert, atau card wrapper dekoratif.

## Masalah Tampilan Saat Ini

- Detail transaksi masih terasa seperti card biasa, belum jelas membedakan tampilan layar dan tampilan struk cetak.
- Tombol `Print` memanggil `window.print()`, tetapi belum ada aturan CSS khusus thermal.
- Jika browser print tanpa CSS khusus, seluruh halaman bisa ikut tercetak.
- Struktur struk belum mengoptimalkan lebar kertas thermal 58mm atau 80mm.
- Item transaksi sudah tampil, tetapi belum memakai format yang umum untuk struk: nama item, qty x harga, subtotal per item, lalu total ringkas.
- Tombol aksi berada di dalam `saleReceipt`; saat print, tombol ini harus disembunyikan.

## Prinsip Desain

- Minimalis: detail transaksi harus cepat dipindai tanpa dekorasi berlebihan.
- Informatif: invoice, tanggal, customer, kasir, item, total, metode bayar, dibayar, dan kembalian harus jelas.
- Print-first untuk struk: CSS print harus menganggap `saleReceipt` sebagai dokumen utama.
- Thermal-friendly: gunakan ukuran sempit, font monospaced atau system font kecil, warna hitam, tanpa shadow, tanpa border card besar.
- Jangan mengubah kontrak data dari API kecuali diperlukan.

## Layout Layar Yang Disarankan

Gunakan 2 zona:

1. Header detail transaksi
   - Kiri: `Detail Transaksi`, invoice, tanggal.
   - Kanan: tombol `Print`, `POS Baru`, dan opsional `Kembali`.
   - Tombol berada di luar area struk atau diberi class `print:hidden`.

2. Isi transaksi
   - Panel ringkas berisi metadata dan daftar item.
   - Total dibuat menonjol.
   - Informasi pembayaran tetap terlihat, tapi tidak dominan berlebihan.

Struktur layar:

```txt
------------------------------------------------------------
| Detail Transaksi / INV-...              [Print] [POS Baru] |
------------------------------------------------------------
| Customer      Kasir       Tanggal                         |
|-----------------------------------------------------------|
| Item transaksi                                             |
|-----------------------------------------------------------|
| Subtotal, Diskon, Pajak, Total, Metode, Dibayar, Kembali   |
------------------------------------------------------------
```

## Struktur Print Thermal

Print preview harus hanya mencetak area struk, bukan semua halaman.

Gunakan `#saleReceipt` sebagai root print atau tambahkan wrapper khusus seperti:

```html
<section id="saleReceipt" class="...">
```

Di CSS print:

```css
@media print {
  @page {
    size: 80mm auto;
    margin: 4mm;
  }

  body * {
    visibility: hidden;
  }

  #saleReceipt,
  #saleReceipt * {
    visibility: visible;
  }

  #saleReceipt {
    position: absolute;
    left: 0;
    top: 0;
    width: 72mm;
    margin: 0;
    border: 0;
    box-shadow: none;
  }

  .receipt-screen-actions,
  .receipt-print-hidden {
    display: none !important;
  }
}
```

Catatan:

- `@page size: 80mm auto` cocok untuk printer thermal 80mm.
- Jika target printer 58mm, gunakan `size: 58mm auto` dan lebar konten sekitar `50mm`.
- Jangan cetak tombol `Print`, `POS Baru`, alert, atau container layout aplikasi.
- Print harus tetap terbaca jika browser tidak mendukung `visibility` sepenuhnya; gunakan class print khusus sebagai fallback bila perlu.

## Isi Struk Yang Dicetak

Struk thermal cukup mencetak isi transaksi:

- Nama sistem: `KASIRE`
- Label kecil: `Point of Sale`
- Invoice
- Tanggal transaksi
- Customer
- Kasir
- Daftar item:
  - Nama produk
  - SKU opsional jika masih cukup ruang
  - Qty x harga
  - Subtotal item
- Subtotal
- Diskon dan metadata diskon bila ada
- Pajak
- Total
- Metode pembayaran
- Dibayar
- Kembalian
- Footer singkat: `Terima kasih`

Jangan cetak:

- Header aplikasi
- Sidebar
- Tombol aksi
- Alert halaman
- Card shadow/background
- Teks instruksi UI

## Rekomendasi HTML

Pisahkan aksi layar dari isi struk:

```html
<section class="mx-auto max-w-4xl space-y-5">
  <div id="saleDetailMessage" class="alert hidden receipt-print-hidden"></div>

  <div class="receipt-screen-actions flex ...">
    <a href="/sales" class="app-button-secondary">Kembali</a>
    <button id="printReceiptButton" type="button" class="app-button-secondary">Print</button>
    <a href="/pos" class="app-button-primary">POS Baru</a>
  </div>

  <section id="saleReceipt" class="app-card hidden overflow-hidden">
    ...
  </section>
</section>
```

Catatan:

- `printReceiptButton` harus tetap ada karena dipakai `detail.js`.
- `saleReceipt` harus tetap ada karena dipakai `detail.js`.
- Tombol aksi tidak perlu berada di dalam `saleReceipt`.

## Rekomendasi Item Row

Untuk layar:

```txt
Product Name                         Rp40.000
2 x Rp20.000 | SKU-001
```

Untuk thermal print:

```txt
Product Name
2 x 20.000              40.000
```

Implementasi bisa tetap memakai elemen yang sama, lalu CSS print mengubah ukuran, spacing, dan font.

## Elemen ID Yang Harus Dipertahankan

Jangan hapus atau rename ID berikut tanpa update `public/assets/js/pages/sales/detail.js`:

- `saleDetailMessage`
- `saleReceipt`
- `receiptInvoice`
- `receiptDate`
- `printReceiptButton`
- `receiptCustomer`
- `receiptCashier`
- `receiptItems`
- `receiptSubtotal`
- `receiptDiscount`
- `receiptDiscountMeta`
- `receiptTax`
- `receiptTotal`
- `receiptPaymentMethod`
- `receiptPaidAmount`
- `receiptChangeAmount`

## Class Baru Yang Disarankan

- `receipt-shell`
- `receipt-screen-actions`
- `receipt-print-hidden`
- `receipt-print-header`
- `receipt-print-row`
- `receipt-total-row`

Gunakan class ini di `app.css` untuk membedakan tampilan layar dan print.

## Update JS Yang Disarankan

`detail.js` sudah cukup untuk render data dan print, tetapi bisa dibuat lebih robust:

1. Guard tombol print:

```js
const printButton = document.getElementById("printReceiptButton");

if (printButton) {
  printButton.addEventListener("click", () => window.print());
}
```

2. Tambahkan nama sistem statis di HTML, tidak perlu dari JS.

3. Jika item terlalu panjang, tetap gunakan `truncate` di layar tetapi print bisa `white-space: normal`.

4. Jangan buat print dengan membuka window baru kecuali benar-benar perlu. CSS `@media print` lebih sederhana dan menjaga data tetap sama.

## Rencana Implementasi Bertahap

1. Rapikan struktur HTML
   - Pindahkan tombol aksi ke luar `saleReceipt`.
   - Tambahkan header halaman ringkas.
   - Pastikan `saleReceipt` hanya berisi konten struk/transaksi.

2. Redesign tampilan layar
   - Gunakan `max-w-4xl` agar detail tidak terlalu sempit.
   - Buat metadata customer/kasir/tanggal dalam grid ringkas.
   - Buat total lebih menonjol.
   - Kurangi border dan teks deskriptif yang tidak penting.

3. Tambahkan struktur struk thermal
   - Tambahkan brand `KASIRE`.
   - Tambahkan separator visual sederhana.
   - Format item agar mudah dibaca pada lebar kecil.

4. Tambahkan CSS print
   - `@page size: 80mm auto`.
   - Sembunyikan semua elemen selain `#saleReceipt`.
   - Hilangkan shadow, background, radius besar, dan padding layar.
   - Gunakan font kecil dan line-height rapat.

5. Update JS kecil
   - Guard event listener tombol print.
   - Pastikan render item tetap aman untuk item kosong.

6. Uji manual
   - Buka `/sales/:id`.
   - Pastikan detail tampil setelah data dimuat.
   - Klik `Print`.
   - Print preview hanya menampilkan struk transaksi.
   - Pastikan tombol dan layout halaman tidak ikut tercetak.
   - Cek di ukuran kertas 80mm; jika target printer 58mm, sesuaikan `@page`.

## Risiko Implementasi

- Jika tombol aksi tetap di dalam `saleReceipt` tanpa class print hidden, tombol bisa ikut tercetak.
- Jika CSS print memakai `display: none` terlalu agresif, isi struk bisa ikut hilang.
- Jika lebar print terlalu besar, printer thermal akan memotong teks.
- Jika item panjang tidak diatur, nama produk bisa merusak alignment total.
- Jika `saleReceipt` dipakai juga sebagai card layar, CSS print harus override semua styling dekoratif.

## Definisi Selesai

- Detail transaksi layar lebih minimalis dan informatif.
- Tombol aksi tidak tercetak.
- Print preview hanya menampilkan isi transaksi/struk.
- Format print cocok untuk printer thermal 80mm.
- Semua ID yang dipakai JS tetap tersedia.
- Data item, subtotal, diskon, pajak, total, metode bayar, dibayar, dan kembalian tetap muncul benar.
