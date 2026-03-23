import { GoogleGenAI } from "@google/genai";

const MODEL = "gemini-2.5-flash";
const MAX_OUTPUT_TOKENS = 4096;

const SAFETY_SETTINGS = [
  { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
  { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
  { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
  { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
];

const METHOD_LABELS = {
  notes: "Appunti",
  video: "Video YouTube",
  topic: "Argomenti",
};

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY non definita. Aggiungila in .env.local (vedi .env.example)"
    );
  }
  return new GoogleGenAI({ apiKey });
}

// json lezione
const LESSON_JSON_SCHEMA = {
  type: "object",
  properties: {
    id: { type: "string", description: "Identificativo univoco della lezione" },
    title: { type: "string", description: "Titolo della lezione" },
    description: { type: "string", description: "Breve descrizione" },
    source: {
      type: "object",
      properties: {
        method: { type: "string", enum: ["notes", "video", "topic"] },
        label: { type: "string" },
        items: { type: "array", items: { type: "string" } },
      },
      required: ["method", "label", "items"],
    },
    objectives: {
      type: "array",
      items: { type: "string" },
      description: "Obiettivi di apprendimento",
    },
    sections: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          content: { type: "string" },
          bullets: { type: "array", items: { type: "string" } },
          timestamp: { type: "string", description: "Per video: es. '0:00-2:30' o 'Parte 1'" },
        },
        required: ["title", "content", "bullets"],
      },
    },
    miniGames: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          objective: { type: "string" },
        },
        required: ["title", "description", "objective"],
      },
    },
  },
  required: ["id", "title", "description", "source", "objectives", "sections", "miniGames"],
};

// json gioco assemblaggio
const ASSEMBLY_JSON_SCHEMA = {
  type: "object",
  properties: {
    pieces: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string", description: "ID pezzo: testa, braccio-dx, braccio-sx, gamba-dx, gamba-sx, torso, schermo" },
          order: { type: "integer", description: "Ordine di assemblaggio 1-7" },
          question: { type: "string" },
          options: { type: "array", items: { type: "string" } },
          correctIndex: { type: "integer", description: "Indice risposta corretta (0-based)" },
        },
        required: ["id", "order", "question", "options", "correctIndex"],
      },
      minItems: 5,
      maxItems: 7,
    },
  },
  required: ["pieces"],
};

// json gioco batteria
const BATTERY_JSON_SCHEMA = {
  type: "object",
  properties: {
    questions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["true_false", "multiple_choice", "complete_sentence"] },
          question: { type: "string", description: "Per multiple_choice e fallback" },
          statement: { type: "string", description: "Per true_false" },
          sentence: { type: "string", description: "Per complete_sentence (frase con ___ per il blank)" },
          options: { type: "array", items: { type: "string" }, description: "Per multiple_choice e complete_sentence" },
          correctIndex: { type: "integer", description: "Indice risposta corretta (0-based)" },
          correctAnswer: { type: "boolean", description: "Per true_false: true o false" },
        },
        required: ["type"],
      },
      minItems: 5,
      maxItems: 8,
    },
  },
  required: ["questions"],
};

// json gioco avventura
const ADVENTURE_JSON_SCHEMA = {
  type: "object",
  properties: {
    steps: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          label: { type: "string", description: "Label checkpoint sulla mappa" },
          question: { type: "string" },
          options: { type: "array", items: { type: "string" } },
          correctIndex: { type: "integer" },
          itemReward: { type: "string", description: "Oggetto ottenuto (opzionale): chiave, monete, etc." },
        },
        required: ["id", "label", "question", "options", "correctIndex"],
      },
      minItems: 3,
      maxItems: 6,
    },
  },
  required: ["steps"],
};

/**
 * Fatto dall'AI perche non so estrarre i contenuti se trovate errori ditemelo
 * Estrae testo da contenuti raw.
 * Per notes: il chiamante deve passare il testo estratto dai file (PDF/DOC/TXT).
 * Per video: il chiamante deve passare le trascrizioni (o placeholder).
 * Per topic: usa direttamente gli argomenti.
 *
 * @param {{ method: string, items: string[], rawContent?: string }} input
 * @returns {string} Testo da inviare a Gemini
 */
