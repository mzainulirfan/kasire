function isAuthenticated(req) {
  return Boolean(req.session && req.session.user);
}

function requireAuthApi(req, res, next) {
  if (!isAuthenticated(req)) {
    return res.status(401).json({ message: "Unauthorized." });
  }

  return next();
}

function requireAuthPage(req, res, next) {
  if (!isAuthenticated(req)) {
    return res.redirect("/login");
  }

  return next();
}

function redirectIfAuthenticated(req, res, next) {
  if (isAuthenticated(req)) {
    return res.redirect("/dashboard");
  }

  return next();
}

module.exports = {
  requireAuthApi,
  requireAuthPage,
  redirectIfAuthenticated
};
