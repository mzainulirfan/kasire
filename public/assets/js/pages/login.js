function initLoginPage() {
  const form = document.getElementById("loginForm");
  const message = document.getElementById("loginMessage");
  const loginButton = document.getElementById("loginButton");
  const loginButtonText = loginButton.querySelector("span");

  function setError(field, text) {
    const error = document.querySelector(`[data-login-error="${field}"]`);
    error.textContent = text;
    error.classList.toggle("hidden", !text);
  }

  function clearErrors() {
    ["email", "password"].forEach((field) => setError(field, ""));
  }

  function setMessage(text) {
    if (!text) {
      message.className = "alert hidden";
      message.replaceChildren();
      return;
    }

    message.className = "alert alert-error";
    message.replaceChildren();

    const icon = document.createElement("i");
    icon.className = "bx bx-error-circle text-xl";
    icon.setAttribute("aria-hidden", "true");

    const messageText = document.createElement("span");
    messageText.textContent = text;

    message.appendChild(icon);
    message.appendChild(messageText);
  }

  function setSubmitState(isSubmitting) {
    loginButton.disabled = isSubmitting;
    loginButtonText.textContent = isSubmitting ? "Memproses..." : "Login";
  }

  function validateLogin(data) {
    clearErrors();

    let isValid = true;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!data.email || !emailPattern.test(data.email)) {
      setError("email", "Email wajib diisi dengan format valid.");
      isValid = false;
    }

    if (!data.password) {
      setError("password", "Password wajib diisi.");
      isValid = false;
    }

    return isValid;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setMessage("");

    const formData = new FormData(form);
    const data = {
      email: formData.get("email").trim(),
      password: formData.get("password").trim()
    };

    if (!validateLogin(data)) {
      setMessage("Periksa kembali email dan password.");
      return;
    }

    try {
      setSubmitState(true);
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
      const result = await response.json();

      if (!response.ok) {
        setMessage(result.message || "Login gagal.");
        setSubmitState(false);
        return;
      }

      window.location.href = "/dashboard";
    } catch (error) {
      setMessage("Gagal terhubung ke server.");
      setSubmitState(false);
    }
  });
}
