function initProductCreatePage() {
  const MAX_PRODUCT_IMAGES = 4;
  const pathParts = window.location.pathname.split("/").filter(Boolean);
  const isEditMode = pathParts[0] === "products" && pathParts[2] === "edit";
  const productId = isEditMode ? Number(pathParts[1]) : null;
  const form = document.getElementById("productForm");
  const title = document.getElementById("productFormTitle");
  const description = document.getElementById("productFormDescription");
  const message = document.getElementById("productFormMessage");
  const submitButton = document.getElementById("productSubmitButton");
  const submitText = submitButton.querySelector("span");
  const imageInput = document.getElementById("productImages");
  const imageReplaceInput = document.getElementById("productImageReplaceInput");
  const imageUploadLabel = document.getElementById("productImageUploadLabel");
  const imagePreview = document.getElementById("productImagePreview");
  let selectedImages = [];
  let primaryImageIndex = 0;
  let replaceImageIndex = null;

  if (isEditMode) {
    title.textContent = "Edit Product";
    description.textContent = "Perbarui data product yang tersimpan.";
    submitText.textContent = "Update Product";
  }

  async function loadCategories() {
    const categorySelect = document.getElementById("category");

    try {
      const response = await fetch("/api/categories");

      if (!response.ok) {
        throw new Error("Gagal memuat kategori.");
      }

      const categories = await response.json();
      categorySelect.replaceChildren();

      const placeholder = document.createElement("option");
      placeholder.value = "";
      placeholder.textContent = "Pilih kategori";
      categorySelect.appendChild(placeholder);

      categories.forEach((category) => {
        const option = document.createElement("option");
        option.value = category.name;
        option.textContent = category.name;
        categorySelect.appendChild(option);
      });
    } catch (error) {
      setError("category", error.message);
    }
  }

  function setError(field, text) {
    const error = document.querySelector(`[data-error="${field}"]`);
    error.textContent = text;
    error.classList.toggle("hidden", !text);
  }

  function clearErrors() {
    ["name", "sku", "category", "price", "stock", "images"].forEach((field) => setError(field, ""));
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

  function setSubmitState(isSubmitting) {
    submitButton.disabled = isSubmitting;
    submitText.textContent = isSubmitting
      ? "Menyimpan..."
      : (isEditMode ? "Update Product" : "Simpan Product");
  }

  function syncImageUploadState() {
    const isMaxSelected = selectedImages.length >= MAX_PRODUCT_IMAGES;
    imageInput.disabled = isMaxSelected;
    imageUploadLabel.setAttribute("aria-disabled", String(isMaxSelected));
    imageUploadLabel.classList.toggle("cursor-pointer", !isMaxSelected);
    imageUploadLabel.classList.toggle("cursor-not-allowed", isMaxSelected);
    imageUploadLabel.classList.toggle("opacity-60", isMaxSelected);
    imageUploadLabel.classList.toggle("pointer-events-none", isMaxSelected);
  }

  async function parseJsonResponse(response) {
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      return response.json();
    }

    return {
      message: response.status === 413
        ? "Ukuran foto terlalu besar. Kurangi jumlah atau ukuran foto product."
        : "Server mengembalikan response tidak valid."
    };
  }

  function validateForm(data) {
    clearErrors();

    let isValid = true;

    if (!data.name) {
      setError("name", "Nama product wajib diisi.");
      isValid = false;
    }

    if (!data.sku) {
      setError("sku", "SKU wajib diisi.");
      isValid = false;
    }

    if (!data.category) {
      setError("category", "Kategori wajib diisi.");
      isValid = false;
    }

    if (!Number.isFinite(data.price) || data.price < 0) {
      setError("price", "Harga wajib diisi dengan angka valid.");
      isValid = false;
    }

    if (!Number.isInteger(data.stock) || data.stock < 0) {
      setError("stock", "Stok wajib diisi dengan angka bulat valid.");
      isValid = false;
    }

    if (!selectedImages.length) {
      setError("images", "Minimal 1 foto product wajib dipilih.");
      isValid = false;
    }

    if (selectedImages.length > MAX_PRODUCT_IMAGES) {
      setError("images", `Maksimal ${MAX_PRODUCT_IMAGES} foto product.`);
      isValid = false;
    }

    return isValid;
  }

  function readImageFile(file) {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith("image/")) {
        reject(new Error("File harus berupa gambar."));
        return;
      }

      const image = new Image();
      const objectUrl = URL.createObjectURL(file);

      image.addEventListener("load", () => {
        const maxSize = 1200;
        const ratio = Math.min(maxSize / image.width, maxSize / image.height, 1);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(image.width * ratio);
        canvas.height = Math.round(image.height * ratio);

        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(objectUrl);

        resolve({
          previewUrl: canvas.toDataURL("image/jpeg", 0.82),
          file,
          fileName: file.name,
          isPrimary: false
        });
      });

      image.addEventListener("error", () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Gagal membaca file gambar."));
      });

      image.src = objectUrl;
    });
  }

  function renderImagePreview() {
    imagePreview.replaceChildren();

    for (let index = 0; index < MAX_PRODUCT_IMAGES; index += 1) {
      const image = selectedImages[index];

      if (!image) {
        const placeholder = document.createElement("article");
        placeholder.className = "flex aspect-square flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-3 text-center text-slate-400";

        const icon = document.createElement("i");
        icon.className = "bx bx-image-add text-3xl";
        icon.setAttribute("aria-hidden", "true");

        const label = document.createElement("span");
        label.className = "mt-2 text-xs font-semibold";
        label.textContent = `Foto ${index + 1}`;

        placeholder.appendChild(icon);
        placeholder.appendChild(label);
        imagePreview.appendChild(placeholder);
        continue;
      }

      const item = document.createElement("article");
      item.className = image.isPrimary
        ? "relative rounded-xl border-2 border-emerald-500 bg-white p-2 shadow-sm"
        : "relative rounded-xl border border-slate-200 bg-white p-2";

      const actionGroup = document.createElement("div");
      actionGroup.className = "absolute right-3 top-3 flex gap-1";

      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.className = "inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50";
      editButton.dataset.editImageIndex = index;
      editButton.setAttribute("aria-label", `Ganti foto ${image.fileName}`);
      editButton.innerHTML = '<i class="bx bx-pencil text-base" aria-hidden="true"></i>';

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-red-600 shadow-sm ring-1 ring-red-100 transition hover:bg-red-50";
      deleteButton.dataset.deleteImageIndex = index;
      deleteButton.setAttribute("aria-label", `Hapus foto ${image.fileName}`);
      deleteButton.innerHTML = '<i class="bx bx-trash text-base" aria-hidden="true"></i>';

      const preview = document.createElement("img");
      preview.className = "aspect-square w-full rounded-lg object-cover";
      preview.src = image.previewUrl;
      preview.alt = image.fileName;

      const footer = document.createElement("div");
      footer.className = "mt-2 flex items-center justify-between gap-2";

      const name = document.createElement("p");
      name.className = "min-w-0 truncate text-xs font-semibold text-slate-700";
      name.textContent = image.fileName;

      const primaryButton = document.createElement("button");
      primaryButton.type = "button";
      primaryButton.className = image.isPrimary ? "admin-button" : "app-button-secondary";
      primaryButton.dataset.primaryImageIndex = index;
      primaryButton.innerHTML = image.isPrimary
        ? '<i class="bx bx-star text-base" aria-hidden="true"></i><span>Utama</span>'
        : '<i class="bx bx-star text-base" aria-hidden="true"></i><span>Pilih</span>';

      footer.appendChild(name);
      footer.appendChild(primaryButton);
      actionGroup.appendChild(editButton);
      actionGroup.appendChild(deleteButton);
      item.appendChild(actionGroup);
      item.appendChild(preview);
      item.appendChild(footer);
      imagePreview.appendChild(item);
    }

    syncImageUploadState();
  }

  function normalizePrimaryImage() {
    if (!selectedImages.length) {
      primaryImageIndex = 0;
      return;
    }

    primaryImageIndex = Math.min(primaryImageIndex, selectedImages.length - 1);
    selectedImages = selectedImages.map((image, index) => ({
      ...image,
      isPrimary: index === primaryImageIndex
    }));
  }

  function fillForm(product) {
    form.elements.name.value = product.name || "";
    form.elements.sku.value = product.sku || "";
    form.elements.category.value = product.category || "";
    form.elements.price.value = String(product.price || 0);
    form.elements.stock.value = String(product.stock || 0);
    selectedImages = (product.images || []).slice(0, MAX_PRODUCT_IMAGES).map((image) => ({
      existingId: image.id,
      previewUrl: image.imageUrl || image.imageData,
      file: null,
      fileName: image.fileName || `product-${image.id}`,
      isPrimary: Boolean(image.isPrimary)
    }));
    primaryImageIndex = Math.max(selectedImages.findIndex((image) => image.isPrimary), 0);
    normalizePrimaryImage();
    renderImagePreview();
  }

  async function loadProductForEdit() {
    if (!isEditMode) {
      return;
    }

    if (!Number.isFinite(productId)) {
      setMessage("ID product tidak valid.", "error");
      submitButton.disabled = true;
      return;
    }

    try {
      const response = await fetch(`/api/products/${productId}`);
      const result = await parseJsonResponse(response);

      if (!response.ok) {
        throw new Error(result.message || "Gagal memuat product.");
      }

      fillForm(result);
    } catch (error) {
      setMessage(error.message, "error");
      submitButton.disabled = true;
    }
  }

  imageInput.addEventListener("change", async () => {
    const files = Array.from(imageInput.files);

    if (!files.length) {
      return;
    }

    if (selectedImages.length + files.length > MAX_PRODUCT_IMAGES) {
      imageInput.value = "";
      setError("images", `Maksimal ${MAX_PRODUCT_IMAGES} foto product.`);
      syncImageUploadState();
      return;
    }

    try {
      const newImages = await Promise.all(files.map(readImageFile));
      selectedImages = selectedImages.concat(newImages);

      normalizePrimaryImage();

      renderImagePreview();
      setError("images", "");
      imageInput.value = "";
    } catch (error) {
      setError("images", error.message);
      imageInput.value = "";
      syncImageUploadState();
    }
  });

  imagePreview.addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-edit-image-index]");
    const deleteButton = event.target.closest("[data-delete-image-index]");
    const primaryButton = event.target.closest("[data-primary-image-index]");

    if (editButton) {
      replaceImageIndex = Number(editButton.dataset.editImageIndex);
      imageReplaceInput.click();
      return;
    }

    if (deleteButton) {
      const deleteIndex = Number(deleteButton.dataset.deleteImageIndex);
      selectedImages = selectedImages.filter((image, index) => index !== deleteIndex);

      if (deleteIndex === primaryImageIndex) {
        primaryImageIndex = 0;
      } else if (deleteIndex < primaryImageIndex) {
        primaryImageIndex -= 1;
      }

      normalizePrimaryImage();
      renderImagePreview();
      setError("images", "");
      return;
    }

    if (!primaryButton) {
      return;
    }

    const selectedIndex = Number(primaryButton.dataset.primaryImageIndex);
    primaryImageIndex = selectedIndex;
    normalizePrimaryImage();
    renderImagePreview();
  });

  imageReplaceInput.addEventListener("change", async () => {
    const file = imageReplaceInput.files[0];

    if (!file || replaceImageIndex === null || !selectedImages[replaceImageIndex]) {
      imageReplaceInput.value = "";
      replaceImageIndex = null;
      return;
    }

    try {
      const replacementImage = await readImageFile(file);
      selectedImages[replaceImageIndex] = {
        ...replacementImage,
        isPrimary: replaceImageIndex === primaryImageIndex
      };
      normalizePrimaryImage();
      renderImagePreview();
      setError("images", "");
    } catch (error) {
      setError("images", error.message);
    } finally {
      imageReplaceInput.value = "";
      replaceImageIndex = null;
    }
  });

  renderImagePreview();
  loadCategories().then(loadProductForEdit);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const priceInput = formData.get("price").trim();
    const stockInput = formData.get("stock").trim();
    const data = {
      name: formData.get("name").trim(),
      sku: formData.get("sku").trim(),
      category: formData.get("category").trim(),
      price: priceInput === "" ? NaN : Number(priceInput),
      stock: stockInput === "" ? NaN : Number(stockInput),
      images: selectedImages
    };

    if (!validateForm(data)) {
      setMessage("Periksa kembali data product yang diisi.", "error");
      return;
    }

    try {
      setSubmitState(true);
      const payload = new FormData();
      payload.append("name", data.name);
      payload.append("sku", data.sku);
      payload.append("category", data.category);
      payload.append("price", String(data.price));
      payload.append("stock", String(data.stock));
      const newImages = [];
      const keptImageIds = [];

      selectedImages.forEach((image) => {
        if (image.existingId) {
          keptImageIds.push(image.existingId);
          return;
        }

        newImages.push(image);
      });

      if (isEditMode) {
        const primaryImage = selectedImages[primaryImageIndex];
        const primaryNewImageIndex = primaryImage && !primaryImage.existingId
          ? newImages.indexOf(primaryImage)
          : -1;
        const primaryImageKey = primaryImage && primaryImage.existingId
          ? `existing:${primaryImage.existingId}`
          : `new:${primaryNewImageIndex}`;

        payload.append("keptImageIds", JSON.stringify(keptImageIds));
        payload.append("primaryImageKey", primaryImageKey);
        newImages.forEach((image) => {
          payload.append("images", image.file, image.fileName);
        });
      } else {
        payload.append("primaryImageIndex", String(primaryImageIndex));
        selectedImages.forEach((image) => {
          payload.append("images", image.file, image.fileName);
        });
      }

      const response = await fetch(isEditMode ? `/api/products/${productId}` : "/api/products", {
        method: isEditMode ? "PUT" : "POST",
        body: payload
      });

      const result = await parseJsonResponse(response);

      if (!response.ok) {
        throw new Error(result.message || "Gagal menyimpan product.");
      }

      sessionStorage.setItem("productFlashMessage", result.message);
      window.location.href = "/products";
    } catch (error) {
      setMessage(error.message, "error");
      setSubmitState(false);
    }
  });
}
