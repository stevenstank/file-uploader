const express = require("express");
const { isAuthenticated } = require("../middleware/authMiddleware");
const { getFileById, downloadFileById, deleteFileById } = require("../controllers/fileController");

const router = express.Router();

router.get("/files/:id", isAuthenticated, getFileById);
router.get("/files/:id/download", isAuthenticated, downloadFileById);
router.post("/files/:id/delete", isAuthenticated, deleteFileById);

module.exports = router;
