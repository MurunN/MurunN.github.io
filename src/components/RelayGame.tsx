"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { Header } from "@/components/Header";

type Language = "mn" | "en";

type Horse = {
  id: string;
  icon: string;
  title: Record<Language, string>;
  summary: Record<Language, string>;
  staminaBonus: number;
  timeBonus: number;
  sealBonus: number;
};

type Choice = {
  label: Record<Language, string>;
  effect: Record<Language, string>;
  score: number;
  stamina: number;
  time: number;
  seal: number;
};

type Stage = {
  icon: string;
  weather: string;
  distance: string;
  title: Record<Language, string>;
  text: Record<Language, string>;
  choices: Choice[];
};

type JourneyLog = {
  stage: string;
  choice: string;
  effect: string;
};

const horses: Horse[] = [
  {
    id: "swift",
    icon: "🐎",
    title: { mn: "Шуурган хүлэг", en: "Swift Horse" },
    summary: { mn: "Хурд сайн, хугацаа хэмнэнэ. Харин тэнхээ хурдан барагдана.", en: "Fast and time-saving, but loses stamina quickly." },
    staminaBonus: -6,
    timeBonus: -5,
    sealBonus: 0
  },
  {
    id: "steady",
    icon: "♞",
    title: { mn: "Тэнхээт морь", en: "Steady Horse" },
    summary: { mn: "Тэнцвэртэй сонголт. Хурд ба тэнхээний дундаж хослолтой.", en: "A balanced choice with a reliable blend of speed and endurance." },
    staminaBonus: 8,
    timeBonus: 0,
    sealBonus: 4
  },
  {
    id: "mountain",
    icon: "🏇",
    title: { mn: "Уулын хүлэг", en: "Mountain Horse" },
    summary: { mn: "Бартаат замд тэсвэртэй, зарлигийг найдвартай хамгаална. Гэвч арай удаан.", en: "Strong on difficult terrain and protects the message well, but travels more slowly." },
    staminaBonus: 14,
    timeBonus: 4,
    sealBonus: 8
  }
];

