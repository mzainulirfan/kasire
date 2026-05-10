const { getDb } = require("./database");

function rowToDiscount(row) {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    value: row.value,
    createdAt: row.created_at
  };
}

function readDiscounts() {
  return getDb()
    .prepare("SELECT id, name, type, value, created_at FROM discounts ORDER BY created_at DESC")
    .all()
    .map(rowToDiscount);
}

function findDiscountById(discountId) {
  const row = getDb()
    .prepare("SELECT id, name, type, value, created_at FROM discounts WHERE id = ?")
    .get(discountId);

  return row ? rowToDiscount(row) : undefined;
}

function findDiscountByName(name) {
  const normalizedName = typeof name === "string" ? name.trim().toLowerCase() : "";
  const row = getDb()
    .prepare("SELECT id, name, type, value, created_at FROM discounts WHERE LOWER(name) = ?")
    .get(normalizedName);

  return row ? rowToDiscount(row) : undefined;
}

function createDiscount(input) {
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const type = typeof input.type === "string" ? input.type.trim().toLowerCase() : "";
  const value = Number(input.value);

  if (!name) {
    throw new Error("Nama diskon wajib diisi.");
  }

  if (!["amount", "percent"].includes(type)) {
    throw new Error("Tipe diskon tidak valid.");
  }

  if (!Number.isInteger(value) || value < 0) {
    throw new Error("Nilai diskon tidak valid.");
  }

  if (type === "percent" && value > 100) {
    throw new Error("Diskon persen maksimal 100.");
  }

  if (findDiscountByName(name)) {
    throw new Error("Nama diskon sudah terdaftar.");
  }

  const discount = {
    id: Date.now(),
    name,
    type,
    value,
    createdAt: new Date().toISOString()
  };

  getDb()
    .prepare("INSERT INTO discounts (id, name, type, value, created_at) VALUES (@id, @name, @type, @value, @createdAt)")
    .run(discount);

  return discount;
}

function deleteDiscountById(discountId) {
  const discount = findDiscountById(discountId);

  if (!discount) {
    return undefined;
  }

  getDb().prepare("DELETE FROM discounts WHERE id = ?").run(discountId);
  return discount;
}

module.exports = {
  readDiscounts,
  findDiscountById,
  findDiscountByName,
  createDiscount,
  deleteDiscountById
};
