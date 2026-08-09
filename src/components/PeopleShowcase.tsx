"use client";

import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";

type Language = "mn" | "en";

type Person = {
  id: string;
  years: string;
  symbol: string;
  accent: string;
  portraitUrl: string;
  portraitAlt: Record<Language, string>;
  sourceLabel: string;
  sourceHref: string;
  licenseLabel: string;
  name: Record<Language, string>;
  role: Record<Language, string>;
  summary: Record<Language, string>;
  impact: Record<Language, string[]>;
  story: Record<Language, string>;
  legacy: Record<Language, string[]>;
  quote: Record<Language, string>;
};

const people: Person[] = [
  {
    id: "chinggis",
    years: "1162–1227",
    symbol: "ᠴ",
    accent: "#8e3f2c",
    portraitUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/YuanEmperorAlbumGenghisPortrait.jpg",
    portraitAlt: {
      mn: "Чингис хааны хөрөг",
      en: "Portrait of Chinggis Khaan"
    },
    sourceLabel: "Wikimedia Commons · YuanEmperorAlbumGenghisPortrait.jpg",
    sourceHref: "https://commons.wikimedia.org/wiki/File:YuanEmperorAlbumGenghisPortrait.jpg",
    licenseLabel: "Public domain",
    name: { mn: "Чингис хаан", en: "Chinggis Khaan" },
    role: { mn: "Их Монгол Улсыг үндэслэгч", en: "Founder of the Great Mongol State" },
    summary: {
      mn: "Монголын овог аймгуудыг нэгтгэж, 1206 онд Их Монгол Улсыг байгуулан төр, цэрэг, хууль цаазын шинэ тогтолцоог бэхжүүлсэн.",
      en: "He united the Mongol tribes in 1206 and created a state whose legal, military and diplomatic systems transformed Eurasia."
    },
    impact: {
      mn: [
        "Овог аймгуудын нэгдлийг төрийн хэмжээнд хүргэсэн",
        "Өртөө, элч харилцаа, цэргийн зохион байгуулалтыг хөгжүүлсэн",
        "Евразийн худалдаа, харилцаанд урт хугацааны нөлөө үзүүлсэн"
      ],
      en: [
        "Turned tribal unity into a functioning state",
        "Expanded relay stations, diplomacy and military organization",
        "Reshaped long-distance exchange across Eurasia"
      ]
    },
    story: {
      mn: "Чингис хааны түүхийг зөвхөн байлдан дагууллаар бус, нэгдэл, сахилга бат, төрийн байгуулалт, стратегийн сэтгэлгээгээр нь ойлгох хэрэгтэй. Түүний байгуулсан систем дараагийн үеийн хаадын үед улам тэлсэн.",
      en: "Chinggis Khaan should be understood not only through conquest, but through his ability to build institutions, discipline a coalition and turn mobility into state power. The systems he created shaped the generations that followed."
    },
    legacy: {
      mn: ["Их Монгол Улс", "Их засаг", "Өртөө, элчийн тогтолцоо"],
      en: ["The Great Mongol State", "Legal reform", "Relay and envoy systems"]
    },
    quote: {
      mn: "Эв нэгдэл, төрийн зохион байгуулалт, алсын харааг нэгэн дор илтгэх дүр.",
      en: "A figure who embodies unity, statecraft and far-reaching vision."
    }
  },
  {
    id: "ogedei",
    years: "1186–1241",
    symbol: "ᠥ",
    accent: "#7c5c2f",
    portraitUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/YuanEmperorAlbumOgedeiPortrait.jpg",
    portraitAlt: {
      mn: "Өгэдэй хааны хөрөг",
      en: "Portrait of Ögedei Khan"
    },
    sourceLabel: "Wikimedia Commons · YuanEmperorAlbumOgedeiPortrait.jpg",
    sourceHref: "https://commons.wikimedia.org/wiki/File:YuanEmperorAlbumOgedeiPortrait.jpg",
    licenseLabel: "Public domain",
    name: { mn: "Өгэдэй хаан", en: "Ögedei Khan" },
    role: { mn: "Их Монгол Улсын хоёр дахь их хаан", en: "Second Great Khan of the Mongol Empire" },
    summary: {
      mn: "Чингис хааны дараах төрийн залгамжийг тогтвортой үргэлжлүүлж, эзэнт гүрний захиргаа, хот байгуулалт, өргөтгөлийг шинэ түвшинд хүргэсэн.",
      en: "He carried the empire into its next phase by strengthening administration, supporting urban growth and overseeing major expansion."
    },
    impact: {
      mn: [
        "Хархорумыг төрийн төвийн хувьд хөгжүүлсэн",
        "Захиргааны тогтолцоог илүү тогтвортой болгосон",
        "Эзэнт гүрний тэлэлтийг шинэ шатанд гаргасан"
      ],
      en: [
        "Advanced Karakorum as a political center",
        "Stabilized imperial administration",
        "Moved imperial expansion into a new phase"
      ]
    },
    story: {
      mn: "Өгэдэй хааны үед Монголын төр дан ганц дайны хүчээр бус, байгуулалт, удирдлага, төвлөрсөн зохион байгуулалтаараа ялгарч эхэлсэн. Түүний үе бол эзэнт гүрнийг тогтолцоотой болгох чухал үе юм.",
      en: "Under Ögedei, the empire became more than a conquering force. It became a more organized political system, with stronger administration and a clearer imperial center."
    },
    legacy: {
      mn: ["Хархорумын хөгжил", "Тогтвортой захиргаа", "Залгамж төрийн бэхжилт"],
      en: ["Growth of Karakorum", "Administrative stability", "A stronger imperial succession"]
    },
    quote: {
      mn: "Байгуулсан улсыг тогтолцоотой болгох ажил түүний үед эрчимжив.",
      en: "His reign deepened the work of turning conquest into governance."
    }
  },
  {
    id: "kublai",
    years: "1215–1294",
    symbol: "ᠬ",
    accent: "#5b587f",
    portraitUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/YuanEmperorAlbumKhubilaiPortrait.jpg",
    portraitAlt: {
      mn: "Хубилай хааны хөрөг",
      en: "Portrait of Kublai Khan"
    },
    sourceLabel: "Wikimedia Commons · YuanEmperorAlbumKhubilaiPortrait.jpg",
    sourceHref: "https://commons.wikimedia.org/wiki/File:YuanEmperorAlbumKhubilaiPortrait.jpg",
    licenseLabel: "Public domain",
    name: { mn: "Хубилай хаан", en: "Kublai Khan" },
    role: { mn: "Юань улсын эзэн хаан", en: "Emperor of the Yuan dynasty" },
    summary: {
      mn: "Тэрээр Монголын эзэнт гүрний удирдлагыг Хятад дахь Юань улсын төрийн бүтэцтэй уялдуулан шинэ хэлбэрт оруулж, соёл, худалдаа, захиргааны хүрээг өргөжүүлсэн.",
      en: "He reshaped the imperial center through the Yuan dynasty and expanded the empire’s administrative, cultural and commercial reach."
    },
    impact: {
      mn: [
        "Юань улсын төрийн бүтцийг бэхжүүлсэн",
        "Олон соёлт эзэнт гүрний удирдлагын жишээ болсон",
        "Тив дамнасан худалдаа, солилцоог дэмжсэн"
      ],
      en: [
        "Consolidated the Yuan political order",
        "Governed a multi-regional empire",
        "Encouraged wider commercial and cultural exchange"
      ]
    },
    story: {
      mn: "Хубилайн үе бол нүүдэлчин уламжлал ба суурин төрийн тогтолцоо огтлолцсон сонирхолтой үе. Түүний бодлого Монголын түүхийг Зүүн Азийн өргөн хүрээтэй түүхтэй холбож өгсөн.",
      en: "Kublai’s reign sits at the crossroads of steppe rule and settled imperial governance. His policies linked Mongolian history to a broader East Asian world."
    },
    legacy: {
      mn: ["Юань улс", "Олон соёлт төрийн загвар", "Тив дамнасан солилцоо"],
      en: ["The Yuan dynasty", "A multi-cultural imperial model", "Cross-continental exchange"]
    },
    quote: {
      mn: "Нүүдэлчин угсаа ба төрийн шинэ хэлбэрийн огтлолцлыг түүний үе харуулдаг.",
      en: "His reign shows how steppe heritage and new imperial structures could meet."
    }
  },
  {
    id: "zanabazar",
    years: "1635–1723",
    symbol: "☸",
    accent: "#3f6b66",
    portraitUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Zanabanzar%20self-portrait.jpg",
    portraitAlt: {
      mn: "Өндөр гэгээн Занабазарын өөрийн хөрөг",
      en: "Self-portrait of Zanabazar"
    },
    sourceLabel: "Wikimedia Commons · Zanabanzar self-portrait.jpg",
    sourceHref: "https://commons.wikimedia.org/wiki/File:Zanabanzar_self-portrait.jpg",
    licenseLabel: "Public domain / open access",
    name: { mn: "Өндөр гэгээн Занабазар", en: "Zanabazar" },
    role: { mn: "Соёл, шашин, урлагийн их зүтгэлтэн", en: "A major religious and artistic leader" },
    summary: {
      mn: "Өндөр гэгээн Занабазар бол Монголын урлаг, шашин, бичиг соёлын түүхэнд гүн мөр үлдээсэн их соён гэгээрүүлэгч юм.",
      en: "Zanabazar was a cultural giant whose influence extended across religion, art, sculpture and Mongolian intellectual life."
    },
    impact: {
      mn: [
        "Монголын бурхны урлагийн оргил бүтээлүүдийг туурвисан",
        "Соёлын өв, гоо зүйн өндөр түвшинг төлөвшүүлсэн",
        "Шашин, соёлын нөлөөг олон үеэр дамжуулсан"
      ],
      en: [
        "Created masterworks of Mongolian Buddhist art",
        "Set a high cultural and aesthetic standard",
        "Shaped religious and artistic traditions for generations"
      ]
    },
    story: {
      mn: "Занабазарын түүх бол төр, шашин, урлаг гуравын огтлолцол юм. Тэрээр зөвхөн шашны тэргүүн байгаагүй, мөн соёлын дүр төрхийг бүтээсэн уран бүтээлч байсан.",
      en: "Zanabazar’s story lies at the intersection of religion, art and authority. He was not only a spiritual leader, but also a creator who defined the visual language of an era."
    },
    legacy: {
      mn: ["Бурхны урлагийн өв", "Соёлын их нөлөө", "Өөрийн хөрөг, уран баримлын уламжлал"],
      en: ["A sculptural legacy", "Deep cultural influence", "A lasting artistic tradition"]
    },
    quote: {
      mn: "Соёлын хүч түүхийг мөн адил бүтээдэг гэдгийг түүний өв харуулна.",
      en: "His legacy shows that culture can shape history as powerfully as politics."
    }
  },
  {
    id: "bogd",
    years: "1869–1924",
    symbol: "✺",
    accent: "#6d4d37",
    portraitUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Bogd%20Khan%20(1).jpg",
    portraitAlt: {
      mn: "Богд хааны хөрөг",
      en: "Portrait of Bogd Khan"
    },
    sourceLabel: "Wikimedia Commons · Bogd Khan (1).jpg",
    sourceHref: "https://commons.wikimedia.org/wiki/File:Bogd_Khan_(1).jpg",
    licenseLabel: "Public domain",
    name: { mn: "Богд хаан", en: "Bogd Khan" },
    role: { mn: "1911 оны тусгаар тогтнолын үеийн хаан", en: "Ruler of Mongolia at the 1911 independence movement" },
    summary: {
      mn: "1911 онд Монголын тусгаар тогтнолын үед хаан ширээнд заларч, шашин-төрийн манлайллыг нэгтгэсэн түүхэн хүн.",
      en: "Enthroned during Mongolia’s 1911 independence movement, he became the leading symbolic and political figure of a new era."
    },
    impact: {
      mn: [
        "1911 оны тусгаар тогтнолын бэлгэдэл болсон",
        "Шашин, төрийн удирдлагыг нэгтгэсэн",
        "Орчин үеийн Монголын шилжилтийн үед онцгой байр суурь эзэлсэн"
      ],
      en: [
        "Became a symbol of the 1911 independence movement",
        "Linked spiritual and state leadership",
        "Held a pivotal place in Mongolia’s transition to modern statehood"
      ]
    },
    story: {
      mn: "Богд хааны үе Монголын орчин үеийн түүхийн нэгэн чухал шилжилтийн үе байв. Түүний дүр нь тусгаар тогтнол, шашин, төрийн уялдааг нэгэн дор илэрхийлдэг.",
      en: "Bogd Khan’s era marks a decisive transition in modern Mongolian history. His image brings together independence, religion and political authority in one historical frame."
    },
    legacy: {
      mn: ["1911 оны тусгаар тогтнол", "Шашин-төрийн манлайлал", "Орчин үеийн түүхэн шилжилт"],
      en: ["The 1911 independence era", "Religious-state leadership", "A modern historical transition"]
    },
    quote: {
      mn: "Орчин үеийн Монголын эхэн үеийн түүхийг түүний дүргүйгээр төсөөлөх аргагүй.",
      en: "It is hard to imagine the opening chapter of modern Mongolia without him."
    }
  }
];

