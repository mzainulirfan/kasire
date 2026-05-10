function initDashboardPage() {
  const totalUsers = document.getElementById("totalUsers");
  const totalProducts = document.getElementById("totalProducts");
  const totalProductStock = document.getElementById("totalProductStock");
  const totalProductCategories = document.getElementById("totalProductCategories");
  const totalIncome = document.getElementById("totalIncome");
  const totalSales = document.getElementById("totalSales");
  const latestUser = document.getElementById("latestUser");
  const latestSavedAt = document.getElementById("latestSavedAt");
  const userTable = document.getElementById("userTable");
  const latestProductTable = document.getElementById("latestProductTable");
  const latestProductTableWrapper = document.getElementById("latestProductTableWrapper");
  const latestProductEmptyState = document.getElementById("latestProductEmptyState");
  const latestSalesTable = document.getElementById("latestSalesTable");
  const latestSalesTableWrapper = document.getElementById("latestSalesTableWrapper");
  const latestSalesEmptyState = document.getElementById("latestSalesEmptyState");
  const emptyState = document.getElementById("emptyState");
  const tableWrapper = document.getElementById("tableWrapper");
  const dashboardMessage = document.getElementById("dashboardMessage");
  const userSearch = document.getElementById("userSearch");
  const searchControl = document.getElementById("searchControl");
  const addDataControl = document.getElementById("addDataControl");
  const deleteModal = document.getElementById("deleteModal");
  const deleteModalText = document.getElementById("deleteModalText");
  const cancelDeleteButton = document.getElementById("cancelDeleteButton");
  const confirmDeleteButton = document.getElementById("confirmDeleteButton");
  const confirmDeleteText = confirmDeleteButton.querySelector("span");
  let allUsers = [];
  let allProducts = [];
  let allSales = [];
  let pendingDelete = null;

  function formatDateTime(value) {
    if (!value) {
      return "-";
    }

    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(new Date(value));
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(value);
  }

  function createActionCell(user) {
    const cell = document.createElement("td");
    cell.className = "table-cell text-right";
    const actions = document.createElement("div");
    actions.className = "flex justify-end gap-2";

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-button";
    deleteButton.dataset.deleteUserId = user.id;
    deleteButton.dataset.userName = user.fullName;
    deleteButton.innerHTML = '<i class="bx bx-trash text-base" aria-hidden="true"></i><span>Hapus</span>';

    if (user.isAdmin) {
      deleteButton.disabled = true;
      deleteButton.title = "Cabut akses admin di Setting sebelum menghapus user.";
    }

    actions.appendChild(deleteButton);
    cell.appendChild(actions);
    return cell;
  }

  function createContactCell(user) {
    const cell = document.createElement("td");
    cell.className = "table-cell";

    const wrapper = document.createElement("div");
    wrapper.className = "space-y-1";

    const email = document.createElement("p");
    email.className = "flex items-center gap-2 font-medium text-slate-900";
    email.innerHTML = '<i class="bx bx-envelope text-base text-slate-400" aria-hidden="true"></i>';
    email.appendChild(document.createTextNode(user.email));

    const phone = document.createElement("p");
    phone.className = "flex items-center gap-2 text-xs text-slate-500";
    phone.innerHTML = '<i class="bx bx-phone text-base text-slate-400" aria-hidden="true"></i>';
    phone.appendChild(document.createTextNode(user.phone));

    wrapper.appendChild(email);
    wrapper.appendChild(phone);
    cell.appendChild(wrapper);

    return cell;
  }

  function createAddressCell(user) {
    const cell = document.createElement("td");
    cell.className = "table-cell max-w-[240px]";

    const address = document.createElement("p");
    address.className = "line-clamp-2 text-slate-700";
    address.title = user.address;
    address.textContent = user.address;

    cell.appendChild(address);
    return cell;
  }

  function createCreatedAtCell(user) {
    const cell = document.createElement("td");
    cell.className = "table-cell";

    const createdAt = document.createElement("p");
    createdAt.className = "font-medium text-slate-900";
    createdAt.textContent = formatDateTime(user.createdAt);

    const id = document.createElement("p");
    id.className = "text-xs text-slate-500";
    id.textContent = `ID ${user.id}`;

    cell.appendChild(createdAt);
    cell.appendChild(id);

    return cell;
  }

  function createUserCell(user) {
    const cell = document.createElement("td");
    cell.className = "table-cell";

    const wrapper = document.createElement("div");
    wrapper.className = "flex items-center gap-3";

    const avatarWrap = document.createElement("span");
    avatarWrap.className = "relative inline-flex h-9 w-9 shrink-0 items-center justify-center";

    const avatar = document.createElement("span");
    avatar.className = "inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700";
    avatar.textContent = user.fullName.charAt(0).toUpperCase();

    avatarWrap.appendChild(avatar);

    if (user.isAdmin) {
      const adminDot = document.createElement("span");
      adminDot.className = "avatar-admin-dot";
      adminDot.innerHTML = '<i class="bx bx-shield-quarter text-[10px]" aria-hidden="true"></i>';
      adminDot.title = "Admin";
      avatarWrap.appendChild(adminDot);
    }

    const textWrapper = document.createElement("div");
    const name = document.createElement("p");
    name.className = "font-semibold text-slate-900";
    name.textContent = user.fullName;
    const email = document.createElement("p");
    email.className = "text-xs text-slate-500";
    email.textContent = user.email;

    textWrapper.appendChild(name);
    textWrapper.appendChild(email);

    wrapper.appendChild(avatarWrap);
    wrapper.appendChild(textWrapper);
    cell.appendChild(wrapper);

    return cell;
  }

  function createProductCell(product) {
    const cell = document.createElement("td");
    cell.className = "table-cell min-w-0";

    const wrapper = document.createElement("div");
    wrapper.className = "flex min-w-0 items-center gap-3";

    const icon = document.createElement("span");
    icon.className = "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700";
    icon.innerHTML = '<i class="bx bx-box text-xl" aria-hidden="true"></i>';

    const textWrapper = document.createElement("div");
    textWrapper.className = "min-w-0";
    const name = document.createElement("p");
    name.className = "truncate font-semibold text-slate-900";
    name.textContent = product.name;
    const sku = document.createElement("p");
    sku.className = "truncate text-xs text-slate-500";
    sku.textContent = product.sku;

    textWrapper.appendChild(name);
    textWrapper.appendChild(sku);
    wrapper.appendChild(icon);
    wrapper.appendChild(textWrapper);
    cell.appendChild(wrapper);

    return cell;
  }

  function createTableCell(text, className = "") {
    const cell = document.createElement("td");
    cell.className = `table-cell ${className}`.trim();
    cell.textContent = text;
    return cell;
  }

  function setMessage(text, type = "error") {
    if (!text) {
      dashboardMessage.className = "alert hidden";
      dashboardMessage.replaceChildren();
      return;
    }

    dashboardMessage.className = `alert ${type === "success" ? "alert-success" : "alert-error"}`;
    dashboardMessage.replaceChildren();

    const icon = document.createElement("i");
    icon.className = `bx ${type === "success" ? "bx-check-circle" : "bx-error-circle"} text-xl`;
    icon.setAttribute("aria-hidden", "true");

    const messageText = document.createElement("span");
    messageText.textContent = text;

    dashboardMessage.appendChild(icon);
    dashboardMessage.appendChild(messageText);
  }

  function setPrimaryControl(mode) {
    const showSearch = mode === "search";
    searchControl.classList.toggle("hidden", !showSearch);
    addDataControl.classList.toggle("hidden", showSearch);
  }

  function showFlashMessage() {
    const flashMessage = sessionStorage.getItem("flashMessage");

    if (!flashMessage) {
      return;
    }

    setMessage(flashMessage, "success");
    sessionStorage.removeItem("flashMessage");
  }

  function renderLatestProducts() {
    latestProductTable.replaceChildren();

    if (!allProducts.length) {
      latestProductTableWrapper.classList.add("hidden");
      latestProductEmptyState.classList.remove("hidden");
      return;
    }

    latestProductTableWrapper.classList.remove("hidden");
    latestProductEmptyState.classList.add("hidden");

    allProducts
      .slice()
      .sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt))
      .slice(0, 5)
      .forEach((product) => {
        const row = document.createElement("tr");
        row.className = "transition hover:bg-slate-50";
        row.appendChild(createProductCell(product));
        row.appendChild(createTableCell(formatCurrency(product.price), "text-right tabular-nums"));
        row.appendChild(createTableCell(String(product.stock), "text-right tabular-nums"));
        latestProductTable.appendChild(row);
      });
  }

  function createSaleInvoiceCell(sale) {
    const cell = document.createElement("td");
    cell.className = "table-cell min-w-0";

    const link = document.createElement("a");
    link.href = `/sales/${sale.id}`;
    link.className = "block min-w-0";

    const invoice = document.createElement("p");
    invoice.className = "truncate font-semibold text-slate-900";
    invoice.textContent = sale.invoiceNumber;

    const date = document.createElement("p");
    date.className = "truncate text-xs text-slate-500";
    date.textContent = formatDateTime(sale.createdAt);

    link.appendChild(invoice);
    link.appendChild(date);
    cell.appendChild(link);

    return cell;
  }

  function renderLatestSales() {
    latestSalesTable.replaceChildren();

    if (!allSales.length) {
      latestSalesTableWrapper.classList.add("hidden");
      latestSalesEmptyState.classList.remove("hidden");
      return;
    }

    latestSalesTableWrapper.classList.remove("hidden");
    latestSalesEmptyState.classList.add("hidden");

    allSales
      .slice()
      .sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt))
      .slice(0, 5)
      .forEach((sale) => {
        const row = document.createElement("tr");
        row.className = "transition hover:bg-slate-50";
        row.appendChild(createSaleInvoiceCell(sale));
        row.appendChild(createTableCell(sale.customerName, "truncate"));
        row.appendChild(createTableCell(formatCurrency(sale.total), "text-right tabular-nums"));
        latestSalesTable.appendChild(row);
      });
  }

  function renderDashboard(users) {
    totalUsers.textContent = allUsers.length;
    totalProducts.textContent = allProducts.length;
    totalProductStock.textContent = allProducts.reduce((total, product) => total + product.stock, 0);
    totalProductCategories.textContent = new Set(allProducts.map((product) => product.category)).size;
    totalIncome.textContent = formatCurrency(allSales.reduce((total, sale) => total + sale.total, 0));
    if (totalSales) {
      totalSales.textContent = allSales.length;
    }
    userTable.replaceChildren();
    renderLatestProducts();
    renderLatestSales();
    showFlashMessage();

    if (!allUsers.length) {
      setPrimaryControl("add");
      if (latestUser) {
        latestUser.textContent = "Belum ada data";
      }
      if (latestSavedAt) {
        latestSavedAt.textContent = "-";
      }
      tableWrapper.classList.add("hidden");
      emptyState.classList.remove("hidden");
      emptyState.querySelector("p").textContent = "Belum ada data user.";
      return;
    }

    const latest = allUsers[allUsers.length - 1];
    if (latestUser) {
      latestUser.textContent = latest.fullName;
    }
    if (latestSavedAt) {
      latestSavedAt.textContent = formatDateTime(latest.createdAt);
    }
    setPrimaryControl("search");

    if (!users.length) {
      tableWrapper.classList.add("hidden");
      emptyState.classList.remove("hidden");
      emptyState.querySelector("p").textContent = "Data tidak ditemukan.";
      return;
    }

    tableWrapper.classList.remove("hidden");
    emptyState.classList.add("hidden");

    users.forEach((user) => {
      const row = document.createElement("tr");
      row.className = "transition hover:bg-slate-50";
      row.appendChild(createUserCell(user));
      row.appendChild(createContactCell(user));
      row.appendChild(createCreatedAtCell(user));
      row.appendChild(createActionCell(user));
      userTable.appendChild(row);
    });
  }

  function filterUsers(keyword) {
    const normalizedKeyword = keyword.trim().toLowerCase();

    if (!normalizedKeyword) {
      renderDashboard(allUsers);
      return;
    }

    const filteredUsers = allUsers.filter((user) => {
      return [user.fullName, user.email, user.phone, user.address, user.birthDate]
        .join(" ")
        .toLowerCase()
        .includes(normalizedKeyword);
    });

    renderDashboard(filteredUsers);
  }

  async function loadDashboard() {
    let usersLoaded = false;
    let productsLoaded = false;
    let salesLoaded = false;

    try {
      const usersResponse = await fetch("/api/users");

      if (!usersResponse.ok) {
        throw new Error("Gagal memuat data user.");
      }

      allUsers = await usersResponse.json();
      usersLoaded = true;
    } catch (error) {
      allUsers = [];
      setMessage(error.message, "error");
    }

    try {
      const productsResponse = await fetch("/api/products");

      if (!productsResponse.ok) {
        throw new Error("Gagal memuat data product.");
      }

      allProducts = await productsResponse.json();
      productsLoaded = true;
    } catch (error) {
      allProducts = [];
      setMessage(error.message, "error");
    }

    try {
      const salesResponse = await fetch("/api/sales");

      if (!salesResponse.ok) {
        throw new Error("Gagal memuat data transaksi.");
      }

      allSales = await salesResponse.json();
      salesLoaded = true;
    } catch (error) {
      allSales = [];
      setMessage(error.message, "error");
    }

    if (usersLoaded || productsLoaded || salesLoaded) {
      renderDashboard(allUsers);
      return;
    }

    try {
      setPrimaryControl("add");
      totalUsers.textContent = "0";
      totalProducts.textContent = "0";
      totalProductStock.textContent = "0";
      totalProductCategories.textContent = "0";
      totalIncome.textContent = formatCurrency(0);
      if (totalSales) {
        totalSales.textContent = "0";
      }
      latestProductTable.replaceChildren();
      latestProductTableWrapper.classList.add("hidden");
      latestProductEmptyState.classList.remove("hidden");
      latestSalesTable.replaceChildren();
      latestSalesTableWrapper.classList.add("hidden");
      latestSalesEmptyState.classList.remove("hidden");
      if (latestUser) {
        latestUser.textContent = "Belum ada data";
      }
      if (latestSavedAt) {
        latestSavedAt.textContent = "-";
      }
      tableWrapper.classList.add("hidden");
      emptyState.textContent = "Gagal memuat data dashboard.";
      emptyState.classList.remove("hidden");
      setMessage("Gagal memuat data.", "error");
    } catch (error) {
      setMessage("Gagal memuat data.", "error");
    }
  }

  function openDeleteModal(userId, userName, button) {
    pendingDelete = { userId, userName, button };
    deleteModalText.textContent = `Data "${userName}" akan dihapus permanen dari database.`;
    deleteModal.classList.remove("hidden");
    confirmDeleteButton.focus();
  }

  function closeDeleteModal() {
    pendingDelete = null;
    deleteModal.classList.add("hidden");
    confirmDeleteButton.disabled = false;
    confirmDeleteText.textContent = "Hapus Data";
  }

  async function deleteUser() {
    if (!pendingDelete) {
      return;
    }

    const { userId, button } = pendingDelete;
    confirmDeleteButton.disabled = true;
    confirmDeleteText.textContent = "Menghapus...";
    button.disabled = true;
    button.querySelector("span").textContent = "Menghapus...";

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE"
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal menghapus data.");
      }

      setMessage(result.message, "success");
      closeDeleteModal();
      await loadDashboard();
      filterUsers(userSearch.value);
    } catch (error) {
      setMessage(error.message, "error");
      button.disabled = false;
      button.querySelector("span").textContent = "Hapus";
      closeDeleteModal();
    }
  }

  userSearch.addEventListener("input", (event) => {
    filterUsers(event.target.value);
  });

  userTable.addEventListener("click", (event) => {
    const button = event.target.closest("[data-delete-user-id]");

    if (!button) {
      return;
    }

    openDeleteModal(button.dataset.deleteUserId, button.dataset.userName, button);
  });

  cancelDeleteButton.addEventListener("click", closeDeleteModal);
  confirmDeleteButton.addEventListener("click", deleteUser);

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

  loadDashboard();
}
