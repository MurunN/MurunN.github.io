"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { AudioGuide } from "@/components/AudioGuide";

type Language = "mn" | "en";

type JourneyStop = {
  label: Record<Language, string>;
  detail: Record<Language, string>;
};

type MapPlace = {
  id: string;
  lat: number;
  lon: number;
  icon: string;
  accent: string;
  imageSrc: string;
  audioSrc?: string;
  title: Record<Language, string>;
  region: Record<Language, string>;
  summary: Record<Language, string>;
  detail: Record<Language, string>;
  highlights: Record<Language, string[]>;
  routeStops: JourneyStop[];
};

const MAP_BOUNDS = { north: 52.5, south: 41.3, west: 87.4, east: 120.5 };

function projectPoint(lat: number, lon: number) {
  return {
    left: ((lon - MAP_BOUNDS.west) / (MAP_BOUNDS.east - MAP_BOUNDS.west)) * 100,
    top: ((MAP_BOUNDS.north - lat) / (MAP_BOUNDS.north - MAP_BOUNDS.south)) * 100
  };
}

const places: MapPlace[] = [
  {
    id: "uvs",
    lat: 50.3,
    lon: 92.7,
    icon: "◉",
    accent: "#5e7953",
    imageSrc: "/images/places/uvs.jpg",
    audioSrc: "/audio/map/uvs.mp3",
    title: { mn: "Увс нуур", en: "Uvs Lake" },
    region: { mn: "Увс аймаг · Баруун хойд Монгол", en: "Uvs Province · Northwestern Mongolia" },
    summary: {
      mn: "Увс нуурын сав газар нь нуур, цөлжилт, уулс, тал хээр нэг дор огтлолцсон өвөрмөц байгалийн тогтолцоотой. Энэ орчинд нүүдэлчдийн олон үеийн ул мөр хадгалагдан үлджээ.",
      en: "The Uvs Lake Basin brings lake, dryland, mountains and steppe into one remarkable landscape, preserving traces of many generations of nomadic life."
    },
    detail: {
      mn: "Газрын зураг дээрх цэг нь Увс нуурын орчимд байрлана. Байгаль, археологи, нүүдлийн соёлын холбоог энэ хэсгээс хамтатган харж болно.",
      en: "The marker is placed in the Uvs Lake area, where natural history, archaeology and nomadic culture can be explored together."
    },
    highlights: {
      mn: ["Увс нуурын сав газрын байгалийн өв", "Эртний нүүдэлчдийн археологийн дурсгал", "Баруун Монголын онцгой экосистем"],
      en: ["Natural heritage of the Uvs Basin", "Archaeological traces of ancient nomads", "A distinctive ecosystem of western Mongolia"]
    },
    routeStops: [
      { label: { mn: "Нуурын эрэг", en: "Lake shore" }, detail: { mn: "Нуур, тал хээрийн зааг дахь амьдралын орчныг ажиглана.", en: "Observe the meeting point of lake and steppe." } },
      { label: { mn: "Археологийн дурсгал", en: "Archaeological sites" }, detail: { mn: "Эртний нүүдэлчдийн үлдээсэн булш, дурсгалын талаар танилцана.", en: "Explore burial sites and traces left by early nomadic societies." } },
      { label: { mn: "Нүүдлийн орчин", en: "Nomadic landscape" }, detail: { mn: "Байгальтайгаа зохицсон амьдралын хэв маягийг ойлгоно.", en: "Understand how mobile life adapted to the environment." } }
    ]
  },
  {
    id: "altai",
    lat: 49.152071,
    lon: 87.970963,
    icon: "🦅",
    accent: "#54748b",
    imageSrc: "/images/places/altai.jpg",
    audioSrc: "/audio/map/altai.mp3",
    title: { mn: "Алтай Таван богд", en: "Altai Tavan Bogd" },
    region: { mn: "Баян-Өлгий аймаг · Монгол Алтай", en: "Bayan-Ölgii Province · Mongolian Altai" },
    summary: {
      mn: "Монгол Алтайн өндөр уулс, мөсөн гол, хадны зураг, бүргэдийн ангийн уламжлал нь баруун Монголын байгаль, соёлын нэгэн цогц дүр төрхийг бий болгодог.",
      en: "High mountains, glaciers, rock art and eagle-hunting traditions form one of western Mongolia's most distinctive cultural landscapes."
    },
    detail: {
      mn: "Энэ цэгийг Алтай Таван богдын Потанины мөсөн голын орчимд байрлуулсан. Уулын орчин, хадны зураг, бүргэдчдийн өвийг нэг аяллын хүрээнд танилцуулна.",
      en: "The marker is positioned near the Potanin Glacier area of Altai Tavan Bogd, linking mountain landscapes, rock art and eagle-hunting heritage."
    },
    highlights: {
      mn: ["Алтай Таван богдын өндөр уулс ба мөсөн гол", "Хадны зургийн өв", "Бүргэдийн ангийн амьд уламжлал"],
      en: ["High peaks and glaciers of Altai Tavan Bogd", "Rock-art heritage", "Living eagle-hunting traditions"]
    },
    routeStops: [
      { label: { mn: "Мөсөн гол", en: "Glacier" }, detail: { mn: "Өндөр уулын байгалийн тогтолцоог танина.", en: "Discover the high-altitude natural environment." } },
      { label: { mn: "Хадны зураг", en: "Rock art" }, detail: { mn: "Олон үеийн амьдрал, ан агнуурын дүрслэлийг харна.", en: "See images of life and hunting preserved in stone." } },
      { label: { mn: "Бүргэдчдийн өв", en: "Eagle hunters" }, detail: { mn: "Хүн, бүргэдийн хамтын ажиллагаанд тулгуурласан уламжлалыг ойлгоно.", en: "Learn about the tradition built on cooperation between hunter and eagle." } }
    ]
  },
  {
    id: "karakorum",
    lat: 47.20108,
    lon: 102.841373,
    icon: "⌂",
    accent: "#b56043",
    imageSrc: "/images/places/karakorum.jpg",
    audioSrc: "/audio/map/karakorum.mp3",
    title: { mn: "Хархорум", en: "Karakorum" },
    region: { mn: "Өвөрхангай аймаг · Орхоны хөндий", en: "Övörkhangai Province · Orkhon Valley" },
    summary: {
      mn: "Хархорум XIII зуунд Их Монгол Улсын төр, худалдаа, гар урлал, дипломат харилцааны чухал төв байв. Өнөөдөр эртний хотын туурь, Эрдэнэ Зуу хийд орчмын соёлын дурсгалууд энэ түүхийг гэрчилнэ.",
      en: "In the thirteenth century, Karakorum was a major center of government, trade, craftsmanship and diplomacy. Today, the ancient site and nearby Erdene Zuu preserve that historical memory."
    },
    detail: {
      mn: "Цэгийг Хархорин дахь Эрдэнэ Зуу хийд, эртний Хархорумын дурсгалын орчимд байрлуулсан. Эндээс эзэнт гүрний нийслэлийн түүхийг газар орны бодит байршилтай нь холбон үзнэ.",
      en: "The marker is placed by Erdene Zuu and the archaeological area of ancient Karakorum, connecting the imperial capital's history with its real location."
    },
    highlights: {
      mn: ["Их Монгол Улсын нийслэлийн түүх", "Орхоны хөндийн соёлын өв", "Эрдэнэ Зуу хийд ба эртний хотын туурь"],
      en: ["History of the imperial capital", "Cultural heritage of the Orkhon Valley", "Erdene Zuu and the remains of the ancient city"]
    },
    routeStops: [
      { label: { mn: "Эртний хотын туурь", en: "Ancient city site" }, detail: { mn: "Хархорумын хот байгуулалт, судалгааны олдворуудтай танилцана.", en: "Explore the archaeology and urban history of Karakorum." } },
      { label: { mn: "Эрдэнэ Зуу", en: "Erdene Zuu" }, detail: { mn: "Хархорумын дурсамжтай залгамжилсан шашин, соёлын төвийг харна.", en: "Visit a major religious and cultural site beside the ancient city." } },
      { label: { mn: "Орхоны хөндий", en: "Orkhon Valley" }, detail: { mn: "Монголын төр, нүүдэл, суурин соёлын урт хугацааны холбоог ойлгоно.", en: "See the long relationship between statehood, mobility and settlement." } }
    ]
  },
  {
    id: "khentii",
    lat: 48.7833,
    lon: 109.1667,
    icon: "▲",
    accent: "#86744a",
    imageSrc: "/images/places/khentii.jpg",
    audioSrc: "/audio/map/khentii.mp3",
    title: { mn: "Бурхан Халдун", en: "Burkhan Khaldun" },
    region: { mn: "Хэнтийн нуруу · Зүүн хойд Монгол", en: "Khentii Mountains · Northeastern Mongolia" },
    summary: {
      mn: "Бурхан Халдун нь Монголын түүх, шүтлэг, аман уламжлалтай гүн холбоотой ариун уулсын нэг. Чингис хааны намтар, Монголын нууц товчооны өгүүлэмжид онцгой байр суурь эзэлдэг.",
      en: "Burkhan Khaldun is one of Mongolia's most sacred mountains, deeply connected with history, worship traditions and narratives associated with Chinggis Khaan."
    },
    detail: {
      mn: "Газрын зураг дээрх цэгийг Бурхан Халдун уулын байршилд ойртуулан тэмдэглэсэн. Энэ хэсэгт түүхэн өгүүлэмжийг шүтлэг, байгаль, газар орны утгатай нь хамтатган танилцуулна.",
      en: "The marker is positioned near Burkhan Khaldun itself, presenting historical narratives together with the mountain's sacred and environmental meaning."
    },
    highlights: {
      mn: ["Монголын шүтлэгт уулсын уламжлал", "Чингис хааны намтартай холбоотой газар", "Хэнтийн нурууны байгалийн өв"],
      en: ["Tradition of sacred mountain worship", "Landscape associated with Chinggis Khaan", "Natural heritage of the Khentii Mountains"]
    },
    routeStops: [
      { label: { mn: "Ариун уулын уламжлал", en: "Sacred-mountain tradition" }, detail: { mn: "Уул, ус тахих ёсны утга учрыг судална.", en: "Explore the meaning of mountain and nature worship." } },
      { label: { mn: "Нууц товчооны орон зай", en: "Secret History landscape" }, detail: { mn: "Түүхэн өгүүлэмж ба газар орны холбоог харна.", en: "Connect historical narrative with physical landscape." } },
      { label: { mn: "Хэнтийн тайга", en: "Khentii forest-steppe" }, detail: { mn: "Тайга, уул, голын эх бүхий байгалийн орчныг танина.", en: "Discover the forest-steppe and headwaters of the Khentii region." } }
    ]
  },
  {
    id: "bayanzag",
    lat: 44.1385,
    lon: 103.7278,
    icon: "◆",
    accent: "#b56535",
    imageSrc: "/images/places/gobi.jpg",
    audioSrc: "/audio/map/gobi.mp3",
    title: { mn: "Баянзаг", en: "Bayanzag" },
    region: { mn: "Өмнөговь аймаг · Говийн бүс", en: "Ömnögovi Province · Gobi region" },
    summary: {
      mn: "Баянзагийн улаан цав нь говийн байгаль, палеонтологийн түүхээрээ дэлхийд танигдсан газар. XX зууны эхэн үеийн судалгаагаар үлэг гүрвэлийн өндөг зэрэг чухал олдворууд илэрсэн.",
      en: "Bayanzag's red cliffs are internationally known for Gobi landscapes and paleontological history, including important dinosaur discoveries made in the early twentieth century."
    },
    detail: {
      mn: "Энэ цэгийг Баянзагийн Улаан цавын бодит байршилд ойртуулан тэмдэглэсэн. Түүхэн аялал нь Монголын говийн байгаль, шинжлэх ухааны нээлтийн түүхийг хамтад нь өгүүлнэ.",
      en: "The marker is positioned at the Flaming Cliffs area of Bayanzag, linking the Gobi landscape with the history of scientific discovery."
    },
    highlights: {
      mn: ["Улаан элсэн чулуун цав", "Палеонтологийн дэлхийд танигдсан олдвор", "Говийн өвөрмөц байгаль"],
      en: ["Red sandstone cliffs", "World-renowned paleontological discoveries", "Distinctive Gobi environment"]
    },
    routeStops: [
      { label: { mn: "Улаан цав", en: "Flaming Cliffs" }, detail: { mn: "Нарны гэрэлд өнгөө өөрчилдөг элсэн чулуун тогтоцыг харна.", en: "See the sandstone cliffs that glow in changing light." } },
      { label: { mn: "Олдворын түүх", en: "Discovery history" }, detail: { mn: "Говийн палеонтологийн судалгааны түүхийг мэднэ.", en: "Learn about the history of paleontological research in the Gobi." } },
      { label: { mn: "Заган ой", en: "Saxaul landscape" }, detail: { mn: "Баянзаг нэрийн утга, говийн ургамлын орчныг танина.", en: "Explore the saxaul landscape from which Bayanzag takes its name." } }
    ]
  }
];