function speak(text: string, language: Language, personId?: string) {
  if (typeof window === "undefined") return;
  if (language === "mn" && personId) {
    const recorded = new Audio(`/audio/narration/person-${personId}-mn.mp3`);
    recorded.onerror = () => speakBrowser(text, language);
    recorded.play().catch(() => speakBrowser(text, language));
    return;
  }
  speakBrowser(text, language);
}

function speakBrowser(text: string, language: Language) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language === "mn" ? "mn-MN" : "en-US";
  utterance.rate = language === "mn" ? 0.88 : 0.95;
  const voices = window.speechSynthesis.getVoices();
  const voice = language === "mn" ? voices.find((item) => item.lang.toLowerCase().startsWith("mn")) : voices.find((item) => item.lang.toLowerCase().startsWith("en"));
  if (voice) utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
}

export function PeopleShowcase({ language }: { language: Language }) {
  const [activeId, setActiveId] = useState<string>("chinggis");
  const [modalId, setModalId] = useState<string | null>(null);
  const active = useMemo(() => people.find((person) => person.id === activeId) ?? people[0], [activeId]);
  const modalPerson = useMemo(() => people.find((person) => person.id === modalId) ?? null, [modalId]);
  const text = language === "mn"
    ? {
        kicker: "ТҮҮХИЙГ БҮТЭЭСЭН ХҮМҮҮС",
        title: "Музейн болон public-domain хөргүүдтэй түүхэн дүрүүд",
        body: "Энэ хэсэгт emoji, placeholder зураг ашиглахгүй. Харин музей, архив, Wikimedia Commons-ийн public-domain эсвэл нээлттэй эх сурвалжтай хөрөг, дүрслэлүүдийг ашиглан Монголын түүхэнд нөлөөлсөн хүмүүсийг танилцуулна.",
        more: "Дэлгэрэнгүй түүх үзэх →",
        close: "Хаах",
        impact: "ТҮҮХЭН НӨЛӨӨ",
        story: "ӨГҮҮЛЭМЖ",
        audio: "Тайлбарыг сонсох",
        legacy: "ҮЛДЭЭСЭН ӨВ",
        spotlight: "ОНЦЛОХ ТҮҮХЭН ХҮН",
        choose: "СОНГОХ ДҮРҮҮД",
        source: "ЭХ СУРВАЛЖ",
        license: "ЭРХ"
      }
    : {
        kicker: "PEOPLE WHO SHAPED HISTORY",
        title: "Historic figures with museum and public-domain portraits",
        body: "This section replaces placeholder graphics with museum-held or public-domain portraits and archival images sourced through Wikimedia Commons and related open collections.",
        more: "Open full story →",
        close: "Close",
        impact: "HISTORICAL IMPACT",
        story: "STORY",
        audio: "Listen",
        legacy: "LEGACY",
        spotlight: "FEATURED FIGURE",
        choose: "SELECT A FIGURE",
        source: "SOURCE",
        license: "LICENSE"
      };

  return (
    <section className="contentSection peopleSection" id="people">
      <div className="sectionHeading">
        <div>
          <span className="kicker">{text.kicker}</span>
          <h2>{text.title}</h2>
        </div>
        <p>{text.body}</p>
      </div>

      <div className="peopleSpotlightLayout">
        <motion.article
          key={`${active.id}-${language}`}
          className="peopleSpotlightCard"
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4 }}
          style={{ ["--accent" as string]: active.accent }}
        >
          <span className="peopleLabel">{text.spotlight}</span>
          <div className="peopleSpotlightTop">
            <div className="peoplePortraitOrb archivePortraitFrame">
              <motion.div className="portraitAura" animate={{ scale: [1, 1.08, 1], opacity: [0.25, 0.45, 0.25] }} transition={{ repeat: Infinity, duration: 3.2 }} />
              <img className="peoplePortraitImage" src={active.portraitUrl} alt={active.portraitAlt[language]} loading="lazy" referrerPolicy="no-referrer" />
              <div className="peoplePortraitGlyph">{active.symbol}</div>
            </div>
            <div className="peopleSpotlightCopy">
              <span className="personEraTag">{active.years}</span>
              <h3>{active.name[language]}</h3>
              <strong>{active.role[language]}</strong>
              <p>{active.summary[language]}</p>
              <div className="portraitMetaCard">
                <span>{text.source}</span>
                <a href={active.sourceHref} target="_blank" rel="noreferrer">{active.sourceLabel}</a>
                <i>{text.license}: {active.licenseLabel}</i>
              </div>
            </div>
          </div>
          <div className="peopleQuote">{active.quote[language]}</div>
          <div className="peopleLegacyPanel">
            <span>{text.legacy}</span>
            <div className="peopleLegacyChips">
              {active.legacy[language].map((item) => <i key={item}>{item}</i>)}
            </div>
          </div>
          <div className="peopleSpotlightActions">
            <button className="audioPill" type="button" onClick={() => speak(`${active.name[language]}. ${active.summary[language]}. ${active.story[language]}`, language, active.id)}>
              🔊 {text.audio}
            </button>
            <button className="storyActionButton" type="button" onClick={() => setModalId(active.id)}>{text.more}</button>
          </div>
        </motion.article>

        <div className="peopleGalleryPanel">
          <div className="peopleGalleryHead">
            <span>{text.choose}</span>
          </div>
          <div className="peopleShowcaseGrid peopleShowcaseGridMuseum">
            {people.map((person, index) => (
              <motion.button
                key={person.id}
                className={person.id === activeId ? "personShowcaseCard active museumCard" : "personShowcaseCard museumCard"}
                type="button"
                onClick={() => setActiveId(person.id)}
                style={{ ["--accent" as string]: person.accent }}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                viewport={{ once: true, amount: 0.2 }}
                whileHover={{ y: -8, scale: 1.01 }}
              >
                <div className="personCardImageWrap">
                  <img className="personCardImage" src={person.portraitUrl} alt={person.portraitAlt[language]} loading="lazy" referrerPolicy="no-referrer" />
                  <div className="personGlyph">{person.symbol}</div>
                </div>
                <span className="personEra">{person.years}</span>
                <h3>{person.name[language]}</h3>
                <strong>{person.role[language]}</strong>
                <p>{person.summary[language]}</p>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {modalPerson && (
          <motion.div className="storyOverlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="storyModal" initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 18, scale: 0.98 }}>
              <button className="closeStory" onClick={() => setModalId(null)}>{text.close} ✕</button>
              <div className="storyModalVisual storyModalVisualWithImage" style={{ background: `radial-gradient(circle at 70% 20%, ${modalPerson.accent}, transparent 34%), linear-gradient(160deg, rgba(255,255,255,.08), rgba(255,255,255,.02))` }}>
                <img className="storyPortraitPhoto" src={modalPerson.portraitUrl} alt={modalPerson.portraitAlt[language]} loading="lazy" referrerPolicy="no-referrer" />
                <div className="storyVisualOverlay" />
                <div className="storyVisualContent">
                  <div className="storySeal">{modalPerson.symbol}</div>
                  <span>{modalPerson.years}</span>
                  <h3>{modalPerson.name[language]}</h3>
                  <p>{modalPerson.role[language]}</p>
                  <div className="storySourceNote">
                    <a href={modalPerson.sourceHref} target="_blank" rel="noreferrer">{modalPerson.sourceLabel}</a>
                    <i>{text.license}: {modalPerson.licenseLabel}</i>
                  </div>
                </div>
              </div>
              <div className="storyModalCopy">
                <div className="storyToolbar">
                  <span>{text.story}</span>
                  <button className="audioPill" type="button" onClick={() => speak(`${modalPerson.name[language]}. ${modalPerson.summary[language]}. ${modalPerson.story[language]}`, language)}>
                    🔊 {text.audio}
                  </button>
                </div>
                <p>{modalPerson.summary[language]}</p>
                <p>{modalPerson.story[language]}</p>
                <div className="modalImpactPanel">
                  <span>{text.impact}</span>
                  <ul>
                    {modalPerson.impact[language].map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
