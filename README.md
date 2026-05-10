# KASIRE

KASIRE adalah aplikasi kasir dan manajemen toko berbasis Node.js, Express, SQLite, dan Vanilla JavaScript. Aplikasi ini menyediakan halaman admin untuk mengelola user/customer, product, kategori, diskon, transaksi POS, riwayat penjualan, profile, dan pengaturan admin.

## Fitur

- Login/logout admin berbasis session.
- Dashboard admin.
- Manajemen user/customer.
- Promosi user menjadi admin dan pencabutan akses admin.
- Manajemen product dengan SKU, kategori, harga, stok, status, dan foto product.
- Upload foto product maksimal 4 file, maksimal 5 MB per file.
- Manajemen kategori product.
- Manajemen diskon nominal dan persen.
- POS untuk membuat transaksi.
- Riwayat transaksi dan detail penjualan.
- Update stok otomatis saat transaksi dibuat.
- Validasi input di backend dan frontend.

## Tech Stack

- Node.js
- Express.js
- Express Session
- better-sqlite3
- bcryptjs
- multer
- Tailwind CSS via CDN/class utility di frontend
- Vanilla JavaScript

## Struktur Project

```txt
fullname/
|-- data/
|   |-- app.sqlite          # Database utama SQLite
|   |-- admins.json         # Seed admin lama/fallback
|   `-- users.json          # Seed user lama/fallback
|-- public/
|   |-- assets/
|   |   |-- css/app.css
|   |   `-- js/
|   |-- pages/              # Halaman SPA
|   |-- partials/           # Header dan sidebar
|   `-- uploads/products/   # File foto product
|-- src/
|   |-- lib/                # Store, validasi, database, upload
|   |-- middleware/         # Middleware auth
|   |-- routes/             # Route web dan API
|   `-- app.js              # Konfigurasi Express
|-- server.js               # Entry point server
|-- package.json
`-- README.md
```

## Instalasi

```bash
npm install
```

## Menjalankan Aplikasi

```bash
npm start
```

Server berjalan di:

```txt
http://localhost:3000
```

Port bisa diubah dengan environment variable `PORT`.

```bash
PORT=4000 npm start
```

PowerShell:

```powershell
$env:PORT = "4000"; npm start
```

Untuk production/local yang lebih aman, set juga `SESSION_SECRET`.

```bash
SESSION_SECRET="ganti-dengan-secret-yang-kuat" npm start
```

PowerShell:

```powershell
$env:SESSION_SECRET = "ganti-dengan-secret-yang-kuat"; npm start
```

## Data dan Seed

Aplikasi memakai SQLite di `data/app.sqlite`. Saat server pertama kali berjalan, schema akan dibuat otomatis dan data awal akan di-seed dari:

- `data/users.json` untuk user/customer.
- `data/admins.json` untuk admin jika tabel admin masih kosong.
- product default dari `src/lib/database.js`.
- kategori default dari kategori product yang ada.

File upload product disimpan di `public/uploads/products`.

## Autentikasi

Semua halaman utama selain `/login` dilindungi session login admin. Data admin tersimpan di tabel `admins`.

Catatan:

- Admin awal berasal dari `data/admins.json` atau default seed di `src/lib/database.js` saat tabel admin kosong.
- User yang dipromosikan menjadi admin lewat fitur user mendapatkan password awal `user12345`.
- Password admin bisa diganti lewat halaman profile.

## Halaman Web

| Route | Keterangan |
| --- | --- |
| `/login` | Login admin |
| `/users` | Manajemen user/customer |
| `/dashboard` | Dashboard |
| `/products` | Daftar product |
| `/products/new` | Tambah product |
| `/products/:id` | Detail product |
| `/products/:id/edit` | Edit product |
| `/categories` | Manajemen kategori |
| `/discounts` | Manajemen diskon |
| `/pos` | Point of Sales |
| `/sales` | Riwayat penjualan |
| `/sales/:id` | Detail penjualan |
| `/profile` | Profile dan ganti password |
| `/settings` | Pengaturan admin |

## API Utama

Semua endpoint API di bawah ini membutuhkan session admin, kecuali login dan logout.

| Method | Endpoint | Keterangan |
| --- | --- | --- |
| `POST` | `/api/auth/login` | Login admin |
| `POST` | `/api/auth/logout` | Logout admin |
| `GET` | `/api/auth/me` | Data admin yang sedang login |
| `PATCH` | `/api/auth/profile/password` | Ganti password |
| `GET` | `/api/admins` | Daftar admin |
| `DELETE` | `/api/admins/:id` | Cabut akses admin |
| `GET` | `/api/users` | Daftar user |
| `POST` | `/api/users` | Tambah user |
| `POST` | `/api/users/:id/promote-admin` | Promosikan user menjadi admin |
| `DELETE` | `/api/users/:id` | Hapus user |
| `GET` | `/api/products` | Daftar product |
| `GET` | `/api/products/:id` | Detail product |
| `POST` | `/api/products` | Tambah product |
| `PUT` | `/api/products/:id` | Update product |
| `DELETE` | `/api/products/:id` | Hapus product |
| `GET` | `/api/categories` | Daftar kategori |
| `POST` | `/api/categories` | Tambah kategori |
| `DELETE` | `/api/categories/:id` | Hapus kategori |
| `GET` | `/api/discounts` | Daftar diskon |
| `POST` | `/api/discounts` | Tambah diskon |
| `DELETE` | `/api/discounts/:id` | Hapus diskon |
| `GET` | `/api/sales` | Daftar transaksi |
| `GET` | `/api/sales/:id` | Detail transaksi |
| `POST` | `/api/sales` | Buat transaksi POS |

## Catatan Development

- Project belum memiliki script test otomatis.
- Database SQLite dibuat dan dimigrasikan secara ringan saat aplikasi start.
- `data/app.sqlite-wal` dan `data/app.sqlite-shm` adalah file pendamping SQLite WAL.
- Jangan hapus folder `public/uploads/products` jika masih membutuhkan foto product yang sudah diupload.

## License

ISC
