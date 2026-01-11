"use server";

import { uploadImage } from "@/lib/s3";
import db from "@/lib/supabase/db";
import { medias } from "@/lib/supabase/schema";
import { mediaSchema } from "@/validations/medias";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { z } from "zod";

export async function POST(request: NextRequest) {
  // const session = await getServerSession(authOptions)
  //   if (!session) return NextResponse.json({}, { status: 401 })
  try {
    const formData = await request.formData();

    // Log formData keys for debugging
    console.log("FormData keys:", Array.from(formData.keys()));

    const data = Object.fromEntries(formData) as z.infer<typeof mediaSchema>;
    const validation = mediaSchema.safeParse(data);

    if (validation.success === false) {
      console.error("Validation error:", validation.error.format());
      return NextResponse.json(
        { message: "Validation failed", errors: validation.error.format() },
        { status: 400 },
      );
    }

    const uploadResponse = await Promise.all(
      Object.entries(data).map(async ([index, file]) => {
        try {
          // Convert to buffer first
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          let uploadBuffer: Buffer = buffer;
          let contentType = file.type || "image/jpeg";
          let fileExtension = "webp"; // Default to webp since we'll convert most images

          // Optimize images (convert to webp except gifs)
          const isGif = file.type === "image/gif" || file.type?.includes("gif");

          if (!isGif && file.type) {
            try {
              uploadBuffer = (await sharp(buffer).webp().toBuffer()) as Buffer;
              contentType = "image/webp";
              fileExtension = "webp";
            } catch (sharpError: any) {
              console.error("Sharp conversion error:", sharpError);
              // If sharp fails, try to determine extension from original type
              const mimeParts = file.type.split("/");
              if (mimeParts[1]) {
                if (mimeParts[1] === "jpeg") fileExtension = "jpg";
                else if (mimeParts[1] === "png") fileExtension = "png";
                else if (mimeParts[1] === "avif") {
                  // Try to convert avif to webp, if that fails use original
                  try {
                    uploadBuffer = (await sharp(buffer)
                      .webp()
                      .toBuffer()) as Buffer;
                    contentType = "image/webp";
                    fileExtension = "webp";
                  } catch {
                    // If avif conversion fails, keep original buffer
                    fileExtension = "avif";
                    contentType = "image/avif";
                  }
                } else {
                  fileExtension = mimeParts[1];
                }
              }
            }
          } else if (isGif) {
            fileExtension = "gif";
            contentType = "image/gif";
          }

          const key = `public/${nanoid()}.${fileExtension}`;

          // Create a File object from the buffer
          const blob = new Blob([new Uint8Array(uploadBuffer)], {
            type: contentType,
          });
          const optimizedFile = new File(
            [blob],
            file.name || `image.${fileExtension}`,
            {
              type: contentType,
            },
          );

          // Upload to Supabase Storage
          console.log(`Uploading file to storage: ${key}`);
          const uploadResult = await uploadImage(optimizedFile, key);

          if (!uploadResult) {
            throw new Error(
              "Upload failed - no result returned from Supabase Storage",
            );
          }
          console.log(`Storage upload successful: ${uploadResult.path}`);

          // Insert media record into database using Drizzle (direct PostgreSQL connection bypasses RLS)
          // This is the same approach used in the seed script which works
          console.log(`Inserting media record into database: ${key}`);
          try {
            const [insertedMedia] = await db
              .insert(medias)
              .values({
                alt: file.name || "Uploaded image",
                key: key,
              })
              .returning();

            if (!insertedMedia) {
              throw new Error(
                "Failed to create media record in database - no data returned",
              );
            }

            console.log(
              "Successfully inserted media record:",
              insertedMedia.id,
            );
          } catch (dbError: any) {
            console.error("Database insert error details:", {
              message: dbError.message,
              code: dbError.code,
              detail: dbError.detail,
              hint: dbError.hint,
              stack: dbError.stack,
            });
            throw dbError;
          }

          return key;
        } catch (err: any) {
          console.error(`Error uploading file ${index} (${file.name}):`, err);
          throw new Error(
            `Failed to upload ${file.name || "file"}: ${err.message}`,
          );
        }
      }),
    );

    return NextResponse.json(uploadResponse, { status: 201 });
  } catch (error: any) {
    console.error("Upload route error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to upload images" },
      { status: 400 },
    );
  }
}
