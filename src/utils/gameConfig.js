/**
 * Configurazione comune ai giochi: difficoltà e numero di domande.
 * Più difficoltà = meno domande = meno margine di errore.
 */

export const DIFFICULTY_LEVELS = [
  { id: "facile", label: "Facile", questions: 7, requiredCorrect: 5 },
  { id: "medio", label: "Medio", questions: 6, requiredCorrect: 5 },
  { id: "difficile", label: "Difficile", questions: 5, requiredCorrect: 5 },
];

export const QUESTION_TYPES = {
  true_false: "Vero o falso",
  multiple_choice: "Scelta multipla",
  complete_sentence: "Completa la frase",
  connect: "Connetti",
  order: "Ordina",
};

export function getQuestionsForDifficulty(difficultyId, allQuestions) {
  const config = DIFFICULTY_LEVELS.find((d) => d.id === difficultyId) || DIFFICULTY_LEVELS[0];
  const count = Math.min(config.questions, allQuestions?.length || 0);
  const shuffled = [...(allQuestions || [])].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
