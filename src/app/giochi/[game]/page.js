import styles from "./page.module.css";
import Button from "@/components/Button";
import { notFound } from "next/navigation";
import { GAME_TYPES, getGameBySlug } from "@/utils/games";

export function generateStaticParams() {
  return GAME_TYPES.map((game) => ({ game: game.slug }));
}

export default function GamePlaceholderPage({ params }) {
  const game = getGameBySlug(params.game);

  if (!game) {
    notFound();
  }

  return (
    <main className={styles.main}>
      <section className={styles.shell}>
        <p className={styles.eyebrow}>WORK IN PROGRESS</p>
        <h1>{game.name}</h1>
        <p>
          PLACEHOLDER.
        </p>
        <Button href="/giochi" variant="outline">Torna ai giochi</Button>
      </section>
    </main>
  );
}
