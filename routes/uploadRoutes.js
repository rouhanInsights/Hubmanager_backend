const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { uploadProductImage } = require("../controllers/uploadController");

// POST /api/upload   (form-data; field name: "file")
router.post("/", upload.single("file"), uploadProductImage);

module.exports = router;
