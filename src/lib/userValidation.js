function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  return /^[0-9]+$/.test(phone);
}

function validateUserInput(input) {
  const user = {
    fullName: normalizeText(input.fullName),
    email: normalizeText(input.email),
    phone: normalizeText(input.phone),
    address: normalizeText(input.address),
    birthDate: normalizeText(input.birthDate)
  };

  if (!user.fullName || !user.email || !user.phone || !user.address || !user.birthDate) {
    return { user, error: "Semua field wajib diisi." };
  }

  if (!isValidEmail(user.email)) {
    return { user, error: "Format email tidak valid." };
  }

  if (!isValidPhone(user.phone)) {
    return { user, error: "Nomor telepon hanya boleh berisi angka." };
  }

  return { user, error: null };
}

module.exports = {
  validateUserInput
};
