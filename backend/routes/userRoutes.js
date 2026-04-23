import express from "express";
import { listAgents } from "../controllers/usersController.js";
import authenticateToken from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/agents", authenticateToken, authorizeRoles("admin"), listAgents);

export default router;
