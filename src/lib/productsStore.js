const { getDb, initDatabase } = require("./database");

function rowToProduct(row) {
  return {
    id: row.id,
    name: row.name,
    sku: row.sku,
    category: row.category,
    price: row.price,
    stock: row.stock,
    status: row.status,
    createdAt: row.created_at
  };
}

function rowToProductImage(row) {
  return {
    id: row.id,
    productId: row.product_id,
    imagePath: row.image_path,
    imageData: row.image_data,
    fileName: row.file_name,
    mimeType: row.mime_type,
    isPrimary: Boolean(row.is_primary),
    createdAt: row.created_at,
    imageUrl: row.image_path ? `/uploads/products/${row.image_path}` : null
  };
}

function ensureProductsTable() {
  initDatabase();
}

function readProducts() {
  const rows = getDb()
    .prepare("SELECT id, name, sku, category, price, stock, status, created_at FROM products ORDER BY created_at ASC")
    .all();
  return rows.map((row) => {
    const product = rowToProduct(row);

    return {
      ...product,
      images: readProductImages(product.id)
    };
  });
}

function findProductBySku(sku) {
  const normalizedSku = typeof sku === "string" ? sku.trim().toLowerCase() : "";
  const row = getDb()
    .prepare("SELECT id, name, sku, category, price, stock, status, created_at FROM products WHERE LOWER(sku) = ?")
    .get(normalizedSku);
  return row ? rowToProduct(row) : undefined;
}

function findProductById(productId) {
  const row = getDb()
    .prepare("SELECT id, name, sku, category, price, stock, status, created_at FROM products WHERE id = ?")
    .get(productId);
  if (!row) {
    return undefined;
  }

  return {
    ...rowToProduct(row),
    images: readProductImages(productId)
  };
}

function createProduct(product) {
  const newProduct = {
    id: Date.now(),
    status: product.stock > 0 ? "active" : "out_of_stock",
    createdAt: new Date().toISOString(),
    ...product
  };

  const database = getDb();
  const insertProduct = database.prepare(`
    INSERT INTO products (id, name, sku, category, price, stock, status, created_at)
    VALUES (@id, @name, @sku, @category, @price, @stock, @status, @createdAt)
  `);
  const insertImage = database.prepare(`
    INSERT INTO product_images (id, product_id, image_path, image_data, file_name, mime_type, is_primary, created_at)
    VALUES (@id, @productId, @imagePath, @imageData, @fileName, @mimeType, @isPrimary, @createdAt)
  `);

  database.transaction(() => {
    insertProduct.run(newProduct);
    (product.images || []).forEach((image, index) => {
      insertImage.run({
        id: Date.now() + index + 1,
        productId: newProduct.id,
        imagePath: image.imagePath || null,
        imageData: image.imageData || "",
        fileName: image.fileName,
        mimeType: image.mimeType || null,
        isPrimary: image.isPrimary ? 1 : 0,
        createdAt: newProduct.createdAt
      });
    });
  })();

  return {
    ...newProduct,
    images: readProductImages(newProduct.id)
  };
}

function readProductImages(productId) {
  const rows = getDb()
    .prepare("SELECT id, product_id, image_path, image_data, file_name, mime_type, is_primary, created_at FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, id ASC")
    .all(productId);
  return rows.map(rowToProductImage);
}

function deleteProductById(productId) {
  const product = findProductById(productId);

  if (!product) {
    return undefined;
  }

  getDb().prepare("DELETE FROM products WHERE id = ?").run(productId);
  return product;
}

function updateProduct(productId, product) {
  const existingProduct = findProductById(productId);

  if (!existingProduct) {
    return undefined;
  }

  const status = product.stock > 0 ? "active" : "out_of_stock";
  const keptImageIds = new Set((product.keptImageIds || []).map(Number));
  const keptImages = (existingProduct.images || []).filter((image) => keptImageIds.has(image.id));
  const createdAt = new Date().toISOString();
  const database = getDb();
  const updateProductStatement = database.prepare(`
    UPDATE products
    SET name = @name,
        sku = @sku,
        category = @category,
        price = @price,
        stock = @stock,
        status = @status
    WHERE id = @id
  `);
  const deleteImages = database.prepare("DELETE FROM product_images WHERE product_id = ?");
  const insertImage = database.prepare(`
    INSERT INTO product_images (id, product_id, image_path, image_data, file_name, mime_type, is_primary, created_at)
    VALUES (@id, @productId, @imagePath, @imageData, @fileName, @mimeType, @isPrimary, @createdAt)
  `);
  const images = [
    ...keptImages.map((image) => ({
      imagePath: image.imagePath || null,
      imageData: image.imageData || "",
      fileName: image.fileName,
      mimeType: image.mimeType || null,
      key: `existing:${image.id}`
    })),
    ...(product.images || []).map((image, index) => ({
      imagePath: image.imagePath || null,
      imageData: image.imageData || "",
      fileName: image.fileName,
      mimeType: image.mimeType || null,
      key: `new:${index}`
    }))
  ];

  database.transaction(() => {
    updateProductStatement.run({
      id: productId,
      name: product.name,
      sku: product.sku,
      category: product.category,
      price: product.price,
      stock: product.stock,
      status
    });
    deleteImages.run(productId);
    images.forEach((image, index) => {
      insertImage.run({
        id: Date.now() + index + 1,
        productId,
        imagePath: image.imagePath,
        imageData: image.imageData,
        fileName: image.fileName,
        mimeType: image.mimeType,
        isPrimary: image.key === product.primaryImageKey ? 1 : 0,
        createdAt
      });
    });
  })();

  return findProductById(productId);
}

function updateProductStock(productId, stock) {
  const status = stock > 0 ? "active" : "out_of_stock";

  getDb()
    .prepare("UPDATE products SET stock = ?, status = ? WHERE id = ?")
    .run(stock, status, productId);
}

module.exports = {
  ensureProductsTable,
  readProducts,
  findProductBySku,
  findProductById,
  createProduct,
  updateProduct,
  readProductImages,
  deleteProductById,
  updateProductStock
};
