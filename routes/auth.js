const express = require("express");
const passport = require("passport");
const {
  getRegister,
  register,
  getLogin,
  getLogout,
} = require("../controllers/authController");
const fileController = require("../controllers/fileController");
const { isAuthenticated } = require("../middleware/authMiddleware");
const { upload } = require("../config/multer");

const router = express.Router();

router.get("/register", getRegister);
router.post("/register", register);

router.get("/login", getLogin);
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
  })
);

router.get("/logout", getLogout);
router.post("/upload", isAuthenticated, upload.single("file"), fileController.uploadFile);

module.exports = router;
