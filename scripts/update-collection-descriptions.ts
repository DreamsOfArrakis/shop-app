import * as dotenv from "dotenv";
import { resolve } from "path";
import { existsSync } from "fs";

// Load environment variables
if (existsSync(resolve(process.cwd(), ".env.local"))) {
  dotenv.config({ path: resolve(process.cwd(), ".env.local") });
} else if (existsSync(resolve(process.cwd(), ".env"))) {
  dotenv.config({ path: resolve(process.cwd(), ".env") });
} else {
  dotenv.config();
}

import db from "../src/lib/supabase/db";
import * as schema from "../src/lib/supabase/schema";
import { eq } from "drizzle-orm";

const collectionDescriptions = {
  bathroom:
    "Transform your bathroom with our premium essentials, blending luxury, functionality, and style. Shop now for the ultimate in comfort and elegance.",
  "kitchen-planning":
    "Transform your kitchen with our premium essentials, blending luxury, functionality, and style. Shop now for the ultimate in comfort and elegance.",
  "living-room-planning":
    "Transform your living room with our premium essentials, blending luxury, functionality, and style. Shop now for the ultimate in comfort and elegance.",
  "Bedroom-planning":
    "Transform your bedroom with our premium essentials, blending luxury, functionality, and style. Shop now for the ultimate in comfort and elegance.",
};

async function updateCollectionDescriptions() {
  try {
    for (const [slug, description] of Object.entries(collectionDescriptions)) {
      const result = await db
        .update(schema.collections)
        .set({ description })
        .where(eq(schema.collections.slug, slug))
        .returning();

      if (result && result.length > 0) {
        console.log(`✅ Updated description for collection: ${slug}`);
      } else {
        console.log(`⚠️  Collection not found: ${slug}`);
      }
    }
    console.log("✅ All collection descriptions updated!");
  } catch (err) {
    console.error("❌ Error updating collection descriptions:", err);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

updateCollectionDescriptions();
