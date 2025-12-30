"use server";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/env.mjs";

export const bufferToFile = (buffer: Buffer) =>
  `data:image/webp;base64,${buffer.toString("base64")}`;

export const uploadImage = async (file: File, path: string) => {
  // Use direct Supabase client with service role key for storage operations
  // This bypasses RLS on storage metadata tables
  const supabase = createClient(
    `https://${env.NEXT_PUBLIC_SUPABASE_PROJECT_REF}.supabase.co`,
    env.DATABASE_SERVICE_ROLE,
    {
      auth: {
        persistSession: false, // Don't persist session for server-side operations
      },
    }
  );

  const { data, error } = await supabase.storage
    .from("media")
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) throw error;
  return data;
};
