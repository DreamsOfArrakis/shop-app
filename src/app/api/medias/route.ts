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
  const formData = await request.formData();
  const data = Object.fromEntries(formData) as z.infer<typeof mediaSchema>;
  const validation = mediaSchema.safeParse(data);

  if (validation.success === false) {
    return NextResponse.json(validation.error.format(), { status: 400 });
  }

  let statusCode = 201;
  let errorMessage = "Unexpected Error";

  const uploadResponse = await Promise.all(
    Object.entries(data).map(async ([index, file]) => {
      const fileExtension = file.type.split("/")[1];
      const key = `public/${nanoid()}.${fileExtension}`;

      try {
        // Convert to buffer and optimize if needed
        const buffer = Buffer.from(await file.arrayBuffer());
        let uploadBuffer = buffer;
        let contentType = file.type;

        // Optimize images (convert to webp except gifs)
        if (file.type !== "image/gif") {
          uploadBuffer = await sharp(buffer).webp().toBuffer();
          contentType = "image/webp";
        }

        // Create a File object from the buffer
        const blob = new Blob([uploadBuffer], { type: contentType });
        const optimizedFile = new File([blob], file.name, {
          type: contentType,
        });

        // Upload to Supabase Storage
        const uploadResult = await uploadImage(optimizedFile, key);

        if (uploadResult) {
          const insertedMedia = await db
            .insert(medias)
            .values({ alt: file.name, key: key })
            .returning();

          return key;
        }
      } catch (err: any) {
        statusCode = 400;
        errorMessage = err.message;
        return { message: err.message };
      }
    }),
  );

  return statusCode >= 300
    ? NextResponse.json({ message: errorMessage }, { status: statusCode })
    : NextResponse.json(uploadResponse, { status: statusCode });
}
