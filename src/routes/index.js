const bcrypt = require("bcryptjs");
const path = require("path");
const {
  readAdmins,
  findAdminByEmail,
  createAdminFromUser,
  deleteAdminById,
  updateAdminPassword,
  toPublicAdmin
} = require("../lib/adminsStore");
const { readUsers, saveUsers } = require("../lib/usersStore");
const { readProducts, findProductBySku, findProductById, createProduct, deleteProductById } = require("../lib/productsStore");
const { readCategories, findCategoryByName, createCategory, isCategoryUsed, deleteCategoryById } = require("../lib/categoriesStore");
const { readDiscounts, findDiscountById, createDiscount, deleteDiscountById } = require("../lib/discountsStore");
const { createSale, readSales, findSaleById } = require("../lib/salesStore");
const { PRODUCT_UPLOAD_DIR, handleProductImagesUpload, deleteUploadedProductFiles, MAX_PRODUCT_IMAGES } = require("../lib/productUpload");
const { validateLoginInput } = require("../lib/authValidation");
const { validateUserInput } = require("../lib/userValidation");
const {
  requireAuthApi,
  requireAuthPage,
  redirectIfAuthenticated
} = require("../middleware/authMiddleware");

const DEFAULT_PROMOTED_ADMIN_PASSWORD = "user12345";

