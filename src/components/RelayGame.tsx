"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Header } from "@/components/Header";

type Language = "mn" | "en";

type HorseChoice = {
  id: string;
  icon: string;
  color: string;
  name: Record<Language, string>;
  summary: Record<Language, string>;
  speedBonus: number;
  jumpBonus: number;
  staminaBonus: number;
};

type SpawnedObject = {
  id: number;
  type: "rock" | "log" | "scroll" | "water" | "seal" | "station";
  x: number;
  y: number;
  w: number;
  h: number;
  collected?: boolean;
};

type Mission = {
  title: Record<Language, string>;
  summary: Record<Language, string>;
  targetDistance: number;
  needScrolls: number;
  needSeals: number;
  needWater: number;
  avoidHitsUnder: number;
};

const W = 960;
const H = 420;
const GROUND = 316;
const HORSE_X = 160;

const horses: HorseChoice[] = [
  {
    id: "storm",
    icon: "🐎",
    color: "#9b5b36",
    name: { mn: "Шуурган хүлэг", en: "Storm Runner" },
    summary: { mn: "Хурдтай, огцом үсрэлттэй. Гэхдээ тэнхээ арай хурдан буурна.", en: "Fast and agile, but stamina drops a little faster." },
    speedBonus: 0.4,
    jumpBonus: 1.2,
    staminaBonus: -4
  },
  {
    id: "steppe",
    icon: "🏇",
    color: "#6c7d51",
    name: { mn: "Талын жороо", en: "Steppe Trotter" },
    summary: { mn: "Тэнцвэртэй сонголт. Дундаж хурд, найдвартай тэнхээтэй.", en: "A balanced choice with steady pace and dependable endurance." },
    speedBonus: 0,
    jumpBonus: 0,
    staminaBonus: 6
  },
  {
    id: "iron",
    icon: "♞",
    color: "#355c75",
    name: { mn: "Төмөр туурай", en: "Iron Hoof" },
    summary: { mn: "Саадыг сайн давах ба тэнхээ өндөр. Харин хурд арай тайван.", en: "Very durable and strong over obstacles, though a little slower." },
    speedBonus: -0.35,
    jumpBonus: -0.4,
    staminaBonus: 12
  }
];

const missions: Mission[] = [
  {
    title: { mn: "I үе · Захианы эхлэл", en: "Stage I · Opening run" },
    summary: { mn: "Эхний өртөөнд хүрэхээсээ өмнө зам дагуух 3 захидлыг цуглуулж, саадтай мөргөлдөхөөс зайлсхий.", en: "Before reaching the first station, collect 3 message scrolls and avoid unnecessary collisions." },
    targetDistance: 1100,
    needScrolls: 3,
    needSeals: 0,
    needWater: 0,
    avoidHitsUnder: 4
  },
  {
    title: { mn: "II үе · Элчийн зам", en: "Stage II · Courier road" },
    summary: { mn: "Өртөөний тамгыг 2-ыг авч, усны сав дор хаяж 1-г цуглуулаад саадыг ухаалгаар дав.", en: "Collect 2 relay seals, pick up at least 1 water flask and keep the run under control." },
    targetDistance: 2400,
    needScrolls: 3,
    needSeals: 2,
    needWater: 1,
    avoidHitsUnder: 6
  },
  {
    title: { mn: "III үе · Эцсийн хүргэлт", en: "Stage III · Final delivery" },
    summary: { mn: "Сүүлийн өртөө хүртэл давхиж, тэнхээгээ 20-иос дээш хадгалан барианд ор.", en: "Reach the final station while keeping your stamina above 20." },
    targetDistance: 3600,
    needScrolls: 3,
    needSeals: 2,
    needWater: 1,
    avoidHitsUnder: 9
  }
];

