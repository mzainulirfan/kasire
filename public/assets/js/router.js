const routes = {
  login: {
    title: "Login",
    description: "Masuk untuk mengelola data user.",
    content: "/pages/auth/login.html",
    init: initLoginPage,
    public: true
  },
  form: {
    title: "Form Input Data User",
    description: "Lengkapi data user baru melalui form berikut.",
    content: "/pages/user/form.html",
    init: initFormPage
  },
  dashboard: {
    title: "Dashboard User",
    description: "Ringkasan data user yang tersimpan.",
    content: "/pages/dashboard/index.html",
    init: initDashboardPage
  },
  pos: {
    title: "POS",
    description: "Buat transaksi penjualan product.",
    content: "/pages/pos/index.html",
    init: initPosPage
  },
  sales: {
    title: "Transactions",
    description: "Riwayat transaksi penjualan.",
    content: "/pages/sales/index.html",
    init: initSalesPage
  },
  "sales/view": {
    title: "Receipt",
    description: "Detail struk transaksi.",
    content: "/pages/sales/detail.html",
    init: initSaleDetailPage
  },
  products: {
    title: "Products",
    description: "Daftar produk yang tersimpan di database.",
    content: "/pages/product/index.html",
    init: initProductPage
  },
  categories: {
    title: "Category",
    description: "Kelola kategori product yang tersedia.",
    content: "/pages/category/index.html",
    init: initCategoryPage
  },
  discounts: {
    title: "Discount",
    description: "Kelola diskon yang dipakai di POS.",
    content: "/pages/discount/index.html",
    init: initDiscountPage
  },
  "products/new": {
    title: "Tambah Product",
    description: "Tambahkan data product baru ke database.",
    content: "/pages/product/form.html",
    init: initProductCreatePage
  },
  "products/view": {
    title: "Detail Product",
    description: "Informasi detail product yang tersimpan.",
    content: "/pages/product/detail.html",
    init: initProductDetailPage
  },
  settings: {
    title: "Setting Aplikasi",
    description: "Kelola preferensi dasar aplikasi data user.",
    content: "/pages/settings/index.html",
    init: initSettingsPage
  },
  profile: {
    title: "Edit Profile",
    description: "Kelola informasi akun admin yang sedang login.",
    content: "/pages/profile/index.html",
    init: initProfilePage
  }
};

function getCurrentPage() {
  const pageFromPath = window.location.pathname.replace(/^\/+|\/+$/g, "") || "form";
  const page = pageFromPath === "index.html" ? "form" : pageFromPath;

  if (/^products\/[^/]+$/.test(page) && page !== "products/new") {
    return "products/view";
  }

  if (/^sales\/[^/]+$/.test(page)) {
    return "sales/view";
  }

  return routes[page] ? page : "form";
}

async function fetchHtml(path) {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`${path} tidak ditemukan.`);
  }

  return response.text();
}

function updateHeader(route) {
  const pageTitle = document.getElementById("pageTitle");
  const pageDescription = document.getElementById("pageDescription");

  if (pageTitle) {
    pageTitle.textContent = route.title;
  }

  if (pageDescription) {
    pageDescription.textContent = route.description;
  }
}

function updateActiveMenu(page) {
  const activeMenu = page === "profile" ? "settings" : page.split("/")[0];

  document.querySelectorAll("[data-menu]").forEach((item) => {
    const isActive = item.dataset.menu === activeMenu;
    item.className = isActive ? "sidebar-link-active" : "sidebar-link";
  });
}

function updateLayoutMode(page) {
  const appShell = document.getElementById("appShell");
  const appLayout = document.getElementById("appLayout");
  const isLoginPage = page === "login";
  const isPosPage = page === "pos";
  const isWidePage = page === "dashboard" || page === "products" || page === "categories" || page === "sales" || page === "discounts";

  appShell.className = isLoginPage || isPosPage ? "min-h-screen" : "min-h-screen lg:flex";
  if (isPosPage) {
    appLayout.className = "h-screen w-full max-w-none p-0";
    return;
  }

  if (page === "dashboard") {
    appLayout.className = "w-full px-4 py-6 lg:px-6";
    return;
  }

  appLayout.className = isLoginPage
    ? "mx-auto max-w-md px-4 py-6"
    : `mx-auto ${isWidePage ? "max-w-7xl" : "max-w-6xl"} px-4 py-6`;
}

async function fetchCurrentUser() {
  const response = await fetch("/api/auth/me");

  if (!response.ok) {
    return null;
  }

  const result = await response.json();
  return result.user;
}

function updateHeaderUser(user) {
  const userName = document.getElementById("headerUserName");
  const userEmail = document.getElementById("headerUserEmail");

  if (userName) {
    userName.textContent = user.name;
  }

  if (userEmail) {
    userEmail.textContent = user.email;
  }
}

function setupLogout() {
  const logoutButton = document.getElementById("logoutButton");

  if (!logoutButton) {
    return;
  }

  logoutButton.addEventListener("click", async () => {
    logoutButton.disabled = true;

    try {
      await fetch("/api/auth/logout", {
        method: "POST"
      });
    } finally {
      window.location.href = "/login";
    }
  });
}

function setupProfileMenu() {
  const profileMenuButton = document.getElementById("profileMenuButton");
  const profileMenuPopup = document.getElementById("profileMenuPopup");

  if (!profileMenuButton || !profileMenuPopup) {
    return;
  }

  function closeMenu() {
    profileMenuPopup.classList.add("hidden");
    profileMenuButton.setAttribute("aria-expanded", "false");
  }

  function toggleMenu() {
    const isOpen = !profileMenuPopup.classList.contains("hidden");
    profileMenuPopup.classList.toggle("hidden", isOpen);
    profileMenuButton.setAttribute("aria-expanded", String(!isOpen));
  }

  profileMenuButton.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleMenu();
  });

  document.addEventListener("click", (event) => {
    if (!profileMenuPopup.contains(event.target) && event.target !== profileMenuButton) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });
}

async function loadLayoutPartials() {
  const sidebar = document.getElementById("appSidebar");
  const header = document.getElementById("appHeader");
  const [sidebarHtml, headerHtml] = await Promise.all([
    fetchHtml("/partials/sidebar.html"),
    fetchHtml("/partials/header.html")
  ]);

  sidebar.innerHTML = sidebarHtml;
  header.innerHTML = headerHtml;
}

async function loadPage() {
  const page = getCurrentPage();
  const route = routes[page];
  const pageContent = document.getElementById("pageContent");
  const sidebar = document.getElementById("appSidebar");
  const header = document.getElementById("appHeader");

  document.title = route.title;
  updateLayoutMode(page);
  pageContent.innerHTML = '<p class="text-sm text-slate-600">Memuat halaman...</p>';

  try {
    if (route.public) {
      sidebar.innerHTML = "";
      header.innerHTML = "";
    } else {
      const user = await fetchCurrentUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      if (page === "pos") {
        sidebar.innerHTML = "";
        header.innerHTML = "";
      } else {
        await loadLayoutPartials();
        updateHeader(route);
        updateHeaderUser(user);
        updateActiveMenu(page);
        setupLogout();
        setupProfileMenu();
      }
    }

    pageContent.innerHTML = await fetchHtml(route.content);
    route.init();
  } catch (error) {
    pageContent.innerHTML = '<section class="rounded-lg bg-white p-6 text-sm text-red-600 shadow">Gagal memuat konten halaman.</section>';
  }
}

loadPage();
