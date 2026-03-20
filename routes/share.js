const express = require("express");
const { isAuthenticated } = require("../middleware/authMiddleware");
const {
	createShareLink,
	getSharedResource,
	downloadSharedFile,
} = require("../controllers/shareController");

const router = express.Router();

router.post("/share-folder/:folderId", isAuthenticated, createShareLink);
router.get("/share/:id", getSharedResource);
router.get("/share/file/:fileId/download", downloadSharedFile);

module.exports = router;
