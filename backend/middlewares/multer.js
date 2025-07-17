import multer from "multer";
import path from "path";

// Storage config (optional - temp folder)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/"); // or 'tmp/' or any folder
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

export default upload;
