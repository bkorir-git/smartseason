import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  uri: process.env.MYSQL_PUBLIC_URL,
  multipleStatements: true
});

export default pool;