export function buildContentForAI({ method, items, rawContent }) {
  if (rawContent && rawContent.trim()) {
    return rawContent;
  }
  if (method === "topic") {
    return `Argomenti da studiare: ${items.join(", ")}`;
  }
  if (method === "video") {
    return `Video YouTube da analizzare (link forniti, contenuto da trascrizione): ${items.join(", ")}. Genera la lezione basandoti sulla descrizione degli argomenti trattati tipicamente in questi video.`;
  }
  if (method === "notes") {
    return `File caricati: ${items.join(", ")}. Il contenuto dei file verrà fornito separatamente tramite rawContent.`;
  }
  return items.join(", ");
}

const VALIDATION_SCHEMA = {
  type: "object",
  properties: {
    valid: { type: "boolean", description: "true se i contenuti sono coerenti e possono formare una lezione unitaria. Inoltre, i contenuti devono essere chiari, leggibili e di senso compiuti, evitando ammassi di parole senza senso o video non leggibili." },
    errorMessage: { type: "string", description: "Messaggio da mostrare all'utente SOLO se valid è false. Breve, chiaro, in italiano." },
  },
  required: ["valid"],
};

export async function validateContentCoherence(extractedContent, context) {
  const ai = getClient();
  const { method, itemCount } = context;

  if (method === "topic") return { valid: true };
  if ((method === "notes" || method === "video") && itemCount <= 1) return { valid: true };

  const prompt = `Analizza il contenuto sottostante. L'utente ha caricato ${itemCount} ${method === "notes" ? "file" : method === "video" ? "video" : "argomenti"}.

CONTENUTO:
${extractedContent.slice(0, 30000)}

Regole:
- valid: true SOLO se tutti i contenuti trattano lo stesso argomento, argomenti fortemente correlati, o uno è complementare all'altro (es. teoria + esercizi su stesso tema).
- valid: false se i contenuti sono su argomenti completamente diversi e non collegabili (es. "Sistema solare" + "Seconda guerra mondiale").
- valid: false se i contenuti sono non leggibili o su argomenti senza senso (es. eddfgjufbndsjf).
- Se valid: false, errorMessage deve essere un messaggio breve in italiano per l'utente, es: "I file caricati trattano argomenti troppo diversi. Carica materiale sullo stesso tema o argomenti collegati per creare una lezione coerente."

Rispondi SOLO con JSON: { "valid": true } oppure { "valid": false, "errorMessage": "..." }`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: VALIDATION_SCHEMA,
      maxOutputTokens: 256,
      temperature: 0.2,
      safetySettings: SAFETY_SETTINGS,
    },
  });

  checkSafetyBlock(response, "validateContentCoherence");

  const text = response.text?.trim();
  if (!text) throw new Error("Impossibile validare i contenuti. Riprova.");
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Errore nell'analisi dei contenuti. Riprova.");
  }
}

/**
 * Estrae e parsea JSON da risposte che possono contenere markdown o testo extra.
 */
function parseJsonFromResponse(text) {
  const raw = (text || "").trim();
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    /* continua con fallback */
  }

  const codeBlockMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch {
      /* continua */
    }
  }

  const firstBrace = raw.indexOf("{");
  const lastBrace = raw.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    try {
      return JSON.parse(raw.slice(firstBrace, lastBrace + 1));
    } catch {
      /* continua */
    }
  }

  return null;
}

function checkSafetyBlock(response, context) {
  const feedback = response?.promptFeedback;
  if (feedback?.blockReason) {
    throw new Error("Il contenuto caricato non è adatto a un contesto didattico. Verifica che non contenga materiale inappropriato.");
  }
  const candidate = response?.candidates?.[0];
  if (candidate?.finishReason === "SAFETY" || candidate?.finishReason === "RECITATION") {
    throw new Error("Il contenuto è stato bloccato per motivi di sicurezza. Verifica che il materiale sia adatto a un contesto scolastico.");
  }
}

/**
 * @param {string} extractedContent - Testo estratto da file/video o argomenti
 * @param {object} source - { method, items }
 * @param {"youtube"|"appunti"|"argomento"} inputType - Tipo di input: youtube (video), appunti (file), argomento (topic)
 */
