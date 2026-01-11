/**
 * Script to update a product's featured image
 *
 * Usage:
 *   npx tsx scripts/update-product-image.ts <product-id> <image-key>
 *
 * Example:
 *   npx tsx scripts/update-product-image.ts 1 public/tonstad-desk-oak-veneer__1319554_pe941590_s5.avif
 */

import * as dotenv from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { medias, products } from "../src/lib/supabase/schema";
import { eq } from "drizzle-orm";

// Load environment variables
dotenv.config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  console.error(
    "❌ DATABASE_URL is required. Make sure .env.local exists and contains DATABASE_URL",
  );
  process.exit(1);
}

// Create database connection
const client = postgres(process.env.DATABASE_URL, { prepare: false });
const db = drizzle(client, { schema: { medias, products } });

async function updateProductImage(productId: string, imageKey: string) {
  try {
    // Ensure image key has 'public/' prefix
    const finalImageKey = imageKey.startsWith("public/")
      ? imageKey
      : `public/${imageKey}`;

    console.log(
      `📝 Updating product ${productId} to use image: ${finalImageKey}`,
    );

    // First, find or create the media record
    let mediaRecord = await db
      .select()
      .from(medias)
      .where(eq(medias.key, finalImageKey))
      .limit(1);

    let mediaId: string;

    if (mediaRecord.length === 0) {
      // Create a new media record
      console.log(`📤 Creating new media record for: ${finalImageKey}`);
      const [newMedia] = await db
        .insert(medias)
        .values({
          key: finalImageKey,
          alt: `Product ${productId} image`,
        })
        .returning();
      mediaId = newMedia.id;
      console.log(`✅ Created media record with id: ${mediaId}`);
    } else {
      mediaId = mediaRecord[0].id;
      console.log(`✅ Found existing media record with id: ${mediaId}`);
    }

    // Update the product's featuredImageId
    const [updatedProduct] = await db
      .update(products)
      .set({ featuredImageId: mediaId })
      .where(eq(products.id, productId))
      .returning();

    if (!updatedProduct) {
      console.error(`❌ Product with id "${productId}" not found`);
      process.exit(1);
    }

    console.log(
      `✅ Successfully updated product "${updatedProduct.name}" (id: ${productId})`,
    );
    console.log(`   Featured image now points to: ${finalImageKey}`);
    console.log(`   Media record id: ${mediaId}`);

    // Close database connection
    await client.end();
  } catch (error: any) {
    console.error(`❌ Error:`, error.message);
    await client.end();
    process.exit(1);
  }
}

// Get command line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log(`
Usage: npx tsx scripts/update-product-image.ts <product-id> <image-key>

Examples:
  npx tsx scripts/update-product-image.ts 1 public/tonstad-desk-oak-veneer__1319554_pe941590_s5.avif
  npx tsx scripts/update-product-image.ts 1 tonstad-desk-oak-veneer__1319554_pe941590_s5.avif

Note: The 'public/' prefix will be added automatically if missing.
  `);
  process.exit(1);
}

const [productId, imageKey] = args;

updateProductImage(productId, imageKey);
