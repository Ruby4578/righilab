import styles from "./page.module.css";
import Image from "next/image";
import Button from "@/components/Button";

export default function GiochiPage() {
  return (
    <main className={styles.main}>
      <section className={styles.shell}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>Pagina finale</p>
          <h1>I videogiochi arriveranno a breve WORK IN PROGRESS!!!</h1>
          <p>
            placeholder. Territorio di racca
          </p>
          <Button href="/lezione" variant="outline">Torna alla lezione</Button>
        </div>
        <div className={styles.visual}>
          <Image
            src="/robot-hi.gif"
            alt="Robot pronto a iniziare i videogiochi"
            width={320}
            height={320}
            unoptimized
          />
        </div>
      </section>
    </main>
  );
}