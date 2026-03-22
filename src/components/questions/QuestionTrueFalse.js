"use client";

import { useState } from "react";
import styles from "./QuestionShared.module.css";

export default function QuestionTrueFalse({ statement, correctAnswer, onAnswer }) {
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const isCorrect = selected !== null && selected === correctAnswer;

  const handleChoose = (value) => {
    if (answered) return;
    setSelected(value);
    setAnswered(true);
  };

  const handleContinue = () => {
    onAnswer(isCorrect);
  };

  const getBtnClass = (value) => {
    if (!answered) return "";
    if (value === correctAnswer) return styles.correct;
    if (selected === value) return styles.wrong;
    return "";
  };

  return (
    <div className={styles.question}>
      <p className={styles.statement}>{statement}</p>
      <div className={styles.optionsRow}>
        <button
          type="button"
          className={`${styles.option} ${styles.trueFalse} ${selected === true ? styles.selected : ""} ${getBtnClass(true)}`}
          onClick={() => handleChoose(true)}
          disabled={answered}
        >
          Vero
        </button>
        <button
          type="button"
          className={`${styles.option} ${styles.trueFalse} ${selected === false ? styles.selected : ""} ${getBtnClass(false)}`}
          onClick={() => handleChoose(false)}
          disabled={answered}
        >
          Falso
        </button>
      </div>
      {answered && (
        <button type="button" className={styles.continueBtn} onClick={handleContinue}>
          Continua
        </button>
      )}
    </div>
  );
}
