import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv"
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

const removeFile = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) {
      console.warn("⚠️ Failed to delete temp file:", filePath);
      console.warn("Reason:", err.message);
    }
  });
};

const uploadOnCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "assistant-images",
    });
    removeFile(filePath); // ✅ Safe unlink
    return result.secure_url;
  } catch (error) {
    removeFile(filePath); // Try to delete even on error
    throw new Error("Cloudinary Upload Error: " + error.message);
  }
};

export default uploadOnCloudinary;
