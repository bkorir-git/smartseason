import pool from "../config/db.js";
import { getFieldsForUser } from "./fieldService.js";

function calculateCounts(fields) {
  return fields.reduce(
    (summary, field) => {
      summary.total_fields += 1;

      if (field.status === "Active") {
        summary.active += 1;
      }

      if (field.status === "At Risk") {
        summary.at_risk += 1;
      }

      if (field.status === "Completed") {
        summary.completed += 1;
      }

      return summary;
    },
    {
      total_fields: 0,
      active: 0,
      at_risk: 0,
      completed: 0
    }
  );
}

export async function getRecentUpdatesForAdmin(limit = 10) {
  const safeLimit = Number(limit) > 0 ? Number(limit) : 10;

  const [rows] = await pool.query(
    `
      SELECT
        field_updates.id,
        field_updates.field_id,
        fields.name AS field_name,
        field_updates.stage,
        field_updates.notes,
        field_updates.created_at,
        users.name AS agent_name
      FROM field_updates
      INNER JOIN fields ON field_updates.field_id = fields.id
      INNER JOIN users ON field_updates.agent_id = users.id
      ORDER BY field_updates.created_at DESC, field_updates.id DESC
      LIMIT ?
    `,
    [safeLimit]
  );

  return rows;
}

export async function getRecentUpdatesForAgent(agentId, limit = 10) {
  const safeLimit = Number(limit) > 0 ? Number(limit) : 10;

  const [rows] = await pool.query(
    `
      SELECT
        field_updates.id,
        field_updates.field_id,
        fields.name AS field_name,
        field_updates.stage,
        field_updates.notes,
        field_updates.created_at,
        users.name AS agent_name
      FROM field_updates
      INNER JOIN fields ON field_updates.field_id = fields.id
      INNER JOIN users ON field_updates.agent_id = users.id
      WHERE fields.assigned_agent_id = ?
      ORDER BY field_updates.created_at DESC, field_updates.id DESC
      LIMIT ?
    `,
    [agentId, safeLimit]
  );

  return rows;
}

export async function getAdminDashboard(user) {
  const fields = await getFieldsForUser(user);
  const recent_updates = await getRecentUpdatesForAdmin(8);
  const counts = calculateCounts(fields);

  return {
    counts,
    recent_updates,
    fields
  };
}

export async function getAgentDashboard(user) {
  const fields = await getFieldsForUser(user);
  const recent_updates = await getRecentUpdatesForAgent(user.id, 8);
  const counts = calculateCounts(fields);

  return {
    summary: {
      assigned_fields: fields.length,
      active: counts.active,
      at_risk: counts.at_risk,
      completed: counts.completed
    },
    recent_updates,
    fields
  };
}
