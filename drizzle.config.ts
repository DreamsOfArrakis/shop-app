import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";
import { resolve } from "path";
import { existsSync } from "fs";

// Load .env.local first, then fall back to .env
const envLocalPath = resolve(process.cwd(), ".env.local");
const envPath = resolve(process.cwd(), ".env");

// Try multiple approaches to load env vars
if (existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath, override: true });
}
if (existsSync(envPath)) {
  dotenv.config({ path: envPath, override: true });
}
// Also try default .env loading
dotenv.config();

if (!process.env.DATABASE_URL) {
  console.error("Error: DATABASE_URL is missing.");
  console.error("Please ensure your .env or .env.local file contains:");
  console.error(
    "DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres",
  );
  throw new Error(
    "DATABASE_URL is missing. Please check your .env.local or .env file.",
  );
}

export default {
  schema: "./src/lib/supabase/schema.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL,
  },
} satisfies Config;
