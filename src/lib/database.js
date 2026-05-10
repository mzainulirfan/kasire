const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const DATA_DIR = path.join(__dirname, "..", "..", "data");
const DB_FILE = path.join(DATA_DIR, "app.sqlite");
const USERS_JSON_FILE = path.join(DATA_DIR, "users.json");
const ADMINS_JSON_FILE = path.join(DATA_DIR, "admins.json");
const { ensureProductUploadDir } = require("./productUpload");

const DEFAULT_ADMINS = [
  {
    id: 1,
    name: "Admin User",
    email: "admin@example.com",
    passwordHash: "$2b$10$SdG33SXMrQVHlYxdX1nkb.5KVcz7ih0.lrgzkpOrZw73mLVhZobGa",
    role: "admin",
    createdAt: "2026-05-03T00:00:00.000Z",
    updatedAt: "2026-05-03T00:00:00.000Z"
  }
];

const DEFAULT_PRODUCTS = [
  {
    id: 1,
    name: "Basic Cotton Shirt",
    sku: "PRD-001",
    category: "Apparel",
    price: 125000,
    stock: 32,
    status: "active",
    createdAt: "2026-05-03T00:00:00.000Z"
  },
  {
    id: 2,
    name: "Canvas Tote Bag",
    sku: "PRD-002",
    category: "Accessories",
    price: 89000,
    stock: 18,
    status: "active",
    createdAt: "2026-05-03T00:00:00.000Z"
  },
  {
    id: 3,
    name: "Notebook A5",
    sku: "PRD-003",
    category: "Stationery",
    price: 35000,
    stock: 0,
    status: "out_of_stock",
    createdAt: "2026-05-03T00:00:00.000Z"
  }
];

let db;

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJsonArray(filePath, fallback = []) {
  if (!fs.existsSync(filePath)) {
    return fallback;
  }

  const data = fs.readFileSync(filePath, "utf8");
  return data ? JSON.parse(data) : fallback;
}

function getDb() {
  if (!db) {
    ensureDataDir();
    db = new Database(DB_FILE);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
  }

  return db;
}

function createSchema(database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      birth_date TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      sku TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL,
      price INTEGER NOT NULL DEFAULT 0,
      stock INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS discounts (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      type TEXT NOT NULL,
      value INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS product_images (
      id INTEGER PRIMARY KEY,
      product_id INTEGER NOT NULL,
      image_path TEXT,
      image_data TEXT,
      file_name TEXT NOT NULL,
      mime_type TEXT,
      is_primary INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY,
      invoice_number TEXT NOT NULL UNIQUE,
      customer_id INTEGER,
      customer_name TEXT NOT NULL,
      cashier_id INTEGER,
      cashier_name TEXT NOT NULL,
      discount_id INTEGER,
      discount_name TEXT,
      subtotal INTEGER NOT NULL DEFAULT 0,
      discount_type TEXT NOT NULL DEFAULT 'amount',
      discount_value INTEGER NOT NULL DEFAULT 0,
      discount INTEGER NOT NULL DEFAULT 0,
      tax INTEGER NOT NULL DEFAULT 0,
      total INTEGER NOT NULL DEFAULT 0,
      payment_method TEXT NOT NULL,
      paid_amount INTEGER NOT NULL DEFAULT 0,
      change_amount INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sale_items (
      id INTEGER PRIMARY KEY,
      sale_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      product_name TEXT NOT NULL,
      product_sku TEXT NOT NULL,
      price INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      subtotal INTEGER NOT NULL,
      FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id)
    );
  `);
}

function ensureProductImageColumns(database) {
  const columns = database.prepare("PRAGMA table_info(product_images)").all().map((column) => column.name);

  if (!columns.includes("image_path")) {
    database.prepare("ALTER TABLE product_images ADD COLUMN image_path TEXT").run();
  }

  if (!columns.includes("image_data")) {
    database.prepare("ALTER TABLE product_images ADD COLUMN image_data TEXT").run();
  }

  if (!columns.includes("mime_type")) {
    database.prepare("ALTER TABLE product_images ADD COLUMN mime_type TEXT").run();
  }
}

function ensureSalesColumns(database) {
  const columns = database.prepare("PRAGMA table_info(sales)").all().map((column) => column.name);

  if (!columns.includes("discount_id")) {
    database.prepare("ALTER TABLE sales ADD COLUMN discount_id INTEGER").run();
  }

  if (!columns.includes("discount_name")) {
    database.prepare("ALTER TABLE sales ADD COLUMN discount_name TEXT").run();
  }

  if (!columns.includes("discount_type")) {
    database.prepare("ALTER TABLE sales ADD COLUMN discount_type TEXT NOT NULL DEFAULT 'amount'").run();
  }

  if (!columns.includes("discount_value")) {
    database.prepare("ALTER TABLE sales ADD COLUMN discount_value INTEGER NOT NULL DEFAULT 0").run();
  }
}

function seedUsers(database) {
  const count = database.prepare("SELECT COUNT(*) AS total FROM users").get().total;

  if (count > 0) {
    return;
  }

  const users = readJsonArray(USERS_JSON_FILE);
  const insert = database.prepare(`
    INSERT OR IGNORE INTO users (id, full_name, email, phone, address, birth_date, created_at)
    VALUES (@id, @fullName, @email, @phone, @address, @birthDate, @createdAt)
  `);

  users.forEach((user) => insert.run(user));
}

function seedAdmins(database) {
  const count = database.prepare("SELECT COUNT(*) AS total FROM admins").get().total;

  if (count > 0) {
    return;
  }

  const admins = readJsonArray(ADMINS_JSON_FILE, DEFAULT_ADMINS);
  const insert = database.prepare(`
    INSERT OR IGNORE INTO admins (id, name, email, password_hash, role, created_at, updated_at)
    VALUES (@id, @name, @email, @passwordHash, @role, @createdAt, @updatedAt)
  `);

  admins.forEach((admin) => insert.run(admin));
}

function seedProducts(database) {
  const count = database.prepare("SELECT COUNT(*) AS total FROM products").get().total;

  if (count > 0) {
    return;
  }

  const insert = database.prepare(`
    INSERT OR IGNORE INTO products (id, name, sku, category, price, stock, status, created_at)
    VALUES (@id, @name, @sku, @category, @price, @stock, @status, @createdAt)
  `);

  DEFAULT_PRODUCTS.forEach((product) => insert.run(product));
}

function seedCategories(database) {
  const count = database.prepare("SELECT COUNT(*) AS total FROM categories").get().total;

  if (count > 0) {
    return;
  }

  const insert = database.prepare(`
    INSERT OR IGNORE INTO categories (id, name, created_at)
    VALUES (@id, @name, @createdAt)
  `);
  const categoryRows = database
    .prepare("SELECT DISTINCT category FROM products WHERE TRIM(category) != '' ORDER BY category ASC")
    .all();
  const createdAt = new Date().toISOString();

  categoryRows.forEach((row, index) => {
    insert.run({
      id: Date.now() + index,
      name: row.category,
      createdAt
    });
  });
}

function seedDiscounts(database) {
  const count = database.prepare("SELECT COUNT(*) AS total FROM discounts").get().total;

  if (count > 0) {
    return;
  }
}

function initDatabase() {
  const database = getDb();

  createSchema(database);
  ensureProductImageColumns(database);
  ensureSalesColumns(database);
  ensureProductUploadDir();
  database.transaction(() => {
    seedUsers(database);
    seedAdmins(database);
    seedProducts(database);
    seedCategories(database);
    seedDiscounts(database);
  })();
}

module.exports = {
  getDb,
  initDatabase
};
