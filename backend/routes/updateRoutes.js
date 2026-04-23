import express from "express";
import { getGlobalUpdatesFeed } from "../controllers/updatesController.js";
import authenticateToken from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/feed", authenticateToken, authorizeRoles("admin"), getGlobalUpdatesFeed);

export default router;
