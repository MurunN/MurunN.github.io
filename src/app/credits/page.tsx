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
    href: "https://commons.wikimedia.org/wiki/File:%D0%9E%D0%B7%D0%B5%D1%80%D0%BE_%D0%A3%D0%B1%D1%81%D1%83-%D0%9D%D1%83%D1%80._%D0%A3%D0%BB%D0%B0%D0%B0%D0%BD%D0%B3%D0%BE%D0%BC,_%D0%9C%D0%BE%D0%BD%D0%B3%D0%BE%D0%BB%D0%B8%D1%8F._-_panoramio_(1).jpg"
  },
  {
    title: "Чингис хааны хөрөг",
    author: "Wikimedia Commons / Yuan-era album reproduction",
    license: "Public domain",
    href: "https://commons.wikimedia.org/wiki/File:YuanEmperorAlbumGenghisPortrait.jpg"
  },
  {
    title: "Өгэдэй хааны хөрөг",
    author: "Wikimedia Commons / Yuan Emperor Album",
    license: "Public domain",
    href: "https://commons.wikimedia.org/wiki/File:YuanEmperorAlbumOgedeiPortrait.jpg"
  },
  {
    title: "Хубилай хааны хөрөг",
    author: "Wikimedia Commons / Yuan Emperor Album",
    license: "Public domain",
    href: "https://commons.wikimedia.org/wiki/File:YuanEmperorAlbumKhubilaiPortrait.jpg"
  },
  {
    title: "Өндөр гэгээн Занабазарын өөрийн хөрөг",
    author: "Wikimedia Commons",
    license: "Public domain / open access",
    href: "https://commons.wikimedia.org/wiki/File:Zanabanzar_self-portrait.jpg"
  },
  {
    title: "Богд хааны хөрөг",
    author: "Unknown author; Wikimedia Commons file page",
    license: "Public domain",
    href: "https://commons.wikimedia.org/wiki/File:Bogd_Khan_(1).jpg"
  }
];

export default function CreditsPage() {
  return (
    <main className="creditsPage">
      <section className="creditsHero">
        <span className="kicker">ЭХ СУРВАЛЖ БА ЗУРГИЙН ЭРХ</span>
        <h1>SteppeQuest-д ашигласан нээлттэй эх сурвалжууд</h1>
        <p>Газрын зураг, түүхэн хөрөг, гэрэл зургуудын зохиогч болон лицензийн мэдээллийг энд нэг дор тэмдэглэв.</p>
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
        <h2>Түүхэн дүрүүдийн зургийн тэмдэглэл</h2>
        <p>Historical Figures хэсэгт placeholder зураг хэрэглэхгүйгээр museum/public-domain хөрөг, нээлттэй архивын дүрслэлүүдийг ашиглахаар шинэчилсэн. Хэрэв тухайн эх сурвалжийн лиценз эсвэл attribution өөрчлөгдвөл credits хуудсыг мөн адил шинэчилж байх шаардлагатай.</p>
      </section>
      <section className="creditsMediaNote">
        <h2>Хөгжмийн бичлэгүүд</h2>
        <p>Морин хуур, хөөмийн бичлэгүүдийг файл болгон хуулж хадгалаагүй. YouTube-ийн албан ёсны тоглуулагчаар эх бичлэгээс нь шууд үзүүлдэг.</p>
      </section>
    </main>
  );
}
