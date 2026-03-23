"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import Button from "@/components/Button";
import { QuestionRenderer } from "@/components/questions";
import { DIFFICULTY_LEVELS, getQuestionsForDifficulty } from "@/utils/gameConfig";
import { useLesson } from "@/components/LessonProvider";
import styles from "./BatteryGame.module.css";

const BATTERY_IMAGES = [
  "/Robot%20Mascotte%20Game%20Assets/GIOCO_BATTERIA_Robot_NoBatteria.png",
  "/Robot%20Mascotte%20Game%20Assets/GIOCO_BATTERIA_Robot_Batteria1su5.png",
  "/Robot%20Mascotte%20Game%20Assets/GIOCO_BATTERIA_Robot_Batteria2su5.png",
  "/Robot%20Mascotte%20Game%20Assets/GIOCO_BATTERIA_Robot_Batteria3su5.png",
  "/Robot%20Mascotte%20Game%20Assets/GIOCO_BATTERIA_Robot_Batteria4su5.png",
  "/Robot%20Mascotte%20Game%20Assets/GIOCO_BATTERIA_Robot_Batteria5su5.png",
];

const REQUIRED_LEVEL = 5;

export default function BatteryGame() {
  const { lesson } = useLesson();
  const [phase, setPhase] = useState("difficulty"); // difficulty | loading | playing | win | lose
  const [difficulty, setDifficulty] = useState(null);
  const [gameData, setGameData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [batteryLevel, setBatteryLevel] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);

  const loadGame = useCallback(async (diffId) => {
    setPhase("loading");
    setError(null);
    try {
      const res = await fetch("/api/generate-game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameKey: "battery",
          difficulty: diffId,
          lesson: lesson
            ? { title: lesson.title, sections: lesson.sections }
            : { title: "Lezione", sections: [] },
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Errore nel caricamento del gioco");
      }
      const data = await res.json();
      setGameData(data);
      const q = getQuestionsForDifficulty(diffId, data.questions || []);
      setQuestions(q);
      setPhase("playing");
      setCurrentIndex(0);
      setBatteryLevel(0);
      setShowModal(true);
    } catch (err) {
      setError(err.message);
      setPhase("difficulty");
    }
  }, [lesson]);

  const handleSelectDifficulty = (diff) => {
    setDifficulty(diff);
    loadGame(diff.id);
  };

  const handleAnswer = (correct) => {
    const newBattery = correct ? Math.min(batteryLevel + 1, REQUIRED_LEVEL) : batteryLevel;
    setBatteryLevel(newBattery);

    const isLastQuestion = currentIndex >= questions.length - 1;

    if (newBattery >= REQUIRED_LEVEL) {
      setShowModal(false);
      setPhase("win");
      return;
    }
    if (isLastQuestion) {
      setShowModal(false);
      setPhase("lose");
      return;
    }
    setCurrentIndex((prev) => prev + 1);
  };

  const currentQuestion = questions[currentIndex];

  return (
    <div className={styles.game}>
      {phase === "difficulty" && (
        <section className={styles.section}>
          <p className={styles.eyebrow}>Scegli difficoltà</p>
          <h2>Quante domande vuoi affrontare?</h2>
          <p className={styles.hint}>
            Più difficile = meno domande = meno margine di errore. Devi caricare 5 livelli di batteria per vincere!
          </p>
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.difficultyGrid}>
            {DIFFICULTY_LEVELS.map((diff) => (
              <button
                key={diff.id}
                type="button"
                className={styles.diffCard}
                onClick={() => handleSelectDifficulty(diff)}
              >
                <span className={styles.diffLabel}>{diff.label}</span>
                <span className={styles.diffDetail}>
                  {diff.questions} domande
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {phase === "loading" && (
        <section className={styles.loadingSection}>
          <Image
            src="/Robot%20Mascotte%20Assets/4_VID_Caricamento_final.gif"
            alt="Robot che carica"
            width={280}
            height={280}
            unoptimized
            className={styles.loadingRobot}
          />
          <p>Preparo le domande...</p>
        </section>
      )}

      {phase === "playing" && (
        <section className={styles.playSection}>
          <div className={styles.playLayout}>
            <div className={styles.robotArea}>
              <Image
                src={BATTERY_IMAGES[Math.min(batteryLevel, 5)]}
                alt={`Batteria ${batteryLevel}/5`}
                width={200}
                height={200}
                className={styles.robotImage}
              />
              <p className={styles.batteryLabel}>{batteryLevel} / 5</p>
            </div>
            <div className={styles.questionsArea}>
              {showModal && currentQuestion && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndex}
                    className={styles.questionCard}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className={styles.progress}>
                      Domanda {currentIndex + 1} di {questions.length}
                    </p>
                    <QuestionRenderer key={currentIndex} question={currentQuestion} onAnswer={handleAnswer} />
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </div>
        </section>
      )}

      {phase === "win" && (
        <section className={styles.resultSection}>
          <Image
            src="/Robot%20Mascotte%20Assets/5_VID_Felice_final.gif"
            alt="Hai vinto!"
            width={200}
            height={200}
            unoptimized
          />
          <h2>Complimenti! Robot carico!</h2>
          <p>Hai risposto correttamente a tutte le domande necessarie.</p>
          <div className={styles.resultActions}>
            <Button href="/giochi/carica-il-robot" variant="solid">Riprova</Button>
            <Button href="/giochi" variant="outline">Torna ai giochi</Button>
          </div>
        </section>
      )}

      {phase === "lose" && (
        <section className={styles.resultSection}>
          <Image
            src="/Robot%20Mascotte%20Assets/3_VID_Triste_final.gif"
            alt="Game over"
            width={200}
            height={200}
            unoptimized
          />
          <h2>Batteria scarica!</h2>
          <p>Le domande sono finite prima di caricare completamente il robot. Riprova!</p>
          <div className={styles.resultActions}>
            <Button href="/giochi/carica-il-robot" variant="solid">Riprova</Button>
            <Button href="/giochi" variant="outline">Torna ai giochi</Button>
          </div>
        </section>
      )}
    </div>
  );
}
