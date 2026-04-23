import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import fieldRoutes from "./routes/fieldRoutes.js";
import updateRoutes from "./routes/updateRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173"
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/fields", fieldRoutes);
app.use("/api/updates", updateRoutes);
app.use("/api/users", userRoutes);

app.use("/api", (req, res) => {
  return res.status(404).json({
    message: "API route not found."
  });
});

app.use(errorHandler);

export default app;
