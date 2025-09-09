// controllers/uploadController.js
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const path = require("path");
const crypto = require("crypto");
const { s3 } = require("../config/s3");

const BUCKET = process.env.AWS_BUCKET_NAME;

const sanitize = (name) => name.replace(/[^a-zA-Z0-9.\-_]/g, "_");

exports.uploadProductImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const folder = "product-image";
    const ext = (path.extname(req.file.originalname) || "").toLowerCase();
    const base = path.basename(req.file.originalname, ext);
    const key = `${folder}/${Date.now()}-${crypto.randomBytes(6).toString("hex")}-${sanitize(base)}${ext}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
        // ACL: "public-read", // only if your bucket/prefix isn't already public
      })
    );

    // public URL for virtual-hosted–style
    const secure_url = `https://${BUCKET}.s3.ap-south-1.amazonaws.com/${key}`;

    return res.json({ secure_url, key, bucket: BUCKET });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ error: err.message || "Upload failed" });
  }
};
