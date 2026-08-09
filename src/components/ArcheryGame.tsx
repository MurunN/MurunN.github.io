"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Header } from "@/components/Header";

type Language = "mn" | "en";
type GameStatus = "ready" | "running" | "between" | "finished";

type Target = {
  id: number;
  lane: -1 | 0 | 1;
  z: number;
  wobble: number;
  wobbleSpeed: number;
  kind: "normal" | "gold" | "small";
  hit?: boolean;
};

type Trail = { x1: number; y1: number; x2: number; y2: number; life: number; hit: boolean };
type Particle = { x: number; y: number; vx: number; vy: number; life: number };

type RoundConfig = {
  title: Record<Language, string>;
  summary: Record<Language, string>;
  seconds: number;
  spawnEvery: number;
  approachSpeed: number;
  wind: number;
  sway: number;
  targetScale: number;
};

const W = 1000;
const H = 560;
const HORIZON = 190;
const GROUND = 455;

const rounds: RoundConfig[] = [
  {
    title: { mn: "I үе · Талын хэмнэл", en: "Round I · Steppe rhythm" },
    summary: { mn: "Морины хэмнэлд дасаж, ойртон ирэх байнуудыг тогтвортой оно.", en: "Find the horse's rhythm and hit targets as they approach." },
    seconds: 24,
    spawnEvery: 1350,
    approachSpeed: 0.00017,
    wind: 10,
    sway: 8,
    targetScale: 1
  },
  {
    title: { mn: "II үе · Хажуугийн салхи", en: "Round II · Crosswind" },
    summary: { mn: "Салхи хүчтэй. Shift дарж төвлөрвөл савлагаа багасна, гэхдээ төвлөрлийн нөөц зарцуулна.", en: "The wind is stronger. Hold Shift to steady the aim, but focus drains while used." },
    seconds: 26,
    spawnEvery: 1120,
    approachSpeed: 0.0002,
    wind: 20,
    sway: 12,
    targetScale: 0.94
  },
  {
    title: { mn: "III үе · Мэргэний давхилт", en: "Round III · Master gallop" },
    summary: { mn: "Жижиг, хурдан, алтан байнууд нэмэгдэнэ. Комбогоо таслахгүй байвал оноо огцом өснө.", en: "Smaller and faster gold targets appear. Keep the combo alive for much higher scores." },
    seconds: 28,
    spawnEvery: 900,
    approachSpeed: 0.000235,
    wind: 28,
    sway: 16,
    targetScale: 0.86
  }
];

const copy = {
  mn: {
    kicker: "МОРИН ХАРВАА · 2.5D СОРИЛ",
    title: "Давхингаа харва",
    intro: "Хулгана эсвэл touch-оор онил. Дарж барин нумаа татаж, тавихад сум гарна. Shift дарвал төвлөрч савлагааг багасгана. Бай ойртох тусам томорч, онох боломж нэмэгдэнэ — гэхдээ хэт оройтвол өнгөрнө.",
    start: "Давхилтыг эхлүүлэх",
    replay: "Дахин эхлүүлэх",
    score: "Оноо",
    combo: "Комбо",
    hits: "Оносон",
    shots: "Харвасан",
    accuracy: "Оновч",
    focus: "Төвлөрөл",
    power: "Таталт",
    wind: "Салхи",
    time: "Үлдсэн",
    hint: "Дарж бариад → тавьж харва · Shift = төвлөрөх",
    roundDone: "Үе дууслаа",
    final: "Морин харвааны дүн",
    rank1: "Их мэргэн",
    rank2: "Мэргэшсэн харваач",
    rank3: "Сайн харваач",
    rank4: "Дадлагажигч"
  },
  en: {
    kicker: "MOUNTED ARCHERY · 2.5D CHALLENGE",
    title: "Shoot at full gallop",
    intro: "Aim with mouse or touch. Hold to draw the bow and release to shoot. Hold Shift to steady the rider's sway at the cost of focus. Targets grow as they approach, but wait too long and they pass you.",
    start: "Start the gallop",
    replay: "Ride again",
    score: "Score",
    combo: "Combo",
    hits: "Hits",
    shots: "Shots",
    accuracy: "Accuracy",
    focus: "Focus",
    power: "Draw",
    wind: "Wind",
    time: "Time",
    hint: "Hold → release to shoot · Shift = focus",
    roundDone: "Round complete",
    final: "Mounted archery result",
    rank1: "Grand mounted archer",
    rank2: "Expert mounted archer",
    rank3: "Skilled archer",
    rank4: "Apprentice"
  }
};

