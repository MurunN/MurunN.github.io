"use client";

import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";
import { Header } from "@/components/Header";

type Mode = "relay" | "archery";
type Language = "mn" | "en";
type Status = "ready" | "running" | "paused" | "finished";
type Lane = -1 | 0 | 1;
type RelayKind = "rock" | "log" | "checkpoint" | "water" | "station";

type Hud = {
  score: number;
  speed: number;
  stamina: number;
  distance: number;
  integrity: number;
  checkpoints: number;
  checkpointGoal: number;
  stage: number;
  stageCount: number;
  time: number;
  combo: number;
  hits: number;
  shots: number;
  focus: number;
  power: number;
  wind: number;
};

type EngineApi = {
  start: () => void;
  pause: () => void;
  resume: () => void;
  restart: () => void;
  lane: (dir: -1 | 1) => void;
  jump: () => void;
  boost: (on: boolean) => void;
  pace: (dir: -1 | 1) => void;
  focus: (on: boolean) => void;
  beginDraw: () => void;
  aim: (x: number, y: number) => void;
  shoot: () => void;
};

type HorseRig = {
  root: THREE.Group;
  body: THREE.Group;
  rider: THREE.Group;
  legs: { upper: THREE.Group; lower: THREE.Group; offset: number }[];
  tail: THREE.Group;
  head: THREE.Group;
  riderTorso: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  bowString?: THREE.Line;
  bowHand?: THREE.Group;
  materials: THREE.MeshStandardMaterial[];
};

type RelayEntity = {
  kind: RelayKind;
  lane: Lane;
  root: THREE.Group;
  resolved: boolean;
  id: number;
};

type TargetEntity = {
  root: THREE.Group;
  disk: THREE.Mesh;
  side: -1 | 1;
  hit: boolean;
  id: number;
  value: number;
};

const LANES: Lane[] = [-1, 0, 1];
const LANE_X = 2.45;
const HORSE_Z = 3.4;
const ROAD_SEGMENT_LENGTH = 18;
const ROAD_SEGMENTS = 12;

const relayStages = [
  { titleMn: "Үүрийн өртөө", titleEn: "Dawn relay", meters: 900, checkpoints: 3, scene: "dawn" as const },
  { titleMn: "Их талын зам", titleEn: "Open steppe", meters: 1150, checkpoints: 4, scene: "day" as const },
  { titleMn: "Шөнийн хүргэлт", titleEn: "Night courier", meters: 1250, checkpoints: 4, scene: "night" as const }
];

const archeryRounds = [
  { titleMn: "Талын хэмнэл", titleEn: "Steppe rhythm", seconds: 24, pace: 15.5, spawn: 2.35, wind: 0.6 },
  { titleMn: "Хажуугийн салхи", titleEn: "Crosswind", seconds: 26, pace: 17, spawn: 2.1, wind: 1.1 },
  { titleMn: "Мэргэний давхилт", titleEn: "Master gallop", seconds: 28, pace: 18.5, spawn: 1.8, wind: 1.55 }
];

const copy = {
  mn: {
    relayKicker: "МОРИН ӨРТӨӨ · 3D COURIER RUN",
    relayTitle: "Элчийн давхилт",
    relayIntro: "Энэ удаа зам дээр хөвдөг item цуглуулахгүй. Бичгээ бүтэн авч явж, зөв мөрийн шалгах цэгүүдийг давж, усны буудлаар тэнхээгээ сэлбээд дараагийн өртөөнд хүрнэ.",
    archeryKicker: "МОРИН ХАРВАА · 3D TRACK",
    archeryTitle: "Давхингаа харва",
    archeryIntro: "Морь шулуун замаар давхина. Mouse/touch-оор онилж, дарж барин нумаа татаж, тавихад харвана. Shift төвлөрлийг ашиглавал савлагаа багасна.",
    start: "Тоглоом эхлүүлэх",
    restart: "Дахин эхлүүлэх",
    pause: "Түр зогсоох",
    resume: "Үргэлжлүүлэх",
    score: "Оноо",
    speed: "Хурд",
    stamina: "Тэнхээ",
    distance: "Зам",
    integrity: "Бичиг",
    checkpoints: "Шалгах цэг",
    time: "Хугацаа",
    combo: "Комбо",
    accuracy: "Оновч",
    focus: "Төвлөрөл",
    power: "Таталт",
    wind: "Салхи",
    relayControls: "A/D эсвэл ←/→ = мөр солих · Space/↑ = үсрэх · Shift = түр давхилт · P = pause",
    archeryControls: "Mouse/touch = онилох · дарж барих → тавих = харвах · Shift = төвлөрөх · W/S = хурдаа тохируулах · P = pause",
    relayGoal: "Зорилго: бичгээ гэмтээлгүй, бүх шалгах цэгийг давж өртөөнд хүр.",
    archeryGoal: "Зорилго: хурд, хэмнэлээ хадгалж байнуудыг оновчтой буудах.",
    finishedRelay: "Хүргэлт дууслаа",
    finishedArchery: "Харвааны дүн",
    stage: "Үе",
    best: "Шилдэг",
    clean: "Цэвэр давлаа",
    missed: "Шалгах цэг алдлаа",
    water: "Усны буудал · тэнхээ сэргэв",
    impact: "Саад мөргөлдлөө",
    station: "Өртөөнд хүрлээ · морь сэлгэв",
    bullseye: "БАЙНЫ ГОЛ!",
    hit: "ОНОЛОО",
    miss: "АЛДЛАА"
  },
  en: {
    relayKicker: "MORIN URTUU · 3D COURIER RUN",
    relayTitle: "Courier of the steppe",
    relayIntro: "No more floating pickups. Protect the dispatch, clear route checkpoints, use real water stops to recover stamina, and reach the next relay station.",
    archeryKicker: "MOUNTED ARCHERY · 3D TRACK",
    archeryTitle: "Shoot at full gallop",
    archeryIntro: "The horse follows the track. Aim with mouse/touch, hold to draw, and release to shoot. Hold Shift to steady the rider while focus lasts.",
    start: "Start game",
    restart: "Restart",
    pause: "Pause",
    resume: "Resume",
    score: "Score",
    speed: "Speed",
    stamina: "Stamina",
    distance: "Distance",
    integrity: "Dispatch",
    checkpoints: "Checkpoints",
    time: "Time",
    combo: "Combo",
    accuracy: "Accuracy",
    focus: "Focus",
    power: "Draw",
    wind: "Wind",
    relayControls: "A/D or ←/→ = steer · Space/↑ = jump · Shift = sprint · P = pause",
    archeryControls: "Mouse/touch = aim · hold → release = shoot · Shift = focus · W/S = pace · P = pause",
    relayGoal: "Goal: protect the dispatch, clear every checkpoint and reach the relay station.",
    archeryGoal: "Goal: preserve speed and rhythm while shooting accurately.",
    finishedRelay: "Delivery complete",
    finishedArchery: "Mounted archery result",
    stage: "Stage",
    best: "Best",
    clean: "Clean jump",
    missed: "Checkpoint missed",
    water: "Water stop · stamina restored",
    impact: "Obstacle impact",
    station: "Relay reached · fresh horse",
    bullseye: "BULLSEYE!",
    hit: "HIT",
    miss: "MISS"
  }
};

