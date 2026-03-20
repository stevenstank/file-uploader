const express = require("express");
const { isAuthenticated } = require("../middleware/authMiddleware");
const {
  getFolders,
  postFolders,
  getFolderById,
  postDeleteFolder,
} = require("../controllers/folderController");

const router = express.Router();

router.get("/folders", isAuthenticated, getFolders);
router.post("/folders", isAuthenticated, postFolders);
router.get("/folders/:id", isAuthenticated, getFolderById);
router.post("/folders/:id/delete", isAuthenticated, postDeleteFolder);

module.exports = router;
