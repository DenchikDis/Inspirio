"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { ScreenshotCarousel } from "./ScreenshotCarousel";
import type { SiteCard as SiteCardType } from "@/types/site";

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

interface SiteCardProps {
  site: SiteCardType;
}

export function SiteCard({ site }: SiteCardProps) {
  const videoUrl = site.videos?.[0] ?? null;
  const screenshots = site.screenshots ?? [];

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <Link href={`/site/${site.id}`} className="block">
        <div className="rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-lg transition-shadow duration-300">
          <div className="relative aspect-video bg-gray-100">
            {videoUrl ? (
              <div className="absolute inset-0">
                <ReactPlayer
                  url={videoUrl}
                  width="100%"
                  height="100%"
                  controls={false}
                  muted
                  loop
                  playing={false}
                  playsinline
                  className="pointer-events-none"
                />
              </div>
            ) : (
              <ScreenshotCarousel
                screenshots={screenshots}
                alt={site.title}
                className="absolute inset-0"
                showDots={screenshots.length > 1}
                autoAdvance={screenshots.length > 1}
              />
            )}
          </div>
          <div className="p-4">
            <h2 className="font-semibold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors">
              {site.title}
            </h2>
            {site.description && (
              <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                {site.description}
              </p>
            )}
            {site.url && (
              <p className="mt-2 text-xs text-gray-400 truncate">{site.url}</p>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
