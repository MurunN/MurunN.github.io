"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Header } from "@/components/Header";

type Arrow = { x: number; y: number; vx: number; vy: number; angle: number; active: boolean };
type Particle = { x: number; y: number; vx: number; vy: number; life: number; color: string };
type UnlockedBadge = { code: string; nameMn: string; nameEn: string; descriptionMn: string; descriptionEn: string; icon: string };
type RoundConfig = {
  nameMn: string;
  nameEn: string;
  summaryMn: string;
  summaryEn: string;
  shots: number;
  windStrength: number;
  moveAmplitude: number;
  moveSpeed: number;
  horizontalDrift: number;
  targetScale: number;
  scoreMultiplier: number;
};

type ShotBreakdown = {
  base: number;
  bonus: number;
  total: number;
  combo: number;
};

const W = 900;
const H = 500;
const BOW_X = 115;
const BOW_Y = 385;
const TARGET_BASE_X = 760;
const rounds: RoundConfig[] = [
  {
    nameMn: "I үе · Халаалт",
    nameEn: "Round I · Warm-up",
    summaryMn: "Тогтуун салхитай, хөдөлгөөн харьцангуй энгийн сорил.",
    summaryEn: "A steadier opening with a simpler moving target.",
    shots: 4,
    windStrength: 0.09,
    moveAmplitude: 58,
    moveSpeed: 820,
    horizontalDrift: 6,
    targetScale: 1,
    scoreMultiplier: 1
  },
  {
    nameMn: "II үе · Салхины сорил",
    nameEn: "Round II · Wind test",
    summaryMn: "Салхи чангарч, бай илүү огцом савлана.",
    summaryEn: "The wind grows stronger and the target shifts more sharply.",
    shots: 4,
    windStrength: 0.14,
    moveAmplitude: 74,
    moveSpeed: 650,
    horizontalDrift: 18,
    targetScale: 0.94,
    scoreMultiplier: 1.15
  },
  {
    nameMn: "III үе · Мэргэний шат",
    nameEn: "Round III · Master stage",
    summaryMn: "Бай жижигрэн, салхи болон хэмнэл хоёрыг зэрэг тооцох хэрэгтэй болно.",
    summaryEn: "The target narrows and demands sharper control over both timing and wind.",
    shots: 4,
    windStrength: 0.18,
    moveAmplitude: 92,
    moveSpeed: 560,
    horizontalDrift: 30,
    targetScale: 0.84,
    scoreMultiplier: 1.35
  }
];
const TOTAL_SHOTS = rounds.reduce((sum, round) => sum + round.shots, 0);

