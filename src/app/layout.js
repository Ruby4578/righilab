import "./globals.css";
import { SITE_TITLE } from "@/utils/constants";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: SITE_TITLE,
  description: "Impara giocando sfruttando (o magari no) i tuoi appunti accompagnato dalla mascote del righi Genny Robot!",
}

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body className={poppins.className}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