export async function generateLesson(extractedContent, source, inputType) {
  const items = Array.isArray(source.items) ? source.items : [source.items];
  const validation = await validateContentCoherence(extractedContent, {
    method: source.method,
    itemCount: items.length,
  });
  if (!validation.valid) {
    throw new Error(validation.errorMessage || "I contenuti non sono coerenti. Carica materiale sullo stesso argomento.");
  }

  const ai = getClient();
  const label = METHOD_LABELS[source.method] || "Contenuto";
  const primaryTopic = items[0] || "contenuto";
  const content = extractedContent.slice(0, 80000);

  const prompts = {
    appunti: `Sei un assistente didattico. L'utente ha caricato APPUNTI e sa già bene o male i contenuti: vuole un ripasso conciso e poi giocare.

CONTENUTO DA ANALIZZARE (appunti dell'utente):
${content}

Requisiti per APPUNTI:
- Mini-lezione snella: titolo chiaro, 3 sezioni con contenuto breve e 2-4 bullet
- Focus su concetti chiave da rafforzare prima dei giochi
- 3 mini-giochi (Vero o falso, Parola chiave mancante, Ordina i passaggi) con titolo, descrizione e obiettivo
- Obiettivi: 3 punti essenziali
- source.method="notes", source.label="${label}", source.items come array dei file
- id: "lesson-notes"
- Stile: sintetico, va dritto al punto`,

    youtube: `Sei un assistente didattico. L'utente ha fornito VIDEO YouTube e vuole sapere di cosa parlano SENZA guardarli tutti: una spiegazione cronologica chiara.

CONTENUTO (trascrizione/analisi del video):
${content}

Requisiti per VIDEO:
- Spiegazione in ORDINE CRONOLOGICO di ciò che il video tratta
- NON una trascrizione: una SPIEGAZIONE chiara e fluida
- NON tralasciare nulla: copri tutto in modo accurato ma espositivo
- NON essere troppo riassuntivo: l'utente deve capire bene i passaggi
- Crea sezioni che corrispondono alle parti del video (aggiungi timestamp se possibile, es. "0:00-3:20")
- Ogni sezione: title (con riferimento temporale), content (spiegazione dettagliata), bullets (punti salienti)
- 3 mini-giochi per verificare la comprensione
- source.method="video", source.label="${label}", source.items = link o titoli video
- id: "lesson-video"
- Stile: narrativo, chiaro, nessun dettaglio perso`,

    argomento: `Sei un assistente didattico. L'utente ha scelto ARGOMENTI senza avere appunti: vuole STUDIARE da zero una lezione completa e dettagliata.

ARGOMENTI DA SPIEGARE:
${content}

Requisiti per ARGOMENTO:
- Lezione COMPLETA e DETTAGLIATA: spiega tutto bene, come se fosse un corso
- Stile giovanile e giocoso ma senza sacrificare chiarezza e completezza
- Più sezioni (4-6) con contenuti ricchi
- Ogni sezione: titolo, contenuto approfondito, bullets per i passaggi chiave
- L'utente non ha materiale: deve poter studiare solo da questa lezione
- 3 mini-giochi per ripassare
- source.method="topic", source.label="${label}", source.items = argomenti
- id: "lesson-topic"
- Stile: coinvolgente, completo, accurato`,
  };

  const prompt = (prompts[inputType] || prompts.appunti) + `

Rispondi SOLO con il JSON richiesto (stesso schema: id, title, description, source, objectives, sections, miniGames). Nessun testo aggiuntivo.`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: LESSON_JSON_SCHEMA,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      temperature: 0.7,
      safetySettings: SAFETY_SETTINGS,
    },
  });

  checkSafetyBlock(response, "generateLesson");

  const text = response.text?.trim();
  if (!text) {
    throw new Error("Errore nel caricamento della lezione. Riprova.");
  }
  const parsed = parseJsonFromResponse(text);
  if (parsed) return parsed;
  console.warn("[generateLesson] Risposta non valida, inizio:", text.slice(0, 200));
  throw new Error("Errore nel formato della lezione generata. Riprova.");
}

/**
 * Seconda chiamata - Gioco Assembly: genera domande per assembrare il robot.
 * Eseguita in parallelo mentre l'utente vede il tutorial del gioco.
 *
 * @param {object} lessonSummary - title, sections (per contesto)
 * @returns {Promise<object>} JSON con pieces (domande per ogni pezzo del robot)
 */