const gameCopy = {
  mn: {
    title: "Бай харвааны том сорил",
    subtitle: "Үе шат ахих тусам бай улам хэцүү болно.",
    instructions: "Бай руу онилж дарж барин хүчээ цэнэглээд тавина. Үе ахих тусам салхи чангарч, байны хөдөлгөөн огцом болж, онооны урамшуулал нэмэгдэнэ.",
    arrows: "Нийт сум",
    roundShots: "Үеийн сум",
    score: "Оноо",
    wind: "Салхи",
    combo: "Комбо",
    best: "Шилдэг сум",
    round: "Үе шат",
    power: "Хүч",
    roundGoal: "Энэ үеийн онцлог",
    ready: "Онилоод хүчээ цэнэглэ",
    charging: "Хүч цэнэглэж байна...",
    flying: "Сум нисэж байна...",
    bullseye: "БАЙНЫ ГОЛ!",
    hit: "ОНЧЛОО!",
    miss: "АЛДСАН Ч ДАХИАД БОЛНО",
    comboBoost: "Комбо бонус",
    roundComplete: "Үе дууслаа",
    nextRound: "Дараагийн үе",
    result: "Тоглолт дууслаа",
    guest: "Энэ хувилбар таны шилдэг оноог тухайн browser дээр хадгална.",
    login: "Browser дээр хадгалах",
    replay: "Дахин тоглох",
    home: "Нүүр хуудас",
    saving: "Тоглолтын дүнг хадгалж байна...",
    earned: "авлаа",
    newBadge: "Шинэ тэмдэг нээгдлээ!",
    roundSummary: "Үеийн хураангуй",
    finalTitle: "Мэргэний үнэлгээ",
    totalBullseyes: "Байны гол",
    lastShot: "Сүүлчийн сум",
    tips: [
      "Дарж барих тусам хүч нэмэгдэнэ.",
      "Комбо тасрахгүй байх тусам бонус өснө.",
      "III үед бай жижигрэх тул хүч ба салхиа илүү нягт ажигла."
    ]
  },
  en: {
    title: "Grand Archery Challenge",
    subtitle: "Each round becomes faster, sharper and more demanding.",
    instructions: "Aim, hold to charge and release. As the rounds progress, the wind intensifies, the target moves more aggressively and score bonuses increase.",
    arrows: "Total arrows",
    roundShots: "Round arrows",
    score: "Score",
    wind: "Wind",
    combo: "Combo",
    best: "Best shot",
    round: "Round",
    power: "Power",
    roundGoal: "Round focus",
    ready: "Aim and charge",
    charging: "Charging power...",
    flying: "Arrow in flight...",
    bullseye: "BULLSEYE!",
    hit: "GREAT HIT!",
    miss: "MISS — TRY AGAIN",
    comboBoost: "Combo bonus",
    roundComplete: "Round complete",
    nextRound: "Next round",
    result: "Game complete",
    guest: "This version stores your best score in this browser.",
    login: "Save in browser",
    replay: "Play again",
    home: "Home",
    saving: "Saving progress...",
    earned: "earned",
    newBadge: "New badge unlocked!",
    roundSummary: "Round summary",
    finalTitle: "Marksman rating",
    totalBullseyes: "Bullseyes",
    lastShot: "Last shot",
    tips: [
      "Hold longer to charge more power.",
      "Keep your combo alive to build bonus points.",
      "In round III the target shrinks, so read both timing and wind carefully."
    ]
  }
};

