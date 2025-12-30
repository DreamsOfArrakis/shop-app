/**
 * Simple script to upload a single image to Supabase Storage
 * 
 * Usage:
 *   npx tsx scripts/upload-single-image.ts <path-to-image> <storage-path>
 * 
 * Example:
 *   npx tsx scripts/upload-single-image.ts ./my-image.jpg public/my-image.jpg
 */

import * as dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";

// Load environment variables
dotenv.config({ path: ".env.local" });
if (!process.env.DATABASE_SERVICE_ROLE || !process.env.NEXT_PUBLIC_SUPABASE_PROJECT_REF) {
  throw new Error("Missing required environment variables. Make sure .env.local has DATABASE_SERVICE_ROLE and NEXT_PUBLIC_SUPABASE_PROJECT_REF");
}

const supabaseUrl = `https://${process.env.NEXT_PUBLIC_SUPABASE_PROJECT_REF}.supabase.co`;
const supabase = createClient(supabaseUrl, process.env.DATABASE_SERVICE_ROLE);

async function uploadImage(imagePath: string, storagePath: string) {
  try {
    console.log(`📤 Reading image from: ${imagePath}`);
    
    // Read the image file
    const imageBuffer = readFileSync(imagePath);
    
    // Get file extension to determine content type
    const ext = imagePath.split('.').pop()?.toLowerCase();
    const contentType = ext === 'png' ? 'image/png' : 
                       ext === 'gif' ? 'image/gif' : 
                       ext === 'webp' ? 'image/webp' : 
                       'image/jpeg';
    
    // Ensure storage path starts with 'public/'
    const finalPath = storagePath.startsWith('public/') ? storagePath : `public/${storagePath}`;
    
    console.log(`📤 Uploading to: ${finalPath}`);
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("media")
      .upload(finalPath, imageBuffer, {
        contentType: contentType,
        upsert: true, // Overwrite if exists
      });

    if (error) {
      console.error(`❌ Error uploading:`, error.message);
      process.exit(1);
    }

    console.log(`✅ Successfully uploaded to: ${data.path}`);
    console.log(`\n📋 Full URL:`);
    console.log(`   https://${process.env.NEXT_PUBLIC_SUPABASE_PROJECT_REF}.supabase.co/storage/v1/object/public/media/${finalPath.replace('public/', '')}`);
    
  } catch (error: any) {
    console.error(`❌ Error:`, error.message);
    process.exit(1);
  }
}

// Get command line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log(`
Usage: npx tsx scripts/upload-single-image.ts <image-path> <storage-path>

Examples:
  npx tsx scripts/upload-single-image.ts ./photo.jpg public/photo.jpg
  npx tsx scripts/upload-single-image.ts ~/Downloads/image.png public/my-image.png

Note: Storage path should start with 'public/' (it will be added automatically if missing)
  `);
  process.exit(1);
}

const [imagePath, storagePath] = args;

uploadImage(imagePath, storagePath);

