function initPosPage() {
  const message = document.getElementById("posMessage");
  const productSearch = document.getElementById("posProductSearch");
  const productGrid = document.getElementById("posProductGrid");
  const productEmptyState = document.getElementById("posProductEmptyState");
  const customerSelect = document.getElementById("posCustomer");
  const cartItems = document.getElementById("posCartItems");
  const cartEmptyState = document.getElementById("posCartEmptyState");
  const discountSelect = document.getElementById("posDiscountId");
  const discountMeta = document.getElementById("posDiscountMeta");
  const taxInput = document.getElementById("posTax");
  const paymentMethodInput = document.getElementById("posPaymentMethod");
  const paidAmountInput = document.getElementById("posPaidAmount");
  const subtotalText = document.getElementById("posSubtotal");
  const totalText = document.getElementById("posTotal");
  const changeText = document.getElementById("posChange");
  const checkoutButton = document.getElementById("posCheckoutButton");
  const checkoutText = checkoutButton.querySelector("span");
  let products = [];
  let discounts = [];
  let cart = [];

  function formatCurrency(value) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(value || 0);
  }

  function setMessage(text, type = "error") {
    if (!text) {
      message.className = "alert hidden";
      message.replaceChildren();
      return;
    }

    message.className = `alert ${type === "success" ? "alert-success" : "alert-error"}`;
    message.replaceChildren();

    const icon = document.createElement("i");
    icon.className = `bx ${type === "success" ? "bx-check-circle" : "bx-error-circle"} text-xl`;
    icon.setAttribute("aria-hidden", "true");

    const messageText = document.createElement("span");
    messageText.textContent = text;

    message.appendChild(icon);
    message.appendChild(messageText);
  }

  function getPrimaryImage(product) {
    const images = Array.isArray(product.images) ? product.images : [];
    return images.find((image) => image.isPrimary) || images[0];
  }

  function getCartQuantity(productId) {
    const item = cart.find((cartItem) => cartItem.product.id === productId);
    return item ? item.quantity : 0;
  }

  function calculateTotals() {
    const subtotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
    const discount = getSelectedDiscount();
    const tax = Math.max(Number(taxInput.value || 0), 0);
    const total = Math.max(subtotal - discount + tax, 0);
    const paymentMethod = getPaymentMethod();
    const paidAmount = paymentMethod === "cash" ? Math.max(Number(paidAmountInput.value || 0), 0) : total;
    const change = paymentMethod === "cash" ? Math.max(paidAmount - total, 0) : 0;

    return {
      subtotal,
      discount,
      tax,
      total,
      paidAmount,
      change
    };
  }

  function getPaymentMethod() {
    const checkedMethod = paymentMethodInput.querySelector('input[name="paymentMethod"]:checked');
    return checkedMethod ? checkedMethod.value : "cash";
  }

  function getSelectedDiscount() {
    const selectedId = Number(discountSelect.value);
    const discount = discounts.find((item) => item.id === selectedId);

    if (!discount) {
      return 0;
    }

    if (discount.type === "percent") {
      const subtotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
      return Math.min(Math.round(subtotal * (discount.value / 100)), subtotal);
    }

    const subtotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
    return Math.min(discount.value, subtotal);
  }

  function syncDiscountMeta() {
    const selectedId = Number(discountSelect.value);
    const discount = discounts.find((item) => item.id === selectedId);

    if (!discount) {
      discountMeta.textContent = "Pilih diskon preset yang tersedia.";
      return;
    }

    discountMeta.textContent = discount.type === "percent"
      ? `${discount.name} - ${discount.value}%`
      : `${discount.name} - ${formatCurrency(discount.value)}`;
  }

  function renderProducts(items) {
    productGrid.replaceChildren();

    if (!items.length) {
      productGrid.classList.add("hidden");
      productEmptyState.classList.remove("hidden");
      return;
    }

    productGrid.classList.remove("hidden");
    productEmptyState.classList.add("hidden");

    items.forEach((product) => {
      const card = document.createElement("button");
      const availableStock = product.stock - getCartQuantity(product.id);
      card.type = "button";
      card.disabled = availableStock <= 0;
      card.className = "flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50";
      card.dataset.addProductId = product.id;

      const primaryImage = getPrimaryImage(product);
      let media;

      if (primaryImage && primaryImage.imageUrl) {
        media = document.createElement("img");
        media.className = "h-11 w-11 shrink-0 rounded-lg border border-slate-200 object-cover";
        media.src = primaryImage.imageUrl;
        media.alt = product.name;
      } else {
        media = document.createElement("span");
        media.className = "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-slate-400";
        media.innerHTML = '<i class="bx bx-image text-2xl" aria-hidden="true"></i>';
      }

      const body = document.createElement("div");
      body.className = "grid min-w-0 flex-1 gap-1 sm:grid-cols-[minmax(0,1fr)_auto]";
      body.innerHTML = `
        <div class="min-w-0">
          <p class="truncate text-sm font-bold text-slate-900"></p>
          <p class="mt-1 truncate text-xs text-slate-500"></p>
        </div>
        <div class="text-left sm:text-right">
          <p class="text-sm font-bold text-blue-700"></p>
          <p class="mt-1 text-xs font-medium text-slate-500"></p>
        </div>
      `;
      body.querySelectorAll("p")[0].textContent = product.name;
      body.querySelectorAll("p")[1].textContent = product.sku;
      body.querySelectorAll("p")[2].textContent = formatCurrency(product.price);
      body.querySelectorAll("p")[3].textContent = availableStock > 0 ? `Stok ${availableStock}` : "Stok habis";

      card.appendChild(media);
      card.appendChild(body);
      productGrid.appendChild(card);
    });
  }

  function filterProducts() {
    const keyword = productSearch.value.trim().toLowerCase();
    const filtered = products.filter((product) => {
      return [product.name, product.sku, product.category].join(" ").toLowerCase().includes(keyword);
    });
    renderProducts(filtered);
  }

  function renderCart() {
    cartItems.replaceChildren();
    cartEmptyState.classList.toggle("hidden", cart.length > 0);

    cart.forEach((item) => {
      const row = document.createElement("article");
      row.className = "rounded-xl border border-slate-200 bg-white p-3";
      row.innerHTML = `
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="truncate font-bold text-slate-900"></p>
            <p class="mt-1 text-xs text-slate-500"></p>
          </div>
          <button type="button" class="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100" data-remove-product-id="${item.product.id}" aria-label="Hapus item">
            <i class="bx bx-trash text-base" aria-hidden="true"></i>
          </button>
        </div>
        <div class="mt-3 flex items-center justify-between gap-3">
          <div class="inline-flex items-center rounded-lg border border-slate-200">
            <button type="button" class="h-8 w-8 text-slate-600 hover:bg-slate-50" data-decrease-product-id="${item.product.id}">-</button>
            <span class="inline-flex h-8 min-w-10 items-center justify-center border-x border-slate-200 px-3 text-sm font-bold"></span>
            <button type="button" class="h-8 w-8 text-slate-600 hover:bg-slate-50" data-increase-product-id="${item.product.id}">+</button>
          </div>
          <p class="font-bold text-slate-900"></p>
        </div>
      `;
      row.querySelector("p").textContent = item.product.name;
      row.querySelectorAll("p")[1].textContent = `${formatCurrency(item.product.price)} / item`;
      row.querySelector("span").textContent = String(item.quantity);
      row.querySelectorAll("p")[2].textContent = formatCurrency(item.product.price * item.quantity);
      cartItems.appendChild(row);
    });

    const totals = calculateTotals();
    subtotalText.textContent = formatCurrency(totals.subtotal);
    totalText.textContent = formatCurrency(totals.total);
    changeText.textContent = formatCurrency(totals.change);
    paidAmountInput.disabled = getPaymentMethod() !== "cash";

    if (getPaymentMethod() !== "cash") {
      paidAmountInput.value = String(totals.total);
    }

    filterProducts();
    syncDiscountMeta();
  }

  function addProduct(productId) {
    const product = products.find((item) => item.id === productId);

    if (!product) {
      return;
    }

    const existingItem = cart.find((item) => item.product.id === productId);
    const currentQuantity = existingItem ? existingItem.quantity : 0;

    if (currentQuantity >= product.stock) {
      setMessage("Stok product tidak cukup.", "error");
      return;
    }

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ product, quantity: 1 });
    }

    setMessage("");
    renderCart();
  }

  function changeQuantity(productId, delta) {
    const item = cart.find((cartItem) => cartItem.product.id === productId);

    if (!item) {
      return;
    }

    const nextQuantity = item.quantity + delta;

    if (nextQuantity <= 0) {
      cart = cart.filter((cartItem) => cartItem.product.id !== productId);
      renderCart();
      return;
    }

    if (nextQuantity > item.product.stock) {
      setMessage("Qty melebihi stok product.", "error");
      return;
    }

    item.quantity = nextQuantity;
    setMessage("");
    renderCart();
  }

  async function loadCustomers() {
    const response = await fetch("/api/users");

    if (!response.ok) {
      throw new Error("Gagal memuat customer.");
    }

    const users = await response.json();
    users.forEach((user) => {
      const option = document.createElement("option");
      option.value = user.id;
      option.textContent = user.fullName;
      customerSelect.appendChild(option);
    });
  }

  async function loadProducts() {
    const response = await fetch("/api/products");

    if (!response.ok) {
      throw new Error("Gagal memuat product.");
    }

    products = await response.json();
    filterProducts();
  }

  async function loadDiscounts() {
    const response = await fetch("/api/discounts");

    if (!response.ok) {
      throw new Error("Gagal memuat diskon.");
    }

    discounts = await response.json();
    const currentValue = discountSelect.value;
    discountSelect.replaceChildren();

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Tanpa diskon";
    discountSelect.appendChild(defaultOption);

    discounts.forEach((discount) => {
      const option = document.createElement("option");
      option.value = String(discount.id);
      option.textContent = discount.type === "percent"
        ? `${discount.name} (${discount.value}%)`
        : `${discount.name} (${formatCurrency(discount.value)})`;
      discountSelect.appendChild(option);
    });

    if (discounts.some((discount) => String(discount.id) === currentValue)) {
      discountSelect.value = currentValue;
    }

    syncDiscountMeta();
  }

  async function checkout() {
    const totals = calculateTotals();

    if (!cart.length) {
      setMessage("Cart masih kosong.", "error");
      return;
    }

    checkoutButton.disabled = true;
    checkoutText.textContent = "Memproses...";

    try {
      const response = await fetch("/api/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          customerId: customerSelect.value || null,
          discountId: discountSelect.value || null,
          discount: totals.discount,
          tax: totals.tax,
          paymentMethod: getPaymentMethod(),
          paidAmount: totals.paidAmount,
          items: cart.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity
          }))
        })
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal menyimpan transaksi.");
      }

      window.location.href = `/sales/${result.sale.id}`;
    } catch (error) {
      setMessage(error.message, "error");
      checkoutButton.disabled = false;
      checkoutText.textContent = "Checkout";
    }
  }

  productGrid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-add-product-id]");

    if (!button || button.disabled) {
      return;
    }

    addProduct(Number(button.dataset.addProductId));
  });

  cartItems.addEventListener("click", (event) => {
    const increaseButton = event.target.closest("[data-increase-product-id]");
    const decreaseButton = event.target.closest("[data-decrease-product-id]");
    const removeButton = event.target.closest("[data-remove-product-id]");

    if (increaseButton) {
      changeQuantity(Number(increaseButton.dataset.increaseProductId), 1);
      return;
    }

    if (decreaseButton) {
      changeQuantity(Number(decreaseButton.dataset.decreaseProductId), -1);
      return;
    }

    if (removeButton) {
      cart = cart.filter((item) => item.product.id !== Number(removeButton.dataset.removeProductId));
      renderCart();
    }
  });

  [discountSelect, taxInput, paidAmountInput].forEach((input) => {
    input.addEventListener("input", renderCart);
    input.addEventListener("change", renderCart);
  });
  paymentMethodInput.addEventListener("change", renderCart);

  productSearch.addEventListener("input", filterProducts);
  checkoutButton.addEventListener("click", checkout);

  Promise.all([loadCustomers(), loadProducts()])
    .then(renderCart)
    .catch((error) => setMessage(error.message, "error"));

  loadDiscounts()
    .then(renderCart)
    .catch((error) => {
      discounts = [];
      syncDiscountMeta();
      setMessage(error.message, "error");
    });
}
