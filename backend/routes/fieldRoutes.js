import express from "express";
import {
  createFieldRecord,
  createFieldUpdate,
  listFields,
  listFieldUpdates
} from "../controllers/fieldsController.js";
import authenticateToken from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", authenticateToken, listFields);
router.post("/", authenticateToken, authorizeRoles("admin"), createFieldRecord);

router.get("/:id/updates", authenticateToken, listFieldUpdates);
router.post("/:id/updates", authenticateToken, authorizeRoles("agent"), createFieldUpdate);

export default router;
