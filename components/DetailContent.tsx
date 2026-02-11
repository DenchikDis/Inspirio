"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import dynamic from "next/dynamic";
import type { Site } from "@/types/site";

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

interface DetailContentProps {
  site: Site;
}

export function DetailContent({ site }: DetailContentProps) {
  const [screenshotIndex, setScreenshotIndex] = useState(0);
  const screenshots = site.screenshots ?? [];
  const videos = site.videos ?? [];

  return (
    <motion.article
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden"
    >
      <h1 className="text-2xl font-bold text-gray-900 px-6 pt-6">{site.title}</h1>
      {site.url && (
        <a
          href={site.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block px-6 pt-2 text-indigo-600 hover:underline text-sm"
        >
          {site.url}
        </a>
      )}

      {/* Carousel */}
      <div className="mt-6 relative">
        {screenshots.length > 0 ? (
          <div className="relative aspect-video bg-gray-100">
            <AnimatePresence mode="wait">
              <motion.div
                key={screenshotIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0"
              >
                <Image
                  src={screenshots[screenshotIndex]}
                  alt={`${site.title} screenshot ${screenshotIndex + 1}`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 1024px"
                  unoptimized
                />
              </motion.div>
            </AnimatePresence>
            {screenshots.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setScreenshotIndex((i) =>
                      i === 0 ? screenshots.length - 1 : i - 1
                    )
                  }
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                  aria-label="Предыдущий скриншот"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setScreenshotIndex((i) =>
                      i === screenshots.length - 1 ? 0 : i + 1
                    )
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                  aria-label="Следующий скриншот"
                >
                  ›
                </button>
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
                  {screenshots.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setScreenshotIndex(i)}
                      className={`w-2.5 h-2.5 rounded-full transition-colors ${
                        i === screenshotIndex
                          ? "bg-white"
                          : "bg-white/50 hover:bg-white/70"
                      }`}
                      aria-label={`Скриншот ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="aspect-video bg-gray-100 flex items-center justify-center text-gray-400">
            Нет скриншотов
          </div>
        )}
      </div>

      {/* Video(s) */}
      {videos.length > 0 && (
        <div className="mt-6 px-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Видео демонстрация
          </h2>
          <div className="space-y-4">
            {videos.map((url, i) => (
              <div key={i} className="rounded-lg overflow-hidden bg-black">
                <ReactPlayer
                  url={url}
                  width="100%"
                  height="100%"
                  controls
                  light={false}
                  className="aspect-video"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Meta */}
      <div className="px-6 py-6 space-y-4">
        {site.description && (
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Описание
            </h2>
            <p className="text-gray-700">{site.description}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {site.framework && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Фреймворк
              </h2>
              <p className="text-gray-900">{site.framework}</p>
            </div>
          )}
          {site.technologies && site.technologies.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Технологии
              </h2>
              <p className="text-gray-900">
                {site.technologies.join(", ")}
              </p>
            </div>
          )}
          {site.fonts && site.fonts.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Шрифты
              </h2>
              <p className="text-gray-900">{site.fonts.join(", ")}</p>
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}
