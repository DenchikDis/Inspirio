"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface ScreenshotCarouselProps {
  screenshots: string[];
  alt?: string;
  className?: string;
  imageClassName?: string;
  showDots?: boolean;
  autoAdvance?: boolean;
  intervalMs?: number;
}

export function ScreenshotCarousel({
  screenshots,
  alt = "Screenshot",
  className = "",
  imageClassName = "object-cover w-full h-full",
  showDots = true,
  autoAdvance = false,
  intervalMs = 4000,
}: ScreenshotCarouselProps) {
  const [index, setIndex] = useState(0);
  const count = screenshots.length;

  useEffect(() => {
    if (!autoAdvance || count <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), intervalMs);
    return () => clearInterval(t);
  }, [autoAdvance, count, intervalMs]);

  if (count === 0) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
        <span className="text-gray-400 text-sm">Нет скриншотов</span>
      </div>
    );
  }

  if (count === 1) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Image
          src={screenshots[0]}
          alt={alt}
          fill
          className={imageClassName}
          sizes="(max-width: 768px) 100vw, 400px"
          unoptimized
        />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="absolute inset-0"
        >
          <Image
            src={screenshots[index]}
            alt={`${alt} ${index + 1}`}
            fill
            className={imageClassName}
            sizes="(max-width: 768px) 100vw, 400px"
            unoptimized
          />
        </motion.div>
      </AnimatePresence>
      {showDots && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
          {screenshots.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === index ? "bg-white" : "bg-white/50 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
