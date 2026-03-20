const express = require("express");
const { isAuthenticated } = require("../middleware/authMiddleware");
const { downloadFileById, getFileById, deleteFileById } = require("../controllers/fileController");

const router = express.Router();

router.get("/files/download/:id", isAuthenticated, downloadFileById);
router.get("/files/:id", isAuthenticated, getFileById);
router.post("/files/:id/delete", isAuthenticated, deleteFileById);

module.exports = router;
