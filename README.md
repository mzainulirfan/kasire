# Kasire

A simple cashier/user management web application built with Node.js, Express.js, Tailwind CSS, and Vanilla JavaScript.

This project is designed as a lightweight fullstack application without using a SQL database. Data is stored locally using JSON files, making it suitable for learning purposes, prototypes, and small-scale applications.

---

## Features

- User data management
- Dashboard interface
- Add and delete data
- Realtime search/filter
- Frontend & backend validation
- JSON-based local storage
- Responsive UI with Tailwind CSS
- Lightweight and beginner-friendly architecture

---

## Tech Stack

- Node.js
- Express.js
- Tailwind CSS
- Vanilla JavaScript
- JSON File Storage

---

## Project Structure

```txt
kasire/
├── data/              # JSON storage
├── public/            # Frontend assets
│   ├── css/
│   ├── js/
│   └── pages/
├── src/               # Backend logic & utilities
├── server.js          # Main server entry
├── package.json
└── README.md
```

---

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/mzainulirfan/kasire.git
cd kasire
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Application

```bash
npm start
```

Server will run at:

```txt
http://localhost:3000
```

---

## Available Routes

| Route | Description |
|---|---|
| `/` | Homepage |
| `/form` | User input form |
| `/dashboard` | User dashboard |

---

## Data Storage

This project uses local JSON storage instead of a database.

Example:

```txt
data/users.json
```

Suitable for:
- Learning projects
- Local applications
- Simple CRUD systems
- Prototyping

---

## Validation

Validation is implemented on both:

- Frontend
- Backend

This helps maintain data consistency and improve application reliability.

---

## Screenshots

Add your application screenshots here.

Example:

```md
![Dashboard Preview](./public/assets/dashboard-preview.png)
```

---

## Future Improvements

- [ ] Edit/update data
- [ ] Authentication & authorization
- [ ] SQLite/MySQL integration
- [ ] Export PDF/Excel
- [ ] Pagination
- [ ] Dark mode
- [ ] REST API support

---

## Development Notes

This project is intentionally built with a simple architecture to make it easier for beginners to understand how frontend and backend interact in a fullstack JavaScript application.

---

## Contributing

Pull requests are welcome.

For major changes, please open an issue first to discuss what you would like to change.

---

## License

This project is licensed under the MIT License.

---

## Author

Made with ❤️ by Mohammad Zainul Irfan

GitHub:
https://github.com/mzainulirfan