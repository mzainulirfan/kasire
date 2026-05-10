function initSettingsPage() {
  const adminTable = document.getElementById("adminTable");
  const tableWrapper = document.getElementById("adminTableWrapper");
  const emptyState = document.getElementById("adminEmptyState");
  const message = document.getElementById("settingsMessage");
  const openPromoteUserModalButton = document.getElementById("openPromoteUserModalButton");
  const promoteUserModal = document.getElementById("promoteUserModal");
  const closePromoteUserModalButton = document.getElementById("closePromoteUserModalButton");
  const promoteUserList = document.getElementById("promoteUserList");
  const promoteUserEmptyState = document.getElementById("promoteUserEmptyState");

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

  function createCell(text) {
    const cell = document.createElement("td");
    cell.className = "table-cell";
    cell.textContent = text;
    return cell;
  }

  function createAdminCell(admin) {
    const cell = document.createElement("td");
    cell.className = "table-cell";

    const wrapper = document.createElement("div");
    wrapper.className = "flex items-center gap-3";

    const avatar = document.createElement("span");
    avatar.className = "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700";
    avatar.textContent = admin.name.charAt(0).toUpperCase();

    const textWrapper = document.createElement("div");
    const name = document.createElement("p");
    name.className = "font-semibold text-slate-900";
    name.textContent = admin.name;
    const id = document.createElement("p");
    id.className = "text-xs text-slate-500";
    id.textContent = admin.isCurrent ? `ID ${admin.id} - Sedang login` : `ID ${admin.id}`;

    textWrapper.appendChild(name);
    textWrapper.appendChild(id);
    wrapper.appendChild(avatar);
    wrapper.appendChild(textWrapper);
    cell.appendChild(wrapper);

    return cell;
  }

  function createActionCell(admin) {
    const cell = document.createElement("td");
    cell.className = "table-cell text-right";

    if (admin.isCurrent) {
      const badge = document.createElement("span");
      badge.className = "admin-badge";
      badge.innerHTML = '<i class="bx bx-user-check text-base" aria-hidden="true"></i><span>Aktif</span>';
      cell.appendChild(badge);
      return cell;
    }

    const button = document.createElement("button");
    button.type = "button";
    button.className = "delete-button";
    button.dataset.adminId = admin.id;
    button.innerHTML = '<i class="bx bx-user-x text-base" aria-hidden="true"></i><span>Cabut Admin</span>';
    cell.appendChild(button);

    return cell;
  }

  function renderAdmins(admins) {
    adminTable.replaceChildren();

    if (!admins.length) {
      tableWrapper.classList.add("hidden");
      emptyState.classList.remove("hidden");
      return;
    }

    tableWrapper.classList.remove("hidden");
    emptyState.classList.add("hidden");

    admins.forEach((admin) => {
      const row = document.createElement("tr");
      row.className = "transition hover:bg-slate-50";
      row.appendChild(createAdminCell(admin));
      row.appendChild(createCell(admin.email));
      row.appendChild(createCell(admin.role));
      row.appendChild(createCell(formatDateTime(admin.createdAt)));
      row.appendChild(createActionCell(admin));
      adminTable.appendChild(row);
    });
  }

  function createPromoteUserItem(user) {
    const item = document.createElement("article");
    item.className = "flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between";

    const profile = document.createElement("div");
    profile.className = "flex min-w-0 items-center gap-3";

    const avatar = document.createElement("span");
    avatar.className = "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700";
    avatar.textContent = user.fullName.charAt(0).toUpperCase();

    const textWrapper = document.createElement("div");
    textWrapper.className = "min-w-0";

    const name = document.createElement("p");
    name.className = "truncate font-semibold text-slate-900";
    name.textContent = user.fullName;

    const meta = document.createElement("p");
    meta.className = "truncate text-sm text-slate-500";
    meta.textContent = user.email;

    textWrapper.appendChild(name);
    textWrapper.appendChild(meta);
    profile.appendChild(avatar);
    profile.appendChild(textWrapper);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "admin-button";
    button.dataset.promoteUserId = user.id;
    button.innerHTML = '<i class="bx bx-user-plus text-base" aria-hidden="true"></i><span>Jadikan Admin</span>';

    item.appendChild(profile);
    item.appendChild(button);

    return item;
  }

  function renderPromoteUsers(users) {
    promoteUserList.replaceChildren();

    if (!users.length) {
      promoteUserList.classList.add("hidden");
      promoteUserEmptyState.classList.remove("hidden");
      promoteUserEmptyState.querySelector("p").textContent = "Semua user sudah menjadi admin.";
      return;
    }

    promoteUserList.classList.remove("hidden");
    promoteUserEmptyState.classList.add("hidden");

    users.forEach((user) => {
      promoteUserList.appendChild(createPromoteUserItem(user));
    });
  }

  async function loadPromoteUsers() {
    promoteUserList.classList.remove("hidden");
    promoteUserEmptyState.classList.add("hidden");
    promoteUserList.innerHTML = '<p class="text-sm text-slate-600">Memuat user...</p>';

    try {
      const response = await fetch("/api/users");

      if (!response.ok) {
        throw new Error("Gagal memuat data user.");
      }

      const users = await response.json();
      renderPromoteUsers(users.filter((user) => !user.isAdmin));
    } catch (error) {
      promoteUserList.innerHTML = "";
      promoteUserEmptyState.classList.remove("hidden");
      promoteUserEmptyState.querySelector("p").textContent = error.message;
    }
  }

  async function promoteUser(button) {
    const buttonText = button.querySelector("span");
    button.disabled = true;
    buttonText.textContent = "Memproses...";

    try {
      const response = await fetch(`/api/users/${button.dataset.promoteUserId}/promote-admin`, {
        method: "POST"
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal menjadikan user sebagai admin.");
      }

      setMessage(result.message, "success");
      await loadAdmins();
      await loadPromoteUsers();
    } catch (error) {
      setMessage(error.message, "error");
      button.disabled = false;
      buttonText.textContent = "Jadikan Admin";
    }
  }

  function openPromoteUserModal() {
    promoteUserModal.classList.remove("hidden");
    loadPromoteUsers();
  }

  function closePromoteUserModal() {
    promoteUserModal.classList.add("hidden");
  }

  async function loadAdmins() {
    try {
      const response = await fetch("/api/admins");

      if (!response.ok) {
        throw new Error("Gagal memuat data admin.");
      }

      const admins = await response.json();
      renderAdmins(admins);
    } catch (error) {
      tableWrapper.classList.add("hidden");
      emptyState.classList.remove("hidden");
      setMessage(error.message, "error");
    }
  }

  async function revokeAdmin(button) {
    const buttonText = button.querySelector("span");
    button.disabled = true;
    buttonText.textContent = "Mencabut...";

    try {
      const response = await fetch(`/api/admins/${button.dataset.adminId}`, {
        method: "DELETE"
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal mencabut admin.");
      }

      setMessage(result.message, "success");
      await loadAdmins();
    } catch (error) {
      setMessage(error.message, "error");
      button.disabled = false;
      buttonText.textContent = "Cabut Admin";
    }
  }

  adminTable.addEventListener("click", (event) => {
    const button = event.target.closest("[data-admin-id]");

    if (!button) {
      return;
    }

    revokeAdmin(button);
  });

  openPromoteUserModalButton.addEventListener("click", openPromoteUserModal);
  closePromoteUserModalButton.addEventListener("click", closePromoteUserModal);

  promoteUserModal.addEventListener("click", (event) => {
    if (event.target === promoteUserModal) {
      closePromoteUserModal();
    }
  });

  promoteUserList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-promote-user-id]");

    if (!button) {
      return;
    }

    promoteUser(button);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !promoteUserModal.classList.contains("hidden")) {
      closePromoteUserModal();
    }
  });

  loadAdmins();
}
