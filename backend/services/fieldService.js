import pool from "../config/db.js";
import { computeFieldStatus } from "../utils/fieldStatus.js";

const baseFieldQuery = `
  SELECT
    fields.id,
    fields.name,
    fields.crop_type,
    fields.planting_date,
    fields.current_stage,
    fields.assigned_agent_id,
    fields.created_by,
    fields.created_at,
    fields.updated_at,
    agent.name AS assigned_agent_name,
    creator.name AS created_by_name
  FROM fields
  LEFT JOIN users AS agent ON fields.assigned_agent_id = agent.id
  LEFT JOIN users AS creator ON fields.created_by = creator.id
`;

async function hydrateFields(fields) {
  if (!fields.length) {
    return [];
  }

  const fieldIds = fields.map((field) => field.id);
  const placeholders = fieldIds.map(() => "?").join(", ");

  const [updates] = await pool.query(
    `
      SELECT id, field_id, stage, notes, created_at
      FROM field_updates
      WHERE field_id IN (${placeholders})
      ORDER BY created_at DESC, id DESC
    `,
    fieldIds
  );

  const updatesByFieldId = updates.reduce((accumulator, update) => {
    if (!accumulator[update.field_id]) {
      accumulator[update.field_id] = [];
    }
    accumulator[update.field_id].push(update);
    return accumulator;
  }, {});

  return fields.map((field) => {
    const fieldUpdates = updatesByFieldId[field.id] || [];
    return {
      ...field,
      status: computeFieldStatus(field, fieldUpdates),
      last_update_at: fieldUpdates[0]?.created_at || null
    };
  });
}

export async function getFieldsForUser(user) {
  let query = baseFieldQuery;
  const params = [];

  if (user.role === "agent") {
    query += ` WHERE fields.assigned_agent_id = ?`;
    params.push(user.id);
  }

  query += ` ORDER BY fields.planting_date DESC, fields.id DESC`;

  const [fields] = await pool.query(query, params);
  return hydrateFields(fields);
}

export async function getFieldById(fieldId) {
  const [fields] = await pool.query(
    `${baseFieldQuery} WHERE fields.id = ? LIMIT 1`,
    [fieldId]
  );

  const hydrated = await hydrateFields(fields);
  return hydrated[0] || null;
}

export async function getAccessibleField(fieldId, user) {
  let query = `SELECT * FROM fields WHERE id = ?`;
  const params = [fieldId];

  if (user.role === "agent") {
    query += ` AND assigned_agent_id = ?`;
    params.push(user.id);
  }

  const [rows] = await pool.query(query, params);
  return rows[0] || null;
}

export async function createField(fieldData, createdBy) {
  const { name, crop_type, planting_date, current_stage, assigned_agent_id } = fieldData;

  const [result] = await pool.query(
    `
      INSERT INTO fields (
        name,
        crop_type,
        planting_date,
        current_stage,
        assigned_agent_id,
        created_by
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [name, crop_type, planting_date, current_stage, assigned_agent_id, createdBy]
  );

  return getFieldById(result.insertId);
}

export async function getUpdatesForField(fieldId) {
  const [rows] = await pool.query(
    `
      SELECT
        field_updates.id,
        field_updates.field_id,
        field_updates.agent_id,
        field_updates.stage,
        field_updates.notes,
        field_updates.created_at,
        users.name AS agent_name
      FROM field_updates
      INNER JOIN users ON field_updates.agent_id = users.id
      WHERE field_updates.field_id = ?
      ORDER BY field_updates.created_at DESC, field_updates.id DESC
    `,
    [fieldId]
  );

  return rows;
}

export async function addUpdate(fieldId, userId, stage, notes) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [insertResult] = await connection.query(
      `
        INSERT INTO field_updates (field_id, agent_id, stage, notes, created_at)
        VALUES (?, ?, ?, ?, NOW())
      `,
      [fieldId, userId, stage, notes]
    );

    await connection.query(
      `
        UPDATE fields
        SET current_stage = ?
        WHERE id = ?
      `,
      [stage, fieldId]
    );

    await connection.commit();
    return insertResult.insertId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
