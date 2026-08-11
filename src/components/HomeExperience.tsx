"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import { useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { Reveal } from "@/components/Reveal";
import { MapExplorer } from "@/components/MapExplorer";
import { PeopleShowcase } from "@/components/PeopleShowcase";
import { CultureShowcase } from "@/components/CultureShowcase";
import { AudioGuide } from "@/components/AudioGuide";
import type { TimelineItem } from "@/lib/content";

type Language = "mn" | "en";

type TimelineVisual = {
  imageSrc: string;
  accent: string;
  chips: Record<Language, string[]>;
  focus: Record<Language, string>;
  atmosphere: Record<Language, string>;
  connection: Record<Language, string>;
};

const timelineVisuals: Record<string, TimelineVisual> = {
  "МЭӨ 209": {
    imageSrc: "/images/places/uvs.jpg",
    accent: "#8d5b39",
    chips: {
      mn: ["Эртний төрийн зохион байгуулалт", "Нүүдэлчдийн хүчирхэг холбоо", "Төв Азийн өргөн нөлөө"],
      en: ["Early state organization", "Powerful nomadic confederation", "Broad Central Asian influence"]
    },
    focus: {
      mn: "Энэ үед нүүдэлчдийн улс төр, цэргийн зохион байгуулалт илүү тод хэлбэрт орж, Хүннү гүрэн тал нутгийн хүчний тэнцвэрийг өөрчилсөн.",
      en: "This era gave nomadic political and military organization a clearer form, and the Xiongnu reshaped the balance of power across the steppe."
    },
    atmosphere: {
      mn: "Өргөн уудам тал, морин хөдөлгөөн, довтолгоон ба хамгаалалтын хэмнэлээр амьсгалсан үе.",
      en: "An era defined by open steppe space, mounted mobility and the rhythms of advance and defense."
    },
    connection: {
      mn: "Хожмын нүүдэлчдийн төрийн загвар, цэргийн зохион байгуулалтад суурь болсон үеийн нэг.",
      en: "One of the foundational periods for later nomadic state models and military organization."
    }
  },
  "1206": {
    imageSrc: "/images/places/khentii.jpg",
    accent: "#5f3a29",
    chips: {
      mn: ["Их хуралдай", "Нэгдсэн төр", "Евразийн шинэ эрин"],
      en: ["Great assembly", "Unified state", "A new Eurasian era"]
    },
    focus: {
      mn: "1206 он бол Монголын олон овог аймаг нэгэн төрийн дор нэгдэж, хууль, цэрэг, захиргааны шинэ бүтэц бүрэлдсэн онцгой эргэлтийн цэг юм.",
      en: "The year 1206 marked a major turning point when many Mongol tribes were united under one state with new legal, military and administrative structures."
    },
    atmosphere: {
      mn: "Нэгдлийн эрч, шинэ дэг журам, алсын аян дайны эхлэл энэ үеийн өнгө аясыг тодорхойлно.",
      en: "Momentum of unification, a new order and the opening of long campaigns define the atmosphere of this period."
    },
    connection: {
      mn: "Дэлхийн түүхэнд Монголын нөлөө хүчтэй мэдрэгдэж эхэлсэн эхлэл үе.",
      en: "The opening chapter of Mongolia’s profound impact on world history."
    }
  },
  "1235": {
    imageSrc: "/images/places/karakorum.jpg",
    accent: "#a96340",
    chips: {
      mn: ["Хархорум", "Олон улсын худалдаа", "Өртөөний сүлжээ"],
      en: ["Karakorum", "International trade", "Relay network"]
    },
    focus: {
      mn: "Өгэдэй хааны үеэс Хархорум нь төр, гар урлал, худалдаа, шашин соёл зэрэгцэн оршсон их гүрний төв хот болон хөгжив.",
      en: "Under Ögedei Khaan, Karakorum grew into an imperial city where governance, craftsmanship, trade and religious culture existed side by side."
    },
    atmosphere: {
      mn: "Хотын хэмнэл, зах зээл, элч төлөөлөгчид, дархны гудамжийн чимээ нэгэн зэрэг сонсогдох мэт орчин.",
      en: "A city atmosphere alive with markets, envoys and the sound of artisan quarters."
    },
    connection: {
      mn: "Монголын эзэнт гүрэн зөвхөн байлдан дагуулал биш, солилцоо ба холболтын төв байсныг харуулна.",
      en: "It shows that the Mongol Empire was not only about conquest, but also exchange and connectivity."
    }
  },
  "1911": {
    imageSrc: "/images/places/altai.jpg",
    accent: "#98533e",
    chips: {
      mn: ["Тусгаар тогтнол", "Богд хаант улс", "Үндэсний сэргэлт"],
      en: ["Independence", "Bogd Khanate", "National revival"]
    },
    focus: {
      mn: "1911 оны үйл явдал нь Монголчуудын тусгаар тогтнолын хүсэл эрмэлзэл бодит төрийн хэлбэрт шилжсэн шинэ эрин байв.",
      en: "The events of 1911 marked a new era in which Mongolia’s aspiration for independence took on concrete state form."
    },
    atmosphere: {
      mn: "Шинэ төрийн бэлгэдэл, шашин төрийн огтлолцол, үндэсний ухамсрын өсөлт энэ үеийг тодорхойлно.",
      en: "New state symbols, the intersection of religion and governance and growing national consciousness define this period."
    },
    connection: {
      mn: "Орчин үеийн Монголын тусгаар тогтнолын замналын гол суурийн нэг.",
      en: "A key foundation in the path toward modern Mongolian independence."
    }
  },
  "1990": {
    imageSrc: "/images/places/gobi.jpg",
    accent: "#486d79",
    chips: {
      mn: ["Ардчилал", "Тайван өөрчлөлт", "Шинэ Үндсэн хууль"],
      en: ["Democracy", "Peaceful change", "New constitution"]
    },
    focus: {
      mn: "1990 оны өөрчлөлт нь Монголын улс төрийн тогтолцоог тайван замаар шинэчилж, иргэний оролцоо, олон намын тогтолцоонд зам нээсэн.",
      en: "The changes of 1990 peacefully transformed Mongolia’s political system and opened the way for civic participation and multi-party democracy."
    },
    atmosphere: {
      mn: "Хотын талбай, хэлэлцүүлэг, шинэ үзэл санаа, иргэний дуу хоолой хүчтэй болсон цаг үе.",
      en: "A moment of public squares, dialogue, new ideas and an amplified civic voice."
    },
    connection: {
      mn: "Өнөөгийн Монголын нийгэм, төрийн амьдралын суурь болсон шинэ шилжилтийн үе.",
      en: "A transformative period that became a foundation of contemporary Mongolian public life."
    }
  }
};

