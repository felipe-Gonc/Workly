import express from "express";
import authRoutes from "./routes/auth.route.js";
import serviceRoutes from "./routes/service.route.js";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();
app.use(cookieParser());

app.use(express.json());

const PORT = process.env.PORT;

app.use("/api/auth", authRoutes);
app.use("/api/service", serviceRoutes);

app.listen(PORT, () => {
  console.log("Server rodando na porta:", +PORT);
  connectDB();
});
