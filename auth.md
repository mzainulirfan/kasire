# Analisis Kebutuhan Sistem Authentication

Dokumen ini menjelaskan kebutuhan, rancangan, alur, endpoint, struktur data, validasi, keamanan, dan tahapan implementasi sistem authentication untuk aplikasi Data User.

## 1. Konteks Aplikasi

Aplikasi saat ini adalah aplikasi Node.js + Express dengan frontend HTML, Tailwind CSS, dan JavaScript vanilla. Data user aplikasi disimpan di file JSON lokal `data/users.json`.

Struktur utama aplikasi:

```text
server.js
src/app.js
src/lib/usersStore.js
src/lib/userValidation.js
data/users.json
public/index.html
public/pages/form.html
public/pages/dashboard.html
public/pages/settings.html
public/assets/js/router.js
public/assets/js/pages/form.js
public/assets/js/pages/dashboard.js
public/assets/css/app.css
```

Sistem authentication yang akan dibuat perlu mengikuti pola aplikasi saat ini, yaitu:

- Backend memakai Express.
- Frontend memakai halaman statis dan JavaScript browser.
- Penyimpanan awal dapat memakai file JSON agar konsisten dengan arsitektur sekarang.
- Route frontend memakai SPA sederhana melalui `router.js`.
- Validasi harus dilakukan di frontend dan backend.

## 2. Tujuan Authentication

Authentication dibutuhkan untuk memastikan hanya pengguna yang sah yang dapat mengakses fitur internal aplikasi.

Tujuan utama:

- Pengguna dapat login menggunakan email dan password.
- Pengguna dapat logout.
- Aplikasi dapat mengenali status login pengguna.
- Halaman internal seperti dashboard, form input, dan setting hanya dapat diakses setelah login.
- Data sensitif seperti password tidak disimpan dalam bentuk teks asli.
- Backend menolak akses API dari pengguna yang belum login.
- Frontend menampilkan navigasi dan halaman sesuai status login.

## 3. Scope Fitur

### 3.1 Fitur Minimum

Fitur minimum yang disarankan untuk implementasi awal:

- Halaman login.
- Endpoint login.
- Endpoint logout.
- Endpoint cek sesi pengguna aktif.
- Middleware proteksi API.
- Middleware proteksi halaman internal.
- Penyimpanan akun admin awal di file JSON.
- Password hashing.
- Session cookie HTTP-only.
- Pesan error login yang aman dan tidak membocorkan detail.

### 3.2 Fitur Opsional Lanjutan

Fitur berikut tidak wajib untuk tahap awal, tetapi sebaiknya disiapkan dalam rancangan:

- Register user admin baru.
- Ganti password.
- Reset password.
- Role-based access control.
- Remember me.
- Audit log login/logout.
- Account lockout setelah beberapa kali gagal login.
- Expiry session yang dapat dikonfigurasi.
- Migration dari file JSON ke database.

## 4. Jenis Pengguna

Untuk tahap awal, cukup gunakan satu tipe pengguna:

```text
Admin
```

Admin memiliki akses ke:

- Dashboard.
- Form input data user.
- Setting.
- API user.

Jika nanti aplikasi berkembang, role dapat dibuat seperti:

```text
admin
staff
viewer
```

Namun untuk kebutuhan sekarang, satu role `admin` sudah cukup dan lebih sederhana.

## 5. Halaman yang Dibutuhkan

### 5.1 Login

Route frontend:

```text
/login
```

File halaman:

```text
public/pages/login.html
public/assets/js/pages/login.js
```

Komponen halaman login:

- Input email.
- Input password.
- Tombol login.
- Pesan error.
- Loading state saat request berjalan.

Validasi frontend:

- Email wajib diisi.
- Email harus berformat valid.
- Password wajib diisi.

### 5.2 Halaman Internal

Halaman berikut harus dilindungi:

```text
/form
/dashboard
/settings
```

Jika pengguna belum login dan membuka halaman tersebut, aplikasi harus redirect ke:

```text
/login
```

### 5.3 Logout

Logout dapat berupa tombol di header atau sidebar.

Lokasi yang disarankan:

- Header kanan, dekat identitas admin.
- Sidebar bagian bawah.

Saat logout berhasil, pengguna diarahkan ke:

```text
/login
```

## 6. Endpoint Backend

### 6.1 Login

```http
POST /api/auth/login
Content-Type: application/json
```

Request body:

