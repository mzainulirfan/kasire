function initProfilePage() {
  const profileName = document.getElementById("profileName");
  const profileEmail = document.getElementById("profileEmail");
  const profileRole = document.getElementById("profileRole");
  const form = document.getElementById("profilePasswordForm");
  const message = document.getElementById("profileMessage");
  const saveButton = document.getElementById("saveProfileButton");
  const saveButtonText = saveButton.querySelector("span");

  function setupPasswordToggles() {
    document.querySelectorAll("[data-password-toggle]").forEach((button) => {
      button.addEventListener("click", () => {
        const input = document.getElementById(button.dataset.passwordToggle);
        const icon = button.querySelector("i");
        const shouldShow = input.type === "password";

        input.type = shouldShow ? "text" : "password";
        icon.className = `bx ${shouldShow ? "bx-hide" : "bx-show"} text-lg`;
        button.title = shouldShow ? "Sembunyikan password" : "Tampilkan password";
      });
    });
  }

  function setError(field, text) {
    const error = document.querySelector(`[data-profile-error="${field}"]`);
    error.textContent = text;
    error.classList.toggle("hidden", !text);
  }

  function clearErrors() {
    ["currentPassword", "newPassword", "confirmPassword"].forEach((field) => setError(field, ""));
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
    saveButton.disabled = isSubmitting;
    saveButtonText.textContent = isSubmitting ? "Menyimpan..." : "Simpan Password";
  }

  function validatePassword(data) {
    clearErrors();

    let isValid = true;

    if (!data.currentPassword) {
      setError("currentPassword", "Password saat ini wajib diisi.");
      isValid = false;
    }

    if (!data.newPassword || data.newPassword.length < 8) {
      setError("newPassword", "Password baru minimal 8 karakter.");
      isValid = false;
    }

    if (!data.confirmPassword || data.confirmPassword !== data.newPassword) {
      setError("confirmPassword", "Konfirmasi password tidak sama.");
      isValid = false;
    }

    return isValid;
  }

  async function loadProfile() {
    const response = await fetch("/api/auth/me");

    if (!response.ok) {
      window.location.href = "/login";
      return;
    }

    const result = await response.json();
    profileName.textContent = result.user.name;
    profileEmail.textContent = result.user.email;
    profileRole.textContent = result.user.role;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setMessage("");

    const formData = new FormData(form);
    const data = {
      currentPassword: formData.get("currentPassword").trim(),
      newPassword: formData.get("newPassword").trim(),
      confirmPassword: formData.get("confirmPassword").trim()
    };

    if (!validatePassword(data)) {
      setMessage("Periksa kembali password yang diisi.");
      return;
    }

    try {
      setSubmitState(true);
      const response = await fetch("/api/auth/profile/password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal mengganti password.");
      }

      form.reset();
      clearErrors();
      setMessage(result.message, "success");
    } catch (error) {
      setMessage(error.message, "error");
    } finally {
      setSubmitState(false);
    }
  });

  loadProfile();
  setupPasswordToggles();
}
