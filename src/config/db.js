import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import "dotenv/config";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_URI}/${DB_NAME}`
    );
    console.log(
      `DB Connected successfully at : ${connectionInstance.connection.host}`
    );
  } catch (err) {
    console.error("Connection Failed due to Error " + err.message);
    process.exit(1);
  }
};
export { connectDB };
