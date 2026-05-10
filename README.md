# Aplikasi Data User

Aplikasi form input data user dengan HTML, Tailwind CSS, Express, dan penyimpanan JSON.

## Route

- `/form` untuk halaman input data
- `/dashboard` untuk halaman ringkasan data

## Struktur Folder

```text
fullname/
├── server.js
├── src/
│   ├── app.js
│   └── lib/
│       ├── userValidation.js
│       └── usersStore.js
├── data/
│   └── users.json
├── public/
│   ├── index.html
│   ├── assets/
│   │   ├── css/
│   │   │   └── app.css
│   │   └── js/
│   │       ├── router.js
│   │       └── pages/
│   │           ├── form.js
│   │           └── dashboard.js
│   ├── pages/
│   │   ├── form.html
│   │   └── dashboard.html
│   └── partials/
│       ├── header.html
│       └── sidebar.html
└── README.md
```

## Menjalankan

```bash
npm install
npm start
```

Buka:

```text
http://localhost:3000/form
http://localhost:3000/dashboard
```

## Catatan

Data disimpan ke `data/users.json`. Validasi dilakukan di frontend dan backend. Dashboard mendukung pencarian, hapus data, dan flash message setelah simpan.
