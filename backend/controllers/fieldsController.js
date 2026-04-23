import pool from "../config/db.js";
import {
  addUpdate,
  createField,
  getAccessibleField,
  getFieldsForUser,
  getUpdatesForField
} from "../services/fieldService.js";
import { FIELD_STAGES } from "../utils/fieldStatus.js";

function isValidStage(stage) {
  return FIELD_STAGES.includes(stage);
}

export async function listFields(req, res, next) {
  try {
    const fields = await getFieldsForUser(req.user);
    return res.json(fields);
  } catch (error) {
    next(error);
  }
}

export async function createFieldRecord(req, res, next) {
  try {
    const { name, crop_type, planting_date, current_stage, assigned_agent_id } = req.body;

    if (!name || !crop_type || !planting_date || !current_stage || !assigned_agent_id) {
      return res.status(400).json({
        message: "Name, crop type, planting date, stage, and assigned agent are required."
      });
    }

    if (!isValidStage(current_stage)) {
      return res.status(400).json({
        message: "Invalid field stage."
      });
    }

    const [agents] = await pool.query(
      `
        SELECT id
        FROM users
        WHERE id = ? AND role = 'agent'
        LIMIT 1
      `,
      [assigned_agent_id]
    );

    if (!agents[0]) {
      return res.status(400).json({
        message: "Assigned agent is invalid."
      });
    }

    const createdField = await createField(
      {
        name: String(name).trim(),
        crop_type: String(crop_type).trim(),
        planting_date,
        current_stage,
        assigned_agent_id: Number(assigned_agent_id)
      },
      req.user.id
    );

    return res.status(201).json(createdField);
  } catch (error) {
    next(error);
  }
}

export async function listFieldUpdates(req, res, next) {
  try {
    const fieldId = Number(req.params.id);

    if (!fieldId) {
      return res.status(400).json({
        message: "Invalid field id."
      });
    }

    const field = await getAccessibleField(fieldId, req.user);

    if (!field) {
      return res.status(404).json({
        message: "Field not found."
      });
    }

    const updates = await getUpdatesForField(fieldId);
    return res.json(updates);
  } catch (error) {
    next(error);
  }
}

export async function createFieldUpdate(req, res, next) {
  try {
    const fieldId = Number(req.params.id);
    const { stage, notes } = req.body;

    if (!fieldId) {
      return res.status(400).json({
        message: "Invalid field id."
      });
    }

    if (!stage || !notes) {
      return res.status(400).json({
        message: "Stage and notes are required."
      });
    }

    if (!isValidStage(stage)) {
      return res.status(400).json({
        message: "Invalid field stage."
      });
    }

    const field = await getAccessibleField(fieldId, req.user);

    if (!field) {
      return res.status(404).json({
        message: "Field not found or not assigned to you."
      });
    }

    const insertedId = await addUpdate(fieldId, req.user.id, stage, String(notes).trim());
    const updates = await getUpdatesForField(fieldId);
    const createdUpdate = updates.find((update) => update.id === insertedId);

    return res.status(201).json(createdUpdate);
  } catch (error) {
    next(error);
  }
}
