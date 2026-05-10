function initSaleDetailPage() {
  const message = document.getElementById("saleDetailMessage");
  const receipt = document.getElementById("saleReceipt");
  const saleId = window.location.pathname.split("/").filter(Boolean).at(-1);

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

  function setText(id, value) {
    document.getElementById(id).textContent = value;
  }

  function renderItems(items) {
    const wrapper = document.getElementById("receiptItems");
    wrapper.replaceChildren();

    items.forEach((item) => {
      const row = document.createElement("article");
      row.className = "flex items-start justify-between gap-4 py-3";
      row.innerHTML = `
        <div class="min-w-0">
          <p class="font-bold text-slate-900"></p>
          <p class="mt-1 text-sm text-slate-500"></p>
        </div>
        <p class="shrink-0 font-bold text-slate-900"></p>
      `;
      row.querySelectorAll("p")[0].textContent = item.productName;
      row.querySelectorAll("p")[1].textContent = `${item.quantity} x ${formatCurrency(item.price)} (${item.productSku})`;
      row.querySelectorAll("p")[2].textContent = formatCurrency(item.subtotal);
      wrapper.appendChild(row);
    });
  }

  function renderSale(sale) {
    setText("receiptInvoice", sale.invoiceNumber);
    setText("receiptDate", formatDateTime(sale.createdAt));
    setText("receiptCustomer", sale.customerName);
    setText("receiptCashier", sale.cashierName);
    setText("receiptSubtotal", formatCurrency(sale.subtotal));
    setText("receiptDiscount", formatCurrency(sale.discount));
    setText(
      "receiptDiscountMeta",
      sale.discountName
        ? `${sale.discountName} - ${sale.discountType === "percent"
          ? `${Number(sale.discountValue || 0)}%`
          : formatCurrency(sale.discountValue || 0)}`
        : sale.discountType === "percent"
          ? `${Number(sale.discountValue || 0)}% dari subtotal`
          : `${formatCurrency(sale.discountValue || 0)} nominal`
    );
    setText("receiptTax", formatCurrency(sale.tax));
    setText("receiptTotal", formatCurrency(sale.total));
    setText("receiptPaymentMethod", String(sale.paymentMethod || "").toUpperCase());
    setText("receiptPaidAmount", formatCurrency(sale.paidAmount));
    setText("receiptChangeAmount", formatCurrency(sale.changeAmount));
    renderItems(sale.items || []);
    receipt.classList.remove("hidden");
  }

  async function loadSale() {
    try {
      const response = await fetch(`/api/sales/${saleId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal memuat transaksi.");
      }

      renderSale(result);
    } catch (error) {
      receipt.classList.add("hidden");
      setMessage(error.message);
    }
  }

  document.getElementById("printReceiptButton").addEventListener("click", () => {
    window.print();
  });

  loadSale();
}
