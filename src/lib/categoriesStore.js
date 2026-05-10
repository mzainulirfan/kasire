const { getDb } = require("./database");

function rowToCategory(row) {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at
  };
}

function readCategories() {
  return getDb()
    .prepare("SELECT id, name, created_at FROM categories ORDER BY name ASC")
    .all()
    .map(rowToCategory);
}

function findCategoryByName(name) {
  const normalizedName = typeof name === "string" ? name.trim().toLowerCase() : "";
  const row = getDb()
    .prepare("SELECT id, name, created_at FROM categories WHERE LOWER(name) = ?")
    .get(normalizedName);

  return row ? rowToCategory(row) : undefined;
}

function createCategory(name) {
  const category = {
    id: Date.now(),
    name: name.trim(),
    createdAt: new Date().toISOString()
  };

  getDb()
    .prepare("INSERT INTO categories (id, name, created_at) VALUES (@id, @name, @createdAt)")
    .run(category);

  return category;
}

function isCategoryUsed(name) {
  const row = getDb()
    .prepare("SELECT COUNT(*) AS total FROM products WHERE LOWER(category) = LOWER(?)")
    .get(name);

  return row.total > 0;
}

function deleteCategoryById(categoryId) {
  const row = getDb()
    .prepare("SELECT id, name, created_at FROM categories WHERE id = ?")
    .get(categoryId);

  if (!row) {
    return undefined;
  }

  const category = rowToCategory(row);
  getDb().prepare("DELETE FROM categories WHERE id = ?").run(categoryId);
  return category;
}

module.exports = {
  readCategories,
  findCategoryByName,
  createCategory,
  isCategoryUsed,
  deleteCategoryById
};
