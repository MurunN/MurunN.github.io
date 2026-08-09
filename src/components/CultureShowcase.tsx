"use client";

import Image from "next/image";
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

type GerPhoto = {
  id: string;
  src: string;
  title: Record<Language, string>;
  caption: Record<Language, string>;
  hotspots: Hotspot[];
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

const gerPhotos: GerPhoto[] = [
  {
    id: "warm",
    src: "/images/culture/ger-interior-warm.jpg",
    title: { mn: "Уламжлалт ахуйтай гэр", en: "Traditional lived-in ger" },
    caption: {
      mn: "Тооно, багана, төв зуух, авдар, орны зохион байгуулалтыг бодит орчин дээрээс харуулсан дулаан уур амьсгалтай дотор тал.",
      en: "A warm interior showing the crown ring, support columns, central stove, storage chest and bed arrangement in a lived-in ger."
    },
    hotspots: [
      { id: "toono", label: { mn: "Тооно", en: "Toono" }, detail: { mn: "Гэрийн оройн дугуй нээлхий. Гэрэл, агаар оруулж, тэнгэртэй холбогдох бэлгэдэл болдог.", en: "The circular crown opening that brings in light and air and symbolically connects the home to the sky." }, x: 50, y: 17 },
      { id: "bagana", label: { mn: "Багана", en: "Support columns" }, detail: { mn: "Тооноо тулж барьдаг хоёр багана нь гэрийн бүтцийн гол тулгуур хэсэг юм.", en: "The two inner columns support the crown and are among the central structural elements of the ger." }, x: 41, y: 38 },
      { id: "zuuh", label: { mn: "Зуух, голомт", en: "Stove and hearth" }, detail: { mn: "Дулаан, хоол унд, гэр бүлийн төв амьдралыг илэрхийлэх голомтын орон зай энд байрлана.", en: "This is the hearth area, associated with warmth, cooking and the center of family life." }, x: 47, y: 71 },
      { id: "or", label: { mn: "Ор, суудал", en: "Bed and seating" }, detail: { mn: "Хананы дагуу ор, суудал байрлуулж, амралт болон зочлох орчныг бүрдүүлдэг.", en: "Beds and seating line the sides of the wall, creating spaces for rest and hospitality." }, x: 74, y: 57 },
      { id: "avdar", label: { mn: "Авдар, ширээ", en: "Chest and table" }, detail: { mn: "Будмал авдар, намхан ширээ зэрэг тавилга нь ахуй хэрэглээ төдийгүй гоёлын утгатай.", en: "Painted chests and low tables serve practical use while also adding decorative identity." }, x: 66, y: 77 }
    ]
  },
  {
    id: "wide",
    src: "/images/culture/ger-interior-wide.jpg",
    title: { mn: "Цэлгэр зохион байгуулалттай гэр", en: "Wide organized ger interior" },
    caption: {
      mn: "Ханын торлог бүтэц, тоононы цагираг, эсгий бүрээс, тавилгын симметр зохион байгуулалтыг өргөн өнцгөөс үзүүлсэн зураг.",
      en: "A wide-angle view showing the lattice wall, crown ring, felt covering and symmetric furniture arrangement."
    },
    hotspots: [
      { id: "hana", label: { mn: "Хана", en: "Lattice wall" }, detail: { mn: "Эвхэгддэг торлог хана нь гэрийг хурдан буулгаж нүүхэд тохиромжтой, нүүдлийн амьдралын ухаалаг шийдэл юм.", en: "The folding lattice wall makes the ger portable and well suited to nomadic life." }, x: 84, y: 48 },
      { id: "toono2", label: { mn: "Тооно ба унь", en: "Toono and roof poles" }, detail: { mn: "Тооноос хана руу уньнууд цацран тогтож, гэрийн оройн бүтцийг бүрдүүлнэ.", en: "Roof poles radiate from the crown ring to the wall, shaping the upper structure of the ger." }, x: 51, y: 10 },
      { id: "haalga", label: { mn: "Хаалга", en: "Door" }, detail: { mn: "Гэрийн хаалга нь ихэвчлэн урд зүг рүү хардаг уламжлалтай бөгөөд орох, гарах ёс журамтай холбоотой.", en: "The door traditionally faces south and is closely tied to etiquette about entering and leaving." }, x: 34, y: 44 },
      { id: "hoimor", label: { mn: "Хоймор", en: "Honor place" }, detail: { mn: "Гэрийн арын хүндэт хэсэгт гоёлын эдлэл, тахилын зүйлс, эрхэм хүмүүсийн суудал байрладаг.", en: "The rear honor place is associated with valued objects, sacred items and respected guests." }, x: 57, y: 41 },
      { id: "shirdag", label: { mn: "Ширдэг, эсгий дэвсгэр", en: "Felt carpet" }, detail: { mn: "Ширдэг, эсгий нь дулаан тусгаарлахаас гадна дотоод орон зайн хээ угалзтай гоо зүйг бүрдүүлнэ.", en: "Felt rugs add insulation while contributing pattern and visual harmony to the space." }, x: 53, y: 78 }
    ]
  }
];

const cultureItems: CultureItem[] = [
  {
    id: "ger",
    symbol: "⌂",
    accent: "#9b6033",
    title: { mn: "Монгол гэр", en: "Mongolian ger" },
    summary: {
      mn: "Бодит зураг дээрээс бүтэц, ёс заншил, дотоод зохион байгуулалтыг нь судлах боломжтой нүүдэлчдийн сууц.",
      en: "A nomadic dwelling explored here through real interior photography, spatial organization and cultural meaning."
    },
    details: {
      mn: "Энд иллюстраци биш, бодит Монгол гэрийн дотор талын зураг ашиглав. Зурган дээрх цэгүүдийг дарж тооно, багана, голомт, хоймор, хана зэрэг хэсгүүдийн үүрэг ба бэлгэдлийг танилцаарай.",
      en: "This section now uses real ger interior photography instead of a simple illustration. Tap the hotspots to learn the role and symbolism of the crown, columns, hearth, honor place, wall and more."
    },
    moments: {
      mn: ["Бодит дотоод орчны гэрэл, тавилгын зохион байгуулалт", "Тооно–уны–хана бүхий нүүдлийн ухаалаг бүтэц", "Ахуй хэрэглээ ба ёс заншил нэг дор огтлолцсон орон зай"],
      en: ["Real interior light and furniture arrangement", "An efficient nomadic structure of crown, poles and lattice wall", "A space where daily life and custom meet"]
    }
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

function GerInterior({ language }: { language: Language }) {
  const [photoId, setPhotoId] = useState(gerPhotos[0].id);
  const [activeHotspot, setActiveHotspot] = useState(gerPhotos[0].hotspots[0].id);
  const [foundIds, setFoundIds] = useState<string[]>([]);

  const activePhoto = gerPhotos.find((photo) => photo.id === photoId) ?? gerPhotos[0];
  const selected = activePhoto.hotspots.find((spot) => spot.id === activeHotspot) ?? activePhoto.hotspots[0];

  useEffect(() => {
    setActiveHotspot(activePhoto.hotspots[0]?.id ?? "");
  }, [photoId, activePhoto.hotspots]);

  const revealSpot = (id: string) => {
    setActiveHotspot(id);
    setFoundIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  return (
    <div className="cultureInteractiveStage gerPhotoStage">
      <div className="miniGameHeader">
        <span>{language === "mn" ? "БОДИТ ГЭРИЙН ДОТООД ОРЧИН" : "REAL GER INTERIOR"}</span>
        <strong>{language === "mn" ? `Нээсэн цэг: ${foundIds.length}` : `Discovered hotspots: ${foundIds.length}`}</strong>
      </div>

      <div className="gerPhotoTabs">
        {gerPhotos.map((photo) => (
          <button
            key={photo.id}
            type="button"
            className={photo.id === activePhoto.id ? "gerPhotoTab active" : "gerPhotoTab"}
            onClick={() => setPhotoId(photo.id)}
          >
            <strong>{photo.title[language]}</strong>
            <span>{photo.caption[language]}</span>
          </button>
        ))}
      </div>

      <div className="gerPhotoViewer">
        <div className="gerPhotoFrame">
          <Image src={activePhoto.src} alt={activePhoto.title[language]} fill sizes="(max-width: 900px) 100vw, 56vw" className="gerPhotoImage" />
          <div className="gerPhotoShade" />
          {activePhoto.hotspots.map((spot) => (
            <button
              key={spot.id}
              type="button"
              className={spot.id === selected.id ? "cultureHotspot photoHotspot active" : "cultureHotspot photoHotspot"}
              style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
              onClick={() => revealSpot(spot.id)}
            >
              <span>{spot.label[language].slice(0, 1)}</span>
            </button>
          ))}
        </div>

        <div className="gerPhotoAside">
          <div className="cultureInteractiveInfo gerInfoCard">
            <span>{language === "mn" ? "СОНГОСОН ХЭСЭГ" : "SELECTED PART"}</span>
            <strong>{selected.label[language]}</strong>
            <p>{selected.detail[language]}</p>
          </div>
          <div className="gerQuickFacts">
            <div>
              <small>{language === "mn" ? "Зураг" : "View"}</small>
              <strong>{activePhoto.title[language]}</strong>
            </div>
            <div>
              <small>{language === "mn" ? "Тайлбар" : "Context"}</small>
              <p>{activePhoto.caption[language]}</p>
            </div>
          </div>
        </div>
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
  const selected = phrases.find((phrase) => phrase.id === activePhrase) ?? phrases[0];

  useEffect(() => {
    setActivePhrase(phrases[0]?.id ?? "");
  }, [phrases]);

  return (
    <div className="cultureInteractiveStage scriptStage">
      <div className="scriptPhrases">
        {phrases.map((phrase) => (
          <button key={phrase.id} type="button" className={phrase.id === selected.id ? "scriptPhrase active" : "scriptPhrase"} onClick={() => setActivePhrase(phrase.id)}>
            <strong>{phrase.text}</strong>
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
        body: "Нүүдэлчдийн ахуй, хөгжим, бичгийн соёл өнөөдөр ч амьд хэвээр. Бодит зураг, бичлэг, сонсголт, тайлбарын хослолоор өв соёлыг илүү нягт мэдэрч судлаарай.",
        moments: "ОНЦЛОХ ОНЦЛОГ",
        ambience: "Орчны дуу"
      }
    : {
        kicker: "LIVING HERITAGE",
        title: "From past to present",
        body: "Nomadic life, music and writing remain living traditions. Explore them through real imagery, performance and guided explanation.",
        moments: "KEY FEATURES",
        ambience: "Ambient sound"
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

            {active.audioSrc && active.id !== "ger" ? <AudioGuide title={text.ambience} src={active.audioSrc} language={language} narration={{ mn: active.details.mn, en: active.details.en }} narrationSrc={`/audio/narration/culture-${active.id}-mn.mp3`} /> : null}
            {active.id === "ger" ? <GerInterior language={language} /> : null}
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
