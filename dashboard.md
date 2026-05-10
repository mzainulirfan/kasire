# Proses Pembuatan Halaman Dashboard

Dokumen ini menjelaskan proses pembuatan halaman dashboard untuk aplikasi input data user. Dashboard digunakan untuk melihat ringkasan data, daftar user, dan status validasi data yang sudah tersimpan.

## Tujuan Dashboard

Halaman dashboard dibuat untuk:

- Menampilkan total user yang sudah tersimpan.
- Menampilkan daftar data user dari file JSON.
- Menyediakan tampilan ringkas dan mudah dibaca.
- Menampilkan status data, seperti jumlah user terbaru dan data kosong.
- Menjadi halaman utama setelah data berhasil dikumpulkan.

## Teknologi

- HTML
- Tailwind CSS
- JavaScript
- Express.js
- File JSON `data/users.json`

## Struktur File yang Dibutuhkan

```text
fullname/
├── public/
│   ├── index.html
│   ├── dashboard.html
│   ├── app.js
│   └── dashboard.js
├── data/
│   └── users.json
├── server.js
├── package.json
├── README.md
└── dashboard.md
```

## Alur Pembuatan

1. Siapkan route API untuk mengambil data user.
2. Buat file halaman dashboard di `public/dashboard.html`.
3. Buat file JavaScript dashboard di `public/dashboard.js`.
4. Ambil data user dari endpoint `/api/users`.
5. Hitung total user dari data JSON.
6. Tampilkan data dalam bentuk ringkasan dan tabel.
7. Tambahkan kondisi tampilan ketika data masih kosong.
8. Uji halaman dashboard di browser.

## Endpoint yang Digunakan

Dashboard menggunakan endpoint yang sudah tersedia:

```http
GET /api/users
```

Endpoint ini membaca data dari:

```text
data/users.json
```

Contoh response:

```json
[
  {
    "id": 1777780281699,
    "fullName": "Budi Santoso",
    "email": "budi@example.com",
    "phone": "081234567890",
    "address": "Jakarta",
    "birthDate": "2000-01-15",
    "createdAt": "2026-05-03T03:51:21.699Z"
  }
]
```

## Komponen Dashboard

Halaman dashboard minimal memiliki komponen berikut:

- Header halaman.
- Tombol kembali ke form input.
- Kartu ringkasan total user.
- Kartu ringkasan user terbaru.
- Tabel daftar user.
- Empty state ketika belum ada data.

## Rancangan Tampilan

Dashboard menggunakan layout sederhana:

- Background halaman berwarna netral.
- Konten berada di tengah dengan lebar maksimum.
- Ringkasan data ditampilkan dalam grid.
- Daftar user ditampilkan dalam tabel.
- Tampilan responsive untuk desktop dan mobile.

## Contoh File `public/dashboard.html`

```html
<!doctype html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Dashboard User</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="min-h-screen bg-slate-100 text-slate-900">
    <main class="mx-auto max-w-6xl px-4 py-8">
      <header class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-semibold">Dashboard User</h1>
          <p class="text-sm text-slate-600">Ringkasan data user yang tersimpan.</p>
        </div>

        <a href="index.html" class="inline-flex rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          Kembali ke Form
        </a>
      </header>

      <section class="mb-6 grid gap-4 sm:grid-cols-2">
        <article class="rounded-lg bg-white p-5 shadow">
          <p class="text-sm text-slate-600">Total User</p>
          <p id="totalUsers" class="mt-2 text-3xl font-semibold">0</p>
        </article>

        <article class="rounded-lg bg-white p-5 shadow">
          <p class="text-sm text-slate-600">User Terbaru</p>
          <p id="latestUser" class="mt-2 text-lg font-semibold">Belum ada data</p>
        </article>
      </section>

      <section class="rounded-lg bg-white p-5 shadow">
        <h2 class="mb-4 text-lg font-semibold">Daftar User</h2>

        <div class="overflow-x-auto">
          <table class="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr class="border-b border-slate-200">
                <th class="py-3 pr-4 font-semibold">Nama</th>
                <th class="py-3 pr-4 font-semibold">Email</th>
                <th class="py-3 pr-4 font-semibold">Telepon</th>
                <th class="py-3 pr-4 font-semibold">Tanggal Lahir</th>
                <th class="py-3 pr-4 font-semibold">Alamat</th>
              </tr>
            </thead>
            <tbody id="userTable"></tbody>
          </table>
        </div>

        <p id="emptyState" class="hidden py-6 text-center text-sm text-slate-600">
          Belum ada data user.
        </p>
      </section>
    </main>

    <script src="dashboard.js"></script>
  </body>
</html>
```

## Contoh File `public/dashboard.js`

```js
const totalUsers = document.getElementById("totalUsers");
const latestUser = document.getElementById("latestUser");
const userTable = document.getElementById("userTable");
const emptyState = document.getElementById("emptyState");

function createCell(text) {
  const cell = document.createElement("td");
  cell.className = "border-b border-slate-100 py-3 pr-4 text-slate-700";
  cell.textContent = text;
  return cell;
}

function renderDashboard(users) {
  totalUsers.textContent = users.length;
  userTable.replaceChildren();

  if (!users.length) {
    latestUser.textContent = "Belum ada data";
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");
  latestUser.textContent = users[users.length - 1].fullName;

  users.forEach((user) => {
    const row = document.createElement("tr");
    row.appendChild(createCell(user.fullName));
    row.appendChild(createCell(user.email));
    row.appendChild(createCell(user.phone));
    row.appendChild(createCell(user.birthDate));
    row.appendChild(createCell(user.address));
    userTable.appendChild(row);
  });
}

async function loadDashboard() {
  try {
    const response = await fetch("/api/users");
    const users = await response.json();
    renderDashboard(users);
  } catch (error) {
    emptyState.textContent = "Gagal memuat data dashboard.";
    emptyState.classList.remove("hidden");
  }
}

loadDashboard();
```

## Integrasi dengan Form

Tambahkan link menuju dashboard di halaman form `public/index.html`, misalnya di bagian atas form:

```html
<a href="dashboard.html" class="text-sm font-medium text-blue-600 hover:text-blue-700">
  Lihat Dashboard
</a>
```

## Langkah Pengujian

1. Jalankan server:

```bash
npm start
```

2. Buka form input:

```text
http://localhost:3000
```

3. Input beberapa data user.

4. Buka dashboard:

```text
http://localhost:3000/dashboard.html
```

5. Pastikan total user, user terbaru, dan tabel data tampil sesuai isi `data/users.json`.

## Catatan Pengembangan

Dashboard ini masih menggunakan file JSON sebagai sumber data. Untuk aplikasi produksi, pertimbangkan penggunaan database agar data lebih aman, mudah dicari, dan dapat diproses dengan pagination atau filter.
