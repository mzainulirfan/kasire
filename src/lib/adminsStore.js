const { getDb, initDatabase } = require("./database");

function ensureAdminsFile() {
  initDatabase();
}

function rowToAdmin(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function readAdmins() {
  const rows = getDb()
    .prepare("SELECT id, name, email, password_hash, role, created_at, updated_at FROM admins ORDER BY created_at ASC")
    .all();
  return rows.map(rowToAdmin);
}

function saveAdmins(admins) {
  const database = getDb();
  const insert = database.prepare(`
    INSERT INTO admins (id, name, email, password_hash, role, created_at, updated_at)
    VALUES (@id, @name, @email, @passwordHash, @role, @createdAt, @updatedAt)
  `);

  database.transaction(() => {
    database.prepare("DELETE FROM admins").run();
    admins.forEach((admin) => insert.run(admin));
  })();
}

function findAdminByEmail(email) {
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  const row = getDb()
    .prepare("SELECT id, name, email, password_hash, role, created_at, updated_at FROM admins WHERE LOWER(email) = ?")
    .get(normalizedEmail);
  return row ? rowToAdmin(row) : undefined;
}

function createAdminFromUser(user, passwordHash) {
  const admins = readAdmins();
  const normalizedEmail = user.email.trim().toLowerCase();
  const existingAdmin = admins.find((admin) => admin.email.toLowerCase() === normalizedEmail);

  if (existingAdmin) {
    return {
      admin: existingAdmin,
      created: false
    };
  }

  const now = new Date().toISOString();
  const newAdmin = {
    id: Date.now(),
    name: user.fullName,
    email: normalizedEmail,
    passwordHash,
    role: "admin",
    createdAt: now,
    updatedAt: now
  };

  getDb()
    .prepare(`
      INSERT INTO admins (id, name, email, password_hash, role, created_at, updated_at)
      VALUES (@id, @name, @email, @passwordHash, @role, @createdAt, @updatedAt)
    `)
    .run(newAdmin);

  return {
    admin: newAdmin,
    created: true
  };
}

function deleteAdminById(adminId) {
  const admin = readAdmins().find((existingAdmin) => existingAdmin.id === adminId);

  if (!admin) {
    return null;
  }

  getDb().prepare("DELETE FROM admins WHERE id = ?").run(adminId);
  return admin;
}

function updateAdminPassword(adminId, passwordHash) {
  const updatedAt = new Date().toISOString();
  const result = getDb()
    .prepare("UPDATE admins SET password_hash = ?, updated_at = ? WHERE id = ?")
    .run(passwordHash, updatedAt, adminId);

  if (!result.changes) {
    return null;
  }

  return readAdmins().find((admin) => admin.id === adminId);
}

function toPublicAdmin(admin) {
  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role
  };
}

module.exports = {
  ensureAdminsFile,
  readAdmins,
  saveAdmins,
  findAdminByEmail,
  createAdminFromUser,
  deleteAdminById,
  updateAdminPassword,
  toPublicAdmin
};
