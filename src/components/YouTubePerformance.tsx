"use client";

import { motion } from "motion/react";

type Language = "mn" | "en";

export function YouTubePerformance({
  videoId,
  title,
  description,
  language,
  sourceLabel
}: {
  videoId: string;
  title: string;
  description: string;
  language: Language;
  sourceLabel?: string;
}) {
  return (
    <motion.article className="youtubePerformanceCard" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <div className="youtubeFrameWrap">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?rel=0&playsinline=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
      <div className="youtubePerformanceCopy">
        <span>{sourceLabel || (language === "mn" ? "БИЧЛЭГ" : "PERFORMANCE")}</span>
        <h4>{title}</h4>
        <p>{description}</p>
      </div>
    </motion.article>
  );
}