function playGameTone(kind: "shot" | "hit" | "gold" | "miss") {
  if (typeof window === "undefined") return;
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return;
  const ctx = new AudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  const now = ctx.currentTime;
  const config = kind === "shot"
    ? { f1: 210, f2: 120, d: 0.09, v: 0.035 }
    : kind === "gold"
      ? { f1: 740, f2: 1040, d: 0.16, v: 0.045 }
      : kind === "hit"
        ? { f1: 460, f2: 620, d: 0.12, v: 0.035 }
        : { f1: 120, f2: 90, d: 0.08, v: 0.025 };
  osc.frequency.setValueAtTime(config.f1, now);
  osc.frequency.exponentialRampToValueAtTime(config.f2, now + config.d);
  gain.gain.setValueAtTime(config.v, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + config.d);
  osc.start(now);
  osc.stop(now + config.d);
  osc.onended = () => void ctx.close();
}

function projectTarget(target: Target, now: number, targetScale: number) {
  const depth = Math.max(0, Math.min(1, 1 - target.z));
  const eased = Math.pow(depth, 1.7);
  const laneSpread = 90 + eased * 300;
  const wobble = Math.sin(now * target.wobbleSpeed + target.wobble) * (8 + eased * 24);
  const x = W / 2 + target.lane * laneSpread + wobble;
  const y = HORIZON + eased * (GROUND - HORIZON - 12);
  const base = target.kind === "small" ? 44 : target.kind === "gold" ? 58 : 62;
  const radius = (base * (0.24 + eased * 1.12)) * targetScale;
  return { x, y, radius, depth };
}

