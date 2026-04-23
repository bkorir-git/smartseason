import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET || "smartseason_super_secret_key_change_me",
    {
      expiresIn: "12h"
    }
  );
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required."
      });
    }

    const [rows] = await pool.query(
      `
        SELECT id, name, email, role, password_hash
        FROM users
        WHERE email = ?
        LIMIT 1
      `,
      [email]
    );

    const user = rows[0];

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials."
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid credentials."
      });
    }

    const token = signToken(user);

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function me(req, res, next) {
  try {
    const [rows] = await pool.query(
      `
        SELECT id, name, email, role
        FROM users
        WHERE id = ?
        LIMIT 1
      `,
      [req.user.id]
    );

    const user = rows[0];

    if (!user) {
      return res.status(404).json({
        message: "User not found."
      });
    }

    return res.json(user);
  } catch (error) {
    next(error);
  }
}
