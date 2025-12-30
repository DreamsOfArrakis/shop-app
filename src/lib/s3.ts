"use server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export const bufferToFile = (buffer: Buffer) =>
  `data:image/webp;base64,${buffer.toString("base64")}`;

export const uploadImage = async (file: File, path: string) => {
  const cookieStore = cookies();
  const supabase = createClient({ cookieStore, isAdmin: true });

  const { data, error } = await supabase.storage
    .from("media")
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) throw error;
  return data;
};