```json
{
  "email": "admin@example.com",
  "password": "password"
}
```

Response sukses:

```json
{
  "message": "Login berhasil.",
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

Response gagal:

```json
{
  "message": "Email atau password tidak valid."
}
```

Status code:

- `200` jika login berhasil.
- `400` jika input tidak lengkap atau format salah.
- `401` jika kredensial salah.

### 6.2 Logout

```http
POST /api/auth/logout
```

Response:

```json
{
  "message": "Logout berhasil."
}
```

Status code:

- `200` jika logout berhasil.

### 6.3 Cek User Aktif

```http
GET /api/auth/me
```

Response jika sudah login:

```json
{
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

Response jika belum login:

```json
{
  "message": "Unauthorized."
}
```

Status code:

- `200` jika session valid.
- `401` jika belum login.

## 7. Proteksi Route dan API

### 7.1 Halaman Publik

Halaman yang boleh diakses tanpa login:

```text
/login
/assets/*
/partials/*
/pages/login.html
```

### 7.2 Halaman Terproteksi

Halaman berikut hanya boleh diakses setelah login:

```text
/
/form
/dashboard
/settings
/index.html
```

### 7.3 API Terproteksi

Endpoint berikut harus dilindungi:

```text
GET /api/users
POST /api/users
DELETE /api/users/:id
```

Jika belum login, backend harus mengembalikan:

```http
401 Unauthorized
```

Dengan response:

```json
{
  "message": "Unauthorized."
}
```

## 8. Struktur Data Authentication

Disarankan membuat file baru:

```text
data/admins.json
```

Contoh struktur:

```json
[
  {
    "id": 1,
    "name": "Admin User",
    "email": "admin@example.com",
    "passwordHash": "$2b$10$exampleHash",
    "role": "admin",
    "createdAt": "2026-05-03T00:00:00.000Z",
    "updatedAt": "2026-05-03T00:00:00.000Z"
  }
]
```

Catatan penting:

- Jangan simpan password asli.
- Simpan password dalam bentuk hash.
- Gunakan email lowercase untuk pencarian.
- `passwordHash` harus dibuat dengan library hashing seperti `bcryptjs` atau `bcrypt`.

## 9. Library yang Dibutuhkan

Dependency minimum:

```bash
npm install express-session bcryptjs
```

Jika ingin keamanan cookie lebih lengkap:

```bash
npm install helmet
```

Kegunaan:

- `express-session`: menyimpan session login.
- `bcryptjs`: hash dan verifikasi password.
- `helmet`: menambahkan header keamanan HTTP.

Untuk aplikasi produksi, session sebaiknya disimpan di database atau Redis. Untuk aplikasi lokal sederhana, session memory store masih bisa dipakai saat development, tetapi tidak ideal untuk produksi.

## 10. Session dan Cookie

Session disarankan memakai cookie HTTP-only agar token tidak dapat dibaca oleh JavaScript browser.

Konfigurasi awal:

```js
app.use(
  session({
    name: "fullname.sid",
    secret: process.env.SESSION_SECRET || "change-this-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 1000 * 60 * 60 * 2
    }
  })
);
```

Catatan:

- `httpOnly: true` mencegah cookie dibaca oleh JavaScript.
- `sameSite: "lax"` membantu mengurangi risiko CSRF dasar.
- `secure: false` hanya untuk lokal HTTP.
- Di production HTTPS, `secure` harus `true`.
- `SESSION_SECRET` wajib memakai environment variable di production.

## 11. File Baru yang Disarankan

Backend:

```text
src/lib/adminsStore.js
src/lib/authValidation.js
src/middleware/authMiddleware.js
```

Frontend:

```text
public/pages/login.html
public/assets/js/pages/login.js
```

Data:

```text
data/admins.json
```

Dokumentasi:

```text
auth.md
```

## 12. Tanggung Jawab Tiap File

### 12.1 `src/lib/adminsStore.js`

Fungsi:

- Memastikan `data/admins.json` tersedia.
- Membaca daftar admin.
- Menulis daftar admin jika nanti ada fitur register atau ganti password.
- Menyediakan helper pencarian admin berdasarkan email.

Fungsi yang disarankan:

```js
ensureAdminsFile()
readAdmins()
saveAdmins(admins)
findAdminByEmail(email)
```

### 12.2 `src/lib/authValidation.js`

Fungsi:

- Normalisasi input login.
- Validasi email.
- Validasi password wajib diisi.

Fungsi yang disarankan:

```js
validateLoginInput(input)
```

### 12.3 `src/middleware/authMiddleware.js`

Fungsi:

- Mengecek apakah session user tersedia.
- Mengembalikan `401 Unauthorized` untuk API jika belum login.
- Redirect ke `/login` untuk halaman internal jika belum login.

Middleware yang disarankan:

```js
requireAuthApi(req, res, next)
requireAuthPage(req, res, next)
redirectIfAuthenticated(req, res, next)
```

### 12.4 `public/assets/js/pages/login.js`

Fungsi:

- Mengambil input email dan password.
- Validasi sisi frontend.
- Mengirim request ke `/api/auth/login`.
- Menampilkan error.
- Redirect ke `/dashboard` setelah login berhasil.

### 12.5 `public/pages/login.html`

Fungsi:

- Menampilkan form login.
- Menyediakan area pesan error.
- Mengikuti gaya UI aplikasi saat ini.

## 13. Perubahan pada `src/app.js`

Perubahan yang dibutuhkan:

- Import `express-session`.
- Import `bcryptjs`.
- Import store admin.
- Import validation login.
- Import auth middleware.
- Tambah middleware session sebelum route.
- Tambah route `/login`.
- Tambah endpoint `/api/auth/login`.
- Tambah endpoint `/api/auth/logout`.
- Tambah endpoint `/api/auth/me`.
- Proteksi route halaman internal.
- Proteksi endpoint `/api/users`.

Urutan middleware penting:

```text
express.json()
session()
auth routes
protected page routes
protected API routes
express.static()
```

Jika urutan salah, halaman atau API bisa terbuka tanpa login.

## 14. Perubahan pada Router Frontend

File:

```text
public/assets/js/router.js
```

Tambahkan route:

```js
login: {
  title: "Login",
  description: "Masuk untuk mengelola data user.",
  content: "/pages/login.html",
  init: initLoginPage
}
```

Hal yang perlu diperhatikan:

- Script `login.js` harus dimuat di `public/index.html`.
- Layout login sebaiknya tidak perlu menampilkan sidebar.
- Jika tetap memakai layout yang sama, sidebar harus disembunyikan saat halaman login.
- Router perlu mengecek status login sebelum memuat halaman internal.

Opsi sederhana:

- Backend redirect halaman internal ke `/login`.
- Frontend hanya mengikuti response backend.

Opsi lebih rapi:

- Frontend memanggil `/api/auth/me` saat load.
- Jika belum login dan halaman bukan login, redirect ke `/login`.
- Jika sudah login dan halaman login, redirect ke `/dashboard`.

## 15. Perubahan pada Header atau Sidebar

Header saat ini menampilkan:

```text
Admin User
admin@example.com
```

Setelah authentication dibuat, data ini sebaiknya tidak hard-coded.

Kebutuhan:

- Ambil user aktif dari `/api/auth/me`.
- Tampilkan `name` dan `email` dari session.
- Tambahkan tombol logout.

Contoh tampilan:

```text
Admin User
admin@example.com
[Logout]
```

Logout flow:

- Klik tombol logout.
- Frontend memanggil `POST /api/auth/logout`.
- Jika berhasil, redirect ke `/login`.

## 16. Validasi Login

Validasi frontend:

- Email wajib diisi.
- Email format valid.
- Password wajib diisi.

Validasi backend:

- Body request harus object.
- Email wajib diisi.
- Email format valid.
- Password wajib diisi.
- Email dinormalisasi dengan `trim()` dan lowercase untuk pencarian.

Pesan error backend:

- Untuk input kosong atau format salah: `Email dan password wajib diisi dengan benar.`
- Untuk email atau password salah: `Email atau password tidak valid.`

Jangan bedakan pesan antara email tidak ditemukan dan password salah. Ini mencegah enumerasi akun.

## 17. Password Hashing

Password wajib disimpan sebagai hash.

Library yang disarankan:

```text
bcryptjs
```

Membuat hash:

```js
const bcrypt = require("bcryptjs");
const passwordHash = await bcrypt.hash(password, 10);
```

Verifikasi password:

```js
const isMatch = await bcrypt.compare(password, admin.passwordHash);
```

Kebutuhan awal:

- Buat akun admin default.
- Password default sebaiknya tidak hard-coded di kode produksi.
- Untuk development, boleh menggunakan script seed.

Contoh akun development:

```text
Email: admin@example.com
Password: admin12345
```

Catatan: password default harus diganti sebelum production.

## 18. Security Requirement

### 18.1 Wajib

- Password tidak boleh disimpan plaintext.
- Cookie session harus `httpOnly`.
- API user harus dilindungi middleware login.
- Response login gagal tidak boleh memberitahu apakah email terdaftar.
- Jangan kirim `passwordHash` ke frontend.
- Session secret harus berasal dari environment variable untuk production.

### 18.2 Disarankan

- Gunakan `helmet`.
- Tambahkan rate limit untuk login.
- Tambahkan CSRF protection jika aplikasi mulai memakai form sensitif berbasis cookie.
- Gunakan HTTPS di production.
- Batasi ukuran JSON request.
- Simpan session di storage persisten untuk production.

### 18.3 Risiko pada Penyimpanan JSON

File JSON cocok untuk pembelajaran atau aplikasi kecil, tetapi punya risiko:

- Tidak aman untuk concurrent write.
- Tidak ideal untuk multi-user aktif.
- Sulit melakukan audit.
- Tidak punya indexing.
- Tidak cocok untuk production dengan data sensitif.

Jika authentication mulai digunakan serius, data admin dan session sebaiknya dipindah ke database.

## 19. Alur Login

```text
1. User membuka /login.
2. User mengisi email dan password.
3. Frontend validasi input dasar.
4. Frontend kirim POST /api/auth/login.
5. Backend validasi input.
6. Backend mencari admin berdasarkan email.
7. Backend membandingkan password dengan passwordHash.
8. Jika valid, backend menyimpan data user aman ke session.
9. Backend mengirim response sukses.
10. Frontend redirect ke /dashboard.
```

Data yang boleh disimpan di session:

```json
{
  "id": 1,
  "name": "Admin User",
  "email": "admin@example.com",
  "role": "admin"
}
```

Data yang tidak boleh disimpan di session:

```text
password
passwordHash
```

## 20. Alur Proteksi Halaman

```text
1. User membuka /dashboard.
2. Backend cek session.
3. Jika session tidak ada, redirect ke /login.
4. Jika session valid, backend mengirim public/index.html.
5. Router frontend memuat dashboard partial.
```

## 21. Alur Proteksi API

```text
1. Frontend memanggil GET /api/users.
2. Backend menjalankan middleware requireAuthApi.
3. Jika session tidak ada, backend response 401.
4. Jika session valid, backend lanjut membaca users.json.
5. Backend mengirim data user.
```

## 22. Alur Logout

```text
1. User klik logout.
2. Frontend kirim POST /api/auth/logout.
3. Backend destroy session.
4. Backend clear cookie.
5. Frontend redirect ke /login.
```

## 23. Rancangan UI Login

Login page sebaiknya dibuat sederhana dan fokus.

Elemen:

- Judul: `Login`
- Deskripsi singkat: `Masuk untuk mengelola data user.`
- Input email dengan icon envelope.
- Input password dengan icon lock.
- Tombol submit dengan icon login.
- Alert error.

State:

- Default.
- Validasi error.
- Loading.
- Login gagal.
- Network error.

UX yang perlu diperhatikan:

- Tombol disable saat request berjalan.
- Pesan error tampil jelas.
- Password input memakai `type="password"`.
- Setelah login berhasil, redirect ke `/dashboard`.

## 24. Rancangan Middleware

### 24.1 API Middleware

Pseudo-code:

```js
function requireAuthApi(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: "Unauthorized." });
  }

  return next();
}
```

### 24.2 Page Middleware

Pseudo-code:

```js
function requireAuthPage(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.redirect("/login");
  }

  return next();
}
```

### 24.3 Redirect Login Jika Sudah Login

Pseudo-code:

```js
function redirectIfAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return res.redirect("/dashboard");
  }

  return next();
}
```

## 25. Rancangan Endpoint Login

Pseudo-code:

```js
app.post("/api/auth/login", async (req, res) => {
  const { credentials, error } = validateLoginInput(req.body);

  if (error) {
    return res.status(400).json({ message: error });
  }

  const admin = findAdminByEmail(credentials.email);

  if (!admin) {
    return res.status(401).json({ message: "Email atau password tidak valid." });
  }

  const isPasswordValid = await bcrypt.compare(credentials.password, admin.passwordHash);

  if (!isPasswordValid) {
    return res.status(401).json({ message: "Email atau password tidak valid." });
  }

  req.session.user = {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role
  };

  return res.json({
    message: "Login berhasil.",
    user: req.session.user
  });
});
```

## 26. Rancangan Endpoint Logout

Pseudo-code:

```js
app.post("/api/auth/logout", (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      return res.status(500).json({ message: "Gagal logout." });
    }

    res.clearCookie("fullname.sid");
    return res.json({ message: "Logout berhasil." });
  });
});
```

## 27. Rancangan Endpoint Me

Pseudo-code:

```js
app.get("/api/auth/me", (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: "Unauthorized." });
  }

  return res.json({ user: req.session.user });
});
```

## 28. Urutan Implementasi yang Disarankan

1. Install dependency `express-session` dan `bcryptjs`.
2. Buat `data/admins.json`.
3. Buat helper `src/lib/adminsStore.js`.
4. Buat helper `src/lib/authValidation.js`.
5. Buat middleware `src/middleware/authMiddleware.js`.
6. Tambahkan konfigurasi session di `src/app.js`.
7. Tambahkan route `/login`.
8. Tambahkan endpoint `/api/auth/login`, `/api/auth/logout`, dan `/api/auth/me`.
9. Proteksi route `/form`, `/dashboard`, `/settings`, dan `/`.
10. Proteksi endpoint `/api/users`.
11. Buat `public/pages/login.html`.
12. Buat `public/assets/js/pages/login.js`.
13. Update `public/index.html` agar memuat `login.js`.
14. Update `public/assets/js/router.js` untuk mengenali route `login`.
15. Update header atau sidebar untuk tombol logout.
16. Uji login sukses.
17. Uji login gagal.
18. Uji akses dashboard tanpa login.
19. Uji API tanpa login.
20. Uji logout.

## 29. Test Case

### 29.1 Login Berhasil

Kondisi:

- Email terdaftar.
- Password benar.

Ekspektasi:

- Response `200`.
- Session dibuat.
- Frontend pindah ke `/dashboard`.

### 29.2 Login Gagal Karena Email Salah

Kondisi:

- Email tidak terdaftar.

Ekspektasi:

- Response `401`.
- Pesan: `Email atau password tidak valid.`
- Session tidak dibuat.

### 29.3 Login Gagal Karena Password Salah

Kondisi:

- Email terdaftar.
- Password salah.

Ekspektasi:

- Response `401`.
- Pesan: `Email atau password tidak valid.`
- Session tidak dibuat.

### 29.4 Akses Dashboard Tanpa Login

Kondisi:

- Tidak ada session.
- User membuka `/dashboard`.

Ekspektasi:

- Redirect ke `/login`.

### 29.5 Akses API Tanpa Login

Kondisi:

- Tidak ada session.
- Request `GET /api/users`.

Ekspektasi:

- Response `401`.
- Data user tidak dikirim.

### 29.6 Logout

Kondisi:

- User sudah login.
- User klik logout.

Ekspektasi:

- Session dihapus.
- Cookie dibersihkan.
- Frontend pindah ke `/login`.
- Akses `/dashboard` setelah logout kembali redirect ke `/login`.

## 30. Acceptance Criteria

Sistem authentication dianggap selesai jika:

- `/login` dapat dibuka tanpa session.
- Login berhasil dengan akun admin valid.
- Login gagal dengan pesan aman jika kredensial salah.
- Session tersimpan dalam cookie HTTP-only.
- `/dashboard`, `/form`, dan `/settings` tidak dapat dibuka tanpa login.
- `/api/users` tidak dapat diakses tanpa login.
- Header atau sidebar menampilkan tombol logout.
- Logout menghapus session.
- Setelah logout, user tidak bisa mengakses halaman internal.
- Password admin di `data/admins.json` berbentuk hash.
- Frontend tidak pernah menerima `passwordHash`.

## 31. Rekomendasi Implementasi Awal

Untuk aplikasi ini, implementasi paling realistis adalah:

- Gunakan `express-session`.
- Gunakan `bcryptjs`.
- Simpan admin di `data/admins.json`.
- Buat satu akun admin default untuk development.
- Proteksi semua halaman internal dan API user.
- Tambahkan tombol logout di header.

Pendekatan ini cukup ringan, sesuai struktur aplikasi saat ini, dan dapat dikembangkan ke database jika aplikasi mulai dipakai lebih serius.
