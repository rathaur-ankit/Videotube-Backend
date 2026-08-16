import { connectDB } from "./config/db.js";
import "dotenv/config";
import { app } from "./app.js";

connectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log("server is running");
    });
  })
  .catch((err) => {
    console.error(`error occurred : ${error}`);
  });
