"use server";

import { createClient } from "@/lib/supabase/server";
import { uploadFiles } from "@/lib/upload";
import { revalidatePath } from "next/cache";

export type AddSiteState = { error?: string; success?: boolean };

export async function addSite(
  prev: AddSiteState,
  formData: FormData
): Promise<AddSiteState> {
  const title = formData.get("title") as string;
  if (!title?.trim()) return { error: "Название обязательно" };

  try {
    const screenshotUrls = await uploadFiles(formData, "screenshots");
    const videoUrls = await uploadFiles(formData, "videos");

    const technologiesStr = (formData.get("technologies") as string) || "";
    const fontsStr = (formData.get("fonts") as string) || "";
    const technologies = technologiesStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const fonts = fontsStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const supabase = await createClient();
    const { error } = await supabase.from("sites").insert({
      title: title.trim(),
      description: (formData.get("description") as string)?.trim() || null,
      url: (formData.get("url") as string)?.trim() || null,
      technologies,
      fonts,
      framework: (formData.get("framework") as string)?.trim() || null,
      screenshots: screenshotUrls,
      videos: videoUrls,
    });

    if (error) return { error: error.message };
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Ошибка при добавлении сайта",
    };
  }
}
