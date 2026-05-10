function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateLoginInput(input = {}) {
  const credentials = {
    email: normalizeText(input.email).toLowerCase(),
    password: normalizeText(input.password)
  };

  if (!credentials.email || !credentials.password || !isValidEmail(credentials.email)) {
    return {
      credentials,
      error: "Email dan password wajib diisi dengan benar."
    };
  }

  return {
    credentials,
    error: null
  };
}

module.exports = {
  validateLoginInput
};
