import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

/**
 * Database pool configuration for Neon (works with DATABASE_URL or individual vars).
 * - Prefer DATABASE_URL (Neon pooler URL).
 * - Reuse this single pool across your app / serverless invocations (module scope).
 * - Tune pool sizes for your environment (serverless vs long-lived container).
 */

const connectionString = process.env.DATABASE_URL || undefined;

// Determine SSL behavior:
// - If PGSSLMODE=require or DB_SSL=true or connection string contains sslmode=require, enable SSL.
// - By default, rejectUnauthorized is true (verify certificate). Set DB_SSL_VERIFY=false to skip verification.
const shouldUseSsl =
  process.env.PGSSLMODE === "require" ||
  process.env.DB_SSL === "true" ||
  (connectionString && connectionString.includes("sslmode=require"));

const ssl = shouldUseSsl
  ? { rejectUnauthorized: process.env.DB_SSL_VERIFY !== "false" }
  : undefined;

const pool = new Pool({
  // If DATABASE_URL is provided, pg will use it. Individual fields are fallback.
  connectionString,
  host: connectionString ? undefined : process.env.DB_HOST,
  port: connectionString ? undefined : parseInt(process.env.DB_PORT ?? "5432", 10),
  user: connectionString ? undefined : process.env.DB_USER,
  password: connectionString ? undefined : process.env.DB_PASSWORD,
  database: connectionString ? undefined : process.env.DB_NAME,
  ssl,
  // Pool tuning (adjust for your runtime)
  max: Number(process.env.DB_POOL_MAX ?? 5),
  min: Number(process.env.DB_POOL_MIN ?? 0),
  idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT_MS ?? 30000),
  connectionTimeoutMillis: Number(process.env.DB_CONN_TIMEOUT_MS ?? 2000),
});

pool.on("connect", () => {
  console.log("Connected to the PostgreSQL database");
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle PostgreSQL client", err);
  // In long-running services you may not want to exit; adjust as needed.
  process.exit(-1);
});

export default pool;