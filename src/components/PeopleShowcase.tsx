"use client";

import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";

type Language = "mn" | "en";

type Person = {
  id: string;
  years: string;
  symbol: string;
  accent: string;
  portrait: string;
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
    id: "modun",
    years: "МЭӨ III зуун",
    symbol: "𐰢",
    portrait: "🛡️",
    accent: "#93602a",
    name: { mn: "Модун шаньюй", en: "Modu Chanyu" },
    role: { mn: "Хүннү гүрний хүчирхэг удирдагч", en: "Powerful ruler of the Xiongnu" },
    summary: {
      mn: "Хүннүгийн хүчийг нэгтгэн бэхжүүлж, Төв Азийн улс төрийн тэнцвэрт хүчтэй нөлөө үзүүлсэн удирдагч.",
      en: "He forged the Xiongnu into a powerful confederation and helped define an early model of steppe statecraft."
    },
    impact: {
      mn: ["Цэрэг, захиргааны зохион байгуулалтыг бэхжүүлсэн", "Төв Азийн геополитикт нөлөөлсөн", "Төв Азийн нүүдэлчдийн төрийн түүхэнд чухал байр суурь эзэлсэн"],
      en: ["Strengthened steppe military organization", "Shaped Central Asian geopolitics", "Part of the deeper roots of Mongolian state traditions"]
    },
    story: {
      mn: "Түүний тухай өгүүлэмжид зориг, хатуу сахилга бат, төвлөрсөн удирдлагын эх шинжийг харж болно.",
      en: "Stories about him reveal courage, discipline and the beginnings of centralized steppe leadership."
    },
    legacy: {
      mn: ["Эртний төрийн ухааны жишээ", "Нэгдлийн эх загвар", "Төв Азийн нөлөө бүхий удирдагч"],
      en: ["An early model of statecraft", "An origin point of political unity", "A leader of major Central Asian impact"]
    },
    quote: {
      mn: "Эртний хүчирхэг нүүдэлчдийн төр хэрхэн бүрэлдсэнийг түүний түүх өгүүлдэг.",
      en: "His story tells how a powerful early nomadic state could take shape."
    }
  },
  {
    id: "chinggis",
    years: "1162–1227",
    symbol: "ᠴ",
    portrait: "👑",
    accent: "#8e3f2c",
    name: { mn: "Чингис хаан", en: "Chinggis Khaan" },
    role: { mn: "Их Монгол Улсыг үндэслэгч", en: "Founder of the Great Mongol State" },
    summary: {
      mn: "Монголын овог аймгуудыг нэгтгэж, 1206 онд Их Монгол Улсыг байгуулан төр, цэрэг, захиргааны шинэ тогтолцоог бэхжүүлсэн.",
      en: "He united the Mongol tribes and created a new state with an enduring legal and military structure."
    },
    impact: {
      mn: ["Овог аймгийн хуваагдлыг нэгтгэсэн", "Евразийн улс төр, худалдаа, харилцаанд гүн нөлөө үзүүлсэн", "Өртөө, элч харилцаа, төрийн зохион байгуулалтыг хөгжүүлсэн"],
      en: ["Unified tribal divisions", "Reshaped Eurasian history", "Expanded the relay, envoy and legal systems"]
    },
    story: {
      mn: "Түүний түүхийг байлдан дагуулалтаар хязгаарлахгүй; эв нэгдэл, төрийн зохион байгуулалт, элч харилцаа, хууль цаазын өөрчлөлттэй хамтатган харах нь чухал.",
      en: "His story is not only about conquest, but also about leadership, unity and institutional vision."
    },
    legacy: {
      mn: ["Их Монгол Улс", "Их засаг ба цэргийн шинэчлэл", "Евразийн харилцааны шинэ эрин"],
      en: ["The Great Mongol State", "Legal and military reform", "A new era of Eurasian connectivity"]
    },
    quote: {
      mn: "Түүнийг ойлгох нь Монголын түүхэн эрч хүч, төрийн бүтцийг ойлгохтой адил.",
      en: "To understand him is to understand Mongolia’s historic energy and political imagination."
    }
  },
  {
    id: "sorghaghtani",
    years: "XIII зуун",
    symbol: "✦",
    portrait: "📜",
    accent: "#57708a",
    name: { mn: "Сорхугтани бэхи", en: "Sorghaghtani Beki" },
    role: { mn: "Улс төрийн алсын хараатай хатан", en: "A visionary royal stateswoman" },
    summary: {
      mn: "Улс төрийн ухаан, дипломат харилцаа, үр хүүхдийн боловсролд анхаарсан бодлогоороо Монголын эзэнт гүрний залгамж үед хүчтэй нөлөө үзүүлсэн.",
      en: "Through education, diplomacy and strategic family leadership, she profoundly shaped the empire’s future."
    },
    impact: {
      mn: ["Ирээдүйн хаадыг бэлтгэсэн", "Дипломат тэнцвэрийг хадгалсан", "Эмэгтэй удирдлагын тод жишээ болсон"],
      en: ["Helped prepare future rulers", "Preserved diplomatic balance", "Stands as a major example of female leadership"]
    },
    story: {
      mn: "Тэрээр хүчийг ил биш, харин бодлого, хүмүүжил, ухаанаар хэрэгжүүлсэн хатан байв.",
      en: "She exercised influence not through spectacle, but through policy, education and political wisdom."
    },
    legacy: {
      mn: ["Хатан хүний манлайллын хүч", "Залгамжлалын тогтвортой байдал", "Боловсрол, бодлогын нөлөө"],
      en: ["The strength of queenship", "Stability in succession", "Long-term influence through education and policy"]
    },
    quote: {
      mn: "Зөөлөн атлаа хүчирхэг удирдлагын дүрийг тэр тод томруун үлдээсэн.",
      en: "She left a vivid model of leadership that was calm, strategic and deeply effective."
    }
  },
  {
    id: "mandukhai",
    years: "1449–1510",
    symbol: "♛",
    portrait: "⚔️",
    accent: "#4a6d58",
    name: { mn: "Мандухай сэцэн хатан", en: "Mandukhai the Wise" },
    role: { mn: "Монголын нэгдлийг сэргээсэн хатан", en: "Queen who restored Mongol unity" },
    summary: {
      mn: "XV зууны задралын үед Монголын улс төрийн нэгдлийг сэргээхэд гол үүрэг гүйцэтгэж, Батмөнх Даян хааныг дэмжин төрийн төвлөрлийг бэхжүүлэхэд хүчин зүтгэсэн.",
      en: "She played a decisive role in reuniting a fragmented Mongolia and restoring political stability."
    },
    impact: {
      mn: ["Монголын нэгдлийг сэргээхэд манлайлсан", "Төрийн шийдэмгий удирдагч байсан", "Хатан хүний түүхэн нөлөөг тод харуулсан"],
      en: ["Led efforts to restore unity", "Exemplified decisive state leadership", "Shows the historical influence of queenship"]
    },
    story: {
      mn: "Түүний дүр эр зориг, төрийн ухаан, эмэгтэй манлайллын хүчийг нэгтгэн харуулдаг.",
      en: "Her image combines courage, political intelligence and the power of female leadership."
    },
    legacy: {
      mn: ["Нэгдлийг дахин сэргээсэн", "Шийдэмгий төрийн удирдлага", "Эмэгтэй түүхэн баатрын бэлгэдэл"],
      en: ["A restorer of unity", "A model of decisive state leadership", "An icon of historical female heroism"]
    },
    quote: {
      mn: "Эв нэгдлийг сэргээхэд төрийн ухаан, зориг хоёр хэр чухлыг түүний түүх харуулна.",
      en: "Her story shows how political wisdom and courage can restore unity."
    }
  }
];

