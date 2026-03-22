"use client";

import styles from "./page.module.css";
import Image from "next/image";
import Button from "@/components/Button";
import { useLesson } from "@/components/LessonProvider";
import { FALLBACK_LESSON } from "@/utils/lesson";

export default function LezionePage() {
  const { lesson } = useLesson();
  const lessonData = lesson || FALLBACK_LESSON;

  return (
    <main className={styles.main}>
      <section className={`${styles.sectionBlock} ${styles.ctaSection}`}>
        <div className={styles.ctaCopy}>
          <h2>Sei pronto a imparare giocando?</h2>
          <p>
            Leggi la mini-lezione generata, altrimenti puoi andare direttamente ai giochi!
          </p>
        </div>
        <div className={styles.ctaActions}>
          <Button href="/giochi" variant="solid">Vai ai giochi</Button>
        </div>
      </section>

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <p className={styles.eyebrow}>Lezione generata</p>
            <h1>{lessonData.title}</h1>
            <p className={styles.description}>{lessonData.description}</p>
            <p className={styles.heroHighlight}>
              Il robot non ti accompagna soltanto nella spiegazione: prepara il terreno di gioco,
              trasforma lo studio in una sfida e ti porta verso la fase più interattiva del progetto.
            </p>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.robotFramePrimary}>
              <Image
                src="/Robot%20Mascotte%20Assets/1_Neutrale.png"
                alt="Robot guida della lezione"
                width={340}
                height={340}
                className={styles.heroRobot}
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <section className={styles.sectionBlock}>
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Lezione</p>
          <h2>Percorso guidato</h2>
        </div>
        <div className={styles.lessonCards}>
          {lessonData.sections.map((section, index) => (
            <article key={section.title} className={styles.lessonCard}>
              <span className={styles.lessonIndex}>0{index + 1}</span>
              <h3>{section.title}</h3>
              <p>{section.content}</p>
              <ul className={styles.bulletList}>
                {section.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}