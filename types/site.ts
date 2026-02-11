export interface Site {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
  technologies: string[];
  fonts: string[];
  framework: string | null;
  screenshots: string[];
  videos: string[];
  created_at: string;
  updated_at: string;
}

export type SiteCard = Pick<
  Site,
  "id" | "title" | "description" | "url" | "screenshots" | "videos"
>;
