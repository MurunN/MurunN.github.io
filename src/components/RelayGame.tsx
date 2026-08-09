"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Header } from "@/components/Header";

type Language = "mn" | "en";
type Lane = -1 | 0 | 1;
type Status = "menu" | "running" | "finished";

type HorseChoice = {
  id: string;
  name: Record<Language, string>;
  summary: Record<Language, string>;
  color: string;
  speed: number;
  jump: number;
  stamina: number;
};

type RoadObject = {
  id: number;
  lane: Lane;
  z: number;
  type: "rock" | "log" | "scroll" | "seal" | "water";
  resolved?: boolean;
};

type StageConfig = {
  title: Record<Language, string>;
  summary: Record<Language, string>;
  endDistance: number;
  scene: "dawn" | "day" | "night";
  scrollGoal: number;
  sealGoal: number;
  waterGoal: number;
};

const W = 1000;
const H = 560;
const HORIZON = 190;
const ROAD_BOTTOM = 550;
const HORSE_Y = 465;

const horses: HorseChoice[] = [
  {
    id: "storm",
    name: { mn: "Шуурган хүлэг", en: "Storm Runner" },
    summary: { mn: "Хамгийн хурдан. Boost хүчтэй ч тэнхээ хурдан зарцуулна.", en: "Fastest ride with strong boost, but stamina drains faster." },
    color: "#8b4f2b",
    speed: 1.08,
    jump: 1,
    stamina: 0.92
  },
  {
    id: "steppe",
    name: { mn: "Талын жороо", en: "Steppe Trotter" },
    summary: { mn: "Хурд, үсрэлт, тэнхээ тэнцвэртэй.", en: "Balanced speed, jump and endurance." },
    color: "#6d573a",
    speed: 1,
    jump: 1.05,
    stamina: 1
  },
  {
    id: "iron",
    name: { mn: "Төмөр туурай", en: "Iron Hoof" },
    summary: { mn: "Тэнхээ хамгийн сайн. Саадыг тайван давна, хурд арай бага.", en: "Best endurance and stable jumps, with slightly lower speed." },
    color: "#4b5b62",
    speed: 0.94,
    jump: 1.12,
    stamina: 1.18
  }
];

const stages: StageConfig[] = [
  {
    title: { mn: "I үе · Үүрийн өртөө", en: "Stage I · Dawn station" },
    summary: { mn: "3 захидал цуглуулж эхний өртөөг дав.", en: "Collect 3 scrolls before the first station." },
    endDistance: 1200,
    scene: "dawn",
    scrollGoal: 3,
    sealGoal: 0,
    waterGoal: 0
  },
  {
    title: { mn: "II үе · Их талын зам", en: "Stage II · Open steppe" },
    summary: { mn: "2 тамга, 1 усны нөөц авч бартаат замыг туул.", en: "Collect 2 seals and 1 water supply through the open steppe." },
    endDistance: 2500,
    scene: "day",
    scrollGoal: 0,
    sealGoal: 2,
    waterGoal: 1
  },
  {
    title: { mn: "III үе · Шөнийн хүргэлт", en: "Stage III · Night delivery" },
    summary: { mn: "Тэнхээгээ хадгалж эцсийн өртөөнд хүр. Хурд нэмэгдэх тусам зам огцом болно.", en: "Preserve stamina and reach the final station as the road becomes faster and darker." },
    endDistance: 3900,
    scene: "night",
    scrollGoal: 0,
    sealGoal: 1,
    waterGoal: 1
  }
];

