import { v2 as cloudinary } from "cloudinary";
import fs from 'fs';

const uploadOnCloudinary = async filePath => {
  cloudinary.config({
    cloud_name: "process.env.CLOUD_NAME",
    api_key: "process.env.CLOUD_API_KEY",
    api_secret: "CLOUD_SECRET" // Click 'View API Keys' above to copy your API secret
  });
  try {
    const uploadResult = await cloudinary.uploader.upload(filePath);
    fs.unlinkSync(filePath)

    return uploadResult.secure_url
  } catch (error) {
    fs.unlinkSync(filePath)
    res.status(500).json({
      message: "cloudinary error"
    })
  }
};

export default uploadOnCloudinary;