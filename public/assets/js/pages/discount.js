function initDiscountPage() {
  const message = document.getElementById("discountMessage");
  const form = document.getElementById("discountForm");
  const nameInput = document.getElementById("discountName");
  const typeInput = document.getElementById("discountType");
  const valueInput = document.getElementById("discountValue");
  const submitButton = document.getElementById("discountSubmitButton");
  const submitText = submitButton.querySelector("span");
  const searchInput = document.getElementById("discountSearch");
  const table = document.getElementById("discountTable");
  const tableWrapper = document.getElementById("discountTableWrapper");
  const emptyState = document.getElementById("discountEmptyState");
  const deleteModal = document.getElementById("deleteDiscountModal");
  const deleteText = document.getElementById("deleteDiscountText");
  const cancelDeleteButton = document.getElementById("cancelDeleteDiscountButton");
  const confirmDeleteButton = document.getElementById("confirmDeleteDiscountButton");
  const confirmDeleteText = confirmDeleteButton.querySelector("span");
  let discounts = [];
  let pendingDeleteDiscount = null;

  function formatCurrency(value) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(value || 0);
  }

  function formatDateTime(value) {
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

  function setError(field, text) {
    const error = document.querySelector(`[data-discount-error="${field}"]`);
    error.textContent = text;
    error.classList.toggle("hidden", !text);
  }

  function clearErrors() {
    ["name", "type", "value"].forEach((field) => setError(field, ""));
  }

  function renderDiscounts(items) {
    table.replaceChildren();

    if (!items.length) {
      tableWrapper.classList.add("hidden");
      emptyState.classList.remove("hidden");
      emptyState.querySelector("p").textContent = discounts.length ? "Discount tidak ditemukan." : "Belum ada discount.";
      return;
    }

    tableWrapper.classList.remove("hidden");
    emptyState.classList.add("hidden");

    items.forEach((discount) => {
      const row = document.createElement("tr");
      row.className = "transition hover:bg-slate-50";

      const nameCell = document.createElement("td");
      nameCell.className = "table-cell";
      nameCell.innerHTML = `<span class="font-semibold text-slate-900"></span>`;
      nameCell.querySelector("span").textContent = discount.name;

      const typeCell = document.createElement("td");
      typeCell.className = "table-cell";
      typeCell.textContent = discount.type === "percent" ? "Persen" : "Nominal";

      const valueCell = document.createElement("td");
      valueCell.className = "table-cell";
      valueCell.textContent = discount.type === "percent" ? `${discount.value}%` : formatCurrency(discount.value);

      const dateCell = document.createElement("td");
      dateCell.className = "table-cell";
      dateCell.textContent = formatDateTime(discount.createdAt);

      const actionCell = document.createElement("td");
      actionCell.className = "table-cell text-right";
      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "delete-button";
      deleteButton.dataset.deleteDiscountId = discount.id;
      deleteButton.innerHTML = '<i class="bx bx-trash text-base" aria-hidden="true"></i><span>Hapus</span>';
      actionCell.appendChild(deleteButton);

      row.appendChild(nameCell);
      row.appendChild(typeCell);
      row.appendChild(valueCell);
      row.appendChild(dateCell);
      row.appendChild(actionCell);
      table.appendChild(row);
    });
  }

  function filterDiscounts(keyword) {
    const normalized = keyword.trim().toLowerCase();

    if (!normalized) {
      renderDiscounts(discounts);
      return;
    }

    renderDiscounts(discounts.filter((discount) => {
      return [discount.name, discount.type, String(discount.value)]
        .join(" ")
        .toLowerCase()
        .includes(normalized);
    }));
  }

  async function loadDiscounts() {
    try {
      const response = await fetch("/api/discounts");

      if (!response.ok) {
        throw new Error("Gagal memuat discount.");
      }

      discounts = await response.json();
      filterDiscounts(searchInput.value);
    } catch (error) {
      tableWrapper.classList.add("hidden");
      emptyState.classList.remove("hidden");
      emptyState.querySelector("p").textContent = "Gagal memuat discount.";
      setMessage(error.message, "error");
    }
  }

  async function saveDiscount() {
    clearErrors();

    const name = nameInput.value.trim();
    const type = typeInput.value;
    const value = Number(valueInput.value);
    let valid = true;

    if (!name) {
      setError("name", "Nama discount wajib diisi.");
      valid = false;
    }

    if (!["amount", "percent"].includes(type)) {
      setError("type", "Tipe discount tidak valid.");
      valid = false;
    }

    if (!Number.isInteger(value) || value < 0) {
      setError("value", "Nilai discount tidak valid.");
      valid = false;
    }

    if (type === "percent" && value > 100) {
      setError("value", "Diskon persen maksimal 100.");
      valid = false;
    }

    if (!valid) {
      return;
    }

    submitButton.disabled = true;
    submitText.textContent = "Menyimpan...";

    try {
      const response = await fetch("/api/discounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, type, value })
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal menyimpan discount.");
      }

      nameInput.value = "";
      typeInput.value = "amount";
      valueInput.value = "0";
      setMessage(result.message, "success");
      await loadDiscounts();
    } catch (error) {
      setMessage(error.message, "error");
    } finally {
      submitButton.disabled = false;
      submitText.textContent = "Simpan Discount";
    }
  }

  function openDeleteModal(discount) {
    pendingDeleteDiscount = discount;
    deleteText.textContent = `Discount "${discount.name}" akan dihapus dari daftar preset.`;
    confirmDeleteButton.disabled = false;
    confirmDeleteText.textContent = "Hapus Discount";
    deleteModal.classList.remove("hidden");
  }

  function closeDeleteModal() {
    pendingDeleteDiscount = null;
    deleteModal.classList.add("hidden");
    confirmDeleteButton.disabled = false;
    confirmDeleteText.textContent = "Hapus Discount";
  }

  async function deleteDiscount() {
    if (!pendingDeleteDiscount) {
      return;
    }

    confirmDeleteButton.disabled = true;
    confirmDeleteText.textContent = "Menghapus...";

    try {
      const response = await fetch(`/api/discounts/${pendingDeleteDiscount.id}`, {
        method: "DELETE"
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal menghapus discount.");
      }

      closeDeleteModal();
      setMessage(result.message, "success");
      await loadDiscounts();
    } catch (error) {
      setMessage(error.message, "error");
      confirmDeleteButton.disabled = false;
      confirmDeleteText.textContent = "Hapus Discount";
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    saveDiscount();
  });

  searchInput.addEventListener("input", (event) => {
    filterDiscounts(event.target.value);
  });

  table.addEventListener("click", (event) => {
    const button = event.target.closest("[data-delete-discount-id]");

    if (!button) {
      return;
    }

    const discountId = Number(button.dataset.deleteDiscountId);
    const discount = discounts.find((item) => item.id === discountId);

    if (discount) {
      openDeleteModal(discount);
    }
  });

  cancelDeleteButton.addEventListener("click", closeDeleteModal);
  confirmDeleteButton.addEventListener("click", deleteDiscount);

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

  loadDiscounts();
}
