import { createClient } from "@/lib/supabase/server";
import type { Site, SiteCard } from "@/types/site";

export async function getSites(): Promise<SiteCard[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sites")
    .select("id, title, description, url, screenshots, videos")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as SiteCard[];
}

export async function getSiteById(id: string): Promise<Site | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sites")
    .select("*")
    .eq("id", id)
    .single();
  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data as Site;
}