export async function generateGameAssembly(lessonSummary) {
  const ai = getClient();
  const sectionsText = (lessonSummary.sections || [])
    .map((s) => `${s.title}: ${s.content}`)
    .join("\n");

  const prompt = `Genera domande a risposta multipla per il gioco "Assembla il robot".
Per ogni risposta corretta il giocatore ottiene un pezzo del robot (ordine: testa, braccio-dx, braccio-sx, gamba-dx, gamba-sx, torso, schermo).

LEZIONE DI RIFERIMENTO:
Titolo: ${lessonSummary.title || "Lezione"}
${sectionsText}

Requisiti:
- 5-7 pezzi, ognuno con: id (es. testa, braccio-dx), order (1-7), question, options (4 opzioni), correctIndex (0-3)
- Domande basate sulla lezione
- Lingua italiana
- Rispondi SOLO con JSON valido`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: ASSEMBLY_JSON_SCHEMA,
      maxOutputTokens: 2048,
      temperature: 0.6,
      safetySettings: SAFETY_SETTINGS,
    },
  });

  checkSafetyBlock(response, "generateGameAssembly");

  const text = response.text?.trim();
  if (!text) {
    throw new Error("Errore nel caricamento del gioco. Riprova.");
  }
  return JSON.parse(text);
}

// Genera gioco batteria
export async function generateGameBattery(lessonSummary, difficulty = "medio") {
  const ai = getClient();
  const sectionsText = (lessonSummary.sections || [])
    .map((s) => `${s.title}: ${s.content}`)
    .join("\n");

  const countByDiff = { facile: 7, medio: 6, difficile: 5 };
  const count = countByDiff[difficulty] ?? 6;

  const prompt = `Genera ${count} domande per il gioco "Carica il robot".
Ogni risposta corretta carica un livello di batteria (5 livelli).

Usa un MIX di questi tipi (almeno 1 di ogni tipo):
1. type: "true_false" - statement (affermazione), correctAnswer (true/false)
2. type: "multiple_choice" - question, options (4 opzioni), correctIndex (0-3)
3. type: "complete_sentence" - sentence (frase con ___ al posto della parola mancante), options (4), correctIndex

LEZIONE:
Titolo: ${lessonSummary.title || "Lezione"}
${sectionsText}

Requisiti:
- Esattamente ${count} domande
- Variare i tipi (vero/falso, multipla, completa frase)
- Domande basate sulla lezione
- Lingua italiana
- Rispondi SOLO con JSON valido`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: BATTERY_JSON_SCHEMA,
      maxOutputTokens: 2048,
      temperature: 0.6,
      safetySettings: SAFETY_SETTINGS,
    },
  });

  checkSafetyBlock(response, "generateGameBattery");

  const text = response.text?.trim();
  if (!text) {
    throw new Error("Errore nel caricamento del gioco. Riprova.");
  }
  return JSON.parse(text);
}

// Genera gioco avventura
export async function generateGameAdventure(lessonSummary) {
  const ai = getClient();
  const sectionsText = (lessonSummary.sections || [])
    .map((s) => `${s.title}: ${s.content}`)
    .join("\n");

  const prompt = `Genera i passaggi per il gioco "Avventura" (mappa, checkpoint, domande).
Ogni passo ha una domanda; risposta corretta = avanzamento. Alcuni passi possono dare itemReward (chiave, monete).

LEZIONE:
Titolo: ${lessonSummary.title || "Lezione"}
${sectionsText}

Requisiti:
- 3-6 steps, ognuno: id, label (es. "Inizio", "Bivio", "Scrigno"), question, options (4), correctIndex
- itemReward opzionale su alcuni step
- Domande basate sulla lezione
- Lingua italiana
- Rispondi SOLO con JSON valido`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: ADVENTURE_JSON_SCHEMA,
      maxOutputTokens: 2048,
      temperature: 0.6,
      safetySettings: SAFETY_SETTINGS,
    },
  });

  checkSafetyBlock(response, "generateGameAdventure");

  const text = response.text?.trim();
  if (!text) {
    throw new Error("Errore nel caricamento del gioco. Riprova.");
  }
  return JSON.parse(text);
}

//Genera JSON del gioco in base alla chiave ( assembly , battery , adventure )
export async function generateGameByKey(gameKey, lessonSummary, difficulty) {
  switch (gameKey) {
    case "assembly":
      return generateGameAssembly(lessonSummary);
    case "battery":
      return generateGameBattery(lessonSummary, difficulty);
    case "adventure":
      return generateGameAdventure(lessonSummary);
    default:
      throw new Error(`Game key non supportata: ${gameKey}`);
  }
}
