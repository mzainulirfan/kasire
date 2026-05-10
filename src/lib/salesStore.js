const { getDb } = require("./database");
const { readUsers } = require("./usersStore");
const { findProductById, updateProductStock } = require("./productsStore");
const { findDiscountById } = require("./discountsStore");

const PAYMENT_METHODS = new Set(["cash", "transfer", "qris", "card"]);

function rowToSale(row) {
  return {
    id: row.id,
    invoiceNumber: row.invoice_number,
    customerId: row.customer_id,
    customerName: row.customer_name,
    cashierId: row.cashier_id,
    cashierName: row.cashier_name,
    discountId: row.discount_id,
    discountName: row.discount_name,
    subtotal: row.subtotal,
    discountType: row.discount_type,
    discountValue: row.discount_value,
    discount: row.discount,
    tax: row.tax,
    total: row.total,
    paymentMethod: row.payment_method,
    paidAmount: row.paid_amount,
    changeAmount: row.change_amount,
    createdAt: row.created_at
  };
}

function rowToSaleItem(row) {
  return {
    id: row.id,
    saleId: row.sale_id,
    productId: row.product_id,
    productName: row.product_name,
    productSku: row.product_sku,
    price: row.price,
    quantity: row.quantity,
    subtotal: row.subtotal
  };
}

function createInvoiceNumber(date = new Date()) {
  const datePart = date.toISOString().slice(0, 10).replace(/-/g, "");
  return `INV-${datePart}-${date.getTime().toString().slice(-6)}`;
}

function resolveCustomer(customerId) {
  if (!customerId) {
    return {
      id: null,
      name: "Walk-in Customer"
    };
  }

  const customer = readUsers().find((user) => user.id === customerId);

  if (!customer) {
    throw new Error("Customer tidak ditemukan.");
  }

  return {
    id: customer.id,
    name: customer.fullName
  };
}

function normalizeSaleInput(input) {
  const customerId = Number(input.customerId);
  const discountId = input.discountId === "" || input.discountId === null || typeof input.discountId === "undefined"
    ? null
    : Number(input.discountId);
  const discountType = typeof input.discountType === "string" ? input.discountType.trim().toLowerCase() : "amount";
  const discountValue = Number(input.discountValue ?? input.discount ?? 0);
  const tax = Number(input.tax || 0);
  const paidAmount = Number(input.paidAmount || 0);
  const paymentMethod = typeof input.paymentMethod === "string" ? input.paymentMethod.trim().toLowerCase() : "";
  const items = Array.isArray(input.items) ? input.items : [];

  if (!["amount", "percent"].includes(discountType)) {
    throw new Error("Tipe diskon tidak valid.");
  }

  if (!PAYMENT_METHODS.has(paymentMethod)) {
    throw new Error("Metode pembayaran tidak valid.");
  }

  if (!Number.isInteger(discountValue) || discountValue < 0) {
    throw new Error("Nilai diskon tidak valid.");
  }

  if (discountType === "percent" && discountValue > 100) {
    throw new Error("Diskon persen maksimal 100.");
  }

  if (!Number.isInteger(tax) || tax < 0) {
    throw new Error("Pajak tidak valid.");
  }

  if (!Number.isInteger(paidAmount) || paidAmount < 0) {
    throw new Error("Nominal bayar tidak valid.");
  }

  if (!items.length) {
    throw new Error("Keranjang masih kosong.");
  }

  return {
    customerId: Number.isFinite(customerId) && customerId > 0 ? customerId : null,
    discountId: Number.isFinite(discountId) && discountId > 0 ? discountId : null,
    discountType,
    discountValue,
    tax,
    paidAmount,
    paymentMethod,
    items
  };
}

function buildSaleItems(items) {
  return items.map((item) => {
    const productId = Number(item.productId);
    const quantity = Number(item.quantity);

    if (!Number.isFinite(productId)) {
      throw new Error("Product tidak valid.");
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error("Qty product tidak valid.");
    }

    const product = findProductById(productId);

    if (!product) {
      throw new Error("Product tidak ditemukan.");
    }

    if (product.stock < quantity) {
      throw new Error(`Stok ${product.name} tidak cukup.`);
    }

    return {
      product,
      quantity,
      price: product.price,
      subtotal: product.price * quantity
    };
  });
}

