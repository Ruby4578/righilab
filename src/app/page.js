"use client";
import styles from "./page.module.css";
import Link from "next/link";
import Image from "next/image";
import { Fragment } from "react";
import { motion } from "motion/react";
import { STUDENTS } from "@/utils/constants";

export default function Home() {
  return (
    <main>
      <section className={styles.hero} aria-label="Hero section">
        <div className={styles.text}>
          <h1>Impara giocando con il <em>tuo</em> robot</h1>
          <p>Carica quello che vuoi studiare e lascia che il robot lo trasformi in sfide interattive.</p>
          <div className={styles.heroCtas}>
            <Link className={styles.fullCta} href="/upload">Inizia ad imparare</Link>
            <Link className={styles.emptyCta} href="/">Scopri come funziona</Link>
          </div>
        </div>
        <Image
          className={styles.robot}
          src="/robot-hi.png"
          alt="Il robot mascote del sito che saluta"
          width={400}
          height={400}
        />
      </section>
      <div className={styles.contentGradient}>
        <section id="come-funziona" className={styles.howItWorks}>
          <h2>Come funziona</h2>
          <p>In pochi passi trasformi quello che vuoi studiare in <em>giochi interattivi</em>.</p>
          <ul className={styles.cardsContainer}>
            {CARDS.map((item, index) => (
              <Fragment key={item.title}>
                <motion.li
                  className={styles.card}
                  initial={{ opacity: 0, y: 28, scale: 0.96 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{ duration: 0.48, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -6, scale: 1.01 }}
                >
                  <Image src={item.img} alt={item.alt} width={100} height={100} />
                  <h3>{item.title}</h3>
                  <p>{item.content}</p>
                </motion.li>
                {index < CARDS.length - 1 && (
                  <motion.li
                    className={styles.cardArrow}
                    aria-hidden="true"
                    initial={{ opacity: 0, scale: 0.7 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.8 }}
                    transition={{ duration: 0.28, delay: 0.2 + (index * 0.12) }}
                  >
                    <span>➜</span>
                  </motion.li>
                )}
              </Fragment>
            ))}
          </ul>
        </section>
        <section id="chi-siamo" className={styles.aboutUs}>
          <h2>Chi siamo</h2>
          <div className={styles.aboutUsSections}>
            <div className={styles.aboutUsContainer}>
              <p>Questo progetto nasce per i <Link href="https://www.campionatidirobotica.it">Campionati Italiani di Robotica 2025-2026</Link>.
                Il tema scelto è “imparare giocando”, e da questa idea è nata RighiLab: una piattaforma che trasforma appunti e video in giochi educativi guidati da un robot.</p>
              <Image src="/chisiamo.png" alt="Un robot che vola felice insieme a mille progetti.." width="350" height="220" />
            </div>
            <div className={styles.aboutUsContainer}>
              <div className={styles.containerText}>
                <p>Il progetto è stato realizzato da un team di 7 studenti dell’Istituto Righi, guidati dai professori Antonio Testa e Gaetano Sito. Gli studenti sono:</p>
                <ul>
                  {STUDENTS.map((student, index) => (
                    <li key={index}>{student.name} ({student.role})</li>
                  ))}
                </ul>
              </div>
              <Image src="/team.png" alt="Un robot che vola felice insieme a mille progetti.." width="350" height="220" />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}


const CARDS = [
  {
    title: "Carica",
    content: "Carica appunti, un video YouTube o scrivi semplicemente l’argomento che vuoi studiare.",
    img: "/card-1.png",
    alt: "Un robot che riceve file.",
  },
  {
    title: "Il robot crea",
    content: "Il robot analizza il contenuto e crea una mini lezione con giochi interattivi.",
    img: "/card-2.png",
    alt: "Un robot che analizza il contenut dei file e crea qualcosa.",
  },
  {
    title: "Gioca e impara",
    content: "Completa le sfide e fai avanzare il robot mentre impari.",
    img: "/card-3.png",
    alt: "Un robot che gioca e si diverte.",
  },
]