function registerRoutes(app, options) {
  const { publicDir, sessionCookieName } = options;

  app.get("/", (req, res) => {
    res.redirect("/users");
  });

  app.get("/index.html", (req, res) => {
    res.redirect("/users");
  });

  app.get("/login", redirectIfAuthenticated, (req, res) => {
    res.sendFile(path.join(publicDir, "index.html"));
  });

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

    req.session.user = toPublicAdmin(admin);

    return res.json({
      message: "Login berhasil.",
      user: req.session.user
    });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((error) => {
      if (error) {
        return res.status(500).json({ message: "Gagal logout." });
      }

      res.clearCookie(sessionCookieName);
      return res.json({ message: "Logout berhasil." });
    });
  });

  app.get("/api/auth/me", requireAuthApi, (req, res) => {
    res.json({ user: req.session.user });
  });

  app.patch("/api/auth/profile/password", requireAuthApi, async (req, res) => {
    const currentPassword = typeof req.body.currentPassword === "string" ? req.body.currentPassword.trim() : "";
    const newPassword = typeof req.body.newPassword === "string" ? req.body.newPassword.trim() : "";
    const confirmPassword = typeof req.body.confirmPassword === "string" ? req.body.confirmPassword.trim() : "";

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "Semua field password wajib diisi." });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: "Password baru minimal 8 karakter." });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Konfirmasi password tidak sama." });
    }

    const admins = readAdmins();
    const admin = admins.find((existingAdmin) => existingAdmin.id === req.session.user.id);

    if (!admin) {
      return res.status(404).json({ message: "Admin tidak ditemukan." });
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, admin.passwordHash);

    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: "Password saat ini tidak valid." });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    updateAdminPassword(admin.id, passwordHash);

    return res.json({ message: "Password berhasil diperbarui." });
  });

  app.get("/api/admins", requireAuthApi, (req, res) => {
    const currentAdminId = req.session.user.id;
    const admins = readAdmins().map((admin) => ({
      ...toPublicAdmin(admin),
      createdAt: admin.createdAt,
      isCurrent: admin.id === currentAdminId
    }));

    res.json(admins);
  });

  app.delete("/api/admins/:id", requireAuthApi, (req, res) => {
    const adminId = Number(req.params.id);

    if (!Number.isFinite(adminId)) {
      return res.status(400).json({ message: "ID admin tidak valid." });
    }

    const admins = readAdmins();
    const admin = admins.find((existingAdmin) => existingAdmin.id === adminId);

    if (!admin) {
      return res.status(404).json({ message: "Admin tidak ditemukan." });
    }

    if (admin.id === req.session.user.id) {
      return res.status(400).json({ message: "Admin yang sedang login tidak bisa dicabut." });
    }

    if (admins.length <= 1) {
      return res.status(400).json({ message: "Admin terakhir tidak bisa dicabut." });
    }

    deleteAdminById(adminId);

    return res.json({
      message: "Akses admin berhasil dicabut.",
      admin: toPublicAdmin(admin)
    });
  });

  app.get("/users", requireAuthPage, (req, res) => {
    res.sendFile(path.join(publicDir, "index.html"));
  });

  app.get("/dashboard", requireAuthPage, (req, res) => {
    res.sendFile(path.join(publicDir, "index.html"));
  });

  app.get("/settings", requireAuthPage, (req, res) => {
    res.sendFile(path.join(publicDir, "index.html"));
  });

  app.get("/categories", requireAuthPage, (req, res) => {
    res.sendFile(path.join(publicDir, "index.html"));
  });

  app.get("/discounts", requireAuthPage, (req, res) => {
    res.sendFile(path.join(publicDir, "index.html"));
  });

  app.get("/pos", requireAuthPage, (req, res) => {
    res.sendFile(path.join(publicDir, "index.html"));
  });

  app.get("/sales", requireAuthPage, (req, res) => {
    res.sendFile(path.join(publicDir, "index.html"));
  });

  app.get("/sales/:id", requireAuthPage, (req, res) => {
    res.sendFile(path.join(publicDir, "index.html"));
  });

  app.get("/profile", requireAuthPage, (req, res) => {
    res.sendFile(path.join(publicDir, "index.html"));
  });

  app.get("/products", requireAuthPage, (req, res) => {
    res.sendFile(path.join(publicDir, "index.html"));
  });

  app.get("/products/new", requireAuthPage, (req, res) => {
    res.sendFile(path.join(publicDir, "index.html"));
  });

  app.get("/products/:id", requireAuthPage, (req, res) => {
    res.sendFile(path.join(publicDir, "index.html"));
  });

  app.get("/api/products", requireAuthApi, (req, res) => {
    res.json(readProducts());
  });

  app.get("/api/sales", requireAuthApi, (req, res) => {
    res.json(readSales());
  });

  app.get("/api/sales/:id", requireAuthApi, (req, res) => {
    const saleId = Number(req.params.id);

    if (!Number.isFinite(saleId)) {
      return res.status(400).json({ message: "ID transaksi tidak valid." });
    }

    const sale = findSaleById(saleId);

    if (!sale) {
      return res.status(404).json({ message: "Transaksi tidak ditemukan." });
    }

    return res.json(sale);
  });

  app.post("/api/sales", requireAuthApi, (req, res) => {
    try {
      const sale = createSale(req.body, req.session.user);

      return res.status(201).json({
        message: "Transaksi berhasil disimpan.",
        sale
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Gagal menyimpan transaksi."
      });
    }
  });

  app.get("/api/categories", requireAuthApi, (req, res) => {
    res.json(readCategories());
  });

  app.get("/api/discounts", requireAuthApi, (req, res) => {
    res.json(readDiscounts());
  });

  app.post("/api/discounts", requireAuthApi, (req, res) => {
    try {
      const discount = createDiscount(req.body || {});

      return res.status(201).json({
        message: "Diskon berhasil ditambahkan.",
        discount
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Gagal menyimpan diskon."
      });
    }
  });

  app.delete("/api/discounts/:id", requireAuthApi, (req, res) => {
    const discountId = Number(req.params.id);

    if (!Number.isFinite(discountId)) {
      return res.status(400).json({ message: "ID diskon tidak valid." });
    }

    const discount = findDiscountById(discountId);

    if (!discount) {
      return res.status(404).json({ message: "Diskon tidak ditemukan." });
    }

    return res.json({
      message: "Diskon berhasil dihapus.",
      discount: deleteDiscountById(discountId)
    });
  });

  app.post("/api/categories", requireAuthApi, (req, res) => {
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";

    if (!name) {
      return res.status(400).json({ message: "Nama kategori wajib diisi." });
    }

    if (findCategoryByName(name)) {
      return res.status(409).json({ message: "Kategori sudah terdaftar." });
    }

    return res.status(201).json({
      message: "Kategori berhasil ditambahkan.",
      category: createCategory(name)
    });
  });

  app.delete("/api/categories/:id", requireAuthApi, (req, res) => {
    const categoryId = Number(req.params.id);

    if (!Number.isFinite(categoryId)) {
      return res.status(400).json({ message: "ID kategori tidak valid." });
    }

    const category = readCategories().find((item) => item.id === categoryId);

    if (!category) {
      return res.status(404).json({ message: "Kategori tidak ditemukan." });
    }

    if (isCategoryUsed(category.name)) {
      return res.status(400).json({ message: "Kategori masih dipakai product dan tidak bisa dihapus." });
    }

    return res.json({
      message: "Kategori berhasil dihapus.",
      category: deleteCategoryById(categoryId)
    });
  });

  app.get("/api/products/:id", requireAuthApi, (req, res) => {
    const productId = Number(req.params.id);

    if (!Number.isFinite(productId)) {
      return res.status(400).json({ message: "ID product tidak valid." });
    }

    const product = findProductById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product tidak ditemukan." });
    }

    return res.json(product);
  });

  app.post("/api/products", requireAuthApi, handleProductImagesUpload, (req, res) => {
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    const sku = typeof req.body.sku === "string" ? req.body.sku.trim().toUpperCase() : "";
    const category = typeof req.body.category === "string" ? req.body.category.trim() : "";
    const price = Number(req.body.price);
    const stock = Number(req.body.stock);
    const primaryImageIndex = Number(req.body.primaryImageIndex);
    const files = Array.isArray(req.files) ? req.files : [];

    function fail(status, message) {
      deleteUploadedProductFiles(files);
      return res.status(status).json({ message });
    }

    if (!name || !sku || !category) {
      return fail(400, "Nama product, SKU, dan kategori wajib diisi.");
    }

    if (!findCategoryByName(category)) {
      return fail(400, "Kategori product tidak valid.");
    }

    if (!Number.isFinite(price) || price < 0) {
      return fail(400, "Harga product tidak valid.");
    }

    if (!Number.isInteger(stock) || stock < 0) {
      return fail(400, "Stok product tidak valid.");
    }

    if (findProductBySku(sku)) {
      return fail(409, "SKU product sudah terdaftar.");
    }

    if (!files.length) {
      return fail(400, "Minimal 1 foto product wajib diunggah.");
    }

    const resolvedPrimaryIndex = Number.isInteger(primaryImageIndex) && primaryImageIndex >= 0
      ? primaryImageIndex
      : 0;

    if (files.length > MAX_PRODUCT_IMAGES) {
      return fail(400, `Maksimal ${MAX_PRODUCT_IMAGES} foto product.`);
    }

    const validImages = files.slice(0, MAX_PRODUCT_IMAGES).map((file, index) => ({
      imagePath: file.filename,
      fileName: file.originalname,
      mimeType: file.mimetype,
      isPrimary: index === resolvedPrimaryIndex
    }));

    let product;

    try {
      product = createProduct({
        name,
        sku,
        category,
        price,
        stock,
        images: validImages
      });
    } catch (error) {
      deleteUploadedProductFiles(files);
      return res.status(500).json({ message: "Gagal menyimpan product." });
    }

    return res.status(201).json({
      message: "Product berhasil ditambahkan.",
      product
    });
  });

  app.delete("/api/products/:id", requireAuthApi, (req, res) => {
    const productId = Number(req.params.id);

    if (!Number.isFinite(productId)) {
      return res.status(400).json({ message: "ID product tidak valid." });
    }

    let deletedProduct;

    try {
      deletedProduct = deleteProductById(productId);
    } catch (error) {
      return res.status(409).json({
        message: "Product sudah masuk transaksi dan tidak bisa dihapus."
      });
    }

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product tidak ditemukan." });
    }

    deleteUploadedProductFiles(
      (deletedProduct.images || [])
        .filter((image) => image.imagePath)
        .map((image) => ({ path: path.join(PRODUCT_UPLOAD_DIR, image.imagePath) }))
    );

    return res.json({
      message: "Product berhasil dihapus.",
      product: deletedProduct
    });
  });

  app.get("/api/users", requireAuthApi, (req, res) => {
    const adminEmails = new Set(readAdmins().map((admin) => admin.email.toLowerCase()));
    const users = readUsers().map((user) => ({
      ...user,
      isAdmin: adminEmails.has(user.email.toLowerCase())
    }));

    res.json(users);
  });

  app.post("/api/users", requireAuthApi, (req, res) => {
    const { user, error } = validateUserInput(req.body);

    if (error) {
      return res.status(400).json({ message: error });
    }

    const users = readUsers();
    const emailExists = users.some(
      (existingUser) => existingUser.email.toLowerCase() === user.email.toLowerCase()
    );

    if (emailExists) {
      return res.status(409).json({ message: "Email sudah terdaftar." });
    }

    const newUser = {
      id: Date.now(),
      ...user,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

    return res.status(201).json({
      message: "Data user berhasil disimpan.",
      user: newUser
    });
  });

  app.post("/api/users/:id/promote-admin", requireAuthApi, async (req, res) => {
    const userId = Number(req.params.id);

    if (!Number.isFinite(userId)) {
      return res.status(400).json({ message: "ID user tidak valid." });
    }

    const users = readUsers();
    const user = users.find((existingUser) => existingUser.id === userId);

    if (!user) {
      return res.status(404).json({ message: "Data user tidak ditemukan." });
    }

    const passwordHash = await bcrypt.hash(DEFAULT_PROMOTED_ADMIN_PASSWORD, 10);
    const { admin, created } = createAdminFromUser(user, passwordHash);

    if (!created) {
      return res.status(409).json({
        message: "User ini sudah terdaftar sebagai admin.",
        admin: toPublicAdmin(admin)
      });
    }

    return res.status(201).json({
      message: `User berhasil dijadikan admin. Password awal: ${DEFAULT_PROMOTED_ADMIN_PASSWORD}`,
      admin: toPublicAdmin(admin)
    });
  });

  app.delete("/api/users/:id", requireAuthApi, (req, res) => {
    const userId = Number(req.params.id);

    if (!Number.isFinite(userId)) {
      return res.status(400).json({ message: "ID user tidak valid." });
    }

    const users = readUsers();
    const user = users.find((existingUser) => existingUser.id === userId);

    if (!user) {
      return res.status(404).json({ message: "Data user tidak ditemukan." });
    }

    const userIsAdmin = readAdmins().some(
      (admin) => admin.email.toLowerCase() === user.email.toLowerCase()
    );

    if (userIsAdmin) {
      return res.status(400).json({
        message: "User yang masih menjadi admin tidak bisa dihapus. Cabut akses admin terlebih dahulu di Setting."
      });
    }

    const filteredUsers = users.filter((user) => user.id !== userId);
    saveUsers(filteredUsers);

    return res.json({ message: "Data user berhasil dihapus." });
  });
}

module.exports = registerRoutes;
