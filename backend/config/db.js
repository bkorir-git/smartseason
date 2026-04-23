import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.MYSQLHOST || !process.env.MYSQLUSER || !process.env.MYSQLDATABASE) {
  throw new Error("Missing MYSQL env variables in Railway");
}

const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT || 3306,
});

export default pool;