function initProductPage() {
  const totalProducts = document.getElementById("totalProducts");
  const availableStock = document.getElementById("availableStock");
  const totalCategories = document.getElementById("totalCategories");
  const emptyStockProducts = document.getElementById("emptyStockProducts");
  const productMessage = document.getElementById("productMessage");
  const productSearch = document.getElementById("productSearch");
  const productResultCount = document.getElementById("productResultCount");
  const productTable = document.getElementById("productTable");
  const tableWrapper = document.getElementById("productTableWrapper");
  const emptyState = document.getElementById("productEmptyState");
  const deleteProductModal = document.getElementById("deleteProductModal");
  const deleteProductText = document.getElementById("deleteProductText");
  const cancelDeleteProductButton = document.getElementById("cancelDeleteProductButton");
  const confirmDeleteProductButton = document.getElementById("confirmDeleteProductButton");
  const confirmDeleteProductText = confirmDeleteProductButton.querySelector("span");
  let allProducts = [];
  let pendingDeleteProduct = null;

  function formatCurrency(value) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(value);
  }

  function setMessage(text, type = "error") {
    if (!text) {
      productMessage.className = "alert hidden";
      productMessage.replaceChildren();
      return;
    }

    productMessage.className = `alert ${type === "success" ? "alert-success" : "alert-error"}`;
    productMessage.replaceChildren();

    const icon = document.createElement("i");
    icon.className = `bx ${type === "success" ? "bx-check-circle" : "bx-error-circle"} text-xl`;
    icon.setAttribute("aria-hidden", "true");

    const messageText = document.createElement("span");
    messageText.textContent = text;

    productMessage.appendChild(icon);
    productMessage.appendChild(messageText);
  }

  function showFlashMessage() {
    const flashMessage = sessionStorage.getItem("productFlashMessage");

    if (!flashMessage) {
      return;
    }

    setMessage(flashMessage, "success");
    sessionStorage.removeItem("productFlashMessage");
  }

  function createCell(text, className = "") {
    const cell = document.createElement("td");
    cell.className = `table-cell ${className}`.trim();
    cell.textContent = text;
    return cell;
  }

  function getPrimaryImage(product) {
    const images = Array.isArray(product.images) ? product.images : [];
    return images.find((image) => image.isPrimary) || images[0];
  }

  function createProductCell(product) {
    const cell = document.createElement("td");
    cell.className = "table-cell";

    const wrapper = document.createElement("div");
    wrapper.className = "flex items-center gap-3";

    const primaryImage = getPrimaryImage(product);
    let media;

    if (primaryImage && primaryImage.imageUrl) {
      media = document.createElement("img");
      media.className = "h-12 w-12 shrink-0 rounded-lg border border-slate-200 object-cover";
      media.src = primaryImage.imageUrl;
      media.alt = product.name;
    } else {
      media = document.createElement("span");
      media.className = "inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-slate-400";
      media.innerHTML = '<i class="bx bx-image text-2xl" aria-hidden="true"></i>';
    }

    const textWrapper = document.createElement("div");
    const name = document.createElement("p");
    name.className = "font-semibold text-slate-900";
    name.textContent = product.name;
    const createdAt = document.createElement("p");
    createdAt.className = "text-xs text-slate-500";
    createdAt.textContent = `ID ${product.id}`;

    textWrapper.appendChild(name);
    textWrapper.appendChild(createdAt);
    wrapper.appendChild(media);
    wrapper.appendChild(textWrapper);
    cell.appendChild(wrapper);

    return cell;
  }

  function createStatusCell(product) {
    const cell = document.createElement("td");
    cell.className = "table-cell";

    const badge = document.createElement("span");
    const isEmpty = product.stock <= 0;
    const isLowStock = product.stock > 0 && product.stock <= 5;

    if (isEmpty) {
      badge.className = "status-badge status-badge-empty";
      badge.textContent = "Stok kosong";
    } else if (isLowStock) {
      badge.className = "status-badge bg-amber-50 text-amber-700";
      badge.textContent = "Stok rendah";
    } else {
      badge.className = "status-badge status-badge-active";
      badge.textContent = "Aktif";
    }

    cell.appendChild(badge);

    return cell;
  }

  function updateProductSummary(products) {
    totalProducts.textContent = String(allProducts.length);
    availableStock.textContent = String(allProducts.reduce((total, product) => total + product.stock, 0));
    totalCategories.textContent = String(new Set(allProducts.map((product) => product.category)).size);

    if (emptyStockProducts) {
      emptyStockProducts.textContent = String(allProducts.filter((product) => product.stock <= 0).length);
    }

    if (productResultCount) {
      const keyword = productSearch.value.trim();
      productResultCount.textContent = keyword ? `${products.length} hasil ditemukan` : `${products.length} product`;
    }
  }

  function createActionCell(product) {
    const cell = document.createElement("td");
    cell.className = "table-cell text-right";

    const actions = document.createElement("div");
    actions.className = "flex justify-end gap-2";

    const link = document.createElement("a");
    link.className = "admin-button";
    link.href = `/products/${product.id}`;
    link.innerHTML = '<i class="bx bx-show text-base" aria-hidden="true"></i><span>View</span>';

    const editLink = document.createElement("a");
    editLink.className = "admin-button";
    editLink.href = `/products/${product.id}/edit`;
    editLink.innerHTML = '<i class="bx bx-pencil text-base" aria-hidden="true"></i><span>Edit</span>';

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-button";
    deleteButton.dataset.deleteProductId = product.id;
    deleteButton.innerHTML = '<i class="bx bx-trash text-base" aria-hidden="true"></i><span>Hapus</span>';

    actions.appendChild(link);
    actions.appendChild(editLink);
    actions.appendChild(deleteButton);
    cell.appendChild(actions);
    return cell;
  }

  function openDeleteProductModal(product) {
    pendingDeleteProduct = product;
    deleteProductText.textContent = `Product "${product.name}" akan dihapus permanen beserta fotonya.`;
    confirmDeleteProductButton.disabled = false;
    confirmDeleteProductText.textContent = "Hapus Product";
    deleteProductModal.classList.remove("hidden");
  }

  function closeDeleteProductModal() {
    deleteProductModal.classList.add("hidden");
    pendingDeleteProduct = null;
    confirmDeleteProductButton.disabled = false;
    confirmDeleteProductText.textContent = "Hapus Product";
  }

  async function deleteProduct() {
    if (!pendingDeleteProduct) {
      return;
    }

    confirmDeleteProductButton.disabled = true;
    confirmDeleteProductText.textContent = "Menghapus...";

    try {
      const response = await fetch(`/api/products/${pendingDeleteProduct.id}`, {
        method: "DELETE"
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal menghapus product.");
      }

      allProducts = allProducts.filter((product) => product.id !== pendingDeleteProduct.id);
      closeDeleteProductModal();
      setMessage(result.message, "success");
      filterProducts(productSearch.value);
    } catch (error) {
      setMessage(error.message, "error");
      confirmDeleteProductButton.disabled = false;
      confirmDeleteProductText.textContent = "Hapus Product";
    }
  }

  function renderProducts(products) {
    productTable.replaceChildren();
    showFlashMessage();
    updateProductSummary(products);

    if (!allProducts.length) {
      tableWrapper.classList.add("hidden");
      emptyState.classList.remove("hidden");
      emptyState.querySelector("p").textContent = "Belum ada data product.";
      return;
    }

    if (!products.length) {
      tableWrapper.classList.add("hidden");
      emptyState.classList.remove("hidden");
      emptyState.querySelector("p").textContent = "Product tidak ditemukan.";
      return;
    }

    tableWrapper.classList.remove("hidden");
    emptyState.classList.add("hidden");

    products.forEach((product) => {
      const row = document.createElement("tr");
      row.className = "transition hover:bg-slate-50";
      row.appendChild(createProductCell(product));
      row.appendChild(createCell(product.sku));
      row.appendChild(createCell(product.category));
      row.appendChild(createCell(formatCurrency(product.price), "text-right font-bold text-slate-900"));
      row.appendChild(createCell(String(product.stock), "text-right font-bold text-slate-900"));
      row.appendChild(createStatusCell(product));
      row.appendChild(createActionCell(product));
      productTable.appendChild(row);
    });
  }

  function filterProducts(keyword) {
    const normalizedKeyword = keyword.trim().toLowerCase();

    if (!normalizedKeyword) {
      renderProducts(allProducts);
      return;
    }

    const filteredProducts = allProducts.filter((product) => {
      return [product.name, product.sku, product.category, product.status]
        .join(" ")
        .toLowerCase()
        .includes(normalizedKeyword);
    });

    renderProducts(filteredProducts);
  }

  async function loadProducts() {
    try {
      const response = await fetch("/api/products");

      if (!response.ok) {
        throw new Error("Gagal memuat data product.");
      }

      allProducts = await response.json();
      renderProducts(allProducts);
    } catch (error) {
      tableWrapper.classList.add("hidden");
      emptyState.classList.remove("hidden");
      emptyState.querySelector("p").textContent = "Gagal memuat data product.";
      setMessage(error.message, "error");
    }
  }

  productSearch.addEventListener("input", (event) => {
    filterProducts(event.target.value);
  });

  productTable.addEventListener("click", (event) => {
    const button = event.target.closest("[data-delete-product-id]");

    if (!button) {
      return;
    }

    const productId = Number(button.dataset.deleteProductId);
    const product = allProducts.find((item) => item.id === productId);

    if (product) {
      openDeleteProductModal(product);
    }
  });

  cancelDeleteProductButton.addEventListener("click", closeDeleteProductModal);
  confirmDeleteProductButton.addEventListener("click", deleteProduct);

  deleteProductModal.addEventListener("click", (event) => {
    if (event.target === deleteProductModal) {
      closeDeleteProductModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !deleteProductModal.classList.contains("hidden")) {
      closeDeleteProductModal();
    }
  });

  loadProducts();
}
