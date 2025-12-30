/**
 * Script to upload placeholder images to Supabase Storage
 * Run with: npx tsx scripts/upload-placeholder-images.ts
 */

import * as dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";

// Load environment variables
dotenv.config({ path: ".env.local" });
if (!process.env.DATABASE_SERVICE_ROLE || !process.env.NEXT_PUBLIC_SUPABASE_PROJECT_REF) {
  throw new Error("Missing required environment variables");
}

const supabaseUrl = `https://${process.env.NEXT_PUBLIC_SUPABASE_PROJECT_REF}.supabase.co`;
const supabase = createClient(supabaseUrl, process.env.DATABASE_SERVICE_ROLE);

// List of images to create (as placeholders)
// Collection images - larger format for banners
const collectionImages = [
  { key: "public/bathroom-planning.jpg", name: "Bathroom Planning", width: 1200, height: 800 },
  { key: "public/kitchen-planning.jpg", name: "Kitchen Planning", width: 1200, height: 800 },
  { key: "public/living-room-planning.jpg", name: "Living Room Planning", width: 1200, height: 800 },
  { key: "public/bedroom-planning.jpg", name: "Bedroom Planning", width: 1200, height: 800 },
];

// Product images - square format for product cards
const productImages = [
  { key: "public/product-1.jpg", name: "Product 1", width: 800, height: 800 },
  { key: "public/product-2.jpg", name: "Product 2", width: 800, height: 800 },
  { key: "public/product-3.jpg", name: "Product 3", width: 800, height: 800 },
  { key: "public/product-4.jpg", name: "Product 4", width: 800, height: 800 },
  { key: "public/product-5.jpg", name: "Product 5", width: 800, height: 800 },
];

const imagesToUpload = [...collectionImages, ...productImages];

/**
 * Creates a simple placeholder image as a data URL
 * Returns a Buffer with a minimal valid JPEG
 */
function createPlaceholderImage(text: string): Buffer {
  // Create a minimal 1x1 pixel JPEG with text
  // For a real placeholder, we'll use a simple colored image
  // This creates a 800x600 JPEG with a gray background
  const width = 800;
  const height = 600;
  
  // Minimal JPEG header for a gray image
  // This is a simplified approach - in production you'd use a library like sharp or canvas
  // For now, we'll create a very simple placeholder using a data URL approach
  
  // Since we can't easily generate images in Node without canvas/sharp,
  // we'll use fetch to get a placeholder from a service
  return Buffer.from(""); // Will be replaced with actual image data
}

/**
 * Fetches a placeholder image from a service
 */
async function fetchPlaceholderImage(text: string, width = 800, height = 600): Promise<Buffer> {
  // Use a more visually appealing placeholder service
  const url = `https://placehold.co/${width}x${height}/4f46e5/ffffff?text=${encodeURIComponent(text)}&font=roboto`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch placeholder: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function uploadPlaceholderImages() {
  console.log("🖼️  Starting to upload placeholder images...\n");

  for (const image of imagesToUpload) {
    try {
      console.log(`📤 Uploading ${image.key}...`);
      
      // Fetch placeholder image with specified dimensions
      const width = image.width || 800;
      const height = image.height || 600;
      const imageBuffer = await fetchPlaceholderImage(image.name, width, height);
      
      // Convert buffer to blob/file
      const blob = new Blob([imageBuffer], { type: "image/jpeg" });
      const file = new File([blob], image.key.split("/").pop() || "image.jpg", {
        type: "image/jpeg",
      });

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("media")
        .upload(image.key, file, {
          contentType: "image/jpeg",
          upsert: true, // Overwrite if exists
        });

      if (uploadError) {
        console.error(`❌ Error uploading ${image.key}:`, uploadError.message);
        continue;
      }

      console.log(`✅ Successfully uploaded ${image.key} (${width}x${height})`);
    } catch (error: any) {
      console.error(`❌ Error processing ${image.key}:`, error.message);
    }
  }

  console.log("\n✨ Done! All placeholder images uploaded.");
  console.log("\nNote: If you see errors, make sure:");
  console.log("  1. The 'media' bucket exists in Supabase Storage");
  console.log("  2. The bucket is set to 'public' or has proper RLS policies");
  console.log("  3. Your DATABASE_SERVICE_ROLE key has storage permissions");
}

// Run the script
uploadPlaceholderImages().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