const stages: Stage[] = [
  {
    icon: "🌅",
    weather: "Өглөөний сэрүүн",
    distance: "18 км",
    title: { mn: "Эхний өртөөнөөс мордох", en: "Ride out from the first station" },
    text: {
      mn: "Өглөөний манан арилаагүй байна. Зарлигийг яаралтай хүргэх ч морь, бичгийн тамгыг эхнээс нь гамтай авч явах хэрэгтэй.",
      en: "The morning mist is still low. The message is urgent, but both horse and seal must be managed carefully from the beginning."
    },
    choices: [
      { label: { mn: "Замын тэмдэглэгээ даган жигд хурдтай эхлэх", en: "Start with a steady pace along the marked route" }, effect: { mn: "Эхлэл тайван, зам зөв тавигдав. Морь ч жигд амьсгалж байна.", en: "A calm opening and a clean route. The horse settles into a good rhythm." }, score: 95, stamina: -8, time: 3, seal: 0 },
      { label: { mn: "Хугацаа хожихын тулд эхнээс нь хурдлах", en: "Push the pace immediately to gain time" }, effect: { mn: "Хэсэг хугацаа хожсон ч морь амьсгаадаж эхлэв.", en: "You gained time, but the horse began to tire early." }, score: 65, stamina: -18, time: -3, seal: -2 },
      { label: { mn: "Замын нөхцөлийг шалгаж удаан хөдлөх", en: "Move slowly while checking the route" }, effect: { mn: "Эрсдэл бага байсан ч анхны цагийг их алдлаа.", en: "The risk stayed low, but too much time was lost at the start." }, score: 40, stamina: -3, time: 8, seal: 2 }
    ]
  },
  {
    icon: "🌊",
    weather: "Усархаг гарц",
    distance: "24 км",
    title: { mn: "Голын гарц", en: "River crossing" },
    text: {
      mn: "Хүчтэй борооны дараа гол дүүрчээ. Гүүртэй гарц тойрч явах боломжтой ч шулуун зам бас бий.",
      en: "After heavy rain, the river is swollen. You can take the bridge route or risk a straighter crossing."
    },
    choices: [
      { label: { mn: "Гүүртэй гарцыг сонгох", en: "Take the bridge route" }, effect: { mn: "Маршрут урт боловч зарлиг, морь хоёрыг аюулгүй авч гарлаа.", en: "The route was longer, but both horse and message remained safe." }, score: 90, stamina: -10, time: 5, seal: 3 },
      { label: { mn: "Шулуун гол гатлах", en: "Cross the river directly" }, effect: { mn: "Зам товчирсон ч ус цацарч, морь их ядран, тамганы уут норлоо.", en: "The route shortened, but the horse tired badly and the seal bag got wet." }, score: 38, stamina: -28, time: 1, seal: -16 },
      { label: { mn: "Орон нутгийн малчнаас гарц асууж чиг авах", en: "Ask a local herder for a safer crossing" }, effect: { mn: "Бага зэрэг саатсан ч илүү найдвартай, ухаалаг зам оллоо.", en: "You lost a little time but found a smarter, safer crossing." }, score: 82, stamina: -8, time: 4, seal: 6 }
    ]
  },
  {
    icon: "🌬️",
    weather: "Салхи ширүүсэв",
    distance: "31 км",
    title: { mn: "Талын салхитай өндөрлөг", en: "Windy upland stretch" },
    text: {
      mn: "Замын өндөрлөг хэсэгт хүрэхэд салхи ширүүсч, элчийн нүдэнд тоос орж, тамганы уут савлаж эхэллээ.",
      en: "As you reach the upland stretch, strong wind carries dust across the road and shakes the message pouch."
    },
    choices: [
      { label: { mn: "Түр зогсоод уут, тоноглолоо бэхлэх", en: "Stop briefly to secure the pouch and tack" }, effect: { mn: "Хэсэг зогссон ч бичиг, тоног хэрэгсэл хамгаалагдав.", en: "The pause cost time, but the document and equipment stayed secure." }, score: 88, stamina: -4, time: 4, seal: 8 },
      { label: { mn: "Салхийг сөрөн хурдаа хадгалах", en: "Keep moving fast into the wind" }, effect: { mn: "Хурд алдаагүй ч морь, элч хоёул их ядралт авлаа.", en: "You kept your pace, but both rider and horse were heavily strained." }, score: 60, stamina: -22, time: -1, seal: -4 },
      { label: { mn: "Толгодын халхавчаар тойрч явах", en: "Use the hills as shelter and take a detour" }, effect: { mn: "Арай урт зам сонгосон ч явдал жигдэрч, хүч хэмнэгдэв.", en: "The route became longer, but the ride steadied and energy was saved." }, score: 78, stamina: -6, time: 5, seal: 3 }
    ]
  },
  {
    icon: "🌙",
    weather: "Шөнийн аялал",
    distance: "22 км",
    title: { mn: "Шөнийн өртөөний өмнөх шийдвэр", en: "Decision before the night station" },
    text: {
      mn: "Орой болж, дараагийн өртөө холгүй байна. Одоо шууд давхих уу, эсвэл морьдоо сэлгэн амсхийх үү гэсэн сонголт тулгарлаа.",
      en: "Evening falls and the next station is near. You must decide whether to push on or change horses and reset your pace."
    },
    choices: [
      { label: { mn: "Морь сэлгэж богино амралт авах", en: "Change horses and take a short rest" }, effect: { mn: "Өртөөний зохион байгуулалтыг зөв ашигласнаар тэнхээ сэргэсэн ч бага зэрэг хугацаа алдлаа.", en: "Using the relay system well restored strength, though it cost a little time." }, score: 96, stamina: 18, time: 5, seal: 4 },
      { label: { mn: "Амралгүй шууд давхих", en: "Ride through without stopping" }, effect: { mn: "Цаг хэмнэсэн ч алдаа гаргах эрсдэл эрс өсөв.", en: "You saved time, but the risk of mistakes rose sharply." }, score: 62, stamina: -24, time: -3, seal: -7 },
      { label: { mn: "Өртөөний хариуцагчаас замын мэдээлэл авч үргэлжлүүлэх", en: "Gather route information from the station keeper, then continue" }, effect: { mn: "Замын талаар зөв мэдээлэл авснаар шөнийн хэсэг илүү итгэлтэй болов.", en: "Better route information made the night stretch more confident and controlled." }, score: 84, stamina: -6, time: 2, seal: 5 }
    ]
  },
  {
    icon: "🏁",
    weather: "Өглөөний хүргэлт",
    distance: "9 км",
    title: { mn: "Зарлигийг хүлээлгэн өгөх", en: "Deliver the imperial message" },
    text: {
      mn: "Эцсийн өртөөнд хүрэхэд замын ядаргаа мэдрэгдэж байгаа ч хамгийн чухал нь зарлигийг зөв ёсоор хүлээлгэн өгөх мөч ирлээ.",
      en: "You arrive at the final station tired from the road, but the most important moment is now: delivering the message properly."
    },
    choices: [
      { label: { mn: "Тамга, бичгийг шалгуулж албан ёсоор хүлээлгэн өгөх", en: "Verify the seal and formally transfer the message" }, effect: { mn: "Хүргэлт журам ёсоор гүйцэж, элчийн үүрэг нэр төртэй өндөрлөв.", en: "The handover followed proper procedure and the mission ended with honor." }, score: 110, stamina: -2, time: 0, seal: 8 },
      { label: { mn: "Хурдан дуусгахын тулд шууд өгөх", en: "Hand it over quickly without full verification" }, effect: { mn: "Хурдан байсан ч бичгийн аюулгүй байдал бүрэн баталгаажаагүй үлдлээ.", en: "It was fast, but the security of the document was not fully confirmed." }, score: 44, stamina: 0, time: -1, seal: -10 },
      { label: { mn: "Өөрөө дараагийн замд үргэлжлүүлэх санал гаргах", en: "Offer to continue with the message yourself" }, effect: { mn: "Хичээл зүтгэлтэй ч өртөөний дэг журмыг зөрчсөн сонголт боллоо.", en: "Energetic, but it broke the order of the relay system." }, score: 32, stamina: -12, time: 4, seal: -4 }
    ]
  }
];

