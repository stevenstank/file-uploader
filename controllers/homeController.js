exports.renderHome = (req, res) => {
  res.render("index", { message: "App is running" });
};