export function Steppe3DGame({ mode }: { mode: Mode }) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const canvasHostRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<EngineApi | null>(null);
  const langRef = useRef<Language>("mn");
  const [language, setLanguage] = useState<Language>("mn");
  const [status, setStatus] = useState<Status>("ready");
  const [message, setMessage] = useState("");
  const [best, setBest] = useState(0);
  const [hud, setHud] = useState<Hud>({
    score: 0, speed: 0, stamina: 100, distance: 0, integrity: 100,
    checkpoints: 0, checkpointGoal: relayStages[0].checkpoints, stage: 1,
    stageCount: mode === "relay" ? relayStages.length : archeryRounds.length,
    time: mode === "relay" ? 0 : archeryRounds[0].seconds,
    combo: 0, hits: 0, shots: 0, focus: 100, power: 0, wind: 0
  });
  const [aim, setAim] = useState({ x: 50, y: 45 });
  const c = copy[language];
  const accuracy = hud.shots ? Math.round((hud.hits / hud.shots) * 100) : 0;

  useEffect(() => { langRef.current = language; }, [language]);
  useEffect(() => {
    const key = mode === "relay" ? "steppequest-relay-3d-best" : "steppequest-archery-3d-best";
    setBest(Number(window.localStorage.getItem(key) || 0));
  }, [mode]);

  useEffect(() => {
    const mount = mountRef.current;
    const canvasHost = canvasHostRef.current;
    if (!mount || !canvasHost) return;

    let destroyed = false;
    let raf = 0;
    let last = performance.now();
    let hudClock = 0;
    let flashTimer = 0;
    const state = {
      status: "ready" as Status,
      score: 0,
      speed: mode === "relay" ? 14.5 : archeryRounds[0].pace,
      targetSpeed: mode === "relay" ? 14.5 : archeryRounds[0].pace,
      stamina: 100,
      distance: 0,
      integrity: 100,
      stage: 0,
      stageDistance: 0,
      checkpoints: 0,
      checkpointGoal: relayStages[0].checkpoints,
      combo: 0,
      hits: 0,
      shots: 0,
      focus: 100,
      power: 0,
      charging: false,
      focusHeld: false,
      boosting: false,
      lane: 0 as Lane,
      targetLane: 0 as Lane,
      jumpY: 0,
      jumpV: 0,
      elapsed: 0,
      roundElapsed: 0,
      lastRelaySpawn: 0,
      nextCheckpointAt: 160,
      nextWaterAt: 420,
      stationSpawned: false,
      lastTargetSpawn: 0,
      wind: 0,
      aimX: 50,
      aimY: 45,
      pausedAt: 0
    };

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(58, 16 / 9, 0.1, 220);
    camera.position.set(0, 4.15, 10.8);
    camera.lookAt(0, 1.25, -10);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.domElement.className = "steppe3dCanvas";
    canvasHost.appendChild(renderer.domElement);

    const hemi = new THREE.HemisphereLight(0xdceef2, 0x665239, 2.2);
    scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xffe7b5, 4.3);
    sun.position.set(-12, 20, 10);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -18; sun.shadow.camera.right = 18;
    sun.shadow.camera.top = 18; sun.shadow.camera.bottom = -18;
    scene.add(sun);

    const world = new THREE.Group();
    scene.add(world);
    const roadSegments: THREE.Group[] = [];
    const roadsideProps: THREE.Group[] = [];
    const relayEntities: RelayEntity[] = [];
    const targets: TargetEntity[] = [];
    const arrows: { mesh: THREE.Group; from: THREE.Vector3; to: THREE.Vector3; t: number }[] = [];
    const dust: { mesh: THREE.Mesh; life: number; vx: number; vy: number; vz: number }[] = [];
    let nextEntityId = 1;
    let nextTargetId = 1;

    const grassMat = new THREE.MeshStandardMaterial({ color: 0x766f45, roughness: 1 });
    const roadMatA = new THREE.MeshStandardMaterial({ color: 0x806448, roughness: 1 });
    const roadMatB = new THREE.MeshStandardMaterial({ color: 0x73583f, roughness: 1 });
    const rutMat = new THREE.MeshStandardMaterial({ color: 0x4e3b2b, roughness: 1 });

    for (let i = 0; i < ROAD_SEGMENTS; i++) {
      const seg = new THREE.Group();
      seg.position.z = -i * ROAD_SEGMENT_LENGTH + 8;
      const grass = new THREE.Mesh(new THREE.PlaneGeometry(50, ROAD_SEGMENT_LENGTH + .25), grassMat);
      grass.rotation.x = -Math.PI / 2;
      grass.receiveShadow = true;
      seg.add(grass);
      const road = new THREE.Mesh(new THREE.PlaneGeometry(8.4, ROAD_SEGMENT_LENGTH + .08), i % 2 ? roadMatA : roadMatB);
      road.rotation.x = -Math.PI / 2;
      road.position.y = .025;
      road.receiveShadow = true;
      seg.add(road);
      for (const x of [-1.25, 1.25]) {
        const rut = new THREE.Mesh(new THREE.PlaneGeometry(.13, ROAD_SEGMENT_LENGTH), rutMat);
        rut.rotation.x = -Math.PI / 2;
        rut.position.set(x, .047, 0);
        seg.add(rut);
      }
      for (let m = -1; m <= 1; m++) {
        const laneLine = new THREE.Mesh(new THREE.PlaneGeometry(.025, ROAD_SEGMENT_LENGTH), new THREE.MeshBasicMaterial({ color: 0xcbb98c, transparent: true, opacity: .17 }));
        laneLine.rotation.x = -Math.PI / 2;
        laneLine.position.set(m * LANE_X, .052, 0);
        seg.add(laneLine);
      }
      roadSegments.push(seg);
      world.add(seg);
    }

    for (let i = 0; i < 28; i++) {
      const prop = createRoadsideProp(i);
      prop.position.z = -10 - i * 9.5;
      prop.position.x = (i % 2 ? 1 : -1) * (6 + (i % 4) * 1.6);
      prop.rotation.y = (i % 5) * .2;
      roadsideProps.push(prop);
      world.add(prop);
    }

    const mountains = new THREE.Group();
    for (let i = 0; i < 12; i++) {
      const height = 12 + (i % 4) * 4;
      const geo = new THREE.ConeGeometry(8 + (i % 3) * 3, height, 5);
      const mat = new THREE.MeshStandardMaterial({ color: i % 2 ? 0x566d62 : 0x66796c, roughness: 1, flatShading: true });
      const m = new THREE.Mesh(geo, mat);
      m.position.set(-38 + i * 7, height / 2 - 1.5, -72 - (i % 3) * 7);
      m.rotation.y = i * .47;
      mountains.add(m);
    }
    scene.add(mountains);

    const sunBall = new THREE.Mesh(new THREE.SphereGeometry(2.2, 18, 18), new THREE.MeshBasicMaterial({ color: 0xffdda1 }));
    sunBall.position.set(25, 22, -70);
    scene.add(sunBall);

    const horse = createHorseRig(mode);
    horse.root.position.set(0, 0, HORSE_Z);
    scene.add(horse.root);

    const updateEnvironment = () => {
      if (mode === "archery") {
        scene.background = new THREE.Color(0x90b8bf);
        scene.fog = new THREE.Fog(0x9db9aa, 34, 115);
        grassMat.color.setHex(0x7d774b);
        hemi.color.setHex(0xddeef1); hemi.groundColor.setHex(0x665139);
        sun.color.setHex(0xffe4aa); sun.intensity = 4.2;
        return;
      }
      const sceneName = relayStages[state.stage]?.scene || "day";
      if (sceneName === "dawn") {
        scene.background = new THREE.Color(0x8da7ae); scene.fog = new THREE.Fog(0xa8a58c, 34, 110);
        grassMat.color.setHex(0x766a44); sun.color.setHex(0xffc883); sun.intensity = 3.8;
      } else if (sceneName === "night") {
        scene.background = new THREE.Color(0x1c2c3a); scene.fog = new THREE.Fog(0x26384a, 27, 94);
        grassMat.color.setHex(0x3d4438); sun.color.setHex(0x9fb9d9); sun.intensity = 2.0;
      } else {
        scene.background = new THREE.Color(0x8eb8c2); scene.fog = new THREE.Fog(0xa7b7a3, 35, 118);
        grassMat.color.setHex(0x7a7447); sun.color.setHex(0xffe3a8); sun.intensity = 4.3;
      }
    };
    updateEnvironment();

    const resize = () => {
      const rect = mount.getBoundingClientRect();
      const w = Math.max(320, rect.width);
      const h = Math.max(360, rect.height);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(mount);
    resize();

    const say = (mn: string, en: string, duration = 1000) => {
      if (flashTimer) window.clearTimeout(flashTimer);
      setMessage(langRef.current === "mn" ? mn : en);
      flashTimer = window.setTimeout(() => setMessage(""), duration);
    };

    const updateHud = () => {
      const round = archeryRounds[state.stage] || archeryRounds[0];
      setHud({
        score: Math.max(0, Math.round(state.score)),
        speed: Math.round(state.speed * 3.6),
        stamina: Math.round(state.stamina),
        distance: Math.round(state.distance),
        integrity: Math.round(state.integrity),
        checkpoints: state.checkpoints,
        checkpointGoal: mode === "relay" ? relayStages[state.stage]?.checkpoints || 0 : 0,
        stage: state.stage + 1,
        stageCount: mode === "relay" ? relayStages.length : archeryRounds.length,
        time: mode === "relay" ? Math.round(state.elapsed) : Math.max(0, Math.ceil(round.seconds - state.roundElapsed)),
        combo: state.combo,
        hits: state.hits,
        shots: state.shots,
        focus: Math.round(state.focus),
        power: Math.round(state.power),
        wind: Number(state.wind.toFixed(1))
      });
    };

    const resetCore = () => {
      state.score = 0; state.stamina = 100; state.distance = 0; state.integrity = 100;
      state.stage = 0; state.stageDistance = 0; state.checkpoints = 0;
      state.checkpointGoal = relayStages[0].checkpoints; state.combo = 0;
      state.hits = 0; state.shots = 0; state.focus = 100; state.power = 0;
      state.charging = false; state.focusHeld = false; state.boosting = false;
      state.lane = 0; state.targetLane = 0; state.jumpY = 0; state.jumpV = 0;
      state.elapsed = 0; state.roundElapsed = 0; state.lastRelaySpawn = 0;
      state.nextCheckpointAt = 160; state.nextWaterAt = 420; state.stationSpawned = false;
      state.lastTargetSpawn = 0; state.wind = 0;
      horse.root.position.x = 0; horse.root.position.y = 0;
      clearEntities(relayEntities, world);
      clearTargets(targets, world);
      for (const a of arrows.splice(0)) world.remove(a.mesh);
      updateEnvironment();
      updateHud();
    };

    const finish = () => {
      state.status = "finished";
      setStatus("finished");
      const final = Math.max(0, Math.round(state.score));
      const key = mode === "relay" ? "steppequest-relay-3d-best" : "steppequest-archery-3d-best";
      const prev = Number(window.localStorage.getItem(key) || 0);
      if (final > prev) {
        window.localStorage.setItem(key, String(final));
        setBest(final);
      }
      updateHud();
    };

    const start = () => {
      resetCore();
      state.status = "running";
      state.speed = mode === "relay" ? 14.5 : archeryRounds[0].pace;
      state.targetSpeed = state.speed;
      setStatus("running");
      if (mode === "relay") {
        scheduleRelayStage(0);
        say("Элчийн зам эхэллээ", "Courier run started");
      } else {
        say("I үе эхэллээ", "Round I started");
      }
    };

    const pause = () => {
      if (state.status !== "running") return;
      state.status = "paused"; state.pausedAt = performance.now(); setStatus("paused");
    };
    const resume = () => {
      if (state.status !== "paused") return;
      state.status = "running"; last = performance.now(); setStatus("running");
    };

    const changeLane = (dir: -1 | 1) => {
      if (mode !== "relay" || state.status !== "running") return;
      state.targetLane = THREE.MathUtils.clamp(state.targetLane + dir, -1, 1) as Lane;
    };
    const jump = () => {
      if (mode !== "relay" || state.status !== "running" || state.jumpY > .08) return;
      state.jumpV = 5.9;
      playTone("jump");
    };
    const boost = (on: boolean) => { if (mode === "relay") state.boosting = on; };
    const pace = (dir: -1 | 1) => {
      if (mode !== "archery" || state.status !== "running") return;
      const base = archeryRounds[state.stage]?.pace || 16;
      state.targetSpeed = THREE.MathUtils.clamp(state.targetSpeed + dir * 1.2, base - 3, base + 3.8);
    };
    const focus = (on: boolean) => { if (mode === "archery") state.focusHeld = on; };
    const beginDraw = () => {
      if (mode !== "archery" || state.status !== "running") return;
      state.charging = true; state.power = Math.max(state.power, 7);
    };
    const aimAt = (x: number, y: number) => { state.aimX = x; state.aimY = y; setAim({ x, y }); };

    const shoot = () => {
      if (mode !== "archery" || state.status !== "running" || !state.charging) return;
      state.charging = false;
      state.shots += 1;
      const rect = mount.getBoundingClientRect();
      const pointerPx = new THREE.Vector2((state.aimX / 100) * rect.width, (state.aimY / 100) * rect.height);
      const focusFactor = state.focusHeld && state.focus > 0 ? .32 : 1;
      const sway = Math.sin(performance.now() / 115) * 16 * focusFactor;
      const windPx = state.wind * 10 * (1.1 - state.power / 160);
      pointerPx.x += sway + windPx;
      pointerPx.y += Math.cos(performance.now() / 97) * 9 * focusFactor + (58 - state.power) * .22;

      let bestTarget: TargetEntity | null = null;
      let bestNorm = Infinity;
      for (const target of targets) {
        if (target.hit) continue;
        const worldPos = target.root.getWorldPosition(new THREE.Vector3());
        const ndc = worldPos.clone().project(camera);
        if (ndc.z < -1 || ndc.z > 1) continue;
        const px = new THREE.Vector2((ndc.x * .5 + .5) * rect.width, (-ndc.y * .5 + .5) * rect.height);
        const depthScale = THREE.MathUtils.clamp(1 - Math.abs(target.root.position.z - HORSE_Z) / 60, .18, 1);
        const radius = 30 + depthScale * 58;
        const norm = px.distanceTo(pointerPx) / radius;
        if (norm < bestNorm) { bestNorm = norm; bestTarget = target; }
      }

      const from = horse.root.localToWorld(new THREE.Vector3(-.15, 2.45, -1.15));
      let to: THREE.Vector3;
      let points = 0;
      if (bestTarget && bestNorm <= 1.05) {
        to = bestTarget.root.getWorldPosition(new THREE.Vector3());
        bestTarget.hit = true;
        points = bestNorm < .22 ? 100 : bestNorm < .48 ? 70 : bestNorm < .75 ? 45 : 25;
        if (bestTarget.value > 1) points = Math.round(points * bestTarget.value);
        state.hits += 1;
        state.combo += 1;
        const comboBonus = Math.min(2.2, 1 + state.combo * .08);
        state.score += points * comboBonus;
        say(points >= 100 ? copy.mn.bullseye : `${copy.mn.hit} +${Math.round(points * comboBonus)}`, points >= 100 ? copy.en.bullseye : `${copy.en.hit} +${Math.round(points * comboBonus)}`, 650);
        playTone(points >= 100 ? "gold" : "hit");
        spawnBurstAt(world, to, points >= 100 ? 0xffd872 : 0xe7c891);
      } else {
        const ndc = new THREE.Vector3((state.aimX / 100) * 2 - 1, -((state.aimY / 100) * 2 - 1), .25);
        ndc.unproject(camera);
        const dir = ndc.sub(camera.position).normalize();
        to = from.clone().add(dir.multiplyScalar(48));
        state.combo = 0;
        say(copy.mn.miss, copy.en.miss, 500);
        playTone("miss");
      }
      arrows.push({ mesh: createArrow(from, to), from, to, t: 0 });
      world.add(arrows[arrows.length - 1].mesh);
      state.power = 0;
      updateHud();
    };

    engineRef.current = { start, pause, resume, restart: start, lane: changeLane, jump, boost, pace, focus, beginDraw, aim: aimAt, shoot };

    function scheduleRelayStage(stageIndex: number) {
      state.checkpoints = 0;
      state.checkpointGoal = relayStages[stageIndex].checkpoints;
      state.stageDistance = 0;
      state.nextCheckpointAt = relayStages[stageIndex].meters / (relayStages[stageIndex].checkpoints + 1);
      state.nextWaterAt = relayStages[stageIndex].meters * .56;
      state.stationSpawned = false;
      state.lastRelaySpawn = state.distance;
      updateEnvironment();
      updateHud();
    }

    function spawnRelayEntity(kind: RelayKind, lane: Lane, z = -64) {
      const root = createRelayEntityMesh(kind);
      root.position.set(lane * LANE_X, 0, z);
      world.add(root);
      relayEntities.push({ kind, lane, root, resolved: false, id: nextEntityId++ });
    }

    function maybeSpawnRelay() {
      const stage = relayStages[state.stage];
      if (!stage) return;
      if (state.stageDistance >= state.nextCheckpointAt && state.checkpoints < stage.checkpoints) {
        const lane = LANES[(state.checkpoints + state.stage) % 3];
        spawnRelayEntity("checkpoint", lane, -70);
        state.nextCheckpointAt += stage.meters / (stage.checkpoints + 1);
      }
      if (state.stageDistance >= state.nextWaterAt && state.nextWaterAt > 0) {
        const lane = state.stage % 2 ? 1 : -1;
        spawnRelayEntity("water", lane, -62);
        state.nextWaterAt = -1;
      }
      if (state.distance - state.lastRelaySpawn > 120 + Math.random() * 45) {
        state.lastRelaySpawn = state.distance;
        const kind: RelayKind = Math.random() > .5 ? "rock" : "log";
        spawnRelayEntity(kind, LANES[Math.floor(Math.random() * 3)], -58 - Math.random() * 14);
      }
      if (!state.stationSpawned && state.stageDistance >= stage.meters - 90) {
        state.stationSpawned = true;
        spawnRelayEntity("station", 0, -78);
      }
    }

    function resolveRelay(entity: RelayEntity) {
      if (entity.resolved) return;
      entity.resolved = true;
      const sameLane = Math.abs(entity.root.position.x - horse.root.position.x) < 1.05;
      const jumping = state.jumpY > .75;
      if (entity.kind === "rock" || entity.kind === "log") {
        if (sameLane && !jumping) {
          state.stamina = Math.max(0, state.stamina - 14);
          state.integrity = Math.max(0, state.integrity - 11);
          state.score = Math.max(0, state.score - 80);
          say(c.impact, "Obstacle impact");
          playTone("impact");
          camera.position.x += Math.random() > .5 ? .28 : -.28;
        } else if (sameLane && jumping) {
          state.score += 45;
          say(`${c.clean} +45`, "Clean jump +45", 650);
        }
      } else if (entity.kind === "checkpoint") {
        if (sameLane) {
          state.checkpoints += 1; state.score += 170;
          say(`Шалгах цэг ${state.checkpoints}/${state.checkpointGoal}`, `Checkpoint ${state.checkpoints}/${state.checkpointGoal}`, 750);
          playTone("checkpoint");
        } else {
          state.integrity = Math.max(0, state.integrity - 4);
          state.score = Math.max(0, state.score - 60);
          say(c.missed, "Checkpoint missed");
        }
      } else if (entity.kind === "water") {
        if (sameLane) {
          state.stamina = Math.min(100, state.stamina + 32);
          state.score += 70;
          say(c.water, "Water stop · stamina restored");
          playTone("water");
        }
      } else if (entity.kind === "station") {
        const stage = relayStages[state.stage];
        const complete = state.checkpoints >= stage.checkpoints;
        state.score += complete ? 500 + state.integrity * 3 : 180;
        state.stamina = Math.min(100, state.stamina + 44);
        say(c.station, "Relay reached · fresh horse", 1300);
        playTone("station");
        if (state.stage >= relayStages.length - 1) {
          state.score += state.integrity * 6 + state.stamina * 3;
          finish();
        } else {
          state.stage += 1;
          state.stageDistance = 0;
          scheduleRelayStage(state.stage);
          horse.materials[0]?.color.offsetHSL(.01, .03, state.stage === 2 ? -.08 : .02);
        }
      }
      updateHud();
    }

    function spawnTarget() {
      const side: -1 | 1 = Math.random() > .5 ? 1 : -1;
      const gold = state.stage === 2 && Math.random() > .74;
      const root = createTargetMesh(gold);
      root.position.set(side * (5.6 + Math.random() * 1.2), 1.5 + Math.random() * .7, -58 - Math.random() * 10);
      root.rotation.y = side > 0 ? -.18 : .18;
      world.add(root);
      targets.push({ root, disk: root.userData.disk as THREE.Mesh, side, hit: false, id: nextTargetId++, value: gold ? 1.45 : 1 });
    }

    function updateHorse(dt: number, now: number) {
      const cadence = state.speed * .58;
      const phase = now * .001 * cadence;
      horse.root.position.x = THREE.MathUtils.lerp(horse.root.position.x, state.targetLane * LANE_X, Math.min(1, dt * 6.2));
      if (mode === "relay") {
        state.lane = Math.round(horse.root.position.x / LANE_X) as Lane;
        state.jumpV -= 14.6 * dt;
        state.jumpY += state.jumpV * dt;
        if (state.jumpY < 0) { state.jumpY = 0; state.jumpV = 0; }
      }
      horse.root.position.y = state.jumpY + Math.abs(Math.sin(phase * 2)) * .035;
      horse.body.rotation.x = Math.sin(phase * 2) * .025;
      horse.head.rotation.x = -.08 + Math.sin(phase * 2 + .6) * .045;
      horse.tail.rotation.x = -.25 + Math.sin(phase + 1.2) * .22;
      const patterns = [0, Math.PI, Math.PI * .5, Math.PI * 1.5];
      horse.legs.forEach((leg, i) => {
        const p = Math.sin(phase + patterns[i]);
        leg.upper.rotation.x = p * .62;
        leg.lower.rotation.x = -.35 - Math.max(0, p) * .55 + Math.min(0, p) * .18;
      });
      const steerLean = (state.targetLane * LANE_X - horse.root.position.x) * -.08;
      horse.rider.rotation.z = THREE.MathUtils.lerp(horse.rider.rotation.z, steerLean, Math.min(1, dt * 7));
      horse.riderTorso.rotation.x = mode === "relay" ? -.13 - (state.boosting ? .09 : 0) : -.08;
      if (mode === "archery") {
        const draw = state.power / 100;
        horse.rightArm.rotation.x = -.2 - draw * .52;
        horse.rightArm.rotation.z = -.36 - draw * .42;
        horse.leftArm.rotation.z = .18;
        if (horse.bowString && horse.bowHand) {
          const positions = horse.bowString.geometry.getAttribute("position") as THREE.BufferAttribute;
          positions.setXYZ(1, -.26 - draw * .42, 0, .02 + draw * .05);
          positions.needsUpdate = true;
        }
      }
    }

    function updateWorld(dt: number, now: number) {
      const worldVelocity = state.speed * 1.9;
      for (const seg of roadSegments) {
        seg.position.z += worldVelocity * dt;
        if (seg.position.z > 20) seg.position.z -= ROAD_SEGMENT_LENGTH * ROAD_SEGMENTS;
      }
      for (const prop of roadsideProps) {
        prop.position.z += worldVelocity * dt;
        if (prop.position.z > 18) prop.position.z -= 28 * 9.5;
      }
      mountains.position.x = Math.sin(now * .00008) * 1.4;
      if (state.status === "running") {
        spawnDust(state.boosting ? 2 : 1);
      }
      for (const p of dust) {
        p.life -= dt;
        p.mesh.position.x += p.vx * dt; p.mesh.position.y += p.vy * dt; p.mesh.position.z += p.vz * dt;
        p.mesh.scale.multiplyScalar(1 + dt * .9);
        (p.mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, p.life * .24);
      }
      for (let i = dust.length - 1; i >= 0; i--) {
        if (dust[i].life <= 0) { world.remove(dust[i].mesh); dust.splice(i, 1); }
      }
    }

    function spawnDust(count: number) {
      if (dust.length > 45 || Math.random() > .45) return;
      for (let i = 0; i < count; i++) {
        const mat = new THREE.MeshBasicMaterial({ color: 0xb69b75, transparent: true, opacity: .16, depthWrite: false });
        const mesh = new THREE.Mesh(new THREE.SphereGeometry(.08 + Math.random() * .08, 6, 6), mat);
        mesh.position.set(horse.root.position.x + (Math.random() - .5) * .65, .08 + Math.random() * .18, HORSE_Z + .8 + Math.random() * .8);
        world.add(mesh);
        dust.push({ mesh, life: .65 + Math.random() * .45, vx: (Math.random() - .5) * .5, vy: .2 + Math.random() * .4, vz: .8 + Math.random() * .6 });
      }
    }

    function updateRelay(dt: number) {
      const normal = 14.5 + state.stage * .7;
      const sprint = state.boosting && state.stamina > 8;
      state.targetSpeed = sprint ? normal * 1.34 : normal;
      state.speed = THREE.MathUtils.lerp(state.speed, state.targetSpeed, Math.min(1, dt * 2.1));
      if (sprint) state.stamina = Math.max(0, state.stamina - 13.5 * dt);
      else if (state.speed <= normal + .4) state.stamina = Math.min(100, state.stamina + 4.2 * dt);
      state.distance += state.speed * dt;
      state.stageDistance += state.speed * dt;
      state.elapsed += dt;
      state.score += state.speed * dt * .7;
      maybeSpawnRelay();

      for (const entity of relayEntities) {
        entity.root.position.z += state.speed * 1.9 * dt;
        if (!entity.resolved && entity.root.position.z >= HORSE_Z - .55) resolveRelay(entity);
      }
      for (let i = relayEntities.length - 1; i >= 0; i--) {
        const e = relayEntities[i];
        if (e.root.position.z > 16 || e.resolved) {
          if (e.root.position.z > HORSE_Z + 5 || e.resolved) {
            world.remove(e.root); relayEntities.splice(i, 1);
          }
        }
      }
      if (state.stamina <= 0 || state.integrity <= 0) finish();
    }

    function updateArchery(dt: number, now: number) {
      const round = archeryRounds[state.stage];
      state.speed = THREE.MathUtils.lerp(state.speed, state.targetSpeed, Math.min(1, dt * 2.2));
      state.distance += state.speed * dt;
      state.elapsed += dt;
      state.roundElapsed += dt;
      state.wind = Math.sin(now * .00053 + state.stage * 1.7) * round.wind;
      if (state.charging) state.power = Math.min(100, state.power + dt * 52);
      if (state.focusHeld && state.focus > 0) state.focus = Math.max(0, state.focus - dt * 23);
      else state.focus = Math.min(100, state.focus + dt * 10);
      if (state.roundElapsed - state.lastTargetSpawn > round.spawn) {
        state.lastTargetSpawn = state.roundElapsed;
        spawnTarget();
      }
      for (const target of targets) {
        target.root.position.z += state.speed * 1.72 * dt;
        target.root.rotation.z = Math.sin(now * .0014 + target.id) * .025;
      }
      for (let i = targets.length - 1; i >= 0; i--) {
        const t = targets[i];
        if (t.root.position.z > HORSE_Z + 5 || t.hit) {
          if (!t.hit && t.root.position.z > HORSE_Z + 3) state.combo = 0;
          if (t.hit || t.root.position.z > HORSE_Z + 5) { world.remove(t.root); targets.splice(i, 1); }
        }
      }
      if (state.roundElapsed >= round.seconds) {
        if (state.stage >= archeryRounds.length - 1) {
          const speedBonus = Math.round(Math.max(0, state.speed - 14) * 70);
          state.score += speedBonus;
          finish();
        } else {
          state.stage += 1;
          state.roundElapsed = 0; state.lastTargetSpawn = 0;
          state.targetSpeed = archeryRounds[state.stage].pace;
          clearTargets(targets, world);
          say(`${state.stage + 1}-р үе эхэллээ`, `Round ${state.stage + 1} started`, 1100);
        }
      }
    }

    function updateArrows(dt: number) {
      for (const a of arrows) {
        a.t += dt * 3.4;
        const t = Math.min(1, a.t);
        const pos = a.from.clone().lerp(a.to, t);
        pos.y += Math.sin(t * Math.PI) * 1.4;
        a.mesh.position.copy(pos);
        const tangent = a.to.clone().sub(a.from).normalize();
        a.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent);
      }
      for (let i = arrows.length - 1; i >= 0; i--) {
        if (arrows[i].t >= 1.1) { world.remove(arrows[i].mesh); arrows.splice(i, 1); }
      }
    }

    function animate(now: number) {
      if (destroyed) return;
      const dt = Math.min(.04, (now - last) / 1000 || .016);
      last = now;
      if (state.status === "running") {
        if (mode === "relay") updateRelay(dt); else updateArchery(dt, now);
        updateWorld(dt, now);
      }
      updateHorse(dt, now);
      updateArrows(dt);

      const speedShake = state.status === "running" ? (state.speed / 22) : 0;
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, horse.root.position.x * .18 + Math.sin(now * .013) * .018 * speedShake, .08);
      camera.position.y = 4.15 + Math.abs(Math.sin(now * .012)) * .035 * speedShake + state.jumpY * .16;
      camera.lookAt(horse.root.position.x * .12, 1.35 + state.jumpY * .12, -9.8);

      renderer.render(scene, camera);
      hudClock += dt;
      if (hudClock > .11) { hudClock = 0; updateHud(); }
      raf = requestAnimationFrame(animate);
    }
    raf = requestAnimationFrame(animate);

    const onKeyDown = (e: KeyboardEvent) => {
      if (["ArrowLeft","ArrowRight","ArrowUp","Space"].includes(e.code)) e.preventDefault();
      if (e.code === "KeyP" || e.code === "Escape") {
        state.status === "running" ? pause() : state.status === "paused" ? resume() : undefined;
      }
      if (mode === "relay") {
        if ((e.code === "ArrowLeft" || e.code === "KeyA") && !e.repeat) changeLane(-1);
        if ((e.code === "ArrowRight" || e.code === "KeyD") && !e.repeat) changeLane(1);
        if ((e.code === "ArrowUp" || e.code === "Space") && !e.repeat) jump();
        if (e.code === "ShiftLeft" || e.code === "ShiftRight") state.boosting = true;
      } else {
        if ((e.code === "KeyW" || e.code === "ArrowUp") && !e.repeat) pace(1);
        if ((e.code === "KeyS" || e.code === "ArrowDown") && !e.repeat) pace(-1);
        if (e.code === "ShiftLeft" || e.code === "ShiftRight") state.focusHeld = true;
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "ShiftLeft" || e.code === "ShiftRight") {
        state.boosting = false; state.focusHeld = false;
      }
    };
    window.addEventListener("keydown", onKeyDown, { passive: false });
    window.addEventListener("keyup", onKeyUp);

    return () => {
      destroyed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      if (flashTimer) window.clearTimeout(flashTimer);
      engineRef.current = null;
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        mesh.geometry?.dispose?.();
        const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(material)) material.forEach((m) => m.dispose()); else material?.dispose?.();
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [mode]);

  const title = mode === "relay" ? c.relayTitle : c.archeryTitle;
  const kicker = mode === "relay" ? c.relayKicker : c.archeryKicker;
  const intro = mode === "relay" ? c.relayIntro : c.archeryIntro;
  const controls = mode === "relay" ? c.relayControls : c.archeryControls;
  const stageTitle = mode === "relay"
    ? (language === "mn" ? relayStages[hud.stage - 1]?.titleMn : relayStages[hud.stage - 1]?.titleEn)
    : (language === "mn" ? archeryRounds[hud.stage - 1]?.titleMn : archeryRounds[hud.stage - 1]?.titleEn);

  const resultRank = useMemo(() => {
    if (mode === "relay") {
      if (hud.integrity >= 90 && hud.score >= 2800) return language === "mn" ? "Их элч" : "Great courier";
      if (hud.integrity >= 70) return language === "mn" ? "Шуурхай элч" : "Swift courier";
      return language === "mn" ? "Талын элч" : "Steppe courier";
    }
    if (accuracy >= 70 && hud.score >= 2600) return language === "mn" ? "Их мэргэн" : "Grand mounted archer";
    if (accuracy >= 50) return language === "mn" ? "Мэргэшсэн харваач" : "Skilled mounted archer";
    return language === "mn" ? "Дадлагажигч" : "Apprentice";
  }, [accuracy, hud.integrity, hud.score, language, mode]);

  const pointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (mode !== "archery") return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = THREE.MathUtils.clamp(((e.clientX - r.left) / r.width) * 100, 2, 98);
    const y = THREE.MathUtils.clamp(((e.clientY - r.top) / r.height) * 100, 2, 98);
    setAim({ x, y });
    engineRef.current?.aim(x, y);
  };

  return (
    <main className="gamePage steppe3dPage">
      <Header language={language} onLanguageChange={() => setLanguage((v) => v === "mn" ? "en" : "mn")} />
      <section className="steppe3dHero">
        <div>
          <span className="kicker light">{kicker}</span>
          <h1>{title}</h1>
          <p>{intro}</p>
        </div>
        <div className="steppe3dHeroStats">
          <div><span>{c.score}</span><strong>{hud.score}</strong></div>
          <div><span>{c.speed}</span><strong>{hud.speed} км/ц</strong></div>
          <div><span>{c.stage}</span><strong>{hud.stage}/{hud.stageCount}</strong></div>
          <div><span>{c.best}</span><strong>{best}</strong></div>
        </div>
      </section>

      <section className="steppe3dMission">
        <div><small>{c.stage} {hud.stage}/{hud.stageCount}</small><strong>{stageTitle}</strong></div>
        <p>{mode === "relay" ? c.relayGoal : c.archeryGoal}</p>
      </section>

      <section className="steppe3dViewportWrap">
        <div
          ref={mountRef}
          className={`steppe3dViewport ${mode}`}
          onPointerMove={pointerMove}
          onPointerDown={(e) => {
            // Only capture the pointer while the archery round is actually running.
            // Capturing pointer events while the READY overlay is visible steals the
            // Start button's pointerup/click event in Safari/Chrome.
            if (mode !== "archery" || status !== "running") return;
            const target = e.target as HTMLElement;
            if (target.closest("button, a, input, select, textarea")) return;
            pointerMove(e);
            e.currentTarget.setPointerCapture(e.pointerId);
            engineRef.current?.beginDraw();
          }}
          onPointerUp={(e) => {
            if (mode !== "archery" || status !== "running") return;
            const target = e.target as HTMLElement;
            if (target.closest("button, a, input, select, textarea")) return;
            pointerMove(e);
            engineRef.current?.shoot();
            if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
          }}
          onPointerCancel={(e) => {
            if (mode !== "archery" || status !== "running") return;
            engineRef.current?.shoot();
            if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
          }}
        >
          <div ref={canvasHostRef} className="steppe3dCanvasHost" />
          {mode === "archery" && status === "running" && <div className="steppeCrosshair" style={{ left: `${aim.x}%`, top: `${aim.y}%` }}><i /><b /></div>}
          {message && <div className="steppe3dFlash">{message}</div>}
          {status === "ready" && (
            <div className="steppe3dStartOverlay">
              <div className="steppe3dStartBadge">{mode === "relay" ? "🐎" : "🏹"}</div>
              <h2>{title}</h2>
              <p>{controls}</p>
              <button onClick={() => engineRef.current?.start()}>{c.start}</button>
            </div>
          )}
          {status === "paused" && (
            <div className="steppe3dStartOverlay compact">
              <h2>{language === "mn" ? "Түр зогслоо" : "Paused"}</h2>
              <button onClick={() => engineRef.current?.resume()}>{c.resume}</button>
            </div>
          )}

          {status === "running" && mode === "relay" && (
            <div className="steppeTouchControls relay">
              <button onPointerDown={(e) => { e.stopPropagation(); engineRef.current?.lane(-1); }}>←</button>
              <button onPointerDown={(e) => { e.stopPropagation(); engineRef.current?.jump(); }}>↑</button>
              <button onPointerDown={(e) => { e.stopPropagation(); engineRef.current?.lane(1); }}>→</button>
              <button className="boost"
                onPointerDown={(e) => { e.stopPropagation(); engineRef.current?.boost(true); }}
                onPointerUp={(e) => { e.stopPropagation(); engineRef.current?.boost(false); }}
                onPointerCancel={(e) => { e.stopPropagation(); engineRef.current?.boost(false); }}
                onPointerLeave={(e) => { e.stopPropagation(); engineRef.current?.boost(false); }}>⚡</button>
            </div>
          )}
          {status === "running" && mode === "archery" && (
            <div className="steppeTouchControls archery">
              <button onPointerDown={(e) => { e.stopPropagation(); engineRef.current?.pace(-1); }} onPointerUp={(e) => e.stopPropagation()}>−</button>
              <button className="focus"
                onPointerDown={(e) => { e.stopPropagation(); engineRef.current?.focus(true); }}
                onPointerUp={(e) => { e.stopPropagation(); engineRef.current?.focus(false); }}
                onPointerCancel={(e) => { e.stopPropagation(); engineRef.current?.focus(false); }}
                onPointerLeave={(e) => { e.stopPropagation(); engineRef.current?.focus(false); }}>◎</button>
              <button onPointerDown={(e) => { e.stopPropagation(); engineRef.current?.pace(1); }} onPointerUp={(e) => e.stopPropagation()}>+</button>
            </div>
          )}
        </div>

        <div className="steppe3dHud">
          {mode === "relay" ? (
            <>
              <div><small>{c.stamina}</small><strong>{hud.stamina}%</strong><meter min="0" max="100" value={hud.stamina} /></div>
              <div><small>{c.integrity}</small><strong>{hud.integrity}%</strong><meter min="0" max="100" value={hud.integrity} /></div>
              <div><small>{c.checkpoints}</small><strong>{hud.checkpoints}/{hud.checkpointGoal}</strong></div>
              <div><small>{c.distance}</small><strong>{hud.distance} м</strong></div>
              <div><small>{c.time}</small><strong>{hud.time} сек</strong></div>
            </>
          ) : (
            <>
              <div><small>{c.time}</small><strong>{hud.time} сек</strong></div>
              <div><small>{c.combo}</small><strong>x{hud.combo}</strong></div>
              <div><small>{c.accuracy}</small><strong>{accuracy}%</strong></div>
              <div><small>{c.focus}</small><strong>{hud.focus}%</strong><meter min="0" max="100" value={hud.focus} /></div>
              <div><small>{c.power}</small><strong>{hud.power}%</strong><meter min="0" max="100" value={hud.power} /></div>
              <div><small>{c.wind}</small><strong>{hud.wind > 0 ? "→" : "←"} {Math.abs(hud.wind).toFixed(1)}</strong></div>
            </>
          )}
        </div>
      </section>

      <section className="steppe3dControlsBar">
        <span>{controls}</span>
        {status === "running" && <button onClick={() => engineRef.current?.pause()}>{c.pause}</button>}
      </section>

      {status === "finished" && (
        <div className="resultBackdrop">
          <div className="resultModal steppe3dResult">
            <div className="resultBadge">{mode === "relay" ? "🐎" : "🏹"}</div>
            <span className="kicker">{mode === "relay" ? c.finishedRelay : c.finishedArchery}</span>
            <h2>{hud.score} <small>PTS</small></h2>
            <p>{resultRank}</p>
            <div className="steppe3dResultGrid">
              {mode === "relay" ? (
                <>
                  <div><small>{c.integrity}</small><strong>{hud.integrity}%</strong></div>
                  <div><small>{c.distance}</small><strong>{hud.distance}м</strong></div>
                  <div><small>{c.stamina}</small><strong>{hud.stamina}%</strong></div>
                </>
              ) : (
                <>
                  <div><small>{c.accuracy}</small><strong>{accuracy}%</strong></div>
                  <div><small>{language === "mn" ? "Оносон" : "Hits"}</small><strong>{hud.hits}</strong></div>
                  <div><small>{language === "mn" ? "Харвасан" : "Shots"}</small><strong>{hud.shots}</strong></div>
                </>
              )}
            </div>
            <div className="modalActions">
              <button className="primaryButton" onClick={() => engineRef.current?.restart()}>{c.restart}</button>
              <a className="secondaryButton" href="/">{language === "mn" ? "Нүүр" : "Home"}</a>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function createHorseRig(mode: Mode): HorseRig {
  const root = new THREE.Group();
  root.scale.setScalar(.82);
  const body = new THREE.Group();
  root.add(body);
  const coat = new THREE.MeshStandardMaterial({ color: mode === "relay" ? 0x60432f : 0x3f3b37, roughness: .83, metalness: 0 });
  const coatLight = new THREE.MeshStandardMaterial({ color: mode === "relay" ? 0x7b5940 : 0x5d554d, roughness: .86 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x211b18, roughness: .92 });
  const leather = new THREE.MeshStandardMaterial({ color: 0x59391f, roughness: .72 });
  const blanket = new THREE.MeshStandardMaterial({ color: mode === "relay" ? 0x8f673d : 0x7a3e2c, roughness: .8 });
  const metal = new THREE.MeshStandardMaterial({ color: 0x766e5e, roughness: .45, metalness: .45 });
  const riderMat = new THREE.MeshStandardMaterial({ color: mode === "relay" ? 0x214d43 : 0x52321f, roughness: .8 });
  const riderDark = new THREE.MeshStandardMaterial({ color: 0x182823, roughness: .9 });
  const skin = new THREE.MeshStandardMaterial({ color: 0xb7835e, roughness: .92 });

  const torsoHorse = new THREE.Mesh(new THREE.SphereGeometry(1, 30, 20), coat);
  torsoHorse.scale.set(.72, .68, 1.5);
  torsoHorse.position.set(0, 1.16, 0);
  torsoHorse.castShadow = torsoHorse.receiveShadow = true;
  body.add(torsoHorse);

  const chest = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 18), coatLight);
  chest.scale.set(.72, .78, .72); chest.position.set(0, 1.25, -.92); chest.castShadow = true; body.add(chest);
  const rump = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 18), coat);
  rump.scale.set(.76, .72, .8); rump.position.set(0, 1.22, .95); rump.castShadow = true; body.add(rump);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(.42, .58, 1.45, 20), coatLight);
  neck.position.set(0, 1.8, -1.12); neck.rotation.x = -.58; neck.castShadow = true; body.add(neck);
  const head = new THREE.Group();
  head.position.set(0, 2.28, -1.75); body.add(head);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 18), coatLight);
  skull.scale.set(.42, .55, .72); skull.rotation.x = .12; skull.castShadow = true; head.add(skull);
  const muzzle = new THREE.Mesh(new THREE.SphereGeometry(1, 18, 14), coat);
  muzzle.scale.set(.36, .3, .55); muzzle.position.set(0, -.18, -.55); muzzle.castShadow = true; head.add(muzzle);
  for (const sx of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(.12, .42, 8), coatLight);
    ear.position.set(sx * .2, .5, -.05); ear.rotation.x = -.08; ear.castShadow = true; head.add(ear);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(.035, 8, 8), dark);
    eye.position.set(sx * .34, .12, -.48); head.add(eye);
  }

  const mane = new THREE.Group();
  for (let i = 0; i < 8; i++) {
    const tuft = new THREE.Mesh(new THREE.ConeGeometry(.11, .42, 6), dark);
    tuft.position.set(0, 1.95 - i * .12, -1.56 + i * .1); tuft.rotation.x = 1.05; mane.add(tuft);
  }
  body.add(mane);

  const tail = new THREE.Group();
  tail.position.set(0, 1.42, 1.45); body.add(tail);
  for (let i = 0; i < 5; i++) {
    const t = new THREE.Mesh(new THREE.CylinderGeometry(.055 + i * .008, .035, .62, 8), dark);
    t.position.set((i - 2) * .055, -.18 - i * .08, .22 + i * .17); t.rotation.x = -.62 - i * .08; t.castShadow = true; tail.add(t);
  }

  const legs: HorseRig["legs"] = [];
  const legPos = [
    [-.43, 1.05, -.82, 0], [.43, 1.05, -.82, Math.PI], [-.43, 1.05, .82, Math.PI], [.43, 1.05, .82, 0]
  ] as const;
  legPos.forEach(([x, y, z, offset]) => {
    const upper = new THREE.Group(); upper.position.set(x, y, z); body.add(upper);
    const upperMesh = new THREE.Mesh(new THREE.CylinderGeometry(.16, .12, .78, 12), coat);
    upperMesh.position.y = -.37; upperMesh.castShadow = true; upper.add(upperMesh);
    const lower = new THREE.Group(); lower.position.y = -.72; upper.add(lower);
    const lowerMesh = new THREE.Mesh(new THREE.CylinderGeometry(.105, .08, .68, 10), coatLight);
    lowerMesh.position.y = -.32; lowerMesh.castShadow = true; lower.add(lowerMesh);
    const hoof = new THREE.Mesh(new THREE.BoxGeometry(.2, .11, .29), dark);
    hoof.position.set(0, -.68, -.06); hoof.castShadow = true; lower.add(hoof);
    legs.push({ upper, lower, offset });
  });

  const saddleBlanket = new THREE.Mesh(new THREE.BoxGeometry(1.08, .12, 1.15), blanket);
  saddleBlanket.position.set(0, 1.78, .05); saddleBlanket.rotation.x = .04; saddleBlanket.castShadow = true; body.add(saddleBlanket);
  const saddle = new THREE.Mesh(new THREE.BoxGeometry(.82, .22, .8), leather);
  saddle.position.set(0, 1.92, .02); saddle.castShadow = true; body.add(saddle);
  const saddlePommel = new THREE.Mesh(new THREE.TorusGeometry(.23, .055, 8, 18, Math.PI), leather);
  saddlePommel.position.set(0, 2.04, -.28); saddlePommel.rotation.z = Math.PI; saddlePommel.rotation.x = Math.PI / 2; body.add(saddlePommel);
  for (const x of [-.55, .55]) {
    const stirrup = new THREE.Mesh(new THREE.TorusGeometry(.16, .035, 8, 16), metal);
    stirrup.position.set(x, 1.3, .15); stirrup.rotation.y = Math.PI / 2; body.add(stirrup);
  }

  const bridle = new THREE.Mesh(new THREE.TorusGeometry(.38, .025, 8, 30), leather);
  bridle.scale.set(1, 1.35, 1); bridle.position.set(0, 2.22, -1.91); bridle.rotation.x = Math.PI / 2; body.add(bridle);

  const rider = new THREE.Group(); rider.position.set(0, 1.98, .05); root.add(rider);
  const hips = new THREE.Mesh(new THREE.SphereGeometry(.34, 16, 12), riderDark); hips.scale.set(1.05, .65, .8); hips.position.y = .1; hips.castShadow = true; rider.add(hips);
  const riderTorso = new THREE.Group(); riderTorso.position.y = .45; rider.add(riderTorso);
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(.32, .42, .95, 14), riderMat); torso.position.y = .43; torso.castShadow = true; riderTorso.add(torso);
  const belt = new THREE.Mesh(new THREE.CylinderGeometry(.43, .43, .11, 14), leather); belt.position.y = .05; riderTorso.add(belt);
  const headHuman = new THREE.Mesh(new THREE.SphereGeometry(.22, 18, 14), skin); headHuman.position.set(0, 1.12, -.04); headHuman.castShadow = true; riderTorso.add(headHuman);
  const hat = new THREE.Mesh(new THREE.CylinderGeometry(.22, .34, .25, 12), riderDark); hat.position.set(0, 1.32, -.02); hat.castShadow = true; riderTorso.add(hat);
  const brim = new THREE.Mesh(new THREE.CylinderGeometry(.37, .37, .045, 18), riderDark); brim.position.set(0, 1.2, -.02); riderTorso.add(brim);

  for (const x of [-1, 1]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(.09, .1, .95, 10), riderDark);
    leg.position.set(x * .37, -.28, .12); leg.rotation.z = x * .28; leg.rotation.x = -.08; leg.castShadow = true; rider.add(leg);
    const boot = new THREE.Mesh(new THREE.BoxGeometry(.18, .18, .38), dark);
    boot.position.set(x * .52, -.73, -.08); boot.rotation.y = x * .1; rider.add(boot);
  }

  const leftArm = new THREE.Group(); leftArm.position.set(-.29, .78, -.06); riderTorso.add(leftArm);
  const rightArm = new THREE.Group(); rightArm.position.set(.29, .78, -.06); riderTorso.add(rightArm);
  for (const arm of [leftArm, rightArm]) {
    const upper = new THREE.Mesh(new THREE.CylinderGeometry(.075, .09, .62, 10), riderMat); upper.position.y = -.28; upper.castShadow = true; arm.add(upper);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(.09, 10, 8), skin); hand.position.y = -.63; arm.add(hand);
  }

  if (mode === "relay") {
    leftArm.rotation.x = -1.1; leftArm.rotation.z = -.38;
    rightArm.rotation.x = -1.1; rightArm.rotation.z = .38;
    const reinsGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-.3, .62, -.05), new THREE.Vector3(0, .25, -1.55), new THREE.Vector3(.3, .62, -.05)
    ]);
    const reins = new THREE.Line(reinsGeo, new THREE.LineBasicMaterial({ color: 0x4d3420 })); riderTorso.add(reins);
    const satchel = new THREE.Mesh(new THREE.BoxGeometry(.44, .5, .18), leather); satchel.position.set(-.48, .18, .35); satchel.rotation.z = -.08; rider.add(satchel);
    const seal = new THREE.Mesh(new THREE.CylinderGeometry(.08, .08, .04, 12), new THREE.MeshStandardMaterial({ color: 0xa74431 })); seal.rotation.x = Math.PI / 2; seal.position.set(-.48, .18, .24); rider.add(seal);
  } else {
    leftArm.rotation.x = -1.38; leftArm.rotation.z = -.18;
    rightArm.rotation.x = -.48; rightArm.rotation.z = -.48;
    const bowHand = new THREE.Group(); bowHand.position.set(-.2, .19, -.7); leftArm.add(bowHand);
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -.75, 0), new THREE.Vector3(-.18, -.35, 0), new THREE.Vector3(-.2, 0, 0), new THREE.Vector3(-.18, .35, 0), new THREE.Vector3(0, .75, 0)
    ]);
    const bow = new THREE.Mesh(new THREE.TubeGeometry(curve, 20, .025, 6, false), leather); bowHand.add(bow);
    const stringGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, -.75, 0), new THREE.Vector3(-.26, 0, 0), new THREE.Vector3(0, .75, 0)]);
    const string = new THREE.Line(stringGeo, new THREE.LineBasicMaterial({ color: 0xf1dfb9 })); bowHand.add(string);
    const quiver = new THREE.Mesh(new THREE.CylinderGeometry(.12, .16, .72, 10), leather); quiver.position.set(.42, .36, .42); quiver.rotation.z = -.24; rider.add(quiver);
    for (let i = 0; i < 4; i++) {
      const arrow = new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, .82, 6), metal); arrow.position.set(.35 + i * .055, .7, .42); rider.add(arrow);
    }
    return { root, body, rider, legs, tail, head, riderTorso, leftArm, rightArm, bowString: string, bowHand, materials: [coat, coatLight, dark, leather, blanket, metal, riderMat, riderDark, skin] };
  }

  return { root, body, rider, legs, tail, head, riderTorso, leftArm, rightArm, materials: [coat, coatLight, dark, leather, blanket, metal, riderMat, riderDark, skin] };
}

