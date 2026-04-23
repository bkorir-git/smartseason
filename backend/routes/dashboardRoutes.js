import express from "express";
import {
  getAdminDashboardData,
  getAgentDashboardData
} from "../controllers/dashboardController.js";
import authenticateToken from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/admin", authenticateToken, authorizeRoles("admin"), getAdminDashboardData);
router.get("/agent", authenticateToken, authorizeRoles("agent"), getAgentDashboardData);

export default router;
