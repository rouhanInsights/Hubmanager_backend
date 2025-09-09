const multer = require("multer");
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const ok = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (ok.includes(file.mimetype)) return cb(null, true);
  cb(new Error("Only images (jpg, png, webp, gif) are allowed"));
};

module.exports = multer({
  storage,
  fileFilter,
});
