function initCategoryPage() {
  const message = document.getElementById("categoryMessage");
  const form = document.getElementById("categoryForm");
  const nameInput = document.getElementById("categoryName");
  const submitButton = document.getElementById("categorySubmitButton");
  const submitText = submitButton.querySelector("span");
  const searchInput = document.getElementById("categorySearch");
  const table = document.getElementById("categoryTable");
  const tableWrapper = document.getElementById("categoryTableWrapper");
  const emptyState = document.getElementById("categoryEmptyState");
  const deleteModal = document.getElementById("deleteCategoryModal");
  const deleteText = document.getElementById("deleteCategoryText");
  const cancelDeleteButton = document.getElementById("cancelDeleteCategoryButton");
  const confirmDeleteButton = document.getElementById("confirmDeleteCategoryButton");
  const confirmDeleteText = confirmDeleteButton.querySelector("span");
  let categories = [];
  let pendingDeleteCategory = null;

  function formatDate(value) {
    if (!value) {
      return "-";
    }

    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium"
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

  function setError(text) {
    const error = document.querySelector('[data-category-error="name"]');
    error.textContent = text;
    error.classList.toggle("hidden", !text);
  }

  function renderCategories(items) {
    table.replaceChildren();

    if (!items.length) {
      tableWrapper.classList.add("hidden");
      emptyState.classList.remove("hidden");
      emptyState.querySelector("p").textContent = categories.length ? "Category tidak ditemukan." : "Belum ada category.";
      return;
    }

    tableWrapper.classList.remove("hidden");
    emptyState.classList.add("hidden");

    items.forEach((category) => {
      const row = document.createElement("tr");
      row.className = "transition hover:bg-slate-50";

      const nameCell = document.createElement("td");
      nameCell.className = "table-cell";
      nameCell.innerHTML = `<span class="font-semibold text-slate-900"></span>`;
      nameCell.querySelector("span").textContent = category.name;

      const dateCell = document.createElement("td");
      dateCell.className = "table-cell";
      dateCell.textContent = formatDate(category.createdAt);

      const actionCell = document.createElement("td");
      actionCell.className = "table-cell text-right";
      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "delete-button";
      deleteButton.dataset.deleteCategoryId = category.id;
      deleteButton.innerHTML = '<i class="bx bx-trash text-base" aria-hidden="true"></i><span>Hapus</span>';
      actionCell.appendChild(deleteButton);

      row.appendChild(nameCell);
      row.appendChild(dateCell);
      row.appendChild(actionCell);
      table.appendChild(row);
    });
  }

  function filterCategories(keyword) {
    const normalizedKeyword = keyword.trim().toLowerCase();

    if (!normalizedKeyword) {
      renderCategories(categories);
      return;
    }

    renderCategories(categories.filter((category) => category.name.toLowerCase().includes(normalizedKeyword)));
  }

  async function loadCategories() {
    try {
      const response = await fetch("/api/categories");

      if (!response.ok) {
        throw new Error("Gagal memuat category.");
      }

      categories = await response.json();
      filterCategories(searchInput.value);
    } catch (error) {
      tableWrapper.classList.add("hidden");
      emptyState.classList.remove("hidden");
      emptyState.querySelector("p").textContent = "Gagal memuat category.";
      setMessage(error.message, "error");
    }
  }

  async function createCategory() {
    const name = nameInput.value.trim();
    setError("");

    if (!name) {
      setError("Nama category wajib diisi.");
      return;
    }

    submitButton.disabled = true;
    submitText.textContent = "Menyimpan...";

    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name })
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal menyimpan category.");
      }

      nameInput.value = "";
      setMessage(result.message, "success");
      await loadCategories();
    } catch (error) {
      setMessage(error.message, "error");
    } finally {
      submitButton.disabled = false;
      submitText.textContent = "Simpan Category";
    }
  }

  function openDeleteModal(category) {
    pendingDeleteCategory = category;
    deleteText.textContent = `Category "${category.name}" akan dihapus jika belum dipakai product.`;
    confirmDeleteButton.disabled = false;
    confirmDeleteText.textContent = "Hapus Category";
    deleteModal.classList.remove("hidden");
  }

  function closeDeleteModal() {
    deleteModal.classList.add("hidden");
    pendingDeleteCategory = null;
    confirmDeleteButton.disabled = false;
    confirmDeleteText.textContent = "Hapus Category";
  }

  async function deleteCategory() {
    if (!pendingDeleteCategory) {
      return;
    }

    confirmDeleteButton.disabled = true;
    confirmDeleteText.textContent = "Menghapus...";

    try {
      const response = await fetch(`/api/categories/${pendingDeleteCategory.id}`, {
        method: "DELETE"
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal menghapus category.");
      }

      closeDeleteModal();
      setMessage(result.message, "success");
      await loadCategories();
    } catch (error) {
      setMessage(error.message, "error");
      confirmDeleteButton.disabled = false;
      confirmDeleteText.textContent = "Hapus Category";
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    createCategory();
  });

  searchInput.addEventListener("input", (event) => {
    filterCategories(event.target.value);
  });

  table.addEventListener("click", (event) => {
    const button = event.target.closest("[data-delete-category-id]");

    if (!button) {
      return;
    }

    const categoryId = Number(button.dataset.deleteCategoryId);
    const category = categories.find((item) => item.id === categoryId);

    if (category) {
      openDeleteModal(category);
    }
  });

  cancelDeleteButton.addEventListener("click", closeDeleteModal);
  confirmDeleteButton.addEventListener("click", deleteCategory);

  deleteModal.addEventListener("click", (event) => {
    if (event.target === deleteModal) {
      closeDeleteModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !deleteModal.classList.contains("hidden")) {
      closeDeleteModal();
    }
  });

  loadCategories();
}