export function RelayGame() {
  const [language, setLanguage] = useState<Language>("mn");
  const [selectedHorse, setSelectedHorse] = useState<Horse | null>(null);
  const [started, setStarted] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [stamina, setStamina] = useState(72);
  const [minutes, setMinutes] = useState(18);
  const [seal, setSeal] = useState(88);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const [log, setLog] = useState<JourneyLog[]>([]);

  const stage = stages[stageIndex];
  const progress = ((stageIndex + (feedback ? 1 : 0)) / stages.length) * 100;

  const finalRank = useMemo(() => {
    const quality = score + seal + stamina - Math.max(0, minutes - 20) * 2;
    if (quality >= 460) return language === "mn" ? "Их элч" : "Great Messenger";
    if (quality >= 365) return language === "mn" ? "Найдвартай элч" : "Reliable Messenger";
    return language === "mn" ? "Дадлагажигч элч" : "Apprentice Messenger";
  }, [score, seal, stamina, minutes, language]);

  const c = language === "mn"
    ? {
        eyebrow: "МОРИН ӨРТӨӨ",
        title: "Элчийн замыг ухаалгаар туулаарай",
        intro: "Морь сонгож, өртөөнөөс өртөө рүү явна. Сонголт бүр хугацаа, морины тэнхээ, зарлигийн бүрэн бүтэн байдал, эцсийн оноонд нөлөөлнө.",
        chooseHorse: "Эхлэхийн өмнө хүлгээ сонго",
        begin: "Аяллыг эхлүүлэх",
        score: "Оноо",
        stamina: "Морины тэнхээ",
        time: "Хугацаа",
        seal: "Зарлигийн байдал",
        choose: "Нэг шийдвэр сонго",
        next: "Дараагийн өртөө",
        finish: "Хүргэлтийг дуусгах",
        completed: "Зарлиг хүргэлээ",
        guest: "Google-оор нэвтэрвэл тоглолтын оноо, ахиц, нээсэн тэмдэг тань хадгалагдана.",
        login: "Google-оор нэвтрэх",
        again: "Дахин тоглох",
        home: "Нүүр хуудас",
        xp: "Ахиц нэмэгдлээ",
        weather: "Нөхцөл",
        distance: "Зам",
        route: "АЯЛЛЫН ТЭМДЭГЛЭЛ",
        selectedHorse: "Сонгосон хүлэг",
        outcome: "СОНГОЛТЫН ҮР ДҮН"
      }
    : {
        eyebrow: "HORSE RELAY",
        title: "Ride the courier road with care",
        intro: "Choose your horse and ride from station to station. Every decision affects time, stamina, the condition of the message and your final score.",
        chooseHorse: "Choose your horse before you begin",
        begin: "Start the journey",
        score: "Score",
        stamina: "Horse stamina",
        time: "Time",
        seal: "Message condition",
        choose: "Choose one decision",
        next: "Next station",
        finish: "Complete the delivery",
        completed: "Message delivered",
        guest: "Sign in with Google to save your score, XP and badges.",
        login: "Sign in with Google",
        again: "Play again",
        home: "Home",
        xp: "XP earned",
        weather: "Condition",
        distance: "Distance",
        route: "JOURNEY LOG",
        selectedHorse: "Chosen horse",
        outcome: "RESULT OF YOUR CHOICE"
      };

  function applyHorse(horse: Horse) {
    setSelectedHorse(horse);
    setStamina(Math.max(0, Math.min(100, 72 + horse.staminaBonus)));
    setMinutes(Math.max(0, 18 + horse.timeBonus));
    setSeal(Math.max(0, Math.min(100, 88 + horse.sealBonus)));
    setStarted(true);
  }

  async function choose(choice: Choice) {
    if (feedback) return;
    setScore((value) => value + choice.score);
    setStamina((value) => Math.max(0, Math.min(100, value + choice.stamina)));
    setMinutes((value) => Math.max(0, value + choice.time));
    setSeal((value) => Math.max(0, Math.min(100, value + choice.seal)));
    setFeedback(choice.effect[language]);
    setLog((prev) => [
      ...prev,
      {
        stage: stage.title[language],
        choice: choice.label[language],
        effect: choice.effect[language]
      }
    ]);
  }

  async function next() {
    if (stageIndex < stages.length - 1) {
      setStageIndex((value) => value + 1);
      setFeedback(null);
      return;
    }

    setFinished(true);
    if (typeof window !== "undefined") {
      const finalScore = score + Math.floor(seal / 2);
      const previous = Number(window.localStorage.getItem("steppequest-relay-best") || 0);
      if (finalScore > previous) window.localStorage.setItem("steppequest-relay-best", String(finalScore));
    }
  }

  function restart() {
    setSelectedHorse(null);
    setStarted(false);
    setStageIndex(0);
    setScore(0);
    setStamina(72);
    setMinutes(18);
    setSeal(88);
    setFeedback(null);
    setFinished(false);
    setLog([]);
  }

  return (
    <main className="relayGamePage">
      <Header language={language} onLanguageChange={() => setLanguage((value) => value === "mn" ? "en" : "mn")} />
      <section className="relayHero upgradedRelayHero">
        <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }}>
          <span className="kicker light">{c.eyebrow}</span>
          <h1>{c.title}</h1>
          <p>{c.intro}</p>
        </motion.div>
        <div className="relayStats upgradedRelayStats">
          <div><span>{c.score}</span><strong>{score}</strong></div>
          <div><span>{c.stamina}</span><strong>{stamina}%</strong></div>
          <div><span>{c.seal}</span><strong>{seal}%</strong></div>
          <div><span>{c.time}</span><strong>{minutes} мин</strong></div>
        </div>
      </section>

      {!started ? (
        <section className="relayBoard relaySetupBoard">
          <div className="relaySetupIntro">
            <span className="kicker">{c.chooseHorse}</span>
            <h2>{language === "mn" ? "Аяллын эхний шийдвэр" : "Your first decision"}</h2>
            <p>{language === "mn" ? "Хүлгийн онцлог таны тоглолтын өнгө аясыг шууд өөрчилнө." : "The nature of your horse will shape the entire run."}</p>
          </div>
          <div className="relayHorseGrid">
            {horses.map((horse) => (
              <button key={horse.id} type="button" className={selectedHorse?.id === horse.id ? "relayHorseCard active" : "relayHorseCard"} onClick={() => setSelectedHorse(horse)}>
                <i>{horse.icon}</i>
                <strong>{horse.title[language]}</strong>
                <p>{horse.summary[language]}</p>
                <div className="relayHorseMeta">
                  <span>{language === "mn" ? "Тэнхээ" : "Stamina"} {horse.staminaBonus > 0 ? `+${horse.staminaBonus}` : horse.staminaBonus}</span>
                  <span>{language === "mn" ? "Хугацаа" : "Time"} {horse.timeBonus > 0 ? `+${horse.timeBonus}` : horse.timeBonus}</span>
                  <span>{language === "mn" ? "Зарлиг" : "Seal"} {horse.sealBonus > 0 ? `+${horse.sealBonus}` : horse.sealBonus}</span>
                </div>
              </button>
            ))}
          </div>
          <div className="relaySetupActionWrap">
            <button type="button" className="relayStartButton" disabled={!selectedHorse} onClick={() => selectedHorse && applyHorse(selectedHorse)}>{c.begin} →</button>
          </div>
        </section>
      ) : (
        <section className="relayBoard relayBoardEnhanced">
          <div className="relayProgress"><i style={{ width: `${progress}%` }} /></div>
          <div className="relayRouteVisual" aria-hidden="true">
            {stages.map((stageItem, index) => <span key={stageItem.title.en} className={index <= stageIndex ? "passed" : ""}>{index + 1}</span>)}
            <motion.div className="relayRider" animate={{ left: `${Math.min(94, 7 + (stageIndex / (stages.length - 1)) * 86)}%` }}>{selectedHorse?.icon ?? "♞"}</motion.div>
          </div>

          <div className="relayJourneyLayout">
            <AnimatePresence mode="wait">
              {!finished ? (
                <motion.article key={stageIndex} className="relayDecisionCard enhancedRelayCard" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="relayStageTop">
                    <div className="relayStageSymbol">{stage.icon}</div>
                    <div>
                      <span>{language === "mn" ? `${stageIndex + 1}-р үе` : `Stage ${stageIndex + 1}`}</span>
                      <h2>{stage.title[language]}</h2>
                    </div>
                  </div>
                  <div className="relayStageMeta">
                    <div><small>{c.weather}</small><strong>{language === "mn" ? stage.weather : stage.weather}</strong></div>
                    <div><small>{c.distance}</small><strong>{stage.distance}</strong></div>
                    <div><small>{c.selectedHorse}</small><strong>{selectedHorse?.title[language]}</strong></div>
                  </div>
                  <p>{stage.text[language]}</p>
                  <div className="relayChoices enhancedRelayChoices">
                    {stage.choices.map((choice) => (
                      <button key={choice.label[language]} type="button" onClick={() => choose(choice)} disabled={Boolean(feedback)}>
                        <strong>{choice.label[language]}</strong>
                        <div className="relayChoiceEffects">
                          <span>+{choice.score}</span>
                          <span>{choice.time > 0 ? `+${choice.time}` : choice.time} мин</span>
                          <span>{choice.stamina > 0 ? `+${choice.stamina}` : choice.stamina}%</span>
                          <span>{choice.seal > 0 ? `+${choice.seal}` : choice.seal}%</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  {feedback ? (
                    <motion.div className="relayFeedback enhancedRelayFeedback" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <span>{c.outcome}</span>
                      <p>{feedback}</p>
                      <button type="button" onClick={next}>{stageIndex === stages.length - 1 ? c.finish : c.next} →</button>
                    </motion.div>
                  ) : <small>{c.choose}</small>}
                </motion.article>
              ) : (
                <motion.article className="relayResultCard enhancedRelayResult" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
                  <span>✓ {c.completed}</span>
                  <h2>{finalRank}</h2>
                  <div className="relayResultStats"><div><strong>{score}</strong><span>{c.score}</span></div><div><strong>{stamina}%</strong><span>{c.stamina}</span></div><div><strong>{seal}%</strong><span>{c.seal}</span></div><div><strong>{minutes}</strong><span>{c.time}</span></div></div>
                  <p>{language === "mn" ? "Таны шилдэг аяллын оноо энэ төхөөрөмж дээр хадгалагдана." : "Your best relay score is saved on this device."}</p>
                  <div className="relayResultActions">
                    <button type="button" onClick={restart}>{c.again}</button>
                    <Link href="/">{c.home}</Link>
                  </div>
                </motion.article>
              )}
            </AnimatePresence>

            <aside className="relayJournalCard">
              <span>{c.route}</span>
              <div className="relayJournalHeader">
                <strong>{selectedHorse?.icon} {selectedHorse?.title[language]}</strong>
                <small>{language === "mn" ? "Сонголт бүр энэ хэсэгт тэмдэглэгдэнэ." : "Every decision is recorded here."}</small>
              </div>
              {log.length === 0 ? (
                <p className="relayJournalEmpty">{language === "mn" ? "Аялал эхэлмэгц таны сонголтууд энд жагсана." : "Your route log will appear here once the journey begins."}</p>
              ) : (
                <div className="relayJournalList">
                  {log.map((item, index) => (
                    <div key={`${item.stage}-${index}`} className="relayJournalItem">
                      <i>{index + 1}</i>
                      <div>
                        <strong>{item.stage}</strong>
                        <h4>{item.choice}</h4>
                        <p>{item.effect}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </aside>
          </div>
        </section>
      )}
    </main>
  );
}
