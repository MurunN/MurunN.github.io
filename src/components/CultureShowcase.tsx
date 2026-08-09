"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { AudioGuide } from "@/components/AudioGuide";
import { YouTubePerformance } from "@/components/YouTubePerformance";

type Language = "mn" | "en";

type Hotspot = {
  id: string;
  label: Record<Language, string>;
  detail: Record<Language, string>;
  x: number;
  y: number;
};

type CultureItem = {
  id: string;
  symbol: string;
  accent: string;
  audioSrc?: string;
  title: Record<Language, string>;
  summary: Record<Language, string>;
  details: Record<Language, string>;
  moments: Record<Language, string[]>;
  hotspots?: Hotspot[];
  phrases?: { id: string; text: string; meaning: Record<Language, string>; narration: Record<Language, string> }[];
};

const cultureItems: CultureItem[] = [
  {
    id: "ger",
    symbol: "⌂",
    accent: "#9b6033",
    audioSrc: "/audio/culture/ger-ambience.mp3",
    title: { mn: "Монгол гэр", en: "Mongolian ger" },
    summary: {
      mn: "Нүүдлийн амьдралд зохицсон, ухаалаг бүтэцтэй сууц.",
      en: "An intelligently designed home adapted to mobile life on the steppe."
    },
    details: {
      mn: "Монгол гэрийн бүтэц, доторх байрлал бүр ахуй, ёс заншлын утгатай. Тооноос гал голомт хүртэлх хэсгүүд дээр дарж, гэрийн орон зай хэрхэн зохион байгуулагддагийг танилцаарай.",
      en: "Every part of a ger carries practical and cultural meaning. Explore the crown, hearth, honor place and other interior elements to understand how the space is organized."
    },
    moments: {
      mn: ["Тооно, унь, хана бүхий угсардаг бүтэц", "Гал голомтыг төвд байрлуулах зохион байгуулалт", "Зочлох ёс, хүндэтгэлийн байрлал"],
      en: ["Portable structure of crown, rafters and lattice wall", "A central hearth at the heart of the home", "Spatial customs of hospitality and respect"]
    },
    hotspots: [
      { id: "toono", label: { mn: "Тооно", en: "Toono" }, detail: { mn: "Тооно нь гэрийн оройд байрлах дугуй хийц. Гэрэл, агаар нэвтрүүлэхийн зэрэгцээ тэнгэр өөд нээлттэй байх бэлгэдлийг агуулдаг.", en: "The toono is the circular crown at the top of the ger, admitting light and air while symbolically opening the home to the sky." }, x: 50, y: 18 },
      { id: "golomt", label: { mn: "Гал голомт", en: "Central hearth" }, detail: { mn: "Гал голомт нь дулаан, хоол ундаа, гэр бүлийн амьдралыг нэгтгэдэг төв цэг. Монгол ахуйд голомтоо хүндэтгэх ёс онцгой байр суурьтай.", en: "The hearth brings together warmth, food and family life. Respect for the household fire holds a special place in Mongolian custom." }, x: 50, y: 63 },
      { id: "hoimor", label: { mn: "Хоймор", en: "Honor place" }, detail: { mn: "Хоймор бол гэрийн хүндэт байр. Эрхэм зочин суулгах, шүтээн болон үнэ цэнтэй зүйлсээ байрлуулах нь түгээмэл.", en: "The honor place is reserved for respected guests, sacred objects and valued belongings." }, x: 50, y: 33 },
      { id: "avdar", label: { mn: "Авдар", en: "Chest" }, detail: { mn: "Авдар нь хувцас, эд зүйл хадгалахаас гадна гэрийн дотоод өнгө төрхийг бүрдүүлдэг уламжлалт тавилга.", en: "Painted chests store clothes and valuables while adding color and identity to the interior." }, x: 28, y: 60 },
      { id: "or", label: { mn: "Ор, суудал", en: "Bed and seating" }, detail: { mn: "Гэрийн хоёр талаар ор, суудал байрлаж амрах, зочлох, өдөр тутмын аж ахуйн хэрэгцээг нэг орон зайд шийддэг.", en: "Beds and seating along the sides support rest, hospitality and everyday household life within one compact space." }, x: 72, y: 60 }
    ]
  },
  {
    id: "music",
    symbol: "♬",
    accent: "#3c678c",
    title: { mn: "Морин хуур ба хөөмий", en: "Morin khuur and throat singing" },
    summary: {
      mn: "Тал нутгийн дуу авиа, амьсгал, хөдөлгөөнийг хөгжмөөр илэрхийлсэн амьд уламжлал.",
      en: "Living musical traditions shaped by the sound, breath and movement of the steppe."
    },
    details: {
      mn: "Морин хуурын гүн цээл өнгө, хөөмийн давхар эгшиг нь Монголын хөгжмийн өвийн хамгийн танигдсан илэрхийллүүдийн нэг. Доорх бичлэгүүдийг сайтаасаа шууд тоглуулж сонсоорой.",
      en: "The resonant sound of the morin khuur and the layered overtones of throat singing are among Mongolia's most distinctive musical traditions. Play the embedded performances below."
    },
    moments: {
      mn: ["Морин хуурын хоёр чавхдаст өвөрмөц хөг", "Хөөмийн үндсэн ба давхар эгшгийн хослол", "Уртын дуу, байгаль, адууны соёлтой нягт холбоо"],
      en: ["The distinctive two-string sound of the morin khuur", "Fundamental tone and overtones in throat singing", "Deep ties with long song, landscape and horse culture"]
    }
  },
  {
    id: "script",
    symbol: "ᠨ",
    accent: "#5c7d4d",
    audioSrc: "/audio/culture/script-chime.mp3",
    title: { mn: "Монгол бичиг", en: "Traditional Mongolian script" },
    summary: {
      mn: "Босоо бичлэгийн өвөрмөц хэлбэр нь Монголын бичгийн соёлын тасралтгүй уламжлалыг хадгалдаг.",
      en: "Its distinctive vertical form carries a long continuity of Mongolian written culture."
    },
    details: {
      mn: "Монгол бичиг нь төрийн бичиг баримт, захидал, сурвалж, уран бичлэгийн өвийг үеэс үед дамжуулсан. Доорх үгс дээр дарж бичлэг, утгыг нь харьцуулан үзээрэй.",
      en: "Traditional Mongolian script has carried state documents, correspondence, chronicles and calligraphic traditions across generations. Tap the words below to explore their form and meaning."
    },
    moments: {
      mn: ["Дээрээс доош босоо бичдэг хэлбэр", "Түүхэн сурвалж, захидлын баялаг өв", "Өнөөдөр дахин өргөн хэрэглээнд нэвтэрч буй бичгийн соёл"],
      en: ["Written vertically from top to bottom", "A rich legacy of chronicles and correspondence", "A script being actively revitalized today"]
    },
    phrases: [
      { id: "mongol", text: "ᠮᠣᠩᠭᠣᠯ", meaning: { mn: "Монгол", en: "Mongol" }, narration: { mn: "Монгол хэмээх нэрийг уламжлалт монгол бичгээр ингэж тэмдэглэнэ.", en: "This is the word Mongol in traditional Mongolian script." } },
      { id: "soyol", text: "ᠰᠣᠶᠣᠯ", meaning: { mn: "Соёл", en: "Culture" }, narration: { mn: "Соёл гэдэг үг нь өв уламжлал, урлаг, мэдлэгийн тасралтгүй үргэлжлэлийг илэрхийлнэ.", en: "The word culture evokes the continuity of heritage, art and knowledge." } },
      { id: "tuuh", text: "ᠲᠦᠦᠬᠡ", meaning: { mn: "Түүх", en: "History" }, narration: { mn: "Түүх бол өнгөрснийг таньж, өнөөдөр ба ирээдүйгээ ойлгох түлхүүр юм.", en: "History helps us understand the past, the present and the future." } }
    ]
  }
];