export function ArcheryGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const aimRef = useRef({ x: 590, y: 240 });
  const arrowRef = useRef<Arrow | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const chargingRef = useRef(false);
  const powerRef = useRef(0);
  const scoreRef = useRef(0);
  const bullseyesRef = useRef(0);
  const shotsRef = useRef(TOTAL_SHOTS);
  const roundShotsRef = useRef(rounds[0].shots);
  const comboRef = useRef(0);
  const bestShotRef = useRef(0);
  const windRef = useRef((Math.random() - 0.5) * rounds[0].windStrength);
  const roundIndexRef = useRef(0);
  const resolvingRef = useRef(false);
  const pendingRoundAdvanceRef = useRef(false);
  const targetXRef = useRef(TARGET_BASE_X);
  const targetYRef = useRef(250);
  const finishRef = useRef<() => void>(() => undefined);

  const [language, setLanguage] = useState<"mn" | "en">("mn");
  const [score, setScore] = useState(0);
  const [shots, setShots] = useState(TOTAL_SHOTS);
  const [roundShots, setRoundShots] = useState(rounds[0].shots);
  const [power, setPower] = useState(0);
  const [status, setStatus] = useState<"ready" | "charging" | "flying" | "transition" | "result">("ready");
  const [flash, setFlash] = useState("");
  const [resultOpen, setResultOpen] = useState(false);
  const [combo, setCombo] = useState(0);
  const [bestShot, setBestShot] = useState(0);
  const [roundIndex, setRoundIndex] = useState(0);
  const [lastShot, setLastShot] = useState<ShotBreakdown | null>(null);
  const c = gameCopy[language];
  const currentRound = rounds[roundIndex];

  const finishGame = useCallback(() => {
    setStatus("result");
    setResultOpen(true);
    if (typeof window !== "undefined") {
      const previous = Number(window.localStorage.getItem("steppequest-archery-best") || 0);
      if (scoreRef.current > previous) window.localStorage.setItem("steppequest-archery-best", String(scoreRef.current));
    }
  }, []);

  useEffect(() => {
    finishRef.current = finishGame;
  }, [finishGame]);

  const rankText = useMemo(() => {
    if (score >= 900) return language === "mn" ? "Их мэргэн харваач" : "Grand Master Archer";
    if (score >= 700) return language === "mn" ? "Шилдэг харваач" : "Elite Archer";
    if (score >= 480) return language === "mn" ? "Сайн харваач" : "Skilled Archer";
    return language === "mn" ? "Дадлагажигч харваач" : "Apprentice Archer";
  }, [language, score]);

  const resolveShot = useCallback((basePoints: number, hitX: number, hitY: number) => {
    if (resolvingRef.current) return;
    resolvingRef.current = true;

    const activeRound = rounds[roundIndexRef.current];
    const nextCombo = basePoints > 0 ? comboRef.current + 1 : 0;
    comboRef.current = nextCombo;
    setCombo(nextCombo);

    const comboBonus = basePoints > 0 ? Math.max(0, (nextCombo - 1) * 10) : 0;
    const total = Math.round(basePoints * activeRound.scoreMultiplier + comboBonus);

    if (basePoints > 0) {
      scoreRef.current += total;
      setScore(scoreRef.current);
      if (basePoints === 100) bullseyesRef.current += 1;
      bestShotRef.current = Math.max(bestShotRef.current, total);
      setBestShot(bestShotRef.current);
      setLastShot({ base: Math.round(basePoints * activeRound.scoreMultiplier), bonus: comboBonus, total, combo: nextCombo });
      setFlash(basePoints === 100 ? c.bullseye : `${c.hit} +${total}`);
      const particleColor = basePoints === 100 ? "rgba(255,214,113," : "rgba(255,244,209,";
      particlesRef.current = Array.from({ length: 24 }, (_, index) => ({
        x: hitX,
        y: hitY,
        vx: Math.cos((Math.PI * 2 * index) / 24) * (1.5 + Math.random() * 3),
        vy: Math.sin((Math.PI * 2 * index) / 24) * (1.5 + Math.random() * 3),
        life: 1,
        color: particleColor
      }));
    } else {
      setLastShot({ base: 0, bonus: 0, total: 0, combo: 0 });
      setFlash(c.miss);
    }

    shotsRef.current -= 1;
    roundShotsRef.current -= 1;
    setShots(shotsRef.current);
    setRoundShots(roundShotsRef.current);

    if (roundShotsRef.current <= 0 && roundIndexRef.current < rounds.length - 1 && shotsRef.current > 0) {
      pendingRoundAdvanceRef.current = true;
      setStatus("transition");
    }

    window.setTimeout(() => setFlash(""), 950);

    window.setTimeout(() => {
      arrowRef.current = null;
      resolvingRef.current = false;
      powerRef.current = 0;
      setPower(0);

      if (shotsRef.current <= 0) {
        finishRef.current();
        return;
      }

      if (pendingRoundAdvanceRef.current) {
        pendingRoundAdvanceRef.current = false;
        const nextRoundIndex = roundIndexRef.current + 1;
        roundIndexRef.current = nextRoundIndex;
        roundShotsRef.current = rounds[nextRoundIndex].shots;
        windRef.current = (Math.random() - 0.5) * rounds[nextRoundIndex].windStrength;
        setRoundIndex(nextRoundIndex);
        setRoundShots(rounds[nextRoundIndex].shots);
        setStatus("ready");
        setFlash(language === "mn" ? `${rounds[nextRoundIndex].nameMn}` : `${rounds[nextRoundIndex].nameEn}`);
        window.setTimeout(() => setFlash(""), 1150);
        return;
      }

      windRef.current = (Math.random() - 0.5) * activeRound.windStrength;
      setStatus("ready");
    }, 880);
  }, [c.bullseye, c.hit, c.miss, language]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId = 0;
    let previous = performance.now();

    const draw = (now: number) => {
      const dt = Math.min(2, (now - previous) / 16.67);
      previous = now;
      const round = rounds[roundIndexRef.current];

      targetYRef.current = 245 + Math.sin(now / round.moveSpeed) * round.moveAmplitude;
      targetXRef.current = TARGET_BASE_X + Math.cos(now / (round.moveSpeed * 1.7)) * round.horizontalDrift;

      if (chargingRef.current) {
        powerRef.current = Math.min(100, powerRef.current + 1.3 * dt);
        setPower(Math.round(powerRef.current));
      }

      ctx.clearRect(0, 0, W, H);
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, "#a9c9c0");
      sky.addColorStop(0.57, "#e9d2a5");
      sky.addColorStop(1, "#b8874f");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);

      ctx.beginPath();
      ctx.arc(690, 92, 58, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,222,142,.72)";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(690, 92, 82, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,222,142,.12)";
      ctx.fill();

      ctx.fillStyle = "#667b69";
      ctx.beginPath();
      ctx.moveTo(0, 310);
      ctx.lineTo(145, 170);
      ctx.lineTo(265, 290);
      ctx.lineTo(405, 145);
      ctx.lineTo(570, 305);
      ctx.lineTo(760, 185);
      ctx.lineTo(900, 300);
      ctx.lineTo(900, 500);
      ctx.lineTo(0, 500);
      ctx.fill();

      ctx.fillStyle = "#8c744e";
      ctx.beginPath();
      ctx.moveTo(0, 365);
      ctx.quadraticCurveTo(170, 315, 320, 365);
      ctx.quadraticCurveTo(500, 410, 900, 335);
      ctx.lineTo(900, 500);
      ctx.lineTo(0, 500);
      ctx.fill();
      ctx.fillStyle = "#967044";
      ctx.fillRect(0, 415, W, 85);

      ctx.strokeStyle = "rgba(255,255,255,.35)";
      ctx.lineWidth = 2;
      for (let i = 0; i < 5; i += 1) {
        const x = ((now * (0.03 + i * 0.004)) + i * 170) % 1050 - 80;
        const y = 80 + i * 54;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x + 38, y - 8, x + 78, y);
        ctx.stroke();
      }

      const tx = targetXRef.current;
      const ty = targetYRef.current;
      const radii = [70, 55, 40, 25, 12].map((radius) => radius * round.targetScale);
      ctx.strokeStyle = "#4d3728";
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(tx, ty + 66 * round.targetScale);
      ctx.lineTo(tx - 38, 450);
      ctx.moveTo(tx, ty + 66 * round.targetScale);
      ctx.lineTo(tx + 38, 450);
      ctx.stroke();
      ["#efe6cf", "#ba4c36", "#f0cf63", "#325f59", "#8d2f27"].forEach((fill, index) => {
        ctx.beginPath();
        ctx.arc(tx, ty, radii[index], 0, Math.PI * 2);
        ctx.fillStyle = fill;
        ctx.fill();
      });

      const angle = Math.atan2(aimRef.current.y - BOW_Y, aimRef.current.x - BOW_X);
      ctx.save();
      ctx.translate(BOW_X, BOW_Y);
      ctx.rotate(angle);
      ctx.strokeStyle = "#6a321f";
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.arc(0, 0, 54, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
      ctx.strokeStyle = "#efe7d0";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(0, -54);
      ctx.lineTo(-powerRef.current * 0.22, 0);
      ctx.lineTo(0, 54);
      ctx.stroke();
      if (!arrowRef.current) {
        ctx.strokeStyle = "#272521";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-powerRef.current * 0.22 - 8, 0);
        ctx.lineTo(60, 0);
        ctx.stroke();
        ctx.fillStyle = "#272521";
        ctx.beginPath();
        ctx.moveTo(64, 0);
        ctx.lineTo(52, -5);
        ctx.lineTo(52, 5);
        ctx.fill();
      }
      ctx.restore();

      const arrow = arrowRef.current;
      if (arrow?.active) {
        const previousX = arrow.x;
        arrow.vx += windRef.current * dt;
        arrow.vy += 0.16 * dt;
        arrow.x += arrow.vx * dt;
        arrow.y += arrow.vy * dt;
        arrow.angle = Math.atan2(arrow.vy, arrow.vx);

        ctx.save();
        ctx.translate(arrow.x, arrow.y);
        ctx.rotate(arrow.angle);
        ctx.strokeStyle = "#29251f";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-26, 0);
        ctx.lineTo(18, 0);
        ctx.stroke();
        ctx.fillStyle = "#29251f";
        ctx.beginPath();
        ctx.moveTo(24, 0);
        ctx.lineTo(14, -4);
        ctx.lineTo(14, 4);
        ctx.fill();
        ctx.fillStyle = "#8e3f2c";
        ctx.fillRect(-26, -5, 10, 3);
        ctx.fillRect(-26, 2, 10, 3);
        ctx.restore();

        if (previousX < tx && arrow.x >= tx - 4) {
          const distance = Math.abs(arrow.y - ty);
          arrow.active = false;
          const points = distance <= radii[4] ? 100 : distance <= radii[3] ? 70 : distance <= radii[2] ? 45 : distance <= radii[1] ? 25 : distance <= radii[0] ? 10 : 0;
          resolveShot(points, tx, arrow.y);
        } else if (arrow.x > W + 40 || arrow.y > H + 40 || arrow.y < -80) {
          arrow.active = false;
          resolveShot(0, arrow.x, arrow.y);
        }
      }

      particlesRef.current = particlesRef.current.filter((particle) => {
        particle.x += particle.vx * dt;
        particle.y += particle.vy * dt;
        particle.vy += 0.05 * dt;
        particle.life -= 0.025 * dt;
        if (particle.life <= 0) return false;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = `${particle.color}${particle.life})`;
        ctx.fill();
        return true;
      });

      if (!arrowRef.current && status !== "result") {
        ctx.strokeStyle = "rgba(255,255,255,.75)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(aimRef.current.x, aimRef.current.y, 13, 0, Math.PI * 2);
        ctx.moveTo(aimRef.current.x - 20, aimRef.current.y);
        ctx.lineTo(aimRef.current.x + 20, aimRef.current.y);
        ctx.moveTo(aimRef.current.x, aimRef.current.y - 20);
        ctx.lineTo(aimRef.current.x, aimRef.current.y + 20);
        ctx.stroke();
      }

      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animationId);
  }, [resolveShot, status]);

  function pointerPosition(event: React.PointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: ((event.clientX - rect.left) / rect.width) * W, y: ((event.clientY - rect.top) / rect.height) * H };
  }

  function handlePointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
    const point = pointerPosition(event);
    aimRef.current = { x: Math.max(BOW_X + 70, point.x), y: point.y };
  }

  function handlePointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
    if (status !== "ready" || shotsRef.current <= 0 || arrowRef.current) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    aimRef.current = pointerPosition(event);
    chargingRef.current = true;
    powerRef.current = 4;
    setStatus("charging");
  }

  function handlePointerUp(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!chargingRef.current || status !== "charging") return;
    chargingRef.current = false;
    const point = pointerPosition(event);
    aimRef.current = point;
    const angle = Math.atan2(point.y - BOW_Y, point.x - BOW_X);
    const speed = 10.5 + powerRef.current * 0.135;
    arrowRef.current = { x: BOW_X + 46, y: BOW_Y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, angle, active: true };
    setStatus("flying");
  }

  function resetGame() {
    scoreRef.current = 0;
    bullseyesRef.current = 0;
    shotsRef.current = TOTAL_SHOTS;
    roundShotsRef.current = rounds[0].shots;
    comboRef.current = 0;
    bestShotRef.current = 0;
    roundIndexRef.current = 0;
    powerRef.current = 0;
    arrowRef.current = null;
    particlesRef.current = [];
    resolvingRef.current = false;
    pendingRoundAdvanceRef.current = false;
    windRef.current = (Math.random() - 0.5) * rounds[0].windStrength;
    setScore(0);
    setShots(TOTAL_SHOTS);
    setRoundShots(rounds[0].shots);
    setPower(0);
    setStatus("ready");
    setFlash("");
    setResultOpen(false);
    setCombo(0);
    setBestShot(0);
    setRoundIndex(0);
    setLastShot(null);
  }

  const windText = `${windRef.current >= 0 ? "→" : "←"} ${Math.abs(windRef.current * 90).toFixed(1)}`;

  return (
    <main className="gamePage archeryChallengePage">
      <Header language={language} onLanguageChange={() => setLanguage((value) => value === "mn" ? "en" : "mn")} />
      <section className="gameHero archeryHeroEnhanced">
        <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }}>
          <span className="kicker light">{language === "mn" ? "БАЙ ХАРВААНЫ ТОМ СОРИЛ" : "GRAND ARCHERY CHALLENGE"}</span>
          <h1>{c.title}</h1>
          <p>{c.instructions}</p>
        </motion.div>
        <div className="gameStatsBar archeryStatsBar">
          <div><span>{c.round}</span><strong>{roundIndex + 1} / {rounds.length}</strong></div>
          <div><span>{c.arrows}</span><strong>{shots} / {TOTAL_SHOTS}</strong></div>
          <div><span>{c.combo}</span><strong>x{Math.max(1, combo)}</strong></div>
          <div><span>{c.score}</span><strong>{score}</strong></div>
          <div><span>{c.wind}</span><strong>{windText}</strong></div>
        </div>
      </section>

      <section className="archeryRoundPanel">
        <div className="archeryRoundIntro">
          <span>{language === "mn" ? currentRound.nameMn : currentRound.nameEn}</span>
          <h3>{c.roundGoal}</h3>
          <p>{language === "mn" ? currentRound.summaryMn : currentRound.summaryEn}</p>
        </div>
        <div className="archeryMiniStats">
          <div><small>{c.roundShots}</small><strong>{roundShots}</strong></div>
          <div><small>{c.best}</small><strong>{bestShot}</strong></div>
          <div><small>{c.lastShot}</small><strong>{lastShot ? lastShot.total : 0}</strong></div>
        </div>
      </section>

      <section className="canvasShell archeryCanvasShell">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          aria-label="Interactive Mongolian archery game"
        />
        <div className="gameHud archeryHudEnhanced">
          <span>{status === "charging" ? c.charging : status === "flying" ? c.flying : status === "transition" ? c.roundComplete : c.ready}</span>
          <div className="powerMeter"><i style={{ width: `${power}%` }} /></div>
          <strong>{c.power}: {power}%</strong>
        </div>
        <AnimatePresence>
          {flash && <motion.div className="hitFlash" initial={{ opacity: 0, scale: 0.4 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: -30 }}>{flash}</motion.div>}
        </AnimatePresence>
      </section>

      <section className="archeryLowerGrid">
        <div className="archeryInfoCard">
          <span>{c.roundSummary}</span>
          <div className="archerySummaryRows">
            <div><small>{c.score}</small><strong>{score}</strong></div>
            <div><small>{c.totalBullseyes}</small><strong>{bullseyesRef.current}</strong></div>
            <div><small>{c.combo}</small><strong>x{Math.max(1, combo)}</strong></div>
          </div>
          {lastShot ? (
            <div className="lastShotPanel">
              <h4>{c.lastShot}</h4>
              <p>
                {language === "mn"
                  ? `Үндсэн оноо ${lastShot.base}, бонус ${lastShot.bonus}, нийт ${lastShot.total}.`
                  : `Base ${lastShot.base}, bonus ${lastShot.bonus}, total ${lastShot.total}.`}
              </p>
            </div>
          ) : null}
        </div>

        <div className="archeryInfoCard tipsCard">
          <span>{language === "mn" ? "ТАКТИК" : "TACTICS"}</span>
          <ul>
            {c.tips.map((tip) => <li key={tip}>{tip}</li>)}
          </ul>
        </div>
      </section>

      <AnimatePresence>
        {resultOpen && (
          <motion.div className="resultBackdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="resultModal" initial={{ opacity: 0, y: 40, scale: 0.92 }} animate={{ opacity: 1, y: 0, scale: 1 }}>
              <div className="resultBadge">🏹</div>
              <span className="kicker">{c.finalTitle}</span>
              <h2>{score} <small>{language === "mn" ? "ОНОО" : "PTS"}</small></h2>
              <p>{rankText}</p>
              <div className="archeryResultGrid">
                <div><small>{c.totalBullseyes}</small><strong>{bullseyesRef.current}</strong></div>
                <div><small>{c.best}</small><strong>{bestShot}</strong></div>
                <div><small>{c.combo}</small><strong>x{Math.max(1, combo)}</strong></div>
              </div>
              <div className="loginNotice"><p>{language === "mn" ? "Таны шилдэг оноо энэ төхөөрөмж дээр хадгалагдана." : "Your best score is saved on this device."}</p></div>
              <div className="modalActions"><button className="primaryButton" onClick={resetGame}>{c.replay}</button><a className="secondaryButton" href="/">{c.home}</a></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
