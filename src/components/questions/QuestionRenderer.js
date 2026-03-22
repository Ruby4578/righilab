"use client";

import QuestionTrueFalse from "./QuestionTrueFalse";
import QuestionMultipleChoice from "./QuestionMultipleChoice";
import QuestionCompleteSentence from "./QuestionCompleteSentence";

/**
 * Renderizza la domanda corretta in base al tipo.
 * Per tipi non ancora implementati, fallback su multiple_choice.
 */
export default function QuestionRenderer({ question, onAnswer }) {
  if (!question) return null;
  const type = question.type || "multiple_choice";

  if (type === "true_false") {
    const statement = question.statement || question.question;
    const correctAnswer = typeof question.correctAnswer === "boolean" ? question.correctAnswer : true;
    if (!statement) return <QuestionMultipleChoice question={question.question} options={["Vero", "Falso"]} correctIndex={correctAnswer ? 0 : 1} onAnswer={onAnswer} />;
    return (
      <QuestionTrueFalse
        statement={statement}
        correctAnswer={correctAnswer}
        onAnswer={onAnswer}
      />
    );
  }

  if (type === "complete_sentence") {
    const sentence = question.sentence || question.question;
    const options = Array.isArray(question.options) ? question.options : [];
    const correctIndex = typeof question.correctIndex === "number" ? question.correctIndex : 0;
    if (!sentence || options.length === 0) {
      return <QuestionMultipleChoice question={sentence || question.question} options={options} correctIndex={correctIndex} onAnswer={onAnswer} />;
    }
    return (
      <QuestionCompleteSentence
        sentence={sentence}
        options={options}
        correctIndex={correctIndex}
        onAnswer={onAnswer}
      />
    );
  }

  // multiple_choice, connect, order, e fallback
  const opts = Array.isArray(question.options) ? question.options : [];
  const correctIdx = typeof question.correctIndex === "number" ? question.correctIndex : 0;
  return (
    <QuestionMultipleChoice
      question={question.question || question.statement}
      options={opts}
      correctIndex={correctIdx}
      onAnswer={onAnswer}
    />
  );
}
