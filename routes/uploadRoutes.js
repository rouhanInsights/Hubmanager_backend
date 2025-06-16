// routes/uploadRoutes.js
const express = require("express");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const upload = require("../middleware/upload"); // ✅ Use your multer config

const router = express.Router();

// 🔐 Cloudinary config from .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 📤 POST /api/upload - Upload to Cloudinary
router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const uploadStream = cloudinary.uploader.upload_stream(
    { folder: "products" }, // Optional folder
    (error, result) => {
      if (error) {
        console.error("Cloudinary error:", error);
        return res.status(500).json({ error: "Upload failed" });
      }
      return res.status(200).json(result);
    }
  );

  streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
});

module.exports = router;
