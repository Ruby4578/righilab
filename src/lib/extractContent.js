/**
 * Estrae testo da file e video per inviarlo a Gemini.
 * Usato dall'API generate-lesson per notes (file) e video (YouTube).
 * Import dinamici per evitare errori con pdf-parse/mammoth in Next.js.
 */

const MAX_CHARS_PER_FILE = 50000;
const SUPPORTED_EXTENSIONS = [".txt", ".pdf", ".doc", ".docx"];

/**
 * Estrae il testo da un singolo file (Buffer).
 * @param {Buffer} buffer - Contenuto del file
 * @param {string} filename - Nome file per determinare il tipo
 * @returns {Promise<string>} Testo estratto
 */
export async function extractTextFromFile(buffer, filename) {
  const ext = filename.toLowerCase().slice(filename.lastIndexOf("."));

  if (!SUPPORTED_EXTENSIONS.includes(ext)) {
    throw new Error(`Formato non supportato: ${ext}. Supportati: ${SUPPORTED_EXTENSIONS.join(", ")}`);
  }

  if (ext === ".txt") {
    const text = buffer.toString("utf-8");
    return text.slice(0, MAX_CHARS_PER_FILE);
  }

  if (ext === ".pdf") {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      await parser.destroy();
      return (result.text || "").slice(0, MAX_CHARS_PER_FILE);
    } finally {
      try {
        await parser.destroy();
      } catch (_) {}
    }
  }

  if (ext === ".doc" || ext === ".docx") {
    const mammoth = (await import("mammoth")).default;
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value || "";
    return text.slice(0, MAX_CHARS_PER_FILE);
  }

  return "";
}

/**
 * Estrae testo da più file e lo concatena.
 * @param {{ buffer: Buffer, name: string }[]} files - Array di { buffer, name }
 * @returns {Promise<string>}
 */
export async function extractTextFromFiles(files) {
  const parts = [];
  for (const file of files) {
    try {
      const text = await extractTextFromFile(file.buffer, file.name);
      if (text.trim()) {
        parts.push(`--- ${file.name} ---\n${text}`);
      }
    } catch (err) {
      console.warn(`[extractContent] Errore su ${file.name}:`, err.message);
      parts.push(`--- ${file.name} ---\n[Impossibile estrarre il testo da questo file]`);
    }
  }
  return parts.join("\n\n");
}

const MAX_CHARS_PER_VIDEO = 80000;

/**
 * Estrae la trascrizione da uno o più video YouTube.
 * @param {string[]} urls - URL o ID dei video (es. https://youtube.com/watch?v=xxx)
 * @returns {Promise<string>} Trascrizioni concatenate con timestamp
 */
export async function extractTranscriptFromVideos(urls) {
  const { fetchTranscript } = await import("youtube-transcript");
  const parts = [];

  for (const url of urls) {
    const trimmed = (url || "").trim();
    if (!trimmed) continue;

    try {
      const segments = await fetchTranscript(trimmed);
      if (!segments?.length) {
        parts.push(`--- ${trimmed} ---\n[Trascrizioni non disponibili per questo video]`);
        continue;
      }

      const lines = segments.map((s) => {
        const ms = s.offset ?? 0;
        const m = Math.floor(ms / 60000);
        const sec = Math.floor((ms % 60000) / 1000);
        const ts = `[${m}:${String(sec).padStart(2, "0")}]`;
        return `${ts} ${(s.text || "").trim()}`;
      });

      let text = lines.join("\n").slice(0, MAX_CHARS_PER_VIDEO);
      if (lines.join("\n").length > MAX_CHARS_PER_VIDEO) {
        text += "\n[... trascrizione troncata]";
      }
      parts.push(`--- Video: ${trimmed} ---\n${text}`);
    } catch (err) {
      console.warn(`[extractContent] Errore trascrizione ${trimmed}:`, err.message);
      const msg = err?.message?.includes("disabled") || err?.message?.includes("unavailable")
        ? "Trascrizioni disabilitate o video non disponibile"
        : "Impossibile recuperare la trascrizione";
      parts.push(`--- ${trimmed} ---\n[${msg}]`);
    }
  }

  return parts.join("\n\n");
}