const copy = {
  mn: {
    kicker: "ИХ ӨРТӨӨНИЙ ЭЛЧ · 2.5D",
    title: "Өртөөнөөс өртөө рүү давх",
    intro: "← → эсвэл A/D-ээр замын мөрөө солино. Space/↑-ээр үсэрнэ. Shift дарвал богино хугацаанд хурд нэмэгдэнэ. Захидал, тамга, усны нөөц цуглуулж даалгавраа биелүүл.",
    choose: "Хүлгээ сонго",
    start: "Элчийн замд гарах",
    lane: "Мөр",
    stamina: "Тэнхээ",
    score: "Оноо",
    distance: "Зам",
    scrolls: "Захидал",
    seals: "Тамга",
    waters: "Ус",
    hits: "Мөргөлт",
    stage: "Үе",
    boost: "Хурд",
    finish: "Хүргэлт дууслаа",
    replay: "Дахин давхих",
    success: "Өртөөний даалгавар биеллээ",
    partial: "Өртөөнд хүрсэн ч даалгавар дутуу",
    rank1: "Их элч",
    rank2: "Шуурхай элч",
    rank3: "Талын элч",
    rank4: "Дадлагажигч"
  },
  en: {
    kicker: "IMPERIAL RELAY COURIER · 2.5D",
    title: "Ride station to station",
    intro: "Use ← → or A/D to change lanes. Space/↑ jumps. Hold Shift for a short speed boost. Collect scrolls, seals and water while completing each relay mission.",
    choose: "Choose your horse",
    start: "Begin the relay run",
    lane: "Lane",
    stamina: "Stamina",
    score: "Score",
    distance: "Distance",
    scrolls: "Scrolls",
    seals: "Seals",
    waters: "Water",
    hits: "Hits",
    stage: "Stage",
    boost: "Boost",
    finish: "Delivery complete",
    replay: "Ride again",
    success: "Station mission cleared",
    partial: "Reached the station, but the mission was incomplete",
    rank1: "Great Messenger",
    rank2: "Swift Messenger",
    rank3: "Steppe Messenger",
    rank4: "Apprentice"
  }
};

function playTone(kind: "pickup" | "hit" | "stage") {
  if (typeof window === "undefined") return;
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return;
  const ctx = new AudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain); gain.connect(ctx.destination);
  const now = ctx.currentTime;
  const config = kind === "pickup" ? [520, 760, .12] : kind === "stage" ? [340, 680, .22] : [130, 76, .1];
  osc.frequency.setValueAtTime(config[0], now);
  osc.frequency.exponentialRampToValueAtTime(config[1], now + config[2]);
  gain.gain.setValueAtTime(.035, now);
  gain.gain.exponentialRampToValueAtTime(.001, now + config[2]);
  osc.start(); osc.stop(now + config[2]);
  osc.onended = () => void ctx.close();
}

function roadProject(lane: Lane, z: number) {
  const depth = Math.max(0, Math.min(1, 1 - z));
  const eased = Math.pow(depth, 1.65);
  const halfRoad = 70 + eased * 430;
  const x = W / 2 + lane * halfRoad * .56;
  const y = HORIZON + 42 + eased * (ROAD_BOTTOM - HORIZON - 62);
  const scale = .22 + eased * 1.1;
  return { x, y, scale, depth };
}