const copy = {
  mn: {
    eyebrow: "ТАЛ НУТГААС ДЭЛХИЙН ТҮҮХ РҮҮ",
    title: "Монголын түүхийг зөвхөн унших биш, мэдэр.",
    text: "Он цагийн хэлхээ, бодит газрын зураг, түүхэн хүмүүсийн өгүүлэмж, өв соёлын дуу дүрсээр Монголын өнгөрсөн үеийг өөрийн хэмнэлээр нээгээрэй.",
    explore: "Түүхийн үеүүдийг үзэх",
    play: "Морин харваа",
    years: "жилийн түүх, өв",
    events: "гол түүхэн үе",
    games: "интерактив тоглоом",
    timelineKicker: "ЦАГ ХУГАЦААНЫ АЯЛАЛ",
    timelineTitle: "Монголын түүхийн гол үеүүд",
    timelineText: "Үе бүр өөрийн өнгө төрх, өөрчлөлт, утга агуулгатай. Он цагийн цуваанд нэг бүрчлэн нэвтэрч, зураг, товч тайлбар, онцлох санаагаар нь түүхийг илүү амьд мэдрээрэй.",
    eraHighlights: "ТУХАЙН ҮЕИЙН ӨНГӨ АЯС",
    eraImpact: "ЯАГААД ЧУХАЛ ВЭ",
    eraContext: "ТҮҮХЭН ХОЛБОС",
    gameKicker: "ТҮҮХЭН СОРИЛУУД",
    gameTitle: "Түүхийг илүү бодитоор мэдрэх хоёр тоглоом",
    gameText: "Морин дээрээс бай харваж, харин элчийн тоглоомд өртөөнөөс өртөө рүү бодит мэт давхиж даалгавраа биелүүлээрэй.",
    archeryTitle: "Морин харваа",
    archeryText: "Давхиж явах мэдрэмжтэй орчинд салхи, хүч, хэмнэлээ тооцоолж бай онох морин харвааны сорилд өрсөлдөнө.",
    archeryButton: "Морин харваа эхлүүлэх",
    relayTitle: "Их өртөөний элч",
    relayText: "3D морин өртөөний замд бичгээ хамгаалж, шалгах цэгүүдийг даван, усны буудлаар тэнхээгээ сэлбэж дараагийн өртөөнд хүр.",
    relayButton: "Өртөөний даалгаврыг эхлүүлэх",
    featureKicker: "ӨӨРИЙН ХЭМНЭЛЭЭР СУДАЛ",
    featureTitle: "Нэг түүхийг олон талаас нь нээ",
    featureText: "Газраас нь эхэлж хүнийг нь тань, хүнээс нь үе рүү шилж, өв соёлыг дуу дүрстэй нь мэдэр. Хэсэг бүр дараагийн түүх рүү хөтөлнө.",
    cards: [
      ["◎", "Газрын зураг", "Түүхэн газруудыг бодит байршлаар нь сонгож, зураг ба товч түүхийг нь үзнэ."],
      ["✦", "Түүхэн хүмүүс", "Тухайн хүний амьдрал, шийдвэр, түүхэнд үлдээсэн нөлөөг нэг дороос судална."],
      ["♪", "Өв соёл", "Монгол гэр, морин хуур, хөөмий, монгол бичгийг дуу дүрстэй нь танилцана."],
      ["🏅", "Миний ахиц", "Тоглоомын шилдэг оноо, нээсэн амжилт, ахиц тань энэ browser дээр хадгалагдана."]
    ],
    cta: "Дараагийн түүхээ өөрөө сонго.",
    ctaText: "Газрын зураг дээрх нэг цэгээс эхэлж, тэндээс хүн, соёл, он цаг руу холбон аялаарай.",
    ctaButton: "Газрын зураг руу очих",
    empty: "Он цагийн мэдээлэл хараахан нэмэгдээгүй байна."
  },
  en: {
    eyebrow: "FROM THE STEPPE TO WORLD HISTORY",
    title: "Do not just read Mongolian history. Step inside it.",
    text: "Explore Mongolia through a clear timeline, geographically grounded maps, human stories, living heritage, sound, image and interactive games.",
    explore: "Explore the eras",
    play: "Mounted archery",
    years: "years of history and heritage",
    events: "major historical eras",
    games: "interactive games",
    timelineKicker: "TRAVEL THROUGH TIME",
    timelineTitle: "Key eras in Mongolian history",
    timelineText: "Each period has its own atmosphere, turning points and meaning. Move through time with visuals, concise explanations and key takeaways that make the story feel more immediate.",
    eraHighlights: "ATMOSPHERE OF THE ERA",
    eraImpact: "WHY IT MATTERS",
    eraContext: "HISTORICAL CONNECTION",
    gameKicker: "LEARN BY PLAYING",
    gameTitle: "Two upgraded games that let you feel the story",
    gameText: "Try mounted archery with a more dynamic challenge, then ride as a courier through relay missions with obstacles, supplies and delivery goals.",
    archeryTitle: "Mounted Archery",
    archeryText: "Read the wind, timing and power in a more dynamic mounted-archery challenge.",
    archeryButton: "Start mounted archery",
    relayTitle: "Relay Courier",
    relayText: "Ride a 3D relay route, protect the dispatch, clear checkpoints, recover at water stops, and reach the next station.",
    relayButton: "Start the relay mission",
    featureKicker: "EXPLORE YOUR WAY",
    featureTitle: "Read, see, listen and play",
    featureText: "Each section connects with the next: places lead to people, people to eras, and living heritage to sound and interaction.",
    cards: [
      ["◎", "Map", "Choose historic places at real geographic positions and open photographs and concise stories."],
      ["✦", "People", "Explore lives, decisions and historical influence through focused profiles."],
      ["♪", "Living heritage", "Discover the ger, morin khuur, throat singing and traditional script through interactive media."],
      ["🏅", "Progress", "Best scores and unlocked achievements are saved in this browser."]
    ],
    cta: "Choose where the next story begins.",
    ctaText: "Start with a place on the map, then follow its connections to people, culture and time.",
    ctaButton: "Open the map",
    empty: "Timeline content has not been added yet."
  }
};