export function ArcheryGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [language, setLanguage] = useState<Language>("mn");
  const [status, setStatus] = useState<GameStatus>("ready");
  const [roundIndex, setRoundIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [hits, setHits] = useState(0);
  const [shots, setShots] = useState(0);
  const [focus, setFocus] = useState(100);
  const [power, setPower] = useState(0);
  const [timeLeft, setTimeLeft] = useState(rounds[0].seconds);
  const [flash, setFlash] = useState("");

  const aimRef = useRef({ x: W * 0.7, y: H * 0.48 });
  const targetsRef = useRef<Target[]>([]);
  const trailsRef = useRef<Trail[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const nextTargetIdRef = useRef(1);
  const lastFrameRef = useRef(0);
  const roundStartedAtRef = useRef(0);
  const lastSpawnRef = useRef(0);
  const chargingRef = useRef(false);
  const chargeRef = useRef(0);
  const focusHeldRef = useRef(false);
  const focusRef = useRef(100);
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const hitsRef = useRef(0);
  const shotsRef = useRef(0);
  const roundIndexRef = useRef(0);
  const statusRef = useRef<GameStatus>("ready");
  const cameraKickRef = useRef(0);
  const c = copy[language];
  const round = rounds[roundIndex];

  const accuracy = useMemo(() => shots ? Math.round((hits / shots) * 100) : 0, [hits, shots]);
  const rank = useMemo(() => {
    if (score >= 4000 && accuracy >= 65) return c.rank1;
    if (score >= 2600) return c.rank2;
    if (score >= 1400) return c.rank3;
    return c.rank4;
  }, [accuracy, c.rank1, c.rank2, c.rank3, c.rank4, score]);

  const setGameStatus = (next: GameStatus) => {
    statusRef.current = next;
    setStatus(next);
  };

  const startRound = useCallback((index: number) => {
    roundIndexRef.current = index;
    setRoundIndex(index);
    targetsRef.current = [];
    trailsRef.current = [];
    particlesRef.current = [];
    lastSpawnRef.current = performance.now() - 500;
    roundStartedAtRef.current = performance.now();
    chargeRef.current = 0;
    setPower(0);
    setTimeLeft(rounds[index].seconds);
    setGameStatus("running");
  }, []);

  const startGame = () => {
    scoreRef.current = 0;
    comboRef.current = 0;
    hitsRef.current = 0;
    shotsRef.current = 0;
    focusRef.current = 100;
    setScore(0);
    setCombo(0);
    setHits(0);
    setShots(0);
    setFocus(100);
    startRound(0);
  };

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.code === "ShiftLeft" || event.code === "ShiftRight") focusHeldRef.current = true;
    };
    const up = (event: KeyboardEvent) => {
      if (event.code === "ShiftLeft" || event.code === "ShiftRight") focusHeldRef.current = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  const shoot = useCallback(() => {
    if (statusRef.current !== "running") return;
    const activeRound = rounds[roundIndexRef.current];
    const now = performance.now();
    const charge = Math.max(18, chargeRef.current);
    const focusFactor = focusHeldRef.current && focusRef.current > 0 ? 0.28 : 1;
    const gallopSway = Math.sin(now / 82) * activeRound.sway * focusFactor;
    const wind = Math.sin(now / 1450 + roundIndexRef.current) * activeRound.wind;
    const shotX = aimRef.current.x + gallopSway + wind * (1.05 - charge / 140);
    const shotY = aimRef.current.y + Math.cos(now / 97) * activeRound.sway * 0.5 * focusFactor + (72 - charge) * 0.18;

    shotsRef.current += 1;
    setShots(shotsRef.current);
    playGameTone("shot");

    let best: { target: Target; distance: number; x: number; y: number; radius: number } | null = null;
    for (const target of targetsRef.current) {
      if (target.hit) continue;
      const p = projectTarget(target, now, activeRound.targetScale);
      if (p.depth < 0.12) continue;
      const d = Math.hypot(shotX - p.x, shotY - p.y);
      if (!best || d < best.distance) best = { target, distance: d, x: p.x, y: p.y, radius: p.radius };
    }

    let shotScore = 0;
    let didHit = false;
    if (best && best.distance <= best.radius) {
      best.target.hit = true;
      didHit = true;
      hitsRef.current += 1;
      setHits(hitsRef.current);
      comboRef.current += 1;
      setCombo(comboRef.current);
      const ring = Math.max(0, 1 - best.distance / best.radius);
      const base = Math.round(80 + ring * 170);
      const depthBonus = Math.round((1 - best.target.z) * 85);
      const chargeBonus = charge >= 62 && charge <= 94 ? 50 : 0;
      const comboBonus = Math.min(250, Math.max(0, comboRef.current - 1) * 18);
      const goldBonus = best.target.kind === "gold" ? 180 : 0;
      shotScore = base + depthBonus + chargeBonus + comboBonus + goldBonus;
      scoreRef.current += shotScore;
      setScore(scoreRef.current);
      setFlash(best.target.kind === "gold" ? `АЛТАН БАЙ +${shotScore}` : `+${shotScore}`);
      playGameTone(best.target.kind === "gold" ? "gold" : "hit");
      particlesRef.current = Array.from({ length: 18 }, (_, i) => ({
        x: best!.x,
        y: best!.y,
        vx: Math.cos((Math.PI * 2 * i) / 18) * (1.8 + Math.random() * 2.8),
        vy: Math.sin((Math.PI * 2 * i) / 18) * (1.8 + Math.random() * 2.8),
        life: 1
      }));
    } else {
      comboRef.current = 0;
      setCombo(0);
      setFlash(language === "mn" ? "ӨНГӨРЛӨӨ" : "MISS");
      playGameTone("miss");
    }

    trailsRef.current.push({ x1: 160, y1: 398, x2: shotX, y2: shotY, life: 1, hit: didHit });
    cameraKickRef.current = didHit ? 5 : 2;
    chargeRef.current = 0;
    setPower(0);
    window.setTimeout(() => setFlash(""), 650);
  }, [language]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;

    const drawHorse = (now: number) => {
      const bob = Math.sin(now / 82) * 5;
      const leg = Math.sin(now / 70) * 16;
      const x = 146;
      const y = 424 + bob;
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = "rgba(19,23,21,.18)";
      ctx.beginPath();
      ctx.ellipse(4, 31, 82, 13, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#704528";
      ctx.beginPath();
      ctx.ellipse(0, -2, 62, 29, -0.05, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(58, -23, 19, 16, -.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(42, -38, 13, 27);
      ctx.strokeStyle = "#3b2618";
      ctx.lineWidth = 7;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-32, 12); ctx.lineTo(-42 + leg * .5, 42);
      ctx.moveTo(-8, 14); ctx.lineTo(-15 - leg * .35, 44);
      ctx.moveTo(18, 13); ctx.lineTo(22 + leg * .4, 43);
      ctx.moveTo(39, 8); ctx.lineTo(44 - leg * .45, 39);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-55, -9); ctx.quadraticCurveTo(-84, -25 - leg * .18, -74, 8);
      ctx.stroke();
      ctx.fillStyle = "#1d332c";
      ctx.beginPath(); ctx.arc(-2, -67, 11, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(-12, -58, 22, 34);
      ctx.strokeStyle = "#1d332c";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(-8, -43); ctx.lineTo(-22, -17);
      ctx.moveTo(7, -42); ctx.lineTo(29, -29);
      ctx.stroke();
      ctx.restore();
    };

    const draw = (now: number) => {
      const dt = Math.min(32, lastFrameRef.current ? now - lastFrameRef.current : 16.67);
      lastFrameRef.current = now;
      const activeRound = rounds[roundIndexRef.current];
      const running = statusRef.current === "running";

      if (running) {
        if (chargingRef.current) {
          chargeRef.current = Math.min(100, chargeRef.current + dt * 0.055);
          setPower(Math.round(chargeRef.current));
        }
        if (focusHeldRef.current && focusRef.current > 0) {
          focusRef.current = Math.max(0, focusRef.current - dt * 0.028);
        } else {
          focusRef.current = Math.min(100, focusRef.current + dt * 0.012);
        }
        setFocus(Math.round(focusRef.current));

        if (now - lastSpawnRef.current >= activeRound.spawnEvery) {
          lastSpawnRef.current = now;
          const roll = Math.random();
          const kind: Target["kind"] = roundIndexRef.current === 2 && roll > .76 ? "gold" : roll < .18 ? "small" : "normal";
          targetsRef.current.push({
            id: nextTargetIdRef.current++,
            lane: ([-1, 0, 1] as const)[Math.floor(Math.random() * 3)],
            z: 1.06,
            wobble: Math.random() * Math.PI * 2,
            wobbleSpeed: 0.001 + Math.random() * 0.0015,
            kind
          });
        }

        targetsRef.current.forEach((target) => { target.z -= activeRound.approachSpeed * dt; });
        targetsRef.current = targetsRef.current.filter((target) => target.z > -0.08 && !target.hit);

        const elapsed = (now - roundStartedAtRef.current) / 1000;
        const left = Math.max(0, activeRound.seconds - elapsed);
        setTimeLeft(Math.ceil(left));
        if (left <= 0) {
          if (roundIndexRef.current < rounds.length - 1) {
            setGameStatus("between");
            setFlash(language === "mn" ? "ДАРААГИЙН ҮЕ" : "NEXT ROUND");
            window.setTimeout(() => {
              setFlash("");
              startRound(roundIndexRef.current + 1);
            }, 1200);
          } else {
            setGameStatus("finished");
            if (typeof window !== "undefined") {
              const prev = Number(window.localStorage.getItem("steppequest-mounted-archery-best") || 0);
              if (scoreRef.current > prev) window.localStorage.setItem("steppequest-mounted-archery-best", String(scoreRef.current));
            }
          }
        }
      }

      cameraKickRef.current *= .86;
      const camX = Math.sin(now / 47) * cameraKickRef.current;
      const camY = Math.cos(now / 39) * cameraKickRef.current;
      ctx.save();
      ctx.translate(camX, camY);
      ctx.clearRect(-20, -20, W + 40, H + 40);

      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, roundIndexRef.current === 2 ? "#6f8294" : "#99c3c0");
      sky.addColorStop(.58, roundIndexRef.current === 2 ? "#d8a56e" : "#ead4a8");
      sky.addColorStop(1, "#9d7045");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);

      ctx.fillStyle = "rgba(255,223,154,.8)";
      ctx.beginPath(); ctx.arc(824, 92, 54, 0, Math.PI * 2); ctx.fill();

      const parallax = now * (running ? .018 : .004);
      ctx.fillStyle = "#66796e";
      ctx.beginPath();
      ctx.moveTo(0, 300);
      for (let i = 0; i <= 10; i++) {
        const x = i * 120 - (parallax % 120);
        const y = 215 + Math.sin(i * 1.7) * 55;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.fill();

      ctx.fillStyle = "#9b794f";
      ctx.beginPath();
      ctx.moveTo(0, HORIZON + 70);
      ctx.lineTo(W, HORIZON + 70);
      ctx.lineTo(W, H);
      ctx.lineTo(0, H);
      ctx.fill();

      ctx.strokeStyle = "rgba(255,243,211,.32)";
      ctx.lineWidth = 2;
      for (let lane = -2; lane <= 2; lane++) {
        ctx.beginPath();
        ctx.moveTo(W / 2 + lane * 25, HORIZON + 52);
        ctx.lineTo(W / 2 + lane * 190, H);
        ctx.stroke();
      }
      for (let i = 0; i < 14; i++) {
        const phase = ((i / 14 + (now * .00022)) % 1);
        const y = HORIZON + 55 + Math.pow(phase, 1.7) * (H - HORIZON - 55);
        const half = 55 + Math.pow(phase, 1.4) * 440;
        ctx.strokeStyle = "rgba(255,248,225,.16)";
        ctx.beginPath(); ctx.moveTo(W / 2 - half, y); ctx.lineTo(W / 2 + half, y); ctx.stroke();
      }

      const ordered = [...targetsRef.current].sort((a, b) => b.z - a.z);
      for (const target of ordered) {
        const p = projectTarget(target, now, activeRound.targetScale);
        if (p.depth <= .02) continue;
        ctx.save();
        ctx.translate(p.x, p.y);
        const poleH = p.radius * 1.5;
        ctx.strokeStyle = "rgba(67,45,27,.82)";
        ctx.lineWidth = Math.max(2, p.radius * .09);
        ctx.beginPath(); ctx.moveTo(0, p.radius * .7); ctx.lineTo(0, p.radius + poleH); ctx.stroke();
        const colors = target.kind === "gold"
          ? ["#f8e29b", "#d7902f", "#f4cf58", "#7f3f24", "#fff4b8"]
          : ["#f4ead2", "#b64736", "#ecc75e", "#315b55", "#8f3028"];
        const rings = [1, .78, .56, .34, .15];
        rings.forEach((ratio, index) => {
          ctx.beginPath(); ctx.arc(0, 0, p.radius * ratio, 0, Math.PI * 2); ctx.fillStyle = colors[index]; ctx.fill();
        });
        if (target.kind === "small") {
          ctx.strokeStyle = "rgba(255,255,255,.8)"; ctx.lineWidth = 3; ctx.stroke();
        }
        ctx.restore();
      }

      drawHorse(now);

      const focusFactor = focusHeldRef.current && focusRef.current > 0 ? .28 : 1;
      const swayX = Math.sin(now / 82) * activeRound.sway * focusFactor;
      const swayY = Math.cos(now / 97) * activeRound.sway * .5 * focusFactor;
      const crossX = aimRef.current.x + swayX;
      const crossY = aimRef.current.y + swayY;
      ctx.strokeStyle = focusHeldRef.current ? "rgba(255,239,178,.95)" : "rgba(255,255,255,.88)";
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(crossX, crossY, 18, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(crossX - 28, crossY); ctx.lineTo(crossX - 8, crossY);
      ctx.moveTo(crossX + 8, crossY); ctx.lineTo(crossX + 28, crossY);
      ctx.moveTo(crossX, crossY - 28); ctx.lineTo(crossX, crossY - 8);
      ctx.moveTo(crossX, crossY + 8); ctx.lineTo(crossX, crossY + 28);
      ctx.stroke();

      trailsRef.current = trailsRef.current.filter((trail) => {
        trail.life -= dt * .003;
        if (trail.life <= 0) return false;
        ctx.strokeStyle = trail.hit ? `rgba(255,231,154,${trail.life})` : `rgba(255,255,255,${trail.life * .7})`;
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(trail.x1, trail.y1); ctx.lineTo(trail.x2, trail.y2); ctx.stroke();
        return true;
      });

      particlesRef.current = particlesRef.current.filter((p) => {
        p.life -= dt * .0025;
        if (p.life <= 0) return false;
        p.x += p.vx * dt * .08; p.y += p.vy * dt * .08;
        ctx.fillStyle = `rgba(255,220,121,${p.life})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, 3 + p.life * 3, 0, Math.PI * 2); ctx.fill();
        return true;
      });

      ctx.restore();
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [language, startRound]);

  const pointFromEvent = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    aimRef.current = {
      x: ((event.clientX - rect.left) / rect.width) * W,
      y: ((event.clientY - rect.top) / rect.height) * H
    };
  };

  const pointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    pointFromEvent(event);
    if (statusRef.current !== "running") return;
    chargingRef.current = true;
    chargeRef.current = Math.max(12, chargeRef.current);
  };
  const pointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => pointFromEvent(event);
  const pointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    pointFromEvent(event);
    if (!chargingRef.current) return;
    chargingRef.current = false;
    shoot();
  };

  return (
    <main className="gamePage mountedArcheryPage">
      <Header language={language} onLanguageChange={() => setLanguage((v) => v === "mn" ? "en" : "mn")} />
      <section className="gameHero mountedGameHero">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
          <span className="kicker light">{c.kicker}</span>
          <h1>{c.title}</h1>
          <p>{c.intro}</p>
        </motion.div>
        <div className="gameStatsBar mountedStatsBar">
          <div><span>{c.score}</span><strong>{score}</strong></div>
          <div><span>{c.combo}</span><strong>x{Math.max(1, combo)}</strong></div>
          <div><span>{c.accuracy}</span><strong>{accuracy}%</strong></div>
          <div><span>{c.focus}</span><strong>{focus}%</strong></div>
          <div><span>{c.time}</span><strong>{status === "running" ? `${timeLeft}s` : "—"}</strong></div>
        </div>
      </section>

      <section className="mountedRoundStrip">
        <div><span>{round.title[language]}</span><p>{round.summary[language]}</p></div>
        <div className="mountedRoundMeters">
          <div><small>{c.power}</small><i><b style={{ width: `${power}%` }} /></i><strong>{power}%</strong></div>
          <div><small>{c.wind}</small><strong>{Math.round(round.wind)} ↔</strong></div>
        </div>
      </section>

      <section className="canvasShell mountedCanvasShell">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          onPointerMove={pointerMove}
          onPointerDown={pointerDown}
          onPointerUp={pointerUp}
          onPointerCancel={() => { chargingRef.current = false; }}
          aria-label="Mounted archery 2.5D game"
        />
        <div className="mountedGameHint">{c.hint}</div>
        {status === "ready" ? <button type="button" className="gameStartOverlay" onClick={startGame}>{c.start}</button> : null}
        {status === "between" ? <div className="gameStageOverlay">{c.roundDone}</div> : null}
        <AnimatePresence>{flash ? <motion.div className="hitFlash mountedFlash" initial={{ opacity: 0, scale: .6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>{flash}</motion.div> : null}</AnimatePresence>
      </section>

      <section className="mountedGameInfoGrid">
        <article><span>{language === "mn" ? "ТОГЛООМЫН ХЭМНЭЛ" : "RIDE RHYTHM"}</span><h3>{language === "mn" ? "Хүлээгээд биш, хэмнэлээр харва" : "Shoot with the rhythm"}</h3><p>{language === "mn" ? "Ойртож буй бай томрох тусам оноход амар боловч бай таны хажуугаар өнгөрөх эрсдэл нэмэгдэнэ. Комбо хадгалж, алтан байг онилох нь өндөр онооны түлхүүр." : "Targets become easier to hit as they approach, but can pass you. Preserve your combo and prioritize gold targets for high scores."}</p></article>
        <article><span>{language === "mn" ? "УДИРДЛАГА" : "CONTROLS"}</span><h3>{language === "mn" ? "Mouse / touch + Shift" : "Mouse / touch + Shift"}</h3><p>{language === "mn" ? "Онилж дарж барин нумаа тат. Тавихад харвана. Shift дарж төвлөрөхөд морины савлагаа багасна." : "Aim and hold to draw. Release to fire. Hold Shift to reduce horse sway while focus lasts."}</p></article>
      </section>

      <AnimatePresence>
        {status === "finished" ? (
          <motion.div className="resultBackdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <motion.div className="resultModal mountedResult" initial={{ opacity: 0, y: 30, scale: .94 }} animate={{ opacity: 1, y: 0, scale: 1 }}>
              <div className="resultBadge">🏹</div>
              <span className="kicker">{c.final}</span>
              <h2>{score} <small>PTS</small></h2>
              <p>{rank}</p>
              <div className="archeryResultGrid">
                <div><small>{c.hits}</small><strong>{hits}</strong></div>
                <div><small>{c.shots}</small><strong>{shots}</strong></div>
                <div><small>{c.accuracy}</small><strong>{accuracy}%</strong></div>
              </div>
              <div className="modalActions"><button className="primaryButton" onClick={startGame}>{c.replay}</button><a className="secondaryButton" href="/">{language === "mn" ? "Нүүр" : "Home"}</a></div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