function GerInterior({ language, hotspots }: { language: Language; hotspots: Hotspot[] }) {
  const [activeHotspot, setActiveHotspot] = useState(hotspots[0]?.id ?? "");
  const [foundIds, setFoundIds] = useState<string[]>([]);
  const selected = hotspots.find((spot) => spot.id === activeHotspot) ?? hotspots[0];

  useEffect(() => {
    setActiveHotspot(hotspots[0]?.id ?? "");
    setFoundIds([]);
  }, [hotspots]);

  const revealSpot = (id: string) => {
    setActiveHotspot(id);
    setFoundIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  return (
    <div className="cultureInteractiveStage gerInteractiveStage">
      <div className="miniGameHeader">
        <span>{language === "mn" ? "ГЭРЭЭ ТАНЬЖ МЭДЬЕ" : "EXPLORE THE GER"}</span>
        <strong>{language === "mn" ? `Нээсэн хэсэг: ${foundIds.length}/${hotspots.length}` : `Discovered: ${foundIds.length}/${hotspots.length}`}</strong>
      </div>
      <div className="gerVisualFrame">
        <div className="gerRoofLine" /><div className="gerBackWall" /><div className="gerDoor" /><div className="gerPillar left" /><div className="gerPillar right" /><div className="gerChest left" /><div className="gerChest right" /><div className="gerBed left" /><div className="gerBed right" /><div className="gerShrine" /><div className="gerHearth" />
        {hotspots.map((spot, index) => (
          <button key={spot.id} type="button" className={spot.id === activeHotspot ? "cultureHotspot active" : "cultureHotspot"} style={{ left: `${spot.x}%`, top: `${spot.y}%` }} onClick={() => revealSpot(spot.id)}>
            <span>{index + 1}</span>
          </button>
        ))}
      </div>
      <div className="cultureInteractiveInfo">
        <span>{language === "mn" ? "СОНГОСОН ХЭСЭГ" : "SELECTED AREA"}</span>
        <strong>{selected.label[language]}</strong>
        <p>{selected.detail[language]}</p>
      </div>
    </div>
  );
}

function MusicStage({ language }: { language: Language }) {
  const text = language === "mn"
    ? {
        morinTitle: "Морин хуурын чуулга — “Beautiful Mongolia”",
        morinDesc: "Морин хуурын чуулгын тоглолтоос морин хуурын өнгө, хамтлагийн өргөн цар хүрээг сонсоно.",
        khoomeiTitle: "Исгэрээ хөөмийн жишээ",
        khoomeiDesc: "Исгэрээ хөөмийн нэгэн жишээг сонсож, үндсэн өнгө ба давхар эгшгийн ялгарлыг анзаараарай."
      }
    : {
        morinTitle: "Morin Khuur Ensemble — “Beautiful Mongolia”",
        morinDesc: "Hear the breadth and resonance of Mongolia's horsehead-fiddle ensemble tradition.",
        khoomeiTitle: "Whistling throat-singing example",
        khoomeiDesc: "Listen for the relationship between the fundamental tone and the clear overtone layer in this whistling throat-singing example."
      };

  return (
    <div className="cultureMediaGrid">
      <YouTubePerformance
        videoId="_Ugxp6eYWd4"
        title={text.morinTitle}
        description={text.morinDesc}
        language={language}
        sourceLabel={language === "mn" ? "МОРИН ХУУР" : "MORIN KHUUR"}
      />
      <YouTubePerformance
        videoId="xykEACo4LbM"
        title={text.khoomeiTitle}
        description={text.khoomeiDesc}
        language={language}
        sourceLabel={language === "mn" ? "ХӨӨМИЙ" : "THROAT SINGING"}
      />
    </div>
  );
}

function ScriptStage({ language, phrases }: { language: Language; phrases: NonNullable<CultureItem["phrases"]> }) {
  const [activePhrase, setActivePhrase] = useState(phrases[0]?.id ?? "");
  const [seenIds, setSeenIds] = useState<string[]>([]);
  const selected = phrases.find((phrase) => phrase.id === activePhrase) ?? phrases[0];

  useEffect(() => {
    setActivePhrase(phrases[0]?.id ?? "");
    setSeenIds([]);
  }, [phrases]);

  const revealPhrase = (id: string) => {
    setActivePhrase(id);
    setSeenIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  return (
    <div className="cultureInteractiveStage scriptInteractiveStage">
      <div className="miniGameHeader">
        <span>{language === "mn" ? "БИЧГЭЭ НЭЭ" : "SCRIPT EXPLORER"}</span>
        <strong>{language === "mn" ? `Үзсэн үг: ${seenIds.length}/${phrases.length}` : `Viewed: ${seenIds.length}/${phrases.length}`}</strong>
      </div>
      <div className="scriptPillars">
        {phrases.map((phrase) => (
          <button key={phrase.id} type="button" className={phrase.id === activePhrase ? "scriptPillar active" : "scriptPillar"} onClick={() => revealPhrase(phrase.id)}>
            <span>{phrase.text}</span>
            <small>{phrase.meaning[language]}</small>
          </button>
        ))}
      </div>
      <div className="cultureInteractiveInfo">
        <span>{language === "mn" ? "УТГА" : "MEANING"}</span>
        <strong>{selected.meaning[language]}</strong>
        <p>{selected.narration[language]}</p>
      </div>
    </div>
  );
}

export function CultureShowcase({ language }: { language: Language }) {
  const [activeId, setActiveId] = useState("ger");
  const active = useMemo(() => cultureItems.find((item) => item.id === activeId) ?? cultureItems[0], [activeId]);

  const text = language === "mn"
    ? {
        kicker: "ӨВ СОЁЛ",
        title: "Өнгөрснөөс өнөөдөрт",
        body: "Нүүдэлчдийн ахуй, хөгжим, бичгийн соёл өнөөдөр ч амьд хэвээр. Хэсэг бүрийг нээж, бүтэц, дуу авиа, утга бэлгэдлийг нь өөрийн хэмнэлээр судлаарай.",
        moments: "ОНЦЛОХ ОНЦЛОГ",
        ambience: "Сонсох хэсэг"
      }
    : {
        kicker: "LIVING HERITAGE",
        title: "From past to present",
        body: "Nomadic life, music and writing remain living traditions. Explore their structure, sound and meaning at your own pace.",
        moments: "KEY FEATURES",
        ambience: "Listen"
      };

  return (
    <section className="contentSection cultureSection" id="culture">
      <div className="sectionHeading">
        <div><span className="kicker">{text.kicker}</span><h2>{text.title}</h2></div>
        <p>{text.body}</p>
      </div>

      <div className="cultureShowcaseLayout">
        <div className="cultureCardRail">
          {cultureItems.map((item, index) => (
            <motion.button key={item.id} className={item.id === activeId ? "cultureSelectCard active" : "cultureSelectCard"} type="button" onClick={() => setActiveId(item.id)} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: index * 0.08 }} viewport={{ once: true, amount: 0.2 }} whileHover={{ y: -6 }} style={{ ["--accent" as string]: item.accent }}>
              <div className="cultureSelectSymbol">{item.symbol}</div>
              <strong>{item.title[language]}</strong>
              <span>{item.summary[language]}</span>
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.article key={`${active.id}-${language}`} className="cultureStoryCard" initial={{ opacity: 0, x: 26 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -22 }} transition={{ duration: 0.28 }} style={{ ["--accent" as string]: active.accent }}>
            <div className="cultureStoryTop">
              <div className="cultureStoryIcon">{active.symbol}</div>
              <div><h3>{active.title[language]}</h3><p>{active.summary[language]}</p></div>
            </div>
            <p className="cultureStoryBody">{active.details[language]}</p>

            {active.audioSrc ? <AudioGuide title={text.ambience} src={active.audioSrc} language={language} narration={{ mn: active.details.mn, en: active.details.en }} /> : null}
            {active.id === "ger" && active.hotspots ? <GerInterior language={language} hotspots={active.hotspots} /> : null}
            {active.id === "music" ? <MusicStage language={language} /> : null}
            {active.id === "script" && active.phrases ? <ScriptStage language={language} phrases={active.phrases} /> : null}

            <div className="cultureMomentsPanel">
              <span>{text.moments}</span>
              <div className="cultureMomentsList">
                {active.moments[language].map((moment) => <motion.div key={moment} className="cultureMoment" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>{moment}</motion.div>)}
              </div>
            </div>
          </motion.article>
        </AnimatePresence>
      </div>
    </section>
  );
}
