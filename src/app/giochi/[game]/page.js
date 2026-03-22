"use client";

import styles from "./page.module.css";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import Button from "@/components/Button";
import { getGameBySlug } from "@/utils/games";
import BatteryGame from "@/components/games/BatteryGame";

export default function GamePage() {
  const params = useParams();
  const game = getGameBySlug(params?.game);

  if (!game) {
    notFound();
  }

  if (game.providerKey === "battery") {
    return (
      <main className={styles.main}>
        <section className={styles.gameSection}>
          <p className={styles.eyebrow}>Gioco</p>
          <h1>{game.name}</h1>
          <p className={styles.description}>{game.description}</p>
          <BatteryGame />
        </section>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <section className={styles.shell}>
        <p className={styles.eyebrow}>Prossimamente</p>
        <h1>{game.name}</h1>
        <p>Questo gioco sarà disponibile a breve!</p>
        <Button href="/giochi" variant="outline">Torna ai giochi</Button>
      </section>
    </main>
  );
}
