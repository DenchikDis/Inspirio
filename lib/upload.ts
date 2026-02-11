"use server";

import { createClient } from "@/lib/supabase/server";

const BUCKET = "sites-media";

export async function uploadFiles(
  formData: FormData,
  field: "screenshots" | "videos"
): Promise<string[]> {
  const supabase = await createClient();
  const files = formData.getAll(field) as File[];
  const urls: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!file?.size) continue;
    const ext = file.name.split(".").pop() || "bin";
    const name = `${field}/${Date.now()}-${i}.${ext}`;
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(name, file, { upsert: false });
    if (error) throw error;
    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
    urls.push(publicUrl);
  }

  return urls;
}
