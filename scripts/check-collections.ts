/**
 * Script to check collection data in the database
 */

import * as dotenv from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/lib/supabase/schema";

// Load environment variables
dotenv.config({ path: ".env.local" });
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: ".env" });
}
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing");
}

const queryClient = postgres(process.env.DATABASE_URL);
const db = drizzle(queryClient, { schema });

const checkCollections = async () => {
  try {
    const collections = await db.select().from(schema.collections);
    console.log("\n📋 Collections in database:\n");
    collections.forEach((c) => {
      console.log(`ID: ${c.id}`);
      console.log(`  Label: ${c.label}`);
      console.log(`  Slug: ${c.slug}`);
      console.log(`  Title: ${c.title || "(empty)"}`);
      console.log(`  Description: ${c.description || "(empty)"}`);
      console.log(`  Featured Image ID: ${c.featuredImageId || "(empty)"}`);
      console.log("---\n");
    });
  } catch (err) {
    console.error("Error checking collections:", err);
  } finally {
    await queryClient.end();
  }
};

checkCollections();
