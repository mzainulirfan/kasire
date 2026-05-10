const { getDb, initDatabase } = require("./database");

function ensureDataFile() {
  initDatabase();
}

function rowToUser(row) {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    address: row.address,
    birthDate: row.birth_date,
    createdAt: row.created_at
  };
}

function readUsers() {
  const rows = getDb()
    .prepare("SELECT id, full_name, email, phone, address, birth_date, created_at FROM users ORDER BY created_at ASC")
    .all();
  return rows.map(rowToUser);
}

function saveUsers(users) {
  const database = getDb();
  const insert = database.prepare(`
    INSERT INTO users (id, full_name, email, phone, address, birth_date, created_at)
    VALUES (@id, @fullName, @email, @phone, @address, @birthDate, @createdAt)
  `);

  database.transaction(() => {
    database.prepare("DELETE FROM users").run();
    users.forEach((user) => insert.run(user));
  })();
}

module.exports = {
  ensureDataFile,
  readUsers,
  saveUsers
};
