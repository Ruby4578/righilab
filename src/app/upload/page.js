"use client";
import styles from "./page.module.css";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";

export default function Upload() {
  // Step corrente mostrato nella timeline (1, 2, 3).
  const [currentStep, setCurrentStep] = useState(1);
  // Fase UI: 1 scelta metodo, 2 caricamento, 3 generazione.
  const [phase, setPhase] = useState(1); // 1: scelta metodo, 2: caricamento, 3: generazione
  // Metodo scelto nella fase 1 (notes, video, topic).
  const [selectedMethod, setSelectedMethod] = useState(null);
  // Valore inserito nell'input della fase 2.
  const [inputValue, setInputValue] = useState('');

  const steps = [
    "Step 1: Scegli metodo",
    "Step 2: Carica",
    "Step 3: Genera"
  ];

  // Posizioni fisse dei 3 step sulla progress bar.
  const stepPercents = [25, 50, 75];

  const handleCardClick = (method) => {
    // Alla selezione del metodo si passa subito alla fase di caricamento.
    setSelectedMethod(method);
    setPhase(2);
    setCurrentStep(2);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulazione temporanea: carica in modo fittizio in attesa della logica lato server.
    alert(`Simulazione: Caricato "${inputValue}" via ${selectedMethod}`);
    setInputValue('');
    setPhase(3);
    setCurrentStep(3);
  };

  const handleBack = () => {
    // Torna alla fase precedente mantenendo sincronizzata la timeline.
    if (phase > 1) {
      setPhase(phase - 1);
      setCurrentStep(currentStep - 1);
      if (phase === 2) {
        // Se torno da fase 2 a fase 1, azzero la scelta metodo.
        setSelectedMethod(null);
      }
    }
  };

  return (
    <main className={styles.main}>
      <section className={styles.uploadSection}>
        <h1>Scegli come partire!</h1>
        
        <div className={styles.timeline}>
          <div className={styles.progressBar}>
            <motion.div
              className={styles.progressFill}
              // Inizialmente lo step 1 è già completato.
              initial={{ width: '25%' }}
              // La barra si riempie fino alla percentuale dello step corrente.
              animate={{ width: `${stepPercents[currentStep - 1]}%` }}
              transition={{ duration: 1, ease: "easeInOut" }}
            />
          </div>
          {steps.map((step, index) => (
            <div
              key={index}
              className={styles.step}
              // Ogni pallino è ancorato in una posizione percentuale fissa.
              style={{ left: `${stepPercents[index]}%` }}
            >
              <div className={`${styles.dot} ${index < currentStep ? styles.active : ''}`}></div>
              <span>{step}</span>
            </div>
          ))}
        </div>
        <div className={styles.phaseViewport}>
        {/* Animazione di entrata/uscita tra le 3 fasi della procedura. */}
        <AnimatePresence mode="wait">
          {phase === 1 && (
            <motion.div
              key="phase1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div className={styles.cardsContainer}>
            <motion.div
              className={styles.card}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -6, scale: 1.01 }}
              transition={{ duration: 0.3 }}
            >
              <Image src="/card-1.png" alt="Un robot che riceve file" width={100} height={100} />
              <h3>Carica i tuoi appunti</h3>
              <p>Carica i tuoi file di appunti per iniziare.</p>
              <button onClick={() => handleCardClick('notes')} className={styles.fullCta}>Seleziona</button>
            </motion.div>
            
            <motion.div
              className={styles.card}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -6, scale: 1.01 }}
              transition={{ duration: 0.3 }}
            >
              <Image src="/card-1.png" alt="Un robot che riceve video" width={100} height={100} />
              <h3>Link di video da YouTube</h3>
              <p>Inserisci link di video YouTube.</p>
              <button onClick={() => handleCardClick('video')} className={styles.fullCta}>Seleziona</button>
            </motion.div>
            
            <motion.div
              className={styles.card}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -6, scale: 1.01 }}
              transition={{ duration: 0.3 }}
            >
              <Image src="/card-1.png" alt="Un robot che riceve argomento" width={100} height={100} />
              <h3>Scegli l&apos;argomento</h3>
              <p>Seleziona un argomento da studiare.</p>
              <button onClick={() => handleCardClick('topic')} className={styles.fullCta}>Seleziona</button>
            </motion.div>
          </div>
        </motion.div>
        )}
        
        {phase === 2 && (
          <motion.div
            key="phase2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className={styles.uploadForm}
          >
            {selectedMethod === 'notes' && (
              <form onSubmit={handleSubmit} className={styles.form}>
                <h3>Carica i tuoi appunti</h3>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={(e) => setInputValue(e.target.files[0]?.name || '')}
                  required
                />
                  <button type="submit" className={styles.fullCta}>Carica</button>
              </form>
            )}
            {selectedMethod === 'video' && (
              <form onSubmit={handleSubmit} className={styles.form}>
                <h3>Inserisci link YouTube</h3>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  required
                />
                  <button type="submit" className={styles.fullCta}>Carica</button>
              </form>
            )}
            {selectedMethod === 'topic' && (
              <form onSubmit={handleSubmit} className={styles.form}>
                <h3>Scegli l&apos;argomento</h3>
                <input
                  type="text"
                  placeholder="Inserisci una parola chiave"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  required
                />
                <button type="submit" className={styles.fullCta}>Carica</button>
              </form>
            )}
            <button onClick={handleBack} className={styles.emptyCta} style={{ marginTop: '2rem' }}>Indietro</button>
          </motion.div>
        )}
        
        {phase === 3 && (
          <motion.div
            key="phase3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className={styles.final}
          >
            <Image
              src="/robot-hi.png"
              alt="Robot mascotte"
              width={200}
              height={200}
            />
            <button className={styles.fullCta} onClick={() => alert('Simulazione: Generazione completata!')}>Genera</button>
            <button onClick={handleBack} className={styles.emptyCta}>Indietro</button>
          </motion.div>
        )}
        </AnimatePresence>
        </div>
      </section>
    </main>
  );
}