export function RelayGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [language, setLanguage] = useState<Language>("mn");
  const [horse, setHorse] = useState<HorseChoice | null>(null);
  const [status, setStatus] = useState<Status>("menu");
  const [stageIndex, setStageIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [stamina, setStamina] = useState(100);
  const [distance, setDistance] = useState(0);
  const [scrolls, setScrolls] = useState(0);
  const [seals, setSeals] = useState(0);
  const [waters, setWaters] = useState(0);
  const [hits, setHits] = useState(0);
  const [toast, setToast] = useState("");
  const [best, setBest] = useState(0);

  const statusRef = useRef<Status>("menu");
  const horseRef = useRef<HorseChoice>(horses[1]);
  const laneRef = useRef<Lane>(0);
  const targetLaneRef = useRef<Lane>(0);
  const laneVisualRef = useRef(0);
  const jumpYRef = useRef(0);
  const jumpVRef = useRef(0);
  const boostingRef = useRef(false);
  const objectsRef = useRef<RoadObject[]>([]);
  const nextIdRef = useRef(1);
  const lastFrameRef = useRef(0);
  const lastSpawnRef = useRef(0);
  const distanceRef = useRef(0);
  const scoreRef = useRef(0);
  const staminaRef = useRef(100);
  const stageRef = useRef(0);
  const hitsRef = useRef(0);
  const stageScrollRef = useRef(0);
  const stageSealRef = useRef(0);
  const stageWaterRef = useRef(0);
  const totalScrollRef = useRef(0);
  const totalSealRef = useRef(0);
  const totalWaterRef = useRef(0);
  const cameraShakeRef = useRef(0);
  const c = copy[language];
  const currentStage = stages[stageIndex];

  useEffect(() => {
    if (typeof window !== "undefined") setBest(Number(window.localStorage.getItem("steppequest-relay-v2-best") || 0));
  }, []);

  const rank = useMemo(() => {
    if (score >= 3600 && hits <= 2) return c.rank1;
    if (score >= 2400) return c.rank2;
    if (score >= 1300) return c.rank3;
    return c.rank4;
  }, [c, hits, score]);

  const showToast = (text: string) => {
    setToast(text);
    window.setTimeout(() => setToast(""), 800);
  };

  const changeLane = (dir: -1 | 1) => {
    if (statusRef.current !== "running") return;
    const next = Math.max(-1, Math.min(1, targetLaneRef.current + dir)) as Lane;
    targetLaneRef.current = next;
    laneRef.current = next;
  };

  const jump = () => {
    if (statusRef.current !== "running" || jumpYRef.current < -3) return;
    jumpVRef.current = -13.2 * horseRef.current.jump;
  };

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.repeat && ["ArrowLeft", "ArrowRight", "KeyA", "KeyD", "Space", "ArrowUp"].includes(event.code)) return;
      if (event.code === "ArrowLeft" || event.code === "KeyA") { event.preventDefault(); changeLane(-1); }
      if (event.code === "ArrowRight" || event.code === "KeyD") { event.preventDefault(); changeLane(1); }
      if (event.code === "Space" || event.code === "ArrowUp") { event.preventDefault(); jump(); }
      if (event.code === "ShiftLeft" || event.code === "ShiftRight") boostingRef.current = true;
    };
    const up = (event: KeyboardEvent) => {
      if (event.code === "ShiftLeft" || event.code === "ShiftRight") boostingRef.current = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, []);

  const resetGame = (selected: HorseChoice) => {
    horseRef.current = selected;
    setHorse(selected);
    statusRef.current = "running";
    setStatus("running");
    stageRef.current = 0; setStageIndex(0);
    laneRef.current = 0; targetLaneRef.current = 0; laneVisualRef.current = 0;
    jumpYRef.current = 0; jumpVRef.current = 0;
    objectsRef.current = [];
    distanceRef.current = 0; scoreRef.current = 0; staminaRef.current = 100; hitsRef.current = 0;
    stageScrollRef.current = 0; stageSealRef.current = 0; stageWaterRef.current = 0;
    totalScrollRef.current = 0; totalSealRef.current = 0; totalWaterRef.current = 0;
    setDistance(0); setScore(0); setStamina(100); setHits(0); setScrolls(0); setSeals(0); setWaters(0);
    lastSpawnRef.current = performance.now() - 800;
    showToast(language === "mn" ? "Элчийн зам эхэллээ" : "Relay run started");
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;

    const spawn = () => {
      const stage = stages[stageRef.current];
      const roll = Math.random();
      let type: RoadObject["type"];
      if (roll < .38) type = Math.random() > .52 ? "rock" : "log";
      else type = roll < .62 ? "scroll" : roll < .78 ? "seal" : "water";
      // Keep goals reachable per stage by biasing missing mission items.
      if (stage.scrollGoal > stageScrollRef.current && Math.random() < .32) type = "scroll";
      if (stage.sealGoal > stageSealRef.current && Math.random() < .3) type = "seal";
      if (stage.waterGoal > stageWaterRef.current && Math.random() < .25) type = "water";
      const lane = ([-1, 0, 1] as const)[Math.floor(Math.random() * 3)];
      objectsRef.current.push({ id: nextIdRef.current++, lane, z: 1.05, type });
    };

    const completeStage = () => {
      const st = stages[stageRef.current];
      const passed = stageScrollRef.current >= st.scrollGoal && stageSealRef.current >= st.sealGoal && stageWaterRef.current >= st.waterGoal;
      scoreRef.current += passed ? 360 : 120;
      setScore(scoreRef.current);
      showToast(passed ? c.success : c.partial);
      playTone("stage");
      if (stageRef.current >= stages.length - 1) {
        statusRef.current = "finished";
        setStatus("finished");
        const final = Math.max(0, Math.round(scoreRef.current + staminaRef.current * 5 - hitsRef.current * 45));
        scoreRef.current = final;
        setScore(final);
        const prev = Number(window.localStorage.getItem("steppequest-relay-v2-best") || 0);
        if (final > prev) { window.localStorage.setItem("steppequest-relay-v2-best", String(final)); setBest(final); }
      } else {
        stageRef.current += 1;
        setStageIndex(stageRef.current);
        stageScrollRef.current = 0; stageSealRef.current = 0; stageWaterRef.current = 0;
        objectsRef.current = [];
      }
    };

    const resolveObject = (obj: RoadObject) => {
      if (obj.resolved) return;
      obj.resolved = true;
      const jumpingHigh = jumpYRef.current < -48;
      if (obj.type === "rock" || obj.type === "log") {
        if (jumpingHigh) {
          scoreRef.current += 35;
          setScore(scoreRef.current);
          showToast(language === "mn" ? "Саадыг цэвэр давлаа +35" : "Clean jump +35");
        } else {
          hitsRef.current += 1; setHits(hitsRef.current);
          staminaRef.current = Math.max(0, staminaRef.current - 16);
          scoreRef.current = Math.max(0, scoreRef.current - 55);
          setStamina(Math.round(staminaRef.current)); setScore(scoreRef.current);
          cameraShakeRef.current = 14;
          showToast(language === "mn" ? "Саадтай мөргөлдлөө" : "Obstacle hit");
          playTone("hit");
        }
        return;
      }
      if (obj.type === "scroll") {
        stageScrollRef.current += 1; totalScrollRef.current += 1; setScrolls(totalScrollRef.current);
        scoreRef.current += 90; setScore(scoreRef.current); showToast(language === "mn" ? "Захидал авлаа +90" : "Scroll +90"); playTone("pickup");
      }
      if (obj.type === "seal") {
        stageSealRef.current += 1; totalSealRef.current += 1; setSeals(totalSealRef.current);
        scoreRef.current += 130; setScore(scoreRef.current); showToast(language === "mn" ? "Өртөөний тамга +130" : "Relay seal +130"); playTone("pickup");
      }
      if (obj.type === "water") {
        stageWaterRef.current += 1; totalWaterRef.current += 1; setWaters(totalWaterRef.current);
        staminaRef.current = Math.min(100, staminaRef.current + 22); setStamina(Math.round(staminaRef.current));
        scoreRef.current += 55; setScore(scoreRef.current); showToast(language === "mn" ? "Тэнхээ сэргэв" : "Stamina restored"); playTone("pickup");
      }
    };

    const drawHorse = (now: number) => {
      const gallop = Math.sin(now / 70);
      const bob = Math.abs(Math.sin(now / 72)) * 7;
      const x = W / 2 + laneVisualRef.current * 255;
      const y = HORSE_Y + jumpYRef.current - bob;
      const selected = horseRef.current;
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = "rgba(20,20,18,.2)";
      ctx.beginPath(); ctx.ellipse(0, 46 - jumpYRef.current * .08, 92, 14, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = selected.color;
      ctx.beginPath(); ctx.ellipse(0, 0, 68, 31, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(61, -22, 20, 17, -.18, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(44, -38, 13, 28);
      ctx.strokeStyle = "#35251b"; ctx.lineWidth = 7; ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-36, 14); ctx.lineTo(-44 + gallop * 18, 48);
      ctx.moveTo(-10, 17); ctx.lineTo(-12 - gallop * 14, 50);
      ctx.moveTo(18, 16); ctx.lineTo(18 + gallop * 15, 49);
      ctx.moveTo(42, 10); ctx.lineTo(48 - gallop * 18, 45);
      ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-62, -8); ctx.quadraticCurveTo(-91, -32 - gallop * 8, -78, 10); ctx.stroke();
      ctx.fillStyle = "#1d302a";
      ctx.beginPath(); ctx.arc(-1, -72, 11, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(-12, -62, 23, 37);
      ctx.strokeStyle = "#1d302a"; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(-8, -47); ctx.lineTo(-22, -18); ctx.moveTo(8, -47); ctx.lineTo(29, -22); ctx.stroke();
      ctx.restore();
    };

    const drawObject = (obj: RoadObject) => {
      const p = roadProject(obj.lane, obj.z);
      if (p.depth <= .02) return;
      const s = p.scale;
      ctx.save(); ctx.translate(p.x, p.y);
      if (obj.type === "rock") {
        ctx.fillStyle = "#55483d"; ctx.beginPath(); ctx.moveTo(-25*s, 20*s); ctx.lineTo(-13*s, -16*s); ctx.lineTo(8*s, -26*s); ctx.lineTo(30*s, 20*s); ctx.closePath(); ctx.fill();
      } else if (obj.type === "log") {
        ctx.fillStyle = "#714b2b"; ctx.fillRect(-34*s, -12*s, 68*s, 24*s); ctx.fillStyle = "#9b6a42"; ctx.beginPath(); ctx.arc(-34*s, 0, 12*s, 0, Math.PI*2); ctx.fill();
      } else if (obj.type === "scroll") {
        ctx.fillStyle = "#f3e4c5"; ctx.fillRect(-18*s, -13*s, 36*s, 26*s); ctx.strokeStyle = "#8b6742"; ctx.lineWidth = 2*s; ctx.strokeRect(-18*s,-13*s,36*s,26*s);
      } else if (obj.type === "seal") {
        ctx.fillStyle = "#b34f35"; ctx.beginPath(); ctx.arc(0,0,19*s,0,Math.PI*2); ctx.fill(); ctx.fillStyle="#ffe3b0"; ctx.font=`bold ${14*s}px Georgia`; ctx.textAlign="center"; ctx.fillText("ᠮ",0,5*s);
      } else {
        ctx.fillStyle="#67a3c8"; ctx.fillRect(-11*s,-17*s,22*s,34*s); ctx.fillStyle="#d8efff"; ctx.fillRect(-6*s,-22*s,12*s,8*s);
      }
      ctx.restore();
    };

    const draw = (now: number) => {
      const dt = Math.min(32, lastFrameRef.current ? now - lastFrameRef.current : 16.67);
      lastFrameRef.current = now;
      const running = statusRef.current === "running";
      const selected = horseRef.current;
      const stage = stages[stageRef.current];

      if (running) {
        laneVisualRef.current += (targetLaneRef.current - laneVisualRef.current) * Math.min(1, dt * .012);
        jumpVRef.current += .68 * (dt / 16.67);
        jumpYRef.current += jumpVRef.current * (dt / 16.67);
        if (jumpYRef.current > 0) { jumpYRef.current = 0; jumpVRef.current = 0; }

        const boosting = boostingRef.current && staminaRef.current > 6;
        const baseSpeed = (7.3 + stageRef.current * .65) * selected.speed;
        const speed = baseSpeed * (boosting ? 1.32 : 1);
        distanceRef.current += speed * dt * .052;
        setDistance(Math.round(distanceRef.current));

        staminaRef.current = Math.max(0, staminaRef.current - dt * (boosting ? .018 : .0045) / selected.stamina);
        if (!boosting && Math.random() < .05) staminaRef.current = Math.min(100, staminaRef.current + dt * .002);
        setStamina(Math.round(staminaRef.current));

        const spawnEvery = Math.max(620, 1040 - stageRef.current * 130 - (boosting ? 110 : 0));
        if (now - lastSpawnRef.current > spawnEvery) { lastSpawnRef.current = now; spawn(); }

        const zSpeed = .00019 * speed * (dt / 16.67);
        objectsRef.current.forEach((obj) => { obj.z -= zSpeed; });
        for (const obj of objectsRef.current) {
          if (!obj.resolved && obj.z < .085 && obj.z > -.02 && Math.abs(obj.lane - laneRef.current) < .1) resolveObject(obj);
        }
        objectsRef.current = objectsRef.current.filter((obj) => obj.z > -.12 && !obj.resolved);

        scoreRef.current += dt * .006 * (boosting ? 1.3 : 1);
        setScore(Math.round(scoreRef.current));

        if (staminaRef.current <= 0) { statusRef.current = "finished"; setStatus("finished"); }
        else if (distanceRef.current >= stage.endDistance) completeStage();
      }

      cameraShakeRef.current *= .84;
      const shakeX = Math.sin(now / 25) * cameraShakeRef.current;
      const shakeY = Math.cos(now / 33) * cameraShakeRef.current * .45;
      ctx.save(); ctx.translate(shakeX, shakeY);
      ctx.clearRect(-30,-30,W+60,H+60);

      const scene = stage.scene;
      const sky = ctx.createLinearGradient(0,0,0,H);
      if (scene === "dawn") { sky.addColorStop(0,"#7fa8b1"); sky.addColorStop(.55,"#e7b77f"); sky.addColorStop(1,"#c17d4c"); }
      if (scene === "day") { sky.addColorStop(0,"#79afc2"); sky.addColorStop(.55,"#d7d6ae"); sky.addColorStop(1,"#9e8353"); }
      if (scene === "night") { sky.addColorStop(0,"#172b46"); sky.addColorStop(.58,"#43566c"); sky.addColorStop(1,"#564733"); }
      ctx.fillStyle=sky; ctx.fillRect(0,0,W,H);

      ctx.fillStyle = scene === "night" ? "rgba(244,237,203,.75)" : "rgba(255,223,149,.78)";
      ctx.beginPath(); ctx.arc(820, scene === "night" ? 86 : 104, scene === "night" ? 35 : 52, 0, Math.PI*2); ctx.fill();

      const para = now * .012;
      ctx.fillStyle = scene === "night" ? "#263a48" : "#66796d";
      ctx.beginPath(); ctx.moveTo(0,310);
      for(let i=0;i<11;i++){ const x=i*120-(para%120); const y=228+Math.sin(i*1.4)*55; ctx.lineTo(x,y); }
      ctx.lineTo(W,H); ctx.lineTo(0,H); ctx.fill();

      ctx.fillStyle = scene === "night" ? "#3c4138" : "#8d744c"; ctx.fillRect(0,HORIZON+72,W,H-HORIZON-72);
      const road = ctx.createLinearGradient(0,HORIZON,0,H);
      road.addColorStop(0, scene === "night" ? "#44423a" : "#8a704d"); road.addColorStop(1, scene === "night" ? "#252a29" : "#5c4b3a");
      ctx.fillStyle=road; ctx.beginPath(); ctx.moveTo(W/2-68,HORIZON+42); ctx.lineTo(W/2+68,HORIZON+42); ctx.lineTo(W,H); ctx.lineTo(0,H); ctx.closePath(); ctx.fill();

      ctx.strokeStyle="rgba(255,245,216,.35)"; ctx.lineWidth=2;
      [-.33,.33].forEach((f)=>{ ctx.beginPath(); ctx.moveTo(W/2+f*120,HORIZON+42); ctx.lineTo(W/2+f*930,H); ctx.stroke(); });
      for(let i=0;i<13;i++){
        const ph=((i/13)+(now*.00024))%1; const y=HORIZON+42+Math.pow(ph,1.7)*(H-HORIZON-42); const half=72+Math.pow(ph,1.5)*430;
        ctx.strokeStyle="rgba(255,244,215,.12)"; ctx.beginPath(); ctx.moveTo(W/2-half,y); ctx.lineTo(W/2+half,y); ctx.stroke();
      }

      // distant ger silhouettes
      for(let i=0;i<5;i++){
        const x=120+i*230-((distanceRef.current*.12)%230); const y=286+(i%2)*15; ctx.fillStyle=scene==="night"?"rgba(235,225,200,.18)":"rgba(246,236,205,.24)";
        ctx.beginPath(); ctx.ellipse(x,y,28,11,0,Math.PI,0); ctx.fill(); ctx.fillRect(x-28,y,56,17);
      }

      [...objectsRef.current].sort((a,b)=>b.z-a.z).forEach(drawObject);
      drawHorse(now);

      if (boostingRef.current && running) {
        ctx.strokeStyle="rgba(255,244,219,.4)"; ctx.lineWidth=3;
        for(let i=0;i<7;i++){ const y=335+i*27; ctx.beginPath(); ctx.moveTo(55,y); ctx.lineTo(220+i*25,y+8); ctx.stroke(); ctx.beginPath(); ctx.moveTo(W-55,y); ctx.lineTo(W-220-i*25,y+8); ctx.stroke(); }
      }

      ctx.restore();
      raf=requestAnimationFrame(draw);
    };
    raf=requestAnimationFrame(draw);
    return()=>cancelAnimationFrame(raf);
  }, [c.partial, c.success, language]);

  const missionStatus = `${stageScrollRef.current}/${currentStage.scrollGoal || 0} · ${stageSealRef.current}/${currentStage.sealGoal || 0} · ${stageWaterRef.current}/${currentStage.waterGoal || 0}`;

  return (
    <main className="gamePage relayV2Page">
      <Header language={language} onLanguageChange={() => setLanguage((v)=>v==="mn"?"en":"mn")} />
      <section className="gameHero relayV2Hero">
        <motion.div initial={{opacity:0,y:22}} animate={{opacity:1,y:0}}>
          <span className="kicker light">{c.kicker}</span>
          <h1>{c.title}</h1>
          <p>{c.intro}</p>
        </motion.div>
        <div className="gameStatsBar relayV2Stats">
          <div><span>{c.stage}</span><strong>{stageIndex+1}/{stages.length}</strong></div>
          <div><span>{c.distance}</span><strong>{distance} м</strong></div>
          <div><span>{c.score}</span><strong>{score}</strong></div>
          <div><span>{c.stamina}</span><strong>{stamina}%</strong></div>
          <div><span>{language==="mn"?"Шилдэг":"Best"}</span><strong>{best}</strong></div>
        </div>
      </section>

      {status === "menu" ? (
        <section className="horseSelectV2">
          <div className="sectionHeading"><div><span className="kicker">{c.choose}</span><h2>{language==="mn"?"Ямар хүлгээр өртөөний замд гарах вэ?":"Choose your relay horse"}</h2></div><p>{language==="mn"?"Хүлэг бүр хурд, үсрэлт, тэнхээгээрээ ялгаатай.":"Each horse changes speed, jump and endurance."}</p></div>
          <div className="horseChoiceV2Grid">
            {horses.map((item)=><motion.button key={item.id} whileHover={{y:-7}} className="horseChoiceV2" onClick={()=>resetGame(item)}>
              <div className="horse3DPreview" style={{["--horse" as string]:item.color}}><span>♞</span></div>
              <h3>{item.name[language]}</h3><p>{item.summary[language]}</p><strong>{c.start} →</strong>
            </motion.button>)}
          </div>
        </section>
      ) : (
        <>
          <section className="relayMissionStrip">
            <div><span>{currentStage.title[language]}</span><p>{currentStage.summary[language]}</p></div>
            <div className="relayMissionMini"><small>{language==="mn"?"ҮЕИЙН ЗОРИЛТ":"STAGE GOAL"}</small><strong>✉ {stageScrollRef.current}/{currentStage.scrollGoal} · ◉ {stageSealRef.current}/{currentStage.sealGoal} · ◇ {stageWaterRef.current}/{currentStage.waterGoal}</strong></div>
          </section>
          <section className="canvasShell relayPerspectiveShell">
            <canvas ref={canvasRef} width={W} height={H} onPointerDown={(e)=>{ const r=e.currentTarget.getBoundingClientRect(); const x=e.clientX-r.left; if(x<r.width*.33) changeLane(-1); else if(x>r.width*.67) changeLane(1); else jump(); }} aria-label="2.5D relay courier game" />
            <div className="relayControlOverlay"><span>← A</span><strong>{language==="mn"?"мөр солих · голд дарвал үсрэх · Shift = хурд":"change lane · tap center to jump · Shift = boost"}</strong><span>D →</span></div>
            <AnimatePresence>{toast?<motion.div className="hitFlash relayToast" initial={{opacity:0,scale:.7}} animate={{opacity:1,scale:1}} exit={{opacity:0}}>{toast}</motion.div>:null}</AnimatePresence>
          </section>
          <section className="relayCollectionBar">
            <div><small>{c.scrolls}</small><strong>✉ {scrolls}</strong></div><div><small>{c.seals}</small><strong>◉ {seals}</strong></div><div><small>{c.waters}</small><strong>◇ {waters}</strong></div><div><small>{c.hits}</small><strong>{hits}</strong></div><div><small>{c.lane}</small><strong>{laneRef.current===-1?"←":laneRef.current===1?"→":"•"}</strong></div>
          </section>
        </>
      )}

      <AnimatePresence>
        {status==="finished"?<motion.div className="resultBackdrop" initial={{opacity:0}} animate={{opacity:1}}><motion.div className="resultModal relayV2Result" initial={{opacity:0,y:30,scale:.94}} animate={{opacity:1,y:0,scale:1}}>
          <div className="resultBadge">🐎</div><span className="kicker">{c.finish}</span><h2>{score} <small>PTS</small></h2><p>{rank}</p>
          <div className="archeryResultGrid"><div><small>{c.scrolls}</small><strong>{scrolls}</strong></div><div><small>{c.seals}</small><strong>{seals}</strong></div><div><small>{c.hits}</small><strong>{hits}</strong></div></div>
          <div className="modalActions"><button className="primaryButton" onClick={()=>resetGame(horse??horses[1])}>{c.replay}</button><a className="secondaryButton" href="/">{language==="mn"?"Нүүр":"Home"}</a></div>
        </motion.div></motion.div>:null}
      </AnimatePresence>
    </main>
  );
}
