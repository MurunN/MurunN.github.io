"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";

type Language = "mn" | "en";

function speak(text: string, language: Language) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language === "mn" ? "mn-MN" : "en-US";
  utterance.rate = 0.95;
  window.speechSynthesis.speak(utterance);
}

function formatTime(value: number) {
  if (!Number.isFinite(value)) return "0:00";
  const mins = Math.floor(value / 60);
  const secs = Math.floor(value % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function AudioGuide({
  title,
  src,
  language,
  narration,
  compact = false
}: {
  title: string;
  src?: string;
  language: Language;
  narration?: Record<Language, string>;
  compact?: boolean;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => setDuration(audio.duration || 0);
    const onEnded = () => setIsPlaying(false);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    setCurrentTime(0);
    setIsPlaying(false);
  }, [src]);

  const progress = useMemo(() => {
    if (!duration) return 0;
    return Math.min(100, (currentTime / duration) * 100);
  }, [currentTime, duration]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }
    try {
      await audio.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  const onSeek = (event: ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const next = (Number(event.target.value) / 100) * duration;
    audio.currentTime = next;
    setCurrentTime(next);
  };

  return (
    <div className={compact ? "audioGuide compact" : "audioGuide"}>
      {src ? <audio ref={audioRef} preload="metadata" src={src} /> : null}
      <div className="audioGuideTop">
        <div>
          <span>{language === "mn" ? "СОНСОХ" : "LISTEN"}</span>
          <strong>{title}</strong>
        </div>
        <div className="audioGuideActions">
          {src ? (
            <button type="button" className="audioMainButton" onClick={togglePlay}>
              {isPlaying ? (language === "mn" ? "Түр зогсоох" : "Pause") : (language === "mn" ? "Тоглуулах" : "Play") }
            </button>
          ) : null}
          {narration ? (
            <button type="button" className="audioNarrationButton" onClick={() => speak(narration[language], language)}>
              {language === "mn" ? "Тайлбар уншуулах" : "Narrate text"}
            </button>
          ) : null}
        </div>
      </div>
      {src ? (
        <>
          <div className="audioProgressBar"><i style={{ width: `${progress}%` }} /></div>
          <input type="range" min="0" max="100" value={progress} onChange={onSeek} className="audioSeek" aria-label="audio seek" />
          <div className="audioMeta"><small>{formatTime(currentTime)}</small><small>{formatTime(duration)}</small></div>
        </>
      ) : null}
    </div>
  );
}
