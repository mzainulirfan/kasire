function initSalesPage() {
  const message = document.getElementById("salesMessage");
  const searchInput = document.getElementById("salesSearch");
  const table = document.getElementById("salesTable");
  const tableWrapper = document.getElementById("salesTableWrapper");
  const emptyState = document.getElementById("salesEmptyState");
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

  function renderSales(items) {
    table.replaceChildren();

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
      row.appendChild(createCell(sale.paymentMethod.toUpperCase()));
      row.appendChild(createCell(formatCurrency(sale.total)));
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
      setMessage(error.message);
    }
  }

  searchInput.addEventListener("input", filterSales);
  loadSales();
}
