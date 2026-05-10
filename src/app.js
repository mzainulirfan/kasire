const express = require("express");
const session = require("express-session");
const path = require("path");
const { ensureAdminsFile } = require("./lib/adminsStore");
const { ensureDataFile } = require("./lib/usersStore");
const registerRoutes = require("./routes");

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "..", "public");
const SESSION_COOKIE_NAME = "fullname.sid";

app.use(express.json({ limit: "50mb" }));
app.use(
  session({
    name: SESSION_COOKIE_NAME,
    secret: process.env.SESSION_SECRET || "change-this-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 1000 * 60 * 60 * 2
    }
  })
);

registerRoutes(app, {
  publicDir: PUBLIC_DIR,
  sessionCookieName: SESSION_COOKIE_NAME
});

app.use(express.static(PUBLIC_DIR));

app.use((error, req, res, next) => {
  if (error && error.type === "entity.too.large") {
    return res.status(413).json({ message: "Ukuran foto terlalu besar. Kurangi jumlah atau ukuran foto product." });
  }

  return next(error);
});

ensureAdminsFile();
ensureDataFile();

module.exports = {
  app,
  PORT
};
