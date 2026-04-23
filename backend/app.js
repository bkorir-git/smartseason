import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import fieldRoutes from "./routes/fieldRoutes.js";
import updateRoutes from "./routes/updateRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

// CORS
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://smartseason-7wms.onrender.com"
      ];

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true
  })
);
app.use(express.json());

/**
 * ROOT ROUTE
 */
app.get("/", (req, res) => {
  res.json({
    message: "SmartSeason API is running 🚀",
    status: "OK"
  });
});

/**
 * ✅ FIXED /api ROOT HANDLER
 */
app.use("/api", (req, res, next) => {
  if (req.path === "/" || req.path === "") {
    return res.json({
      message: "SmartSeason API is running 🚀",
      status: "OK"
    });
  }
  next();
});

/**
 * API ROUTES
 */
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/fields", fieldRoutes);
app.use("/api/updates", updateRoutes);
app.use("/api/users", userRoutes);

/**
 * 404 HANDLER
 */
app.use("/api", (req, res) => {
  res.status(404).json({
    message: "API route not found."
  });
});

/**
 * ERROR HANDLER
 */
app.use(errorHandler);

export default app;