function createRoadsideProp(i: number) {
  const g = new THREE.Group();
  if (i % 7 === 0) {
    const wall = new THREE.Mesh(new THREE.CylinderGeometry(.9, 1.05, .85, 16), new THREE.MeshStandardMaterial({ color: 0xe3d4b8, roughness: 1 }));
    wall.position.y = .43; wall.castShadow = true; g.add(wall);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(1.05, .75, 16), new THREE.MeshStandardMaterial({ color: 0xa8845a, roughness: 1 }));
    roof.position.y = 1.18; roof.castShadow = true; g.add(roof);
    const door = new THREE.Mesh(new THREE.BoxGeometry(.3, .55, .04), new THREE.MeshStandardMaterial({ color: 0x65412a })); door.position.set(0, .31, -.92); g.add(door);
  } else if (i % 5 === 0) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(.04, .05, 2.4, 8), new THREE.MeshStandardMaterial({ color: 0x684a2c })); pole.position.y = 1.2; g.add(pole);
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(.72, .42), new THREE.MeshStandardMaterial({ color: i % 2 ? 0x3e6a74 : 0x9b513b, side: THREE.DoubleSide })); flag.position.set(.38, 2.05, 0); g.add(flag);
  } else {
    for (let k = 0; k < 5; k++) {
      const grass = new THREE.Mesh(new THREE.ConeGeometry(.05, .7 + Math.random() * .5, 5), new THREE.MeshStandardMaterial({ color: k % 2 ? 0x647044 : 0x8a7746 }));
      grass.position.set((Math.random() - .5) * 1.8, .35, (Math.random() - .5) * 1.8); grass.rotation.z = (Math.random() - .5) * .4; g.add(grass);
    }
  }
  return g;
}

