"use client";

import styles from "./page.module.css";
import Image from "next/image";
import Button from "@/components/Button";
import { useLesson } from "@/components/LessonProvider";

export default function LezionePage() {
  const { lesson } = useLesson();

  if (!lesson) {
    return (
      <main className={styles.main}>
        <section className={`${styles.sectionBlock} ${styles.ctaSection}`}>
          <div className={styles.heroVisual}>
            <Image
              src="/Robot%20Mascotte%20Assets/1_Neutrale.png"
              alt="Robot guida"
              width={200}
              height={200}
            />
          </div>
          <div className={styles.ctaCopy}>
            <h2>Nessuna lezione caricata</h2>
            <p>Carica appunti, un video o scegli un argomento per generare la tua lezione interattiva.</p>
          </div>
          <div className={styles.ctaActions}>
            <Button href="/upload" variant="solid">Carica contenuto</Button>
          </div>
        </section>
      </main>
    );
  }

  const sections = lesson.sections || [];

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
            <h1>{lesson.title}</h1>
            <p className={styles.description}>{lesson.description}</p>
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

      {sections.length > 0 && (
        <section className={styles.sectionBlock}>
          <div className={styles.sectionHeader}>
            <p className={styles.eyebrow}>Lezione</p>
            <h2>Percorso guidato</h2>
          </div>
          <div className={styles.lessonCards}>
            {sections.map((section, index) => (
              <article key={section.title || index} className={styles.lessonCard}>
                <span className={styles.lessonIndex}>0{index + 1}</span>
                <h3>{section.title}</h3>
                <p>{section.content}</p>
                <ul className={styles.bulletList}>
                  {(section.bullets || []).map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}