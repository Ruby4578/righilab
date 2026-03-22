import { NextResponse } from "next/server";
import {
  generateLesson,
  buildContentForAI,
} from "@/lib/gemini";
import { extractTextFromFiles } from "@/lib/extractContent";

/**
 * POST /api/generate-lesson
 *
 * Opzione A - JSON:
 *   Body: { method: "notes"|"video"|"topic", items: string[], rawContent?: string }
 *   Per notes: rawContent con testo estratto, oppure usa Opzione B.
 *   Per video: rawContent con trascrizioni, oppure lascia vuoto.
 *   Per topic: items = argomenti.
 *
 * Opzione B - FormData (per method=notes con file):
 *   method, items (JSON string), e file[] con i file caricati.
 *   Il server estrae il testo dai file automaticamente.
 */
export async function POST(request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let method;
    let items;
    let rawContent = "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      method = formData.get("method");
      const itemsStr = formData.get("items");
      items = itemsStr ? JSON.parse(itemsStr) : [];

      if (method === "notes" && items.length > 0) {
        const files = [
          ...formData.getAll("files"),
          ...formData.getAll("file"),
        ].filter((f) => f && typeof f.arrayBuffer === "function");
        if (files.length > 0) {
          const fileBuffers = await Promise.all(
            files.map(async (f) => ({
              buffer: Buffer.from(await f.arrayBuffer()),
              name: f.name || "documento",
            }))
          );
          rawContent = await extractTextFromFiles(fileBuffers);
        }
      }
    } else {
      const body = await request.json();
      method = body.method;
      items = body.items;
      rawContent = body.rawContent || "";
    }

    if (!method || !Array.isArray(items)) {
      return NextResponse.json(
        { error: "method e items (array) sono obbligatori" },
        { status: 400 }
      );
    }

    const extractedContent = buildContentForAI({
      method,
      items,
      rawContent: rawContent || "",
    });

    const lesson = await generateLesson(extractedContent, { method, items });
    if (!lesson.id) {
      lesson.id = `lesson-${method}-${Date.now()}`;
    }
    return NextResponse.json(lesson);
  } catch (err) {
    console.error("[generate-lesson]", err);
    let message = err?.message || "Errore nella generazione della lezione. Riprova.";
    if (err?.cause?.message) message = err.cause.message;
    if (message.includes("404") || message.includes("NOT_FOUND")) {
      message = "Modello AI non disponibile. Controlla la configurazione.";
    }
    if (message.includes("401") || message.includes("API key") || message.includes("invalid")) {
      message = "Chiave API non valida. Verifica GEMINI_API_KEY in .env.local";
    }
    const status = message.includes("coerenti") || message.includes("adatto") || message.includes("bloccato")
      ? 400
      : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
