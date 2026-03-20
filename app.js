require("dotenv").config();

const express = require("express");
const path = require("path");
const indexRoutes = require("./routes/index");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
