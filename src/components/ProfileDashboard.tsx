"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { Header } from "@/components/Header";

type BadgeItem = {
  code: string;
  nameMn: string;
  descriptionMn: string;
  icon: string;
  unlockedAt: string;
};

type ScoreItem = {
  id: string;
  gameType: string;
  score: number;
  xpEarned: number;
  bullseyes: number;
  createdAt: string;
};

export function ProfileDashboard({ user, badges, scores }: {
  user: { name: string | null; email: string; image: string | null; xp: number; role: "USER" | "ADMIN" };
  badges: BadgeItem[];
  scores: ScoreItem[];
}) {
  const bestScore = scores.reduce((best, item) => Math.max(best, item.score), 0);
  const bullseyes = scores.reduce((sum, item) => sum + item.bullseyes, 0);
  const level = Math.floor(user.xp / 100) + 1;
  const levelProgress = user.xp % 100;

  return (
    <main className="dashboardPage">
      <Header />
      <section className="profileHero">
        <motion.div className="profileIdentity" initial={{ opacity: 0, x: -25 }} animate={{ opacity: 1, x: 0 }}>
          {user.image ? <img src={user.image} alt="" /> : <div className="avatarFallback">ᠮ</div>}
          <div><span className="kicker light">МИНИЙ АЯЛАЛ</span><h1>{user.name ?? "Тал нутгийн аялагч"}</h1><p>{user.email}</p></div>
        </motion.div>
        <div className="levelCard"><span>ТҮВШИН</span><strong>{level}</strong><div className="levelTrack"><i style={{ width: `${levelProgress}%` }} /></div><small>{levelProgress} / 100 XP</small></div>
      </section>

      <section className="dashboardContent">
        <div className="metricGrid">
          {[ [user.xp, "Нийт XP"], [scores.length, "Тоглолт"], [bestScore, "Шилдэг оноо"], [bullseyes, "Байны гол"] ].map(([value, label], index) => (
            <motion.article key={String(label)} className="metricCard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}><strong>{value}</strong><span>{label}</span></motion.article>
          ))}
        </div>

        <div className="dashboardGrid">
          <section className="panelCard">
            <div className="panelHeading"><div><span className="kicker">АМЖИЛТ</span><h2>Нээгдсэн тэмдгүүд</h2></div><span>{badges.length} тэмдэг</span></div>
            <div className="profileBadgeGrid">
              {badges.length ? badges.map((badge, index) => (
                <motion.article className="profileBadge" key={badge.code} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.06 }}>
                  <div>{badge.icon}</div><strong>{badge.nameMn}</strong><p>{badge.descriptionMn}</p><small>{new Date(badge.unlockedAt).toLocaleDateString("mn-MN")}</small>
                </motion.article>
              )) : <div className="emptyState">Одоогоор тэмдэг нээгдээгүй байна.</div>}
            </div>
          </section>

          <section className="panelCard scorePanel">
            <div className="panelHeading"><div><span className="kicker">ТОГЛОЛТЫН ТҮҮХ</span><h2>Сүүлийн тоглолтууд</h2></div><Link href="/#games">Тоглоом сонгох →</Link></div>
            <div className="scoreList">
              {scores.length ? scores.map((item, index) => (
                <motion.div className="scoreRow" key={item.id} initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}>
                  <div className="scoreIcon">{item.gameType === "RELAY" ? "♞" : "◎"}</div><div><strong>{item.score} оноо</strong><span>{item.gameType === "RELAY" ? "Өртөөний элч" : "Бай харваа"} · {new Date(item.createdAt).toLocaleString("mn-MN")}</span></div><div><strong>+{item.xpEarned} XP</strong><span>{item.gameType === "ARCHERY" ? `${item.bullseyes} удаа гол оносон` : "замын шийдвэрийн сорил"}</span></div>
                </motion.div>
              )) : <div className="emptyState">Тоглолтын түүх алга. Тоглоомын хэсгээс эхний сорилоо сонгоорой.</div>}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
