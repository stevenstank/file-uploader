const express = require("express");
const { isAuthenticated } = require("../middleware/authMiddleware");
const {
	createShareLink,
	getSharedResource,
} = require("../controllers/shareController");

const router = express.Router();

router.post("/share-folder/:folderId", isAuthenticated, createShareLink);
router.get("/share/:id", getSharedResource);

module.exports = router;
