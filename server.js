const { app, PORT } = require("./src/app");

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
