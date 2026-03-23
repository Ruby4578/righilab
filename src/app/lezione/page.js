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

  const method = lesson.source?.method || "notes";
  const sections = lesson.sections || [];

  const ctaSection = (
    <section className={`${styles.sectionBlock} ${styles.ctaSection}`}>
      <div className={styles.ctaCopy}>
        <h2>Sei pronto a imparare giocando?</h2>
        <p>
          {method === "notes" && "Leggi il ripasso e poi vai ai giochi!"}
          {method === "video" && "Scopri di cosa parlava il video e poi mettiti alla prova!"}
          {method === "topic" && "Studia la lezione completa e poi testa quanto hai imparato!"}
        </p>
      </div>
      <div className={styles.ctaActions}>
        <Button href="/giochi" variant="solid">Vai ai giochi</Button>
      </div>
    </section>
  );

  const heroSection = (
    <section className={styles.hero}>
      <div className={styles.heroContent}>
        <div className={styles.heroText}>
          <p className={styles.eyebrow}>
            {method === "notes" && "Ripasso dagli appunti"}
            {method === "video" && "Guida al video"}
            {method === "topic" && "Lezione completa"}
          </p>
          <h1>{lesson.title}</h1>
          <p className={styles.description}>{lesson.description}</p>
          <p className={styles.heroHighlight}>
            {method === "notes" && "Il robot riassume i concetti chiave dei tuoi appunti e ti prepara per i giochi."}
            {method === "video" && "Il robot ti spiega in ordine tutto ciò di cui parla il video, così puoi capire senza guardarlo tutto."}
            {method === "topic" && "Il robot ti guida in una lezione completa e dettagliata per studiare da zero."}
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
  );

  // 1. APPUNTI: layout attuale, card compatte
  if (method === "notes") {
    return (
      <main className={styles.main}>
        {ctaSection}
        {heroSection}
        {sections.length > 0 && (
          <section className={styles.sectionBlock}>
            <div className={styles.sectionHeader}>
              <p className={styles.eyebrow}>Ripasso</p>
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

  // 2. VIDEO: ordine cronologico, timeline con timestamp
  if (method === "video") {
    return (
      <main className={styles.main}>
        {ctaSection}
        {heroSection}
        {sections.length > 0 && (
          <section className={styles.sectionBlock}>
            <div className={styles.sectionHeader}>
              <p className={styles.eyebrow}>Cosa tratta il video</p>
              <h2>In ordine cronologico</h2>
            </div>
            <div className={styles.videoTimeline}>
              {sections.map((section, index) => (
                <article key={section.title || index} className={styles.videoSegment}>
                  <div className={styles.videoSegmentHeader}>
                    {section.timestamp && (
                      <span className={styles.timestamp}>{section.timestamp}</span>
                    )}
                    <h3>{section.title}</h3>
                  </div>
                  <p className={styles.videoContent}>{section.content}</p>
                  {(section.bullets || []).length > 0 && (
                    <ul className={styles.bulletList}>
                      {section.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
    );
  }

  // 3. ARGOMENTO: lezione completa e dettagliata
  if (method === "topic") {
    return (
      <main className={styles.main}>
        {ctaSection}
        {heroSection}
        {sections.length > 0 && (
          <section className={styles.sectionBlock}>
            <div className={styles.sectionHeader}>
              <p className={styles.eyebrow}>Lezione</p>
              <h2>Spiegazione completa</h2>
            </div>
            <div className={styles.topicSections}>
              {sections.map((section, index) => (
                <article key={section.title || index} className={styles.topicCard}>
                  <span className={styles.lessonIndex}>0{index + 1}</span>
                  <h3>{section.title}</h3>
                  <div className={styles.topicContent}>
                    <p>{section.content}</p>
                  </div>
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

  // Fallback per method sconosciuto
  return (
    <main className={styles.main}>
      {ctaSection}
      {heroSection}
      {sections.length > 0 && (
        <section className={styles.sectionBlock}>
          <div className={styles.lessonCards}>
            {sections.map((section, index) => (
              <article key={section.title || index} className={styles.lessonCard}>
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