function speak(text: string, language: Language) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language === "mn" ? "mn-MN" : "en-US";
  utterance.rate = 0.95;
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
        title: "Түүхэн дүрүүдтэй танилц",
        body: "Монголын түүхийн урсгалыг өөрчилсөн хаад, хатад, төрийн зүтгэлтнүүдийн амьдрал, шийдвэр, үлдээсэн өвтэй танилцаарай.",
        more: "Түүхийг дэлгэрүүлж үзэх →",
        close: "Хаах",
        impact: "ТҮҮХЭН НӨЛӨӨ",
        story: "ӨГҮҮЛЭМЖ",
        audio: "Тайлбарыг сонсох",
        legacy: "ҮЛДЭЭСЭН ӨВ",
        spotlight: "ОНЦЛОХ ТҮҮХЭН ХҮН",
        choose: "БУСАД ТҮҮХЭН ХҮМҮҮС"
      }
    : {
        kicker: "PEOPLE WHO SHAPED HISTORY",
        title: "Meet historic figures",
        body: "Meet people whose lives and decisions shaped Mongolian history. Select a figure to explore their role, influence and deeper story.",
        more: "Open full story →",
        close: "Close",
        impact: "HISTORICAL IMPACT",
        story: "STORY",
        audio: "Listen",
        legacy: "LEGACY",
        spotlight: "FEATURED FIGURE",
        choose: "CHOOSE A FIGURE"
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
            <div className="peoplePortraitOrb">
              <motion.div className="portraitAura" animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ repeat: Infinity, duration: 3.2 }} />
              <div className="peoplePortraitIcon">{active.portrait}</div>
              <div className="peoplePortraitGlyph">{active.symbol}</div>
            </div>
            <div className="peopleSpotlightCopy">
              <span className="personEraTag">{active.years}</span>
              <h3>{active.name[language]}</h3>
              <strong>{active.role[language]}</strong>
              <p>{active.summary[language]}</p>
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
            <button className="audioPill" type="button" onClick={() => speak(`${active.name[language]}. ${active.summary[language]}. ${active.story[language]}`, language)}>
              🔊 {text.audio}
            </button>
            <button className="storyActionButton" type="button" onClick={() => setModalId(active.id)}>{text.more}</button>
          </div>
        </motion.article>

        <div className="peopleGalleryPanel">
          <div className="peopleGalleryHead">
            <span>{text.choose}</span>
          </div>
          <div className="peopleShowcaseGrid">
            {people.map((person, index) => (
              <motion.button
                key={person.id}
                className={person.id === activeId ? "personShowcaseCard active" : "personShowcaseCard"}
                type="button"
                onClick={() => setActiveId(person.id)}
                style={{ ["--accent" as string]: person.accent }}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                viewport={{ once: true, amount: 0.2 }}
                whileHover={{ y: -8, scale: 1.01 }}
              >
                <div className="personGlyph">{person.symbol}</div>
                <div className="personMiniPortrait">{person.portrait}</div>
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
              <div className="storyModalVisual" style={{ background: `radial-gradient(circle at 70% 20%, ${modalPerson.accent}, transparent 34%), linear-gradient(160deg, rgba(255,255,255,.08), rgba(255,255,255,.02))` }}>
                <div className="storySeal">{modalPerson.symbol}</div>
                <div className="storyPortraitEmblem">{modalPerson.portrait}</div>
                <span>{modalPerson.years}</span>
                <h3>{modalPerson.name[language]}</h3>
                <p>{modalPerson.role[language]}</p>
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
