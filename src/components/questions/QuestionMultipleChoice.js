"use client";

import { useState } from "react";
import styles from "./QuestionShared.module.css";

export default function QuestionMultipleChoice({ question, options, correctIndex, onAnswer }) {
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const isCorrect = selected !== null && selected === correctIndex;

  const handleChoose = (index) => {
    if (answered) return;
    setSelected(index);
    setAnswered(true);
  };

  const handleContinue = () => {
    onAnswer(isCorrect);
  };

  const getOptionClass = (i) => {
    if (!answered) return "";
    if (i === correctIndex) return styles.correct;
    if (selected === i && i !== correctIndex) return styles.wrong;
    return "";
  };

  return (
    <div className={styles.question}>
      <p className={styles.statement}>{question}</p>
      <ul className={styles.optionsList}>
        {options?.map((opt, i) => (
          <li key={i}>
            <button
              type="button"
              className={`${styles.option} ${selected === i ? styles.selected : ""} ${getOptionClass(i)}`}
              onClick={() => handleChoose(i)}
              disabled={answered}
            >
              {opt}
            </button>
          </li>
        ))}
      </ul>
      {answered && (
        <button type="button" className={styles.continueBtn} onClick={handleContinue}>
          Continua
        </button>
      )}
    </div>
  );
}
