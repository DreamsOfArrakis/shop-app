/**
 * Script to fix the Living Room collection title
 */

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

async function fixLivingRoomTitle() {
  try {
    const result = await db
      .update(schema.collections)
      .set({ title: "Elevate Your Living Room Experience" })
      .where(eq(schema.collections.slug, "living-room-planning"))
      .returning();

    if (result && result.length > 0) {
      console.log(`✅ Updated title for Living Room collection`);
      console.log(`   New title: ${result[0].title}`);
    } else {
      console.log(`⚠️  Living Room collection not found`);
    }
  } catch (err) {
    console.error("❌ Error updating title:", err);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

fixLivingRoomTitle();
