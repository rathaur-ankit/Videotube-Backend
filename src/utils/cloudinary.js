import { v2 as cloudinary } from "cloudinary";
import "dotenv/config";
import fs from "fs";

//configuration

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//upload image

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    //upload file on cloudinary
    console.log(`path received by cloudinary : ${localFilePath}`);
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      timeout: 120000,
    });
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    console.error("Cloudinary upload failed error :", error);
    //remove the locally saved temp file as operation got failed
    fs.unlinkSync(localFilePath);
    return null;
  }
};

export { uploadOnCloudinary };
