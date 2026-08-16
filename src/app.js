import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    Credential: true,
  })
);

app.use(express.json({ limit: "12kb" }));
app.use(express.urlencoded({ extended: true, limit: "12kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// import routes

import { userRouter } from "./routes/user.route.js";

app.use("/api/v1/users", userRouter);

export { app };
