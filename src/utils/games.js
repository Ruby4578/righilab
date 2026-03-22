export const GAME_TYPES = [
  {
    slug: "assembla-il-robot",
    name: "ASSEMBLA IL ROBOT",
    description: "Ricostruisci il robot pezzo dopo pezzo rispondendo correttamente alle domande!",
    image: "/Robot%20Mascotte%20Game%20Assets/GIOCO_ASSEMBLAGGIO_Robot_Testa.png",
    alt: "Testa del robot per il gioco di assemblaggio",
    providerKey: "assembly",
  },
  {
    slug: "carica-il-robot",
    name: "CARICA IL ROBOT",
    description: "Ricarica la batteria del robot con le risposte giuste!",
    image: "/Robot%20Mascotte%20Game%20Assets/GIOCO_BATTERIA_Robot_Batteria5su5.png",
    alt: "Indicatore batteria del robot in ricarica",
    providerKey: "battery",
  },
  {
    slug: "avventura",
    name: "AVVENTURA",
    description: "Segui la mappa, raccogli oggetti e raggiungi il traguardo finale rispondendo correttamente alle domande!",
    image: "/Robot%20Mascotte%20Game%20Assets/GIOCO_AVVENTURA_Mappa.png",
    alt: "Mappa per il gioco di avventura",
    providerKey: "adventure",
  },
];

export function getGameBySlug(slug) {
  return GAME_TYPES.find((game) => game.slug === slug);
}
