const express = require("express");
const passport = require("passport");
const {
  getRegister,
  postRegister,
  getLogin,
  getLogout,
  getDashboard,
} = require("../controllers/authController");
const { isAuthenticated } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/register", getRegister);
router.post("/register", postRegister);

router.get("/login", getLogin);
router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login?error=1",
  }),
  (req, res) => {
    res.redirect("/dashboard");
  }
);

router.get("/logout", getLogout);
router.get("/dashboard", isAuthenticated, getDashboard);

module.exports = router;
