import styles from "./Footer.module.css";
import Link from "next/link";
import { SITE_TITLE } from "@/utils/constants";

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.brand}>{SITE_TITLE}</p>
        <nav aria-label="Link footer" className={styles.links}>
          <Link href="/">Home</Link>
          <Link href="/upload">Inizia</Link>
          <Link href="/">Come funziona</Link>
        </nav>
        <p className={styles.copy}>© {year} {SITE_TITLE}. Tutti i diritti riservati.</p>
      </div>
    </footer>
  );
}

export default Footer;