export function RelayGame() {
  const [language, setLanguage] = useState<Language>("mn");
  const [horse, setHorse] = useState<HorseChoice | null>(null);
  const [status, setStatus] = useState<"menu" | "running" | "finished">("menu");
  const [stageIndex, setStageIndex] = useState(0);
  const [distance, setDistance] = useState(0);
  const [score, setScore] = useState(0);
  const [stamina, setStamina] = useState(78);
  const [scrolls, setScrolls] = useState(0);
  const [seals, setSeals] = useState(0);
  const [waters, setWaters] = useState(0);
  const [hits, setHits] = useState(0);
  const [best, setBest] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [resultText, setResultText] = useState<string>("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const horseYRef = useRef(0);
  const horseVYRef = useRef(0);
  const runningRef = useRef(false);
  const speedRef = useRef(5.6);
  const frameRef = useRef(0);
  const distanceRef = useRef(0);
  const staminaRef = useRef(78);
  const scoreRef = useRef(0);
  const objectsRef = useRef<SpawnedObject[]>([]);
  const scrollsRef = useRef(0);
  const sealsRef = useRef(0);
  const watersRef = useRef(0);
  const hitsRef = useRef(0);
  const stageRef = useRef(0);
  const spawnTimerRef = useRef(0);
  const nextIdRef = useRef(1);
  const stationSpawnedRef = useRef(false);
  const finishRequestedRef = useRef(false);
  const lastTimeRef = useRef(0);

  const c = language === "mn"
    ? {
        eyebrow: "ӨРТӨӨНИЙ ДАВХИЛТ",
        title: "Морин элчийн бодит мини тоглоом",
        intro: "Одоо зөвхөн сонголт дарах биш — морьтой давхиж, саад давж, захидал цуглуулж, өртөөнд цагтаа хүрэх хэрэгтэй. Space товч эсвэл дэлгэц дээр дарж үсрэнэ.",
        chooseHorse: "Хүлгээ сонго",
        start: "Тоглоом эхлүүлэх",
        restart: "Дахин тоглох",
        home: "Нүүр",
        stage: "Үе",
        stamina: "Тэнхээ",
        score: "Оноо",
        distance: "Зам",
        task: "Даалгавар",
        controls: "Удирдлага",
        controlsText: "Space / ↑ / click = үсрэх",
        collect: "Цуглуулсан",
        avoid: "Мөргөлдсөн",
        best: "Шилдэг оноо",
        result: "Хүргэлт дууслаа",
        missionDone: "Өртөөнд амжилттай хүрлээ!",
        save: "Шилдэг оноо энэ browser дээр хадгалагдана.",
        playHint: "Үсрээд саадыг дав, захидал ба тамгыг цуглуул.",
        rank1: "Их элч",
        rank2: "Чадварлаг элч",
        rank3: "Дадлагажигч элч"
      }
    : {
        eyebrow: "RELAY RUN",
        title: "A real horse courier mini-game",
        intro: "This is no longer just a text choice game — ride, jump, collect messages and reach the stations on time. Press Space or tap/click to jump.",
        chooseHorse: "Choose your horse",
        start: "Start game",
        restart: "Play again",
        home: "Home",
        stage: "Stage",
        stamina: "Stamina",
        score: "Score",
        distance: "Distance",
        task: "Mission",
        controls: "Controls",
        controlsText: "Space / ↑ / click = jump",
        collect: "Collected",
        avoid: "Hits",
        best: "Best score",
        result: "Delivery complete",
        missionDone: "Station reached successfully!",
        save: "Your best score is stored in this browser.",
        playHint: "Jump over obstacles and collect messages and relay seals.",
        rank1: "Great Messenger",
        rank2: "Skilled Messenger",
        rank3: "Apprentice Messenger"
      };

  const currentMission = missions[stageIndex];
  const rank = useMemo(() => {
    if (score >= 850 && stamina >= 30) return c.rank1;
    if (score >= 520) return c.rank2;
    return c.rank3;
  }, [c.rank1, c.rank2, c.rank3, score, stamina]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBest(Number(window.localStorage.getItem("steppequest-runner-best") || 0));
    }
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.code === "Space" || event.code === "ArrowUp") && status === "running") {
        event.preventDefault();
        jump();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [status]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || status !== "running") return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    runningRef.current = true;
    lastTimeRef.current = performance.now();

    const spawnObject = () => {
      const mission = missions[stageRef.current];
      if (!stationSpawnedRef.current && distanceRef.current >= mission.targetDistance - 180) {
        objectsRef.current.push({ id: nextIdRef.current++, type: "station", x: W + 40, y: GROUND - 100, w: 90, h: 100 });
        stationSpawnedRef.current = true;
        return;
      }
      const roll = Math.random();
      if (roll < 0.42) {
        const type = Math.random() > 0.5 ? "rock" : "log";
        objectsRef.current.push({ id: nextIdRef.current++, type, x: W + 20, y: GROUND - (type === "rock" ? 34 : 28), w: type === "rock" ? 40 : 55, h: type === "rock" ? 34 : 28 });
      } else {
        const type = roll < 0.64 ? "scroll" : roll < 0.82 ? "water" : "seal";
        const y = type === "water" ? GROUND - 52 : type === "scroll" ? GROUND - 122 : GROUND - 90;
        objectsRef.current.push({ id: nextIdRef.current++, type, x: W + 20, y, w: 34, h: 34 });
      }
    };

    const endGame = () => {
      if (finishRequestedRef.current) return;
      finishRequestedRef.current = true;
      runningRef.current = false;
      setStatus("finished");
      const finalScore = Math.max(0, Math.round(scoreRef.current + staminaRef.current * 2 - hitsRef.current * 18));
      setScore(finalScore);
      let message = language === "mn"
        ? `Та ${scrollsRef.current} захидал, ${sealsRef.current} тамга, ${watersRef.current} усны нөөц цуглуулж, ${hitsRef.current} удаа мөргөлдлөө.`
        : `You collected ${scrollsRef.current} scrolls, ${sealsRef.current} seals, ${watersRef.current} water flasks and hit ${hitsRef.current} obstacles.`;
      if (staminaRef.current < 20) {
        message += language === "mn" ? " Эцсийн шатанд тэнхээ бага байсан тул оноо буурлаа." : " Stamina was too low at the finish, so the final score was reduced.";
      }
      setResultText(message);
      if (typeof window !== "undefined") {
        const previous = Number(window.localStorage.getItem("steppequest-runner-best") || 0);
        if (finalScore > previous) {
          window.localStorage.setItem("steppequest-runner-best", String(finalScore));
          setBest(finalScore);
        }
      }
    };

    const tick = (time: number) => {
      if (!runningRef.current) return;
      const dt = Math.min(2, (time - lastTimeRef.current) / 16.67);
      lastTimeRef.current = time;

      const horse = horse ?? horses[1];
      const speed = Math.max(5, 5.7 + horse.speedBonus + stageRef.current * 0.55);
      speedRef.current = speed;

      horseVYRef.current += 0.62 * dt;
      horseYRef.current += horseVYRef.current * dt;
      if (horseYRef.current > 0) {
        horseYRef.current = 0;
        horseVYRef.current = 0;
      }

      distanceRef.current += speed * dt;
      setDistance(Math.round(distanceRef.current));
      staminaRef.current = Math.max(0, staminaRef.current - (0.022 + stageRef.current * 0.003) * dt);
      setStamina(Math.round(staminaRef.current));

      spawnTimerRef.current += dt;
      if (spawnTimerRef.current > 34 - stageRef.current * 4) {
        spawnTimerRef.current = 0;
        spawnObject();
      }

      objectsRef.current.forEach((obj) => {
        obj.x -= speed * 4.4 * dt;
      });

      const horseBox = { x: HORSE_X - 28, y: GROUND - 68 + horseYRef.current, w: 88, h: 56 };
      objectsRef.current = objectsRef.current.filter((obj) => {
        if (obj.x + obj.w < -40) return false;
        const hit = horseBox.x < obj.x + obj.w && horseBox.x + horseBox.w > obj.x && horseBox.y < obj.y + obj.h && horseBox.y + horseBox.h > obj.y;
        if (!hit || obj.collected) return true;

        if (obj.type === "rock" || obj.type === "log") {
          obj.collected = true;
          hitsRef.current += 1;
          setHits(hitsRef.current);
          staminaRef.current = Math.max(0, staminaRef.current - 12);
          scoreRef.current = Math.max(0, scoreRef.current - 20);
          setScore(Math.round(scoreRef.current));
          setToast(language === "mn" ? "Саадтай мөргөлдлөө" : "You hit an obstacle");
          return false;
        }
        if (obj.type === "scroll") {
          obj.collected = true;
          scrollsRef.current += 1;
          setScrolls(scrollsRef.current);
          scoreRef.current += 35;
          setScore(Math.round(scoreRef.current));
          setToast(language === "mn" ? "Захидал цуглууллаа" : "Message collected");
          return false;
        }
        if (obj.type === "seal") {
          obj.collected = true;
          sealsRef.current += 1;
          setSeals(sealsRef.current);
          scoreRef.current += 55;
          setScore(Math.round(scoreRef.current));
          setToast(language === "mn" ? "Өртөөний тамга авлаа" : "Relay seal collected");
          return false;
        }
        if (obj.type === "water") {
          obj.collected = true;
          watersRef.current += 1;
          setWaters(watersRef.current);
          staminaRef.current = Math.min(100, staminaRef.current + 12);
          setStamina(Math.round(staminaRef.current));
          scoreRef.current += 18;
          setScore(Math.round(scoreRef.current));
          setToast(language === "mn" ? "Тэнхээ сэргээлээ" : "Stamina restored");
          return false;
        }
        if (obj.type === "station") {
          obj.collected = true;
          const mission = missions[stageRef.current];
          const passed = scrollsRef.current >= mission.needScrolls && sealsRef.current >= mission.needSeals && watersRef.current >= mission.needWater && hitsRef.current < mission.avoidHitsUnder;
          scoreRef.current += passed ? 120 : 45;
          setScore(Math.round(scoreRef.current));
          setToast(passed ? (language === "mn" ? "Өртөө амжилттай давлаа" : "Station cleared") : (language === "mn" ? "Өртөөнд хүрсэн ч даалгавар дутуу байна" : "Reached station, but mission is incomplete"));
          if (stageRef.current >= missions.length - 1) {
            endGame();
            return false;
          }
          stageRef.current += 1;
          setStageIndex(stageRef.current);
          stationSpawnedRef.current = false;
          return false;
        }
        return true;
      });

      if (staminaRef.current <= 0) {
        endGame();
        return;
      }

      ctx.clearRect(0, 0, W, H);
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, "#aec8c1");
      sky.addColorStop(0.55, "#e6d3ab");
      sky.addColorStop(1, "#c18a54");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);

      // sun
      ctx.fillStyle = "rgba(247,222,150,.82)";
      ctx.beginPath();
      ctx.arc(780, 88, 46, 0, Math.PI * 2);
      ctx.fill();

      // mountains
      ctx.fillStyle = "#6b7968";
      ctx.beginPath();
      ctx.moveTo(0, 275);
      ctx.lineTo(160, 170);
      ctx.lineTo(320, 248);
      ctx.lineTo(472, 148);
      ctx.lineTo(640, 252);
      ctx.lineTo(810, 132);
      ctx.lineTo(960, 230);
      ctx.lineTo(960, 420);
      ctx.lineTo(0, 420);
      ctx.fill();

      // moving ground
      ctx.fillStyle = "#8a6642";
      ctx.fillRect(0, GROUND, W, H - GROUND);
      ctx.fillStyle = "#a57b4d";
      for (let i = 0; i < 22; i += 1) {
        const x = ((i * 60) - ((distanceRef.current * 2) % 60));
        ctx.fillRect(x, GROUND + 44, 30, 4);
      }

      // stations tents in background
      for (let i = 0; i < 3; i += 1) {
        const bx = 220 + i * 220 - ((distanceRef.current * 0.45) % 220);
        ctx.fillStyle = "rgba(79,51,34,.25)";
        ctx.beginPath();
        ctx.moveTo(bx, GROUND - 72);
        ctx.lineTo(bx + 36, GROUND - 114);
        ctx.lineTo(bx + 72, GROUND - 72);
        ctx.closePath();
        ctx.fill();
      }

      // horse
      const hx = HORSE_X;
      const hy = GROUND - 32 + horseYRef.current;
      ctx.fillStyle = horse.color;
      ctx.fillRect(hx - 18, hy - 26, 62, 26);
      ctx.beginPath();
      ctx.arc(hx + 50, hy - 22, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(hx + 38, hy - 34, 8, 22); // neck
      ctx.fillRect(hx - 8, hy, 8, 32);
      ctx.fillRect(hx + 12, hy, 8, 32);
      ctx.fillRect(hx + 28, hy, 8, 32);
      ctx.fillRect(hx + 46, hy, 8, 32);
      ctx.strokeStyle = "#3c2619";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(hx - 18, hy - 16);
      ctx.quadraticCurveTo(hx - 34, hy - 34, hx - 36, hy - 6);
      ctx.stroke(); // tail

      // rider
      ctx.fillStyle = "#1f2e2a";
      ctx.beginPath();
      ctx.arc(hx + 18, hy - 46, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(hx + 10, hy - 38, 16, 24);
      ctx.strokeStyle = "#1f2e2a";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(hx + 6, hy - 24);
      ctx.lineTo(hx - 8, hy - 8);
      ctx.moveTo(hx + 26, hy - 24);
      ctx.lineTo(hx + 42, hy - 6);
      ctx.stroke();

      objectsRef.current.forEach((obj) => {
        if (obj.type === "rock") {
          ctx.fillStyle = "#4c4237";
          ctx.beginPath();
          ctx.moveTo(obj.x, obj.y + obj.h);
          ctx.lineTo(obj.x + 10, obj.y + 8);
          ctx.lineTo(obj.x + 28, obj.y);
          ctx.lineTo(obj.x + obj.w, obj.y + obj.h);
          ctx.closePath();
          ctx.fill();
        } else if (obj.type === "log") {
          ctx.fillStyle = "#714d2e";
          ctx.fillRect(obj.x, obj.y + 8, obj.w, obj.h - 8);
        } else if (obj.type === "scroll") {
          ctx.fillStyle = "#f7edd4";
          ctx.fillRect(obj.x, obj.y, 24, 18);
          ctx.strokeStyle = "#a17a4c";
          ctx.lineWidth = 2;
          ctx.strokeRect(obj.x, obj.y, 24, 18);
          ctx.fillStyle = "#a17a4c";
          ctx.fillRect(obj.x + 4, obj.y + 5, 16, 2);
        } else if (obj.type === "seal") {
          ctx.fillStyle = "#b85a3b";
          ctx.beginPath();
          ctx.arc(obj.x + 14, obj.y + 14, 14, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#f8e2bd";
          ctx.font = "bold 12px Georgia";
          ctx.fillText("ᠮ", obj.x + 9, obj.y + 18);
        } else if (obj.type === "water") {
          ctx.fillStyle = "#6aa1c9";
          ctx.fillRect(obj.x + 8, obj.y + 4, 16, 24);
          ctx.fillRect(obj.x + 12, obj.y, 8, 8);
        } else if (obj.type === "station") {
          ctx.fillStyle = "#f3ebd4";
          ctx.fillRect(obj.x + 10, obj.y + 36, 72, 52);
          ctx.fillStyle = "#805336";
          ctx.beginPath();
          ctx.moveTo(obj.x, obj.y + 38);
          ctx.lineTo(obj.x + 45, obj.y);
          ctx.lineTo(obj.x + 90, obj.y + 38);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = "#2c463d";
          ctx.fillRect(obj.x + 24, obj.y + 44, 12, 24);
          ctx.fillRect(obj.x + 54, obj.y + 44, 12, 24);
        }
      });

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      runningRef.current = false;
      cancelAnimationFrame(frameRef.current);
    };
  }, [horse, language, status]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 900);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function jump() {
    const jumpPower = horse?.jumpBonus ?? 0;
    if (horseYRef.current >= -1) {
      horseVYRef.current = -12.8 - jumpPower;
    }
  }

  function startGame() {
    const selected = horse ?? horses[1];
    setHorse(selected);
    const initialStamina = 78 + selected.staminaBonus;
    setStatus("running");
    setStageIndex(0);
    setDistance(0);
    setScore(0);
    setStamina(initialStamina);
    setScrolls(0);
    setSeals(0);
    setWaters(0);
    setHits(0);
    setToast(null);
    setResultText("");

    horseYRef.current = 0;
    horseVYRef.current = 0;
    distanceRef.current = 0;
    staminaRef.current = initialStamina;
    scoreRef.current = 0;
    scrollsRef.current = 0;
    sealsRef.current = 0;
    watersRef.current = 0;
    hitsRef.current = 0;
    stageRef.current = 0;
    spawnTimerRef.current = 0;
    stationSpawnedRef.current = false;
    objectsRef.current = [];
    finishRequestedRef.current = false;
  }

  function resetAll() {
    setStatus("menu");
    setStageIndex(0);
    setDistance(0);
    setScore(0);
    setStamina(78);
    setScrolls(0);
    setSeals(0);
    setWaters(0);
    setHits(0);
    setToast(null);
    setResultText("");
    setHorse(null);
  }

  const missionProgress = `${Math.min(distance, currentMission.targetDistance)} / ${currentMission.targetDistance}`;

  return (
    <main className="runnerGamePage">
      <Header language={language} onLanguageChange={() => setLanguage((value) => value === "mn" ? "en" : "mn")} />
      <section className="runnerHero">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
          <span className="kicker light">{c.eyebrow}</span>
          <h1>{c.title}</h1>
          <p>{c.intro}</p>
        </motion.div>
        <div className="runnerHeroStats">
          <div><span>{c.stage}</span><strong>{stageIndex + 1} / {missions.length}</strong></div>
          <div><span>{c.best}</span><strong>{best}</strong></div>
          <div><span>{c.distance}</span><strong>{distance}</strong></div>
          <div><span>{c.stamina}</span><strong>{Math.round(stamina)}%</strong></div>
        </div>
      </section>

      {status === "menu" && (
        <section className="runnerSetupBoard">
          <div className="runnerSetupIntro">
            <span className="kicker">{c.chooseHorse}</span>
            <h2>{language === "mn" ? "Ямар хүлгээр замд гарах вэ?" : "Which horse will carry the message?"}</h2>
            <p>{c.playHint}</p>
          </div>
          <div className="runnerHorseGrid">
            {horses.map((item) => (
              <button key={item.id} className={horse?.id === item.id ? "runnerHorseCard active" : "runnerHorseCard"} onClick={() => setHorse(item)}>
                <i>{item.icon}</i>
                <strong>{item.name[language]}</strong>
                <p>{item.summary[language]}</p>
                <div className="runnerHorseMeta">
                  <span>{language === "mn" ? "Хурд" : "Speed"} {item.speedBonus > 0 ? `+${item.speedBonus.toFixed(1)}` : item.speedBonus.toFixed(1)}</span>
                  <span>{language === "mn" ? "Үсрэлт" : "Jump"} {item.jumpBonus > 0 ? `+${item.jumpBonus.toFixed(1)}` : item.jumpBonus.toFixed(1)}</span>
                  <span>{language === "mn" ? "Тэнхээ" : "Stamina"} {item.staminaBonus > 0 ? `+${item.staminaBonus}` : item.staminaBonus}</span>
                </div>
              </button>
            ))}
          </div>
          <div className="runnerSetupActions">
            <button className="primaryButton" type="button" onClick={startGame}>{c.start}</button>
            <a className="secondaryButton" href="/">{c.home}</a>
          </div>
        </section>
      )}

      {status !== "menu" && (
        <>
          <section className="runnerInfoBar">
            <div className="runnerMissionCard">
              <span>{c.task}</span>
              <h3>{currentMission.title[language]}</h3>
              <p>{currentMission.summary[language]}</p>
              <div className="runnerMissionChecklist">
                <b>{missionProgress}</b>
                <small>{language === "mn" ? `Захидал ${scrolls}/${currentMission.needScrolls} · Тамга ${seals}/${currentMission.needSeals} · Ус ${waters}/${currentMission.needWater}` : `Scrolls ${scrolls}/${currentMission.needScrolls} · Seals ${seals}/${currentMission.needSeals} · Water ${waters}/${currentMission.needWater}`}</small>
              </div>
            </div>
            <div className="runnerMetricsCard">
              <div><span>{c.score}</span><strong>{score}</strong></div>
              <div><span>{c.collect}</span><strong>{scrolls + seals + waters}</strong></div>
              <div><span>{c.avoid}</span><strong>{hits}</strong></div>
              <div><span>{c.controls}</span><strong>{c.controlsText}</strong></div>
            </div>
          </section>

          <section className="runnerCanvasShell">
            <canvas ref={canvasRef} width={W} height={H} onClick={() => status === "running" && jump()} />
            <div className="runnerHudOverlay">
              <div className="runnerStaminaBar"><i style={{ width: `${Math.max(0, Math.min(100, stamina))}%` }} /></div>
              <span>{c.stamina}: {Math.round(stamina)}%</span>
            </div>
            <AnimatePresence>
              {toast && <motion.div className="runnerToast" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>{toast}</motion.div>}
            </AnimatePresence>
          </section>
        </>
      )}

      <AnimatePresence>
        {status === "finished" && (
          <motion.div className="resultBackdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="resultModal runnerResultModal" initial={{ opacity: 0, y: 40, scale: 0.92 }} animate={{ opacity: 1, y: 0, scale: 1 }}>
              <div className="resultBadge">🐎</div>
              <span className="kicker">{c.result}</span>
              <h2>{score}</h2>
              <p>{rank}</p>
              <div className="archeryResultGrid">
                <div><small>{c.distance}</small><strong>{distance}</strong></div>
                <div><small>{c.collect}</small><strong>{scrolls + seals + waters}</strong></div>
                <div><small>{c.avoid}</small><strong>{hits}</strong></div>
              </div>
              <p className="runnerResultText">{resultText}</p>
              <div className="loginNotice"><p>{c.save}</p></div>
              <div className="modalActions">
                <button className="primaryButton" onClick={startGame}>{c.restart}</button>
                <button className="secondaryButton" onClick={resetAll}>{language === "mn" ? "Өөр хүлэг сонгох" : "Choose another horse"}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