function createRelayEntityMesh(kind: RelayKind) {
  const g = new THREE.Group();
  const wood = new THREE.MeshStandardMaterial({ color: 0x6e492c, roughness: .9 });
  const stone = new THREE.MeshStandardMaterial({ color: 0x5b5650, roughness: 1 });
  if (kind === "rock") {
    const m = new THREE.Mesh(new THREE.DodecahedronGeometry(.62, 0), stone); m.scale.set(1.1, .7, .85); m.position.y = .42; m.castShadow = true; g.add(m);
  } else if (kind === "log") {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(.28, .32, 1.55, 12), wood); m.rotation.z = Math.PI / 2; m.position.y = .32; m.castShadow = true; g.add(m);
  } else if (kind === "checkpoint") {
    const cloth = new THREE.MeshStandardMaterial({ color: 0xd9bf84, roughness: .85, side: THREE.DoubleSide });
    for (const x of [-.72, .72]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(.06, .07, 2.8, 8), wood); p.position.set(x, 1.4, 0); p.castShadow = true; g.add(p); }
    const b = new THREE.Mesh(new THREE.BoxGeometry(1.55, .5, .05), cloth); b.position.y = 2.35; b.castShadow = true; g.add(b);
    const mark = new THREE.Mesh(new THREE.CircleGeometry(.16, 18), new THREE.MeshStandardMaterial({ color: 0x9a4937, side: THREE.DoubleSide })); mark.position.set(0, 2.35, .035); g.add(mark);
  } else if (kind === "water") {
    const trough = new THREE.Mesh(new THREE.BoxGeometry(1.25, .42, .7), wood); trough.position.y = .33; trough.castShadow = true; g.add(trough);
    const water = new THREE.Mesh(new THREE.PlaneGeometry(1.05, .5), new THREE.MeshStandardMaterial({ color: 0x5c94a2, metalness: .15, roughness: .25, side: THREE.DoubleSide })); water.rotation.x = -Math.PI / 2; water.position.y = .56; g.add(water);
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(.48, .32), new THREE.MeshStandardMaterial({ color: 0x4e7f8d, side: THREE.DoubleSide })); flag.position.set(.85, 1.35, 0); g.add(flag);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(.035, .04, 1.8, 8), wood); pole.position.set(.62, .9, 0); g.add(pole);
  } else {
    for (const x of [-3.4, 3.4]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(.12, .16, 4.6, 10), wood); p.position.set(x, 2.3, 0); p.castShadow = true; g.add(p); }
    const beam = new THREE.Mesh(new THREE.BoxGeometry(7.1, .34, .34), wood); beam.position.y = 4.35; beam.castShadow = true; g.add(beam);
    const banner = new THREE.Mesh(new THREE.PlaneGeometry(3.3, .8), new THREE.MeshStandardMaterial({ color: 0x345d54, side: THREE.DoubleSide, roughness: .8 })); banner.position.set(0, 3.78, .02); g.add(banner);
    const lanternMat = new THREE.MeshStandardMaterial({ color: 0xffc96e, emissive: 0xff8a35, emissiveIntensity: 1.3 });
    for (const x of [-2.4, 2.4]) { const l = new THREE.Mesh(new THREE.SphereGeometry(.15, 10, 8), lanternMat); l.position.set(x, 3.85, .15); g.add(l); }
  }
  return g;
}

