function initFormPage() {
  const form = document.getElementById("userForm");
  const message = document.getElementById("message");
  const submitButton = document.getElementById("submitButton");
  const submitText = submitButton.querySelector("span");

  function setError(field, text) {
    const error = document.querySelector(`[data-error="${field}"]`);
    error.textContent = text;
    error.classList.toggle("hidden", !text);
  }

  function clearErrors() {
    ["fullName", "email", "phone", "address", "birthDate"].forEach((field) => setError(field, ""));
  }

  function setMessage(text, type) {
    message.textContent = text;
    message.className = `text-sm font-medium ${type === "success" ? "text-green-600" : "text-red-600"}`;
  }

  function setSubmitState(isSubmitting) {
    submitButton.disabled = isSubmitting;
    submitText.textContent = isSubmitting ? "Menyimpan..." : "Simpan Data";
  }

  function validateForm(data) {
    clearErrors();

    let isValid = true;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^[0-9]+$/;

    if (!data.fullName) {
      setError("fullName", "Nama lengkap wajib diisi.");
      isValid = false;
    }

    if (!data.email || !emailPattern.test(data.email)) {
      setError("email", "Email wajib diisi dengan format valid.");
      isValid = false;
    }

    if (!data.phone || !phonePattern.test(data.phone)) {
      setError("phone", "Nomor telepon wajib diisi dan hanya boleh angka.");
      isValid = false;
    }

    if (!data.address) {
      setError("address", "Alamat wajib diisi.");
      isValid = false;
    }

    if (!data.birthDate) {
      setError("birthDate", "Tanggal lahir wajib diisi.");
      isValid = false;
    }

    return isValid;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const data = {
      fullName: formData.get("fullName").trim(),
      email: formData.get("email").trim(),
      phone: formData.get("phone").trim(),
      address: formData.get("address").trim(),
      birthDate: formData.get("birthDate")
    };

    if (!validateForm(data)) {
      setMessage("Periksa kembali data yang diisi.", "error");
      return;
    }

    try {
      setSubmitState(true);
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.message, "error");
        setSubmitState(false);
        return;
      }

      sessionStorage.setItem("flashMessage", result.message);
      window.location.href = "/dashboard";
    } catch (error) {
      setMessage("Gagal menyimpan data user.", "error");
      setSubmitState(false);
    }
  });
}
