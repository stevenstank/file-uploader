const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middleware/authMiddleware");
const authController = require("../controllers/authController");

router.get("/dashboard", isAuthenticated, authController.dashboard);

module.exports = router;