function createTargetMesh(gold: boolean) {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(.055, .07, 2.4, 8), new THREE.MeshStandardMaterial({ color: 0x5d3c25 })); pole.position.y = -1.0; pole.castShadow = true; g.add(pole);
  const rings = gold
    ? [[1, 0xe9cc72], [.78, 0xbc7a2f], [.56, 0xf1da7e], [.34, 0x8f4c27], [.14, 0xffedac]]
    : [[1, 0xeee2c9], [.78, 0xb74e3c], [.56, 0xebcb66], [.34, 0x37645b], [.14, 0x8d332d]];
  let disk: THREE.Mesh | null = null;
  rings.forEach(([r, color], idx) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(Number(r), Number(r), .075, 36), new THREE.MeshStandardMaterial({ color: Number(color), roughness: .75 }));
    m.rotation.x = Math.PI / 2; m.position.z = idx * .018; m.castShadow = true; g.add(m); if (idx === 0) disk = m;
  });
  g.userData.disk = disk;
  return g;
}

function createArrow(from: THREE.Vector3, to: THREE.Vector3) {
  const g = new THREE.Group();
  g.position.copy(from);
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(.018, .018, 1.05, 8), new THREE.MeshStandardMaterial({ color: 0x3c2c1e, roughness: .8 }));
  shaft.position.y = .5; g.add(shaft);
  const head = new THREE.Mesh(new THREE.ConeGeometry(.06, .18, 8), new THREE.MeshStandardMaterial({ color: 0x77746c, metalness: .5, roughness: .4 })); head.position.y = 1.11; g.add(head);
  const dir = to.clone().sub(from).normalize(); g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  return g;
}