function PlacePhoto({ place, large = false }: { place: MapPlace; large?: boolean }) {
  return (
    <div className={large ? "placePhoto large" : "placePhoto"}>
      <Image src={place.imageSrc} alt={place.title.mn} fill sizes={large ? "(max-width: 900px) 100vw, 55vw" : "(max-width: 900px) 100vw, 36vw"} className="placePhotoImage" />
      <div className="placePhotoShade" />
      <div className="placePhotoCaption">
        <span>{place.region.mn}</span>
        <strong>{place.title.mn}</strong>
      </div>
    </div>
  );
}

export function MapExplorer({ language }: { language: Language }) {
  const [activeId, setActiveId] = useState("karakorum");
  const [modalId, setModalId] = useState<string | null>(null);
  const active = useMemo(() => places.find((place) => place.id === activeId) ?? places[0], [activeId]);
  const modalPlace = useMemo(() => places.find((place) => place.id === modalId) ?? null, [modalId]);

  const text = language === "mn"
    ? {
        kicker: "ГАЗРЫН ЗУРАГ ДЭЭРХ ТҮҮХ",
        title: "Түүхэн газруудаар аял",
        body: "Монголын түүх, өв соёлтой холбоотой газруудыг бодит байршлаар нь сонгон үзээрэй. Цэг бүрээс тухайн газрын зураг, товч түүх, онцлох баримтыг нээж болно.",
        highlights: "ОНЦЛОХ НЬ",
        route: "ЭНД ЮУГ ҮЗЭХ ВЭ?",
        cue: "Газрын зураг дээрх цэгээс сонирхсон газраа сонгоорой",
        open: "Дэлгэрэнгүй үзэх",
        close: "Хаах",
        ambience: "Орчны аялгуу"
      }
    : {
        kicker: "HISTORY ON THE MAP",
        title: "Explore historic places",
        body: "Choose places connected with Mongolian history and heritage at their real geographic positions. Each marker opens a photograph, concise story and key facts.",
        highlights: "HIGHLIGHTS",
        route: "WHAT TO EXPLORE",
        cue: "Choose a place from the map",
        open: "Explore in detail",
        close: "Close",
        ambience: "Listen"
      };

  return (
    <section className="contentSection mapSection" id="map">
      <div className="sectionHeading">
        <div><span className="kicker">{text.kicker}</span><h2>{text.title}</h2></div>
        <p>{text.body}</p>
      </div>

      <div className="mapExplorerLayout mapExplorerReal">
        <div className="mapColumn">
          <div className="realMapStage">
            <Image src="/images/mongolia-relief.png" alt="Монгол орны газрын зураг" fill priority={false} sizes="(max-width: 1100px) 100vw, 58vw" className="realMapImage" />
            <div className="realMapTint" />
            {places.map((place) => {
              const point = projectPoint(place.lat, place.lon);
              return (
                <button
                  key={place.id}
                  type="button"
                  className={place.id === activeId ? "geoMarker active" : "geoMarker"}
                  style={{ left: `${point.left}%`, top: `${point.top}%`, ["--marker-accent" as string]: place.accent }}
                  onClick={() => setActiveId(place.id)}
                  aria-label={place.title[language]}
                >
                  <motion.i animate={place.id === activeId ? { scale: [1, 1.25, 1] } : { scale: 1 }} transition={{ repeat: place.id === activeId ? Infinity : 0, duration: 1.8 }} />
                  <span>{place.title[language]}</span>
                </button>
              );
            })}
            <div className="mapCoordinateNote">{text.cue}</div>
          </div>

          <div className="mapPlaceTabs">
            {places.map((place) => (
              <button key={place.id} type="button" className={place.id === activeId ? "mapPlaceTab active" : "mapPlaceTab"} onClick={() => setActiveId(place.id)}>
                <span>{place.icon}</span><strong>{place.title[language]}</strong><small>{place.region[language]}</small>
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.aside key={`${active.id}-${language}`} className="mapDetailCard realMapDetail" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
            <PlacePhoto place={active} />
            <div className="realMapDetailCopy">
              <span className="detailBadge" style={{ background: `${active.accent}16`, color: active.accent }}>{active.region[language]}</span>
              <h3>{active.title[language]}</h3>
              <p>{active.summary[language]}</p>
              <AudioGuide title={text.ambience} src={active.audioSrc} language={language} narration={{ mn: active.summary.mn, en: active.summary.en }} narrationSrc={`/audio/narration/map-${active.id}-mn.mp3`} compact />
              <div className="mapHighlightPanel compactPanel">
                <span>{text.highlights}</span>
                <ul>{active.highlights[language].map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
              <button className="storyActionButton mapModalButton" type="button" onClick={() => setModalId(active.id)}>{text.open} →</button>
            </div>
          </motion.aside>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {modalPlace ? (
          <motion.div className="storyOverlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="mapImmersiveModal mapTravelModal" initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.98 }}>
              <button className="closeStory mapClose" onClick={() => setModalId(null)}>{text.close} ✕</button>
              <PlacePhoto place={modalPlace} large />
              <div className="mapImmersiveCopy">
                <span className="kicker">{modalPlace.region[language]}</span>
                <h3>{modalPlace.title[language]}</h3>
                <p>{modalPlace.detail[language]}</p>
                <AudioGuide title={text.ambience} src={modalPlace.audioSrc} language={language} narration={{ mn: `${modalPlace.summary.mn} ${modalPlace.detail.mn}`, en: `${modalPlace.summary.en} ${modalPlace.detail.en}` }} narrationSrc={`/audio/narration/map-${modalPlace.id}-detail-mn.mp3`} />
                <div className="mapRoutePanel immersiveRoutePanel">
                  <span>{text.route}</span>
                  <div className="mapRouteList">
                    {modalPlace.routeStops.map((stop, index) => (
                      <div key={stop.label[language]} className="mapRouteStop">
                        <i>{index + 1}</i>
                        <div><h4>{stop.label[language]}</h4><p>{stop.detail[language]}</p></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
