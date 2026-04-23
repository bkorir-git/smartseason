import fs from "fs";
import bcrypt from "bcryptjs";
import pool from "../config/db.js";

console.log("🔥 SEED FILE STARTED");

function addDays(baseDate, days) {
  const copy = new Date(baseDate);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function formatDateTime(date) {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

async function seed() {
  const now = new Date();

  try {
    // ✅ LOAD SCHEMA (NO USE DATABASE INSIDE SQL FILE)
    const schema = fs.readFileSync("database/schema.sql", "utf8");
    await pool.query(schema);

    // ✅ RESET TABLES
    await pool.query("SET FOREIGN_KEY_CHECKS = 0");
    await pool.query("TRUNCATE TABLE field_updates");
    await pool.query("TRUNCATE TABLE fields");
    await pool.query("TRUNCATE TABLE users");
    await pool.query("SET FOREIGN_KEY_CHECKS = 1");

    // ✅ USERS
    const adminPassword = await bcrypt.hash("admin123", 10);
    const agent1Password = await bcrypt.hash("agent123", 10);
    const agent2Password = await bcrypt.hash("agent123", 10);

    const [admin] = await pool.query(
      `INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
      ["Admin", "admin@smartseason.com", adminPassword, "admin"]
    );

    const [agent1] = await pool.query(
      `INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
      ["Alice", "alice@smartseason.com", agent1Password, "agent"]
    );

    const [agent2] = await pool.query(
      `INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
      ["Bob", "bob@smartseason.com", agent2Password, "agent"]
    );

    console.log("Seed completed successfully");

  } catch (err) {
    console.error("Seed failed:", err);
  } finally {
    await pool.end();
  }
}

seed();