function spawnBurstAt(scene: THREE.Group, at: THREE.Vector3, color: number) {
  for (let i = 0; i < 12; i++) {
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .85 });
    const p = new THREE.Mesh(new THREE.SphereGeometry(.04, 6, 6), mat);
    p.position.copy(at).add(new THREE.Vector3((Math.random() - .5) * .8, (Math.random() - .5) * .8, (Math.random() - .5) * .4));
    scene.add(p);
    const start = performance.now();
    const tick = () => {
      const t = (performance.now() - start) / 500;
      if (t >= 1) { scene.remove(p); p.geometry.dispose(); mat.dispose(); return; }
      p.scale.setScalar(1 + t * 2); mat.opacity = 1 - t; requestAnimationFrame(tick);
    };
    tick();
  }
}

function clearEntities(items: RelayEntity[], world: THREE.Group) {
  for (const e of items) world.remove(e.root);
  items.splice(0);
}
function clearTargets(items: TargetEntity[], world: THREE.Group) {
  for (const t of items) world.remove(t.root);
  items.splice(0);
}

function playTone(kind: "jump" | "impact" | "checkpoint" | "water" | "station" | "hit" | "gold" | "miss") {
  if (typeof window === "undefined") return;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  const ctx = new AC();
  const osc = ctx.createOscillator(); const gain = ctx.createGain();
  osc.connect(gain); gain.connect(ctx.destination);
  const now = ctx.currentTime;
  const map: Record<typeof kind, [number, number, number]> = {
    jump: [180, 250, .09], impact: [110, 58, .12], checkpoint: [420, 620, .12], water: [350, 520, .16],
    station: [280, 720, .28], hit: [470, 650, .12], gold: [720, 1060, .2], miss: [130, 90, .08]
  };
  const [a, b, d] = map[kind];
  osc.frequency.setValueAtTime(a, now); osc.frequency.exponentialRampToValueAtTime(b, now + d);
  gain.gain.setValueAtTime(.035, now); gain.gain.exponentialRampToValueAtTime(.001, now + d);
  osc.start(); osc.stop(now + d); osc.onended = () => void ctx.close();
}

