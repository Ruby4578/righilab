import styles from "./page.module.css";
import Image from "next/image";
import Button from "@/components/Button";
import { GAME_TYPES } from "@/utils/games";

export default function GiochiPage() {
  return (
    <main className={styles.main}>
      <section className={styles.sectionBlock}>
        <div className={styles.sectionHeader}>
          <h1>IMPARA GIOCANDO!</h1>
          <p className={styles.description}>
            Scegli come vuoi imparare!
          </p>
        </div>

        <div className={styles.cardsGrid}>
          {GAME_TYPES.map((game) => (
            <article key={game.slug} className={styles.card}>
              <Image
                src={game.image}
                alt={game.alt}
                width={170}
                height={170}
                className={styles.cardImage}
              />
              <h2>{game.name}</h2>
              <p>{game.description}</p>
              <Button href={`/giochi/${game.slug}`} variant="solid" className={styles.playButton}>
                Gioca
              </Button>
            </article>
          ))}
        </div>

      </section>
      <div className={styles.backArea}>
        <Button href="/lezione" variant="outline">Torna alla lezione</Button>
      </div>
    </main>
  );
}