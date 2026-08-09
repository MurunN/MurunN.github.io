"use client";

import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { Header } from "@/components/Header";
import type { TimelineItem } from "@/lib/content";

type FormState = Omit<TimelineItem, "id"> & { id?: string };

const emptyForm: FormState = {
  yearLabel: "",
  eraMn: "",
  eraEn: "",
  titleMn: "",
  titleEn: "",
  summaryMn: "",
  summaryEn: "",
  factsMn: [],
  factsEn: [],
  sortOrder: 0,
  published: true
};

export function AdminTimeline({ initialItems }: { initialItems: TimelineItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [factsMnText, setFactsMnText] = useState("");
  const [factsEnText, setFactsEnText] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const editing = Boolean(form.id);

  const sortedItems = useMemo(() => [...items].sort((a, b) => a.sortOrder - b.sortOrder), [items]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function editItem(item: TimelineItem) {
    setForm(item);
    setFactsMnText(item.factsMn.join("\n"));
    setFactsEnText(item.factsEn.join("\n"));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setForm(emptyForm); setFactsMnText(""); setFactsEnText("");
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    const payload = {
      ...form,
      factsMn: factsMnText.split("\n").map((item) => item.trim()).filter(Boolean),
      factsEn: factsEnText.split("\n").map((item) => item.trim()).filter(Boolean),
      sortOrder: Number(form.sortOrder)
    };
    const response = await fetch(form.id ? `/api/admin/timeline/${form.id}` : "/api/admin/timeline", {
      method: form.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (response.ok) {
      const data = await response.json();
      const normalized: TimelineItem = { ...data.item, factsMn: payload.factsMn, factsEn: payload.factsEn };
      setItems((current) => form.id ? current.map((item) => item.id === form.id ? normalized : item) : [...current, normalized]);
      setMessage(form.id ? "Контент шинэчлэгдлээ." : "Шинэ түүхэн үе нэмэгдлээ.");
      resetForm();
    } else setMessage("Хадгалах үед алдаа гарлаа. Бүх талбарыг шалгана уу.");
    setBusy(false);
  }

  async function remove(id: string) {
    if (!window.confirm("Энэ түүхэн үеийг устгах уу?")) return;
    const response = await fetch(`/api/admin/timeline/${id}`, { method: "DELETE" });
    if (response.ok) setItems((current) => current.filter((item) => item.id !== id));
  }

  return (
    <main className="adminPage">
      <Header />
      <section className="adminHero"><div><span className="kicker light">КОНТЕНТЫН УДИРДЛАГА</span><h1>SteppeQuest Admin</h1><p>Он цагийн мэдээллийг монгол, англи хэлээр нэмэх, засах, нийтлэх боломжтой.</p></div><div className="adminCount"><strong>{items.length}</strong><span>нийт түүхэн үе</span></div></section>
      <section className="adminLayout">
        <motion.form className="adminForm" onSubmit={submit} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="panelHeading"><div><span className="kicker">{editing ? "ЗАСВАРЛАХ" : "ШИНЭ ҮЕ"}</span><h2>{editing ? "Түүхэн үе засах" : "Түүхэн үе нэмэх"}</h2></div>{editing && <button type="button" className="textButton" onClick={resetForm}>Цуцлах</button>}</div>
          <div className="formGrid">
            <label><span>Он / хугацаа</span><input value={form.yearLabel} onChange={(e) => update("yearLabel", e.target.value)} placeholder="1206" required /></label>
            <label><span>Эрэмбэ</span><input type="number" value={form.sortOrder} onChange={(e) => update("sortOrder", Number(e.target.value))} /></label>
            <label><span>Эрин үе — MN</span><input value={form.eraMn} onChange={(e) => update("eraMn", e.target.value)} required /></label>
            <label><span>Era — EN</span><input value={form.eraEn} onChange={(e) => update("eraEn", e.target.value)} required /></label>
            <label><span>Гарчиг — MN</span><input value={form.titleMn} onChange={(e) => update("titleMn", e.target.value)} required /></label>
            <label><span>Title — EN</span><input value={form.titleEn} onChange={(e) => update("titleEn", e.target.value)} required /></label>
            <label className="full"><span>Тайлбар — MN</span><textarea value={form.summaryMn} onChange={(e) => update("summaryMn", e.target.value)} rows={4} required /></label>
            <label className="full"><span>Summary — EN</span><textarea value={form.summaryEn} onChange={(e) => update("summaryEn", e.target.value)} rows={4} required /></label>
            <label><span>Баримтууд — MN (мөр бүр нэг)</span><textarea value={factsMnText} onChange={(e) => setFactsMnText(e.target.value)} rows={5} /></label>
            <label><span>Facts — EN (one per line)</span><textarea value={factsEnText} onChange={(e) => setFactsEnText(e.target.value)} rows={5} /></label>
          </div>
          <label className="checkLabel"><input type="checkbox" checked={form.published} onChange={(e) => update("published", e.target.checked)} /><span>Нүүр хуудсанд нийтлэх</span></label>
          {message && <p className="formMessage">{message}</p>}
          <button className="primaryButton" disabled={busy}>{busy ? "Хадгалж байна..." : editing ? "Өөрчлөлт хадгалах" : "Түүхэн үе нэмэх"}</button>
        </motion.form>

        <section className="adminList">
          <div className="panelHeading"><div><span className="kicker">ОН ЦАГИЙН МЭДЭЭЛЭЛ</span><h2>Нийт түүхэн үе</h2></div></div>
          {sortedItems.map((item, index) => (
            <motion.article className="adminItem" key={item.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
              <div className="adminYear">{item.yearLabel}</div><div className="adminItemCopy"><span>{item.eraMn}</span><strong>{item.titleMn}</strong><p>{item.summaryMn}</p><small className={item.published ? "published" : "draft"}>{item.published ? "НИЙТЭЛСЭН" : "НООРОГ"}</small></div>
              <div className="adminActions"><button onClick={() => editItem(item)}>Засах</button><button className="danger" onClick={() => remove(item.id)}>Устгах</button></div>
            </motion.article>
          ))}
        </section>
      </section>
    </main>
  );
}
