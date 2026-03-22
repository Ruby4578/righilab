import { NextResponse } from "next/server";
import { generateGameByKey } from "@/lib/gemini";

/**
 * POST /api/generate-game
 * Body: { gameKey: "assembly"|"battery"|"adventure", lesson: { title, sections } }
 * Chiamare mentre l'utente guarda il tutorial del gioco per ridurre l'attesa.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { gameKey, lesson, difficulty } = body;

    if (!gameKey || !lesson) {
      return NextResponse.json(
        { error: "gameKey e lesson sono obbligatori" },
        { status: 400 }
      );
    }

    const lessonSummary = {
      title: lesson.title,
      sections: lesson.sections || [],
    };

    const gameData = await generateGameByKey(gameKey, lessonSummary, difficulty);
    return NextResponse.json(gameData);
  } catch (err) {
    console.error("[generate-game]", err);
    return NextResponse.json(
      { error: err.message || "Errore generazione gioco" },
      { status: 500 }
    );
  }
}
