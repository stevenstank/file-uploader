const express = require("express");
const { isAuthenticated } = require("../middleware/authMiddleware");
const { getFileById, downloadFileById } = require("../controllers/fileController");

const router = express.Router();

router.get("/files/:id", isAuthenticated, getFileById);
router.get("/files/:id/download", isAuthenticated, downloadFileById);

module.exports = router;
