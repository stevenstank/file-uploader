const express = require("express");
const passport = require("passport");
const {
  getRegister,
  register,
  getLogin,
  getLogout,
  getDashboard,
  postUpload,
} = require("../controllers/authController");
const { isAuthenticated } = require("../middleware/authMiddleware");
const { upload, MAX_FILE_SIZE } = require("../config/multer");

const router = express.Router();

router.get("/register", getRegister);
router.post("/register", register);

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
router.post("/upload", isAuthenticated, (req, res) => {
  upload.single("file")(req, res, (error) => {
    if (error) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.redirect(`/dashboard?error=Max+file+size+is+${MAX_FILE_SIZE / (1024 * 1024)}MB`);
      }
      return res.redirect("/dashboard?error=" + encodeURIComponent(error.message));
    }

    return postUpload(req, res);
  });
});

module.exports = router;
