const express = require("express");
const { isAuthenticated } = require("../middleware/authMiddleware");
const {
	createShareLink,
	createFileShareLink,
	getSharedResource,
} = require("../controllers/shareController");

const router = express.Router();

router.post("/share-folder/:folderId", isAuthenticated, createShareLink);
router.post("/share-file/:fileId", isAuthenticated, createFileShareLink);
router.get("/share/:id", getSharedResource);

module.exports = router;
