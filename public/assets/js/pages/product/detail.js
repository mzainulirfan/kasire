function initProductDetailPage() {
  const message = document.getElementById("productDetailMessage");
  const detailCard = document.getElementById("productDetailCard");
  const productId = window.location.pathname.split("/").filter(Boolean).at(-1);

  function formatCurrency(value) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(value);
  }

  function formatDateTime(value) {
    if (!value) {
      return "-";
    }

    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(new Date(value));
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

  function setText(id, text) {
    const element = document.getElementById(id);
    element.textContent = text;
  }

  function renderProduct(product) {
    setText("detailProductName", product.name);
    setText("detailProductSku", product.sku);
    setText("detailProductCategory", product.category);
    setText("detailProductPrice", formatCurrency(product.price));
    setText("detailProductStock", String(product.stock));
    setText("detailProductId", String(product.id));
    setText("detailProductCreatedAt", formatDateTime(product.createdAt));
    setText("detailProductStockValue", formatCurrency(product.price * product.stock));
    setText("detailProductInventoryNote", product.stock > 0 ? `${product.stock} item tersedia untuk dijual.` : "Product perlu restock sebelum bisa dijual.");
    setText("detailProductIdentity", `${product.name} dengan SKU ${product.sku}`);
    setText("detailProductAvailability", product.stock > 0 ? `Tersedia dalam kategori ${product.category}.` : `Stok kosong di kategori ${product.category}.`);

    const status = document.getElementById("detailProductStatus");
    const isAvailable = product.status === "active" && product.stock > 0;
    status.className = isAvailable ? "status-badge status-badge-active" : "status-badge status-badge-empty";
    status.textContent = isAvailable ? "Aktif" : "Stok kosong";

    renderProductImages(product.images || []);

    detailCard.classList.remove("hidden");
  }

  function renderProductImages(images) {
    const mainImageWrap = document.getElementById("detailProductMainImageWrap");
    const thumbnails = document.getElementById("detailProductThumbnails");
    const primaryImage = images.find((image) => image.isPrimary) || images[0];

    thumbnails.replaceChildren();

    function setMainImage(image) {
      const img = document.createElement("img");
      img.className = "aspect-square w-full object-cover";
      img.src = image.imageUrl || image.imageData;
      img.alt = image.fileName;
      mainImageWrap.replaceChildren(img);
    }

    if (primaryImage) {
      setMainImage(primaryImage);
    }

    images.slice(0, 4).forEach((image) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = primaryImage && image.id === primaryImage.id
        ? "overflow-hidden rounded-lg border-2 border-emerald-500 bg-white"
        : "overflow-hidden rounded-lg border border-slate-200 bg-white";

      const img = document.createElement("img");
      img.className = "aspect-square w-full object-cover";
      img.src = image.imageUrl || image.imageData;
      img.alt = image.fileName;

      button.appendChild(img);
      button.addEventListener("click", () => setMainImage(image));

      thumbnails.appendChild(button);
    });

    if (!images.length) {
      for (let index = 0; index < 4; index += 1) {
        const item = document.createElement("div");
        item.className = "flex aspect-square items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-400";
        item.innerHTML = '<i class="bx bx-image text-2xl" aria-hidden="true"></i>';
        thumbnails.appendChild(item);
      }
    }
  }

  async function loadProduct() {
    try {
      const response = await fetch(`/api/products/${productId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal memuat detail product.");
      }

      renderProduct(result);
    } catch (error) {
      detailCard.classList.add("hidden");
      setMessage(error.message, "error");
    }
  }

  loadProduct();
}
