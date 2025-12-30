import * as dotenv from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";
import * as seed from "./seedData";
import { exit } from "process";

// import { seedMedias } from "./seedData/medias"
// import { seedCollections } from "./seedData/collections"

// Load .env.local first, then fallback to .env
dotenv.config({ path: ".env.local" });
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: ".env" });
}
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing");
}

const queryClient = postgres(process.env.DATABASE_URL);
export const db = drizzle(queryClient, { schema });

const seeddata = async () => {
  // Delete in reverse dependency order: products -> collections -> medias
  // Then seed in forward order: medias -> collections -> products
  try {
    await db.delete(schema.products);
    await db.delete(schema.collections);
    await db.delete(schema.medias);
  } catch (err) {
    console.log("Error deleting existing data:", err);
  }
  
  // Seed in order: medias first, then collections (which reference medias), then products (which reference both)
  await seed.medias();
  await seed.collections();
  await seed.products();
  // await seed.shopOrders()
  // await seed.address()

  exit();
};

seeddata();