function HorseScene() {
  return (
    <div className="heroScene" aria-hidden="true">
      <motion.div className="heroSun" animate={{ scale: [1, 1.06, 1] }} transition={{ repeat: Infinity, duration: 5 }} />
      <motion.div className="cloud cloudOne" animate={{ x: [-30, 60, -30] }} transition={{ repeat: Infinity, duration: 18, ease: "linear" }} />
      <motion.div className="cloud cloudTwo" animate={{ x: [40, -70, 40] }} transition={{ repeat: Infinity, duration: 23, ease: "linear" }} />
      <div className="mountain far" />
      <div className="mountain near" />
      <motion.div className="rider" animate={{ y: [0, -5, 0], rotate: [-1, 1, -1] }} transition={{ repeat: Infinity, duration: 1.1 }}>♞</motion.div>
      <motion.div className="flyingArrow" animate={{ x: [0, 280], y: [0, -36], opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 2.4, repeatDelay: 1.2 }}>➵</motion.div>
      <div className="heroEraCard"><small>1206</small><strong>Их Монгол Улс</strong><span>Түүхэн аяллын нэгэн зангилаа</span></div>
    </div>
  );
}

export function HomeExperience({ events }: { events: TimelineItem[] }) {
  const [language, setLanguage] = useState<Language>("mn");
  const [selected, setSelected] = useState(Math.min(1, Math.max(0, events.length - 1)));
  const c = copy[language];
  const active = events[selected];
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const facts = useMemo(() => {
    if (!active) return [];
    return language === "mn" ? active.factsMn : active.factsEn;
  }, [active, language]);

  const visual = useMemo(() => {
    if (!active) return null;
    return timelineVisuals[active.yearLabel] ?? timelineVisuals["1206"];
  }, [active]);

  return (
    <main>
      <motion.div className="scrollProgress" style={{ scaleX }} />
      <Header language={language} onLanguageChange={() => setLanguage((value) => value === "mn" ? "en" : "mn")} />

      <section className="heroSection">
        <div className="heroPattern" />
        <motion.div className="heroCopy" initial={{ opacity: 0, x: -35 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
          <span className="kicker light">{c.eyebrow}</span>
          <h1>{c.title}</h1>
          <p>{c.text}</p>
          <div className="buttonRow">
            <a className="primaryButton" href="#timeline">{c.explore}</a>
            <Link className="glassButton" href="/game/archery">{c.play} <span>➹</span></Link>
          </div>
          <div className="heroStats">
            <div><strong>2,000+</strong><span>{c.years}</span></div>
            <div><strong>{events.length || 8}</strong><span>{c.events}</span></div>
            <div><strong>2</strong><span>{c.games}</span></div>
          </div>
        </motion.div>
        <HorseScene />
      </section>

      <section className="contentSection" id="timeline">
        <Reveal className="sectionHeading">
          <div><span className="kicker">{c.timelineKicker}</span><h2>{c.timelineTitle}</h2></div>
          <p>{c.timelineText}</p>
        </Reveal>

        {events.length > 0 && active && visual ? (
          <div className="timelineImmersiveLayout">
            <div className="timelineRail enhancedTimelineRail">
              {events.map((event, index) => (
                <button key={event.id} className={selected === index ? "timelineTab active" : "timelineTab"} onClick={() => setSelected(index)}>
                  <strong>{event.yearLabel}</strong>
                  <span>{language === "mn" ? event.titleMn : event.titleEn}</span>
                  <small>{language === "mn" ? event.eraMn : event.eraEn}</small>
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.article key={`${active.id}-${language}`} className="timelineStory timelineStoryRich" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }} transition={{ duration: 0.35 }}>
                <div className="timelineHeroVisual" style={{ ["--timeline-accent" as string]: visual.accent }}>
                  <Image src={visual.imageSrc} alt={language === "mn" ? active.titleMn : active.titleEn} fill sizes="(max-width: 900px) 100vw, 48vw" className="timelineHeroImage" />
                  <div className="timelineHeroOverlay" />
                  <div className="timelineHeroCopy">
                    <div className="storyYear">{active.yearLabel}</div>
                    <span className="kicker light">{language === "mn" ? active.eraMn : active.eraEn}</span>
                    <h3>{language === "mn" ? active.titleMn : active.titleEn}</h3>
                    <p>{language === "mn" ? active.summaryMn : active.summaryEn}</p>
                  </div>
                </div>

                <AudioGuide
                  title={language === "mn" ? "Түүхэн тайлбар" : "Historical narration"}
                  language={language}
                  narration={{
                    mn: `${active.titleMn}. ${active.summaryMn} ${visual.focus.mn}`,
                    en: `${active.titleEn}. ${active.summaryEn} ${visual.focus.en}`
                  }}
                  narrationSrc={`/audio/narration/timeline-${active.id}-mn.mp3`}
                  compact
                />

                <div className="timelinePanelGrid">
                  <div className="timelinePanel major">
                    <span>{c.eraHighlights}</span>
                    <p>{visual.atmosphere[language]}</p>
                  </div>
                  <div className="timelinePanel">
                    <span>{c.eraImpact}</span>
                    <p>{visual.focus[language]}</p>
                  </div>
                  <div className="timelinePanel">
                    <span>{c.eraContext}</span>
                    <p>{visual.connection[language]}</p>
                  </div>
                </div>

                <div className="timelineFactCloud">
                  {visual.chips[language].map((item, index) => (
                    <motion.span key={item} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}>{item}</motion.span>
                  ))}
                  {facts.map((fact, index) => (
                    <motion.span key={fact} className="fact" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 + index * 0.05 }}>✦ {fact}</motion.span>
                  ))}
                </div>
              </motion.article>
            </AnimatePresence>
          </div>
        ) : <div className="emptyState">{c.empty}</div>}
      </section>

      <MapExplorer language={language} />
      <PeopleShowcase language={language} />
      <CultureShowcase language={language} />

      <section className="contentSection gamesHubSection" id="games">
        <Reveal className="sectionHeading">
          <div><span className="kicker">{c.gameKicker}</span><h2>{c.gameTitle}</h2></div>
          <p>{c.gameText}</p>
        </Reveal>
        <div className="gamesHubGrid">
          <motion.article className="gameChoiceCard archeryChoice" whileHover={{ y: -8 }}>
            <div className="gameChoiceVisual">
              <div className="miniTarget"><i /><i /><i /><i /></div>
              <motion.span className="miniArrow" animate={{ x: [-45, 150], y: [28, 0], opacity: [0, 1, 1] }} transition={{ repeat: Infinity, duration: 2.1, repeatDelay: 1 }}>➵</motion.span>
            </div>
            <div className="gameChoiceCopy"><span>01</span><h3>{c.archeryTitle}</h3><p>{c.archeryText}</p><Link href="/game/archery">{c.archeryButton} →</Link></div>
          </motion.article>

          <motion.article className="gameChoiceCard relayChoice" whileHover={{ y: -8 }}>
            <div className="gameChoiceVisual relayVisual">
              <div className="relayRoad"><i /><i /><i /><i /></div>
              <motion.span className="relayHorse" animate={{ x: [-55, 145], y: [6, -8, 4] }} transition={{ repeat: Infinity, duration: 3.2, repeatDelay: 0.7 }}>♞</motion.span>
              <div className="relayFlag">⚑</div>
            </div>
            <div className="gameChoiceCopy"><span>02</span><h3>{c.relayTitle}</h3><p>{c.relayText}</p><Link href="/game/relay">{c.relayButton} →</Link></div>
          </motion.article>
        </div>
      </section>

      <section className="contentSection featureSection">
        <Reveal className="featureIntro">
          <span className="kicker">{c.featureKicker}</span>
          <h2>{c.featureTitle}</h2>
          <p>{c.featureText}</p>
        </Reveal>
        <div className="featureGrid">
          {c.cards.map(([icon, title, description], index) => (
            <Reveal key={title} delay={index * 0.08}>
              <motion.article className="featureCard" whileHover={{ y: -8, scale: 1.01 }} transition={{ duration: 0.2 }}>
                <div className="featureIcon">{icon}</div>
                <h3>{title}</h3>
                <p>{description}</p>
              </motion.article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="ctaSection">
        <div><span className="kicker light">STEPPEQUEST</span><h2>{c.cta}</h2><p>{c.ctaText}</p></div>
        <a className="lightButton" href="#map">{c.ctaButton}</a>
      </section>

      <footer className="siteFooter">
        <div className="footerBrand">
          <span className="brandSeal">ᠮ</span>
          <div><strong>SteppeQuest</strong><span>{language === "mn" ? "Монголын түүх, өв соёлыг интерактив хэлбэрээр танилцуулах платформ" : "An interactive platform for Mongolian history and living heritage"}</span></div>
        </div>
        <p>© {new Date().getFullYear()} SteppeQuest. · <Link href="/credits">Эх сурвалж</Link></p>
      </footer>
    </main>
  );
}
