const METHOD_LABELS = {
  notes: "Appunti",
  video: "Video YouTube",
  topic: "Argomenti",
};

const METHOD_DESCRIPTIONS = {
  notes: "Hai caricato materiale scritto: la lezione parte dai concetti chiave estratti dai tuoi file.",
  video: "Hai fornito uno o più video: la lezione sintetizza i passaggi principali in un percorso guidato.",
  topic: "Hai indicato uno o più argomenti: la lezione costruisce una base chiara e progressiva per iniziare a studiarli.",
};

function normalizeItems(items) {
  if (Array.isArray(items)) {
    return items.filter(Boolean);
  }

  return items ? [items] : [];
}

export function buildStaticLesson({ method, items }) {
  const normalizedItems = normalizeItems(items);
  const sourceLabel = METHOD_LABELS[method] || "Contenuto";
  const primaryTopic = normalizedItems[0] || "il contenuto caricato";

  return {
    id: `lesson-${method || "default"}`,
    title: `Lezione su ${primaryTopic}`,
    description: METHOD_DESCRIPTIONS[method] || "La lezione è stata preparata a partire dal materiale selezionato.",
    source: {
      method,
      label: sourceLabel,
      items: normalizedItems,
    },
    objectives: [
      "Capire i concetti fondamentali senza partire da zero.",
      "Riconoscere parole chiave, definizioni e collegamenti utili.",
      "Passare subito dal ripasso ai mini-giochi interattivi.",
    ],
    sections: [
      {
        title: "Panoramica iniziale",
        content: `Partiamo da ${primaryTopic} e costruiamo una spiegazione breve, chiara e progressiva.`,
        bullets: [
          "Individua i concetti principali del materiale.",
          "Ordina gli argomenti dal più semplice al più importante.",
          "Prepara il terreno per gli esercizi successivi.",
        ],
      },
      {
        title: "Concetti chiave",
        content: "Questa sezione evidenzia definizioni, relazioni e passaggi che vale la pena ricordare.",
        bullets: [
          `Punto di partenza: ${primaryTopic}.`,
          "Parole chiave da riconoscere durante lo studio.",
          "Connessioni da usare per ripassare più velocemente.",
        ],
      },
      {
        title: "Riepilogo operativo",
        content: "Prima dei giochi, la lezione ti restituisce una sintesi da usare come mappa mentale.",
        bullets: [
          "Che cosa sapere.",
          "Che cosa ricordare.",
          "Su cosa allenarsi nei mini-giochi.",
        ],
      },
    ],
    miniGames: [
      {
        title: "Vero o falso",
        description: "Leggi un'affermazione e decidi in pochi secondi se è corretta.",
        objective: "Verificare se hai colto i concetti base.",
      },
      {
        title: "Parola chiave mancante",
        description: "Completa una frase con il termine corretto tra quelli appena studiati.",
        objective: "Allenare memoria e lessico disciplinare.",
      },
      {
        title: "Ordina i passaggi",
        description: "Rimetti in ordine i passaggi logici o cronologici della spiegazione.",
        objective: "Capire la sequenza corretta del ragionamento.",
      },
    ],
  };
}

export const FALLBACK_LESSON = buildStaticLesson({
  method: "topic",
  items: ["Sistema solare"],
});