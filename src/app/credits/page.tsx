import Link from "next/link";

const assets = [
  {
    title: "Монгол орны рельеф газрын зураг",
    author: "NordNordWest; derivative work Виктор В.",
    license: "CC BY-SA 3.0",
    href: "https://commons.wikimedia.org/wiki/File:Relief_map_of_Mongolia.png"
  },
  {
    title: "Эрдэнэ Зуу хийд — Хархорум",
    author: "Mongolia Expeditions…",
    license: "CC BY 3.0",
    href: "https://commons.wikimedia.org/wiki/File:Erdenezuu_monastery_-_panoramio_-_Mongolia_Expeditions%E2%80%A6_(1).jpg"
  },
  {
    title: "Бурхан Халдун",
    author: "ganzo art",
    license: "CC BY-SA 2.0",
    href: "https://commons.wikimedia.org/wiki/File:Burkhan_Khaldun_mount2.jpg"
  },
  {
    title: "Алтай Таван богд — Потанины мөсөн гол",
    author: "Mongolia Expeditions…",
    license: "CC BY 3.0",
    href: "https://commons.wikimedia.org/wiki/File:Altai_Tavan_Bogd_-_Potanin_glacier_-_panoramio.jpg"
  },
  {
    title: "Баянзаг — Flaming Cliffs",
    author: "Richard Mortel / Prof. Mortel",
    license: "CC BY 2.0",
    href: "https://commons.wikimedia.org/wiki/File:Bayanzag_(Flaming_Cliffs),_Gobi_Desert,_Mongolia_(27).jpg"
  },
  {
    title: "Увс нуур",
    author: "Александр Попрыгин",
    license: "CC BY 3.0",
    href: "https://commons.wikimedia.org/wiki/File:Озеро_Убсу-Нур._Улаангом,_Монголия._-_panoramio_(1).jpg"
  }
];

export default function CreditsPage() {
  return (
    <main className="creditsPage">
      <section className="creditsHero">
        <span className="kicker">ЭХ СУРВАЛЖ БА ЗУРГИЙН ЭРХ</span>
        <h1>SteppeQuest-д ашигласан нээлттэй эх сурвалжууд</h1>
        <p>Газрын зураг, гэрэл зургуудын зохиогч болон лицензийн мэдээллийг энд нэг дор тэмдэглэв.</p>
        <Link href="/">← Нүүр хуудас</Link>
      </section>
      <section className="creditsGrid">
        {assets.map((asset) => (
          <article key={asset.href} className="creditCard">
            <strong>{asset.title}</strong>
            <p>{asset.author}</p>
            <span>{asset.license}</span>
            <a href={asset.href} target="_blank" rel="noreferrer">Wikimedia Commons →</a>
          </article>
        ))}
      </section>
      <section className="creditsMediaNote">
        <h2>Хөгжмийн бичлэгүүд</h2>
        <p>Морин хуур, хөөмийн бичлэгүүдийг файл болгон хуулж хадгалаагүй. YouTube-ийн албан ёсны тоглуулагчаар эх бичлэгээс нь шууд үзүүлдэг.</p>
      </section>
    </main>
  );
}