function createSale(input, cashier) {
  const normalized = normalizeSaleInput(input);
  const customer = resolveCustomer(normalized.customerId);
  const saleItems = buildSaleItems(normalized.items);
  const subtotal = saleItems.reduce((total, item) => total + item.subtotal, 0);
  const selectedDiscount = normalized.discountId ? findDiscountById(normalized.discountId) : null;

  if (normalized.discountId && !selectedDiscount) {
    throw new Error("Diskon tidak ditemukan.");
  }

  const discountType = selectedDiscount ? selectedDiscount.type : normalized.discountType;
  const discountValue = selectedDiscount ? selectedDiscount.value : normalized.discountValue;
  const discountName = selectedDiscount ? selectedDiscount.name : "";
  const rawDiscount = discountType === "percent"
    ? Math.round(subtotal * (discountValue / 100))
    : discountValue;
  const discount = Math.min(Math.max(rawDiscount, 0), subtotal);
  const total = Math.max(subtotal - discount + normalized.tax, 0);

  if (normalized.paymentMethod === "cash" && normalized.paidAmount < total) {
    throw new Error("Nominal bayar kurang dari total transaksi.");
  }

  const now = new Date();
  const sale = {
    id: now.getTime(),
    invoiceNumber: createInvoiceNumber(now),
    customerId: customer.id,
    customerName: customer.name,
    cashierId: cashier && cashier.id ? cashier.id : null,
    cashierName: cashier && cashier.name ? cashier.name : "Admin",
    discountId: selectedDiscount ? selectedDiscount.id : null,
    discountName,
    subtotal,
    discountType,
    discountValue,
    discount,
    tax: normalized.tax,
    total,
    paymentMethod: normalized.paymentMethod,
    paidAmount: normalized.paymentMethod === "cash" ? normalized.paidAmount : total,
    changeAmount: normalized.paymentMethod === "cash" ? normalized.paidAmount - total : 0,
    createdAt: now.toISOString()
  };

  const database = getDb();
  const insertSale = database.prepare(`
    INSERT INTO sales (
      id, invoice_number, customer_id, customer_name, cashier_id, cashier_name,
      discount_id, discount_name, subtotal, discount_type, discount_value, discount, tax, total, payment_method, paid_amount, change_amount, created_at
    )
    VALUES (
      @id, @invoiceNumber, @customerId, @customerName, @cashierId, @cashierName,
      @discountId, @discountName, @subtotal, @discountType, @discountValue, @discount, @tax, @total, @paymentMethod, @paidAmount, @changeAmount, @createdAt
    )
  `);
  const insertItem = database.prepare(`
    INSERT INTO sale_items (id, sale_id, product_id, product_name, product_sku, price, quantity, subtotal)
    VALUES (@id, @saleId, @productId, @productName, @productSku, @price, @quantity, @subtotal)
  `);

  database.transaction(() => {
    insertSale.run(sale);
    saleItems.forEach((item, index) => {
      insertItem.run({
        id: sale.id + index + 1,
        saleId: sale.id,
        productId: item.product.id,
        productName: item.product.name,
        productSku: item.product.sku,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.subtotal
      });
      updateProductStock(item.product.id, item.product.stock - item.quantity);
    });
  })();

  return findSaleById(sale.id);
}

function readSales() {
  return getDb()
    .prepare("SELECT * FROM sales ORDER BY created_at DESC")
    .all()
    .map(rowToSale);
}

function readSaleItems(saleId) {
  return getDb()
    .prepare("SELECT * FROM sale_items WHERE sale_id = ? ORDER BY id ASC")
    .all(saleId)
    .map(rowToSaleItem);
}

function findSaleById(saleId) {
  const row = getDb().prepare("SELECT * FROM sales WHERE id = ?").get(saleId);

  if (!row) {
    return undefined;
  }

  const sale = rowToSale(row);
  return {
    ...sale,
    items: readSaleItems(sale.id)
  };
}

module.exports = {
  createSale,
  readSales,
  findSaleById
};
