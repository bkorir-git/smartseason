import pool from "../config/db.js";

export async function listAgents(req, res, next) {
  try {
    const [rows] = await pool.query(
      `
        SELECT id, name, email, role
        FROM users
        WHERE role = 'agent'
        ORDER BY name ASC
      `
    );

    return res.json(rows);
  } catch (error) {
    next(error);
  }
}
