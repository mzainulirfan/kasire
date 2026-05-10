function initSalesPage() {
  const message = document.getElementById("salesMessage");
  const searchInput = document.getElementById("salesSearch");
  const table = document.getElementById("salesTable");
  const tableWrapper = document.getElementById("salesTableWrapper");
  const emptyState = document.getElementById("salesEmptyState");
  const totalCountText = document.getElementById("salesTotalCount");
  const totalAmountText = document.getElementById("salesTotalAmount");
  const latestDateText = document.getElementById("salesLatestDate");
  const paymentSummaryText = document.getElementById("salesPaymentSummary");
  const resultCountText = document.getElementById("salesResultCount");
  let sales = [];

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

  function setMessage(text) {
    if (!text) {
      message.className = "alert hidden";
      message.replaceChildren();
      return;
    }

    message.className = "alert alert-error";
    message.innerHTML = '<i class="bx bx-error-circle text-xl" aria-hidden="true"></i><span></span>';
    message.querySelector("span").textContent = text;
  }

  function createCell(text, className = "") {
    const cell = document.createElement("td");
    cell.className = `table-cell ${className}`.trim();
    cell.textContent = text;
    return cell;
  }

  function formatPaymentMethod(method) {
    return String(method || "-").toUpperCase();
  }

  function updateSummary(items) {
    const totalAmount = items.reduce((total, sale) => total + Number(sale.total || 0), 0);
    const latestSale = items
      .slice()
      .sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt))[0];
    const cashCount = items.filter((sale) => sale.paymentMethod === "cash").length;
    const nonCashCount = items.length - cashCount;

    if (totalCountText) {
      totalCountText.textContent = String(items.length);
    }

    if (totalAmountText) {
      totalAmountText.textContent = formatCurrency(totalAmount);
    }

    if (latestDateText) {
      latestDateText.textContent = latestSale ? formatDateTime(latestSale.createdAt) : "-";
    }

    if (paymentSummaryText) {
      paymentSummaryText.textContent = items.length ? `Cash ${cashCount} | Non-cash ${nonCashCount}` : "-";
    }

    if (resultCountText) {
      const keyword = searchInput.value.trim();
      resultCountText.textContent = keyword ? `${items.length} hasil ditemukan` : `${items.length} transaksi`;
    }
  }

  function createPaymentBadge(method) {
    const badge = document.createElement("span");
    const normalizedMethod = String(method || "").toLowerCase();
    badge.className = normalizedMethod === "cash"
      ? "inline-flex rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700"
      : "inline-flex rounded-full bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700";
    badge.textContent = formatPaymentMethod(method);
    return badge;
  }

  function renderSales(items) {
    table.replaceChildren();
    updateSummary(items);

    if (!items.length) {
      tableWrapper.classList.add("hidden");
      emptyState.classList.remove("hidden");
      emptyState.querySelector("p").textContent = sales.length ? "Transaksi tidak ditemukan." : "Belum ada transaksi.";
      return;
    }

    tableWrapper.classList.remove("hidden");
    emptyState.classList.add("hidden");

    items.forEach((sale) => {
      const row = document.createElement("tr");
      row.className = "transition hover:bg-slate-50";

      const invoiceCell = createCell("");
      invoiceCell.innerHTML = '<span class="font-bold text-slate-900"></span>';
      invoiceCell.querySelector("span").textContent = sale.invoiceNumber;

      const paymentCell = document.createElement("td");
      paymentCell.className = "table-cell";
      paymentCell.appendChild(createPaymentBadge(sale.paymentMethod));

      const actionCell = document.createElement("td");
      actionCell.className = "table-cell text-right";
      const link = document.createElement("a");
      link.className = "admin-button";
      link.href = `/sales/${sale.id}`;
      link.innerHTML = '<i class="bx bx-show text-base" aria-hidden="true"></i><span>View</span>';
      actionCell.appendChild(link);

      row.appendChild(invoiceCell);
      row.appendChild(createCell(sale.customerName));
      row.appendChild(createCell(sale.cashierName));
      row.appendChild(paymentCell);
      row.appendChild(createCell(formatCurrency(sale.total), "text-right font-bold text-slate-900"));
      row.appendChild(createCell(formatDateTime(sale.createdAt)));
      row.appendChild(actionCell);
      table.appendChild(row);
    });
  }

  function filterSales() {
    const keyword = searchInput.value.trim().toLowerCase();

    if (!keyword) {
      renderSales(sales);
      return;
    }

    renderSales(sales.filter((sale) => {
      return [sale.invoiceNumber, sale.customerName, sale.cashierName, sale.paymentMethod]
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    }));
  }

  async function loadSales() {
    try {
      const response = await fetch("/api/sales");

      if (!response.ok) {
        throw new Error("Gagal memuat transaksi.");
      }

      sales = await response.json();
      filterSales();
    } catch (error) {
      tableWrapper.classList.add("hidden");
      emptyState.classList.remove("hidden");
      emptyState.querySelector("p").textContent = "Gagal memuat transaksi.";
      updateSummary([]);
      setMessage(error.message);
    }
  }

  searchInput.addEventListener("input", filterSales);
  loadSales();
}
