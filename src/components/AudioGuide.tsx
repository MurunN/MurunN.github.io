"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";

type Language = "mn" | "en";

function pickVoice(language: Language) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return undefined;
  const voices = window.speechSynthesis.getVoices();
  if (language === "mn") {
    return voices.find((voice) => voice.lang.toLowerCase() === "mn-mn")
      ?? voices.find((voice) => voice.lang.toLowerCase().startsWith("mn"));
  }
  return voices.find((voice) => voice.lang.toLowerCase() === "en-us")
    ?? voices.find((voice) => voice.lang.toLowerCase().startsWith("en"));
}

function speakFallback(text: string, language: Language) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language === "mn" ? "mn-MN" : "en-US";
  utterance.rate = language === "mn" ? 0.88 : 0.94;
  utterance.pitch = 0.96;
  const voice = pickVoice(language);
  if (voice) utterance.voice = voice;
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
  narrationSrc,
  compact = false
}: {
  title: string;
  src?: string;
  language: Language;
  narration?: Record<Language, string>;
  narrationSrc?: string;
  compact?: boolean;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const narrationRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [narrating, setNarrating] = useState(false);
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

  useEffect(() => {
    return () => {
      narrationRef.current?.pause();
      if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

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

  const playNarration = async () => {
    if (!narration) return;
    if (narrating) {
      narrationRef.current?.pause();
      if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
      setNarrating(false);
      return;
    }

    if (language === "mn" && narrationSrc) {
      const audio = new Audio(narrationSrc);
      narrationRef.current = audio;
      audio.preload = "auto";
      audio.onended = () => setNarrating(false);
      audio.onerror = () => {
        setNarrating(false);
        speakFallback(narration.mn, "mn");
      };
      try {
        setNarrating(true);
        await audio.play();
        return;
      } catch {
        setNarrating(false);
      }
    }

    speakFallback(narration[language], language);
    setNarrating(true);
    window.setTimeout(() => setNarrating(false), Math.max(3500, narration[language].length * 58));
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
          <span>{language === "mn" ? "ДУУ, ТАЙЛБАР" : "AUDIO & NARRATION"}</span>
          <strong>{title}</strong>
        </div>
        <div className="audioGuideActions">
          {src ? (
            <button type="button" className="audioMainButton" onClick={togglePlay}>
              {isPlaying ? (language === "mn" ? "Түр зогсоох" : "Pause") : (language === "mn" ? "Орчны дуу" : "Ambient audio")}
            </button>
          ) : null}
          {narration ? (
            <button type="button" className="audioNarrationButton" onClick={playNarration}>
              {narrating
                ? (language === "mn" ? "Тайлбарыг зогсоох" : "Stop narration")
                : (language === "mn" ? "Монгол тайлбар сонсох" : "Listen to narration")}
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
