const express = require("express");
const { isAuthenticated } = require("../middleware/authMiddleware");
const {
  getFolders,
  postFolders,
  createFolder,
  getFolderById,
  postDeleteFolder,
} = require("../controllers/folderController");

const router = express.Router();

router.get("/folders", isAuthenticated, getFolders);
router.post("/folders", isAuthenticated, createFolder);
router.get("/folders/:id", isAuthenticated, getFolderById);
router.post("/folders/:id/delete", isAuthenticated, postDeleteFolder);

module.exports = router;
