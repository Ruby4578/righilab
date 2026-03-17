"use client";
import styles from "./page.module.css";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import Button from "@/components/Button";
import { useLesson } from "@/components/LessonProvider";
import { GENERATION_TOOLTIPS } from "@/utils/constants";
import { buildStaticLesson } from "@/utils/lesson";

export default function Upload() {
  const router = useRouter();
  const { setLesson } = useLesson();
  const [currentStep, setCurrentStep] = useState(1);
  const [phase, setPhase] = useState(1);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadedVideos, setUploadedVideos] = useState([]);
  const [uploadedTopics, setUploadedTopics] = useState([]);
  const [submittedValue, setSubmittedValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [tooltipIndex, setTooltipIndex] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const steps = [
    "Step 1: Scegli metodo",
    "Step 2: Carica",
    "Step 3: Genera",
  ];
  const stepGap = 100 / (steps.length + 1);
  const stepPercents = steps.map((_, index) => stepGap * (index + 1));

  useEffect(() => {
    if (!isGenerating) {
      return undefined;
    }

    let timeoutId;
    const cycleTooltip = () => {
      setTooltipIndex((previousIndex) => {
        const randomOffset = Math.floor(Math.random() * (GENERATION_TOOLTIPS.length - 1)) + 1;
        return (previousIndex + randomOffset) % GENERATION_TOOLTIPS.length;
      });
      const nextDelay = 3000 + Math.floor(Math.random() * 2001);
      timeoutId = window.setTimeout(cycleTooltip, nextDelay);
    };

    const initialDelay = 3000 + Math.floor(Math.random() * 2001);
    timeoutId = window.setTimeout(cycleTooltip, initialDelay);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isGenerating]);

  useEffect(() => {
    if (!isGenerating) {
      return undefined;
    }

    const redirectTimeoutId = window.setTimeout(() => {
      router.push("/lezione");
    }, 3200);

    return () => {
      window.clearTimeout(redirectTimeoutId);
    };
  }, [isGenerating, router]);

  const handleCardClick = (method) => {
    setSelectedMethod(method);
    setPhase(2);
    setCurrentStep(2);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedMethod === "notes" && uploadedFiles.length === 0) {
      setUploadError("Carica o trascina un file prima di continuare.");
      return;
    }
    if (selectedMethod === "video" && uploadedVideos.length === 0) {
      setUploadError("Aggiungi almeno un link YouTube prima di continuare.");
      return;
    }
    if (selectedMethod === "topic" && uploadedTopics.length === 0) {
      setUploadError("Aggiungi almeno un argomento prima di continuare.");
      return;
    }
    setUploadError("");
    setSubmittedValue(
      selectedMethod === "notes"
        ? uploadedFiles.map((file) => file.name)
        : selectedMethod === "video"
          ? uploadedVideos
          : selectedMethod === "topic"
            ? uploadedTopics
            : inputValue,
    );
    setPhase(3);
    setCurrentStep(3);
  };

  const handleBack = () => {
    if (phase > 1) {
      setPhase((previousPhase) => previousPhase - 1);
      setCurrentStep((previousStep) => previousStep - 1);
      if (phase === 2) {
        setSelectedMethod(null);
        setInputValue("");
        setUploadedFiles([]);
        setUploadedVideos([]);
        setUploadedTopics([]);
        setSubmittedValue("");
      }
    }
  };

  const addFiles = (files) => {
    if (!files.length) {
      return;
    }

    setUploadedFiles((previousFiles) => {
      const nextFiles = [...previousFiles];

      files.forEach((file) => {
        const alreadyAdded = nextFiles.some(
          (existingFile) => existingFile.name === file.name && existingFile.size === file.size && existingFile.lastModified === file.lastModified,
        );

        if (!alreadyAdded) {
          nextFiles.push(file);
        }
      });

      return nextFiles;
    });
    setUploadError("");
  };

  const handleRemoveFile = (fileToRemove) => {
    setUploadedFiles((previousFiles) => previousFiles.filter(
      (file) => !(file.name === fileToRemove.name && file.size === fileToRemove.size && file.lastModified === fileToRemove.lastModified),
    ));
  };

  const handleAddVideo = () => {
    const normalizedValue = inputValue.trim();

    if (!normalizedValue) {
      setUploadError("Inserisci un link YouTube valido prima di aggiungerlo.");
      return;
    }

    const isValidUrl = /^https?:\/\//i.test(normalizedValue);
    const isYoutubeUrl = /(?:youtube\.com|youtu\.be)/i.test(normalizedValue);

    if (!isValidUrl || !isYoutubeUrl) {
      setUploadError("Inserisci un link YouTube valido prima di aggiungerlo.");
      return;
    }

    setUploadedVideos((previousVideos) => (
      previousVideos.includes(normalizedValue)
        ? previousVideos
        : [...previousVideos, normalizedValue]
    ));
    setUploadError("");
    setInputValue("");
  };

  const handleRemoveVideo = (videoToRemove) => {
    setUploadedVideos((previousVideos) => previousVideos.filter((video) => video !== videoToRemove));
  };

  const handleAddTopic = () => {
    const normalizedValue = inputValue.trim();

    if (!normalizedValue) {
      setUploadError("Inserisci un argomento prima di aggiungerlo.");
      return;
    }

    setUploadedTopics((previousTopics) => (
      previousTopics.includes(normalizedValue)
        ? previousTopics
        : [...previousTopics, normalizedValue]
    ));
    setUploadError("");
    setInputValue("");
  };

  const handleRemoveTopic = (topicToRemove) => {
    setUploadedTopics((previousTopics) => previousTopics.filter((topic) => topic !== topicToRemove));
  };

  const handleStartGeneration = () => {
    const confirmed = window.confirm("Confermi la generazione della lezione interattiva?");
    if (!confirmed) {
      return;
    }

    const lessonItems =
      selectedMethod === "notes"
        ? uploadedFiles.map((file) => file.name)
        : selectedMethod === "video"
          ? uploadedVideos
          : selectedMethod === "topic"
            ? uploadedTopics
            : [];

    setLesson(buildStaticLesson({
      method: selectedMethod,
      items: lessonItems,
    }));

    setTooltipIndex(Math.floor(Math.random() * GENERATION_TOOLTIPS.length));
    setIsGenerating(true);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files || []);
    if (!droppedFiles.length) {
      return;
    }
    addFiles(droppedFiles);
  };

  if (isGenerating) {
    return (
      <main className={styles.main}>
        <section className={styles.generatingOnly}>
          <Image
            src="/robot-hi.gif"
            alt="Robot che sta generando la lezione"
            width={280}
            height={280}
            priority
          />
          <p className={styles.generatingTooltip}>{GENERATION_TOOLTIPS[tooltipIndex]}</p>
        </section>
      </main>
    );
  }

  const selectedMethodTitle = METHODS.find((method) => method.id === selectedMethod)?.title;

  return (
    <main className={styles.main}>
      <section className={styles.uploadSection}>
        <h2 className={styles.pageTitle}>Scegli come partire!</h2>

        <div className={styles.timeline}>
          <div className={styles.progressBar}>
            <motion.div
              className={styles.progressFill}
              initial={{ width: `${stepPercents[0]}%` }}
              animate={{ width: `${stepPercents[currentStep - 1]}%` }}
              transition={{ duration: 1, ease: "easeInOut" }}
            />
          </div>
          {steps.map((step, index) => (
            <div
              key={index}
              className={`${styles.step} ${index + 1 === currentStep ? styles.currentStep : ""}`}
              style={{ left: `${stepPercents[index]}%` }}
            >
              <div className={`${styles.dot} ${index < currentStep ? styles.active : ''}`}></div>
              <span>{step}</span>
            </div>
          ))}
        </div>
        <div className={styles.phaseViewport}>
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
                  {METHODS.map((method, index) => (
                    <motion.button
                      key={method.id}
                      type="button"
                      className={styles.card}
                      onClick={() => handleCardClick(method.id)}
                      initial={{ opacity: 0, y: 28 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      whileHover={{ y: -6, scale: 1.01 }}
                      transition={{ duration: 0.3, delay: index * 0.07 }}
                    >
                      <Image
                        src={method.img}
                        alt={method.alt}
                        width={180}
                        height={140}
                        className={styles.cardImage}
                      />
                      <h3>{method.title}</h3>
                      <p>{method.description}</p>
                    </motion.button>
                  ))}
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
                    <p className={styles.formSubtitle}>Carica uno o più file (DOC, PDF, TXT) e poi conferma per passare alla generazione.</p>
                    <label
                      className={`${styles.uploadDropzone} ${isDragOver ? styles.dropzoneActive : ""}`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragOver(true);
                      }}
                      onDragLeave={() => setIsDragOver(false)}
                      onDrop={handleDrop}
                    >
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        multiple
                        className={styles.dropzoneInput}
                        onChange={(e) => {
                          addFiles(Array.from(e.target.files || []));
                          e.target.value = "";
                        }}
                      />
                      <span className={styles.dropzoneTitle}>Trascina qui i file</span>
                      <span className={styles.dropzoneHint}>oppure clicca per selezionarli dal dispositivo</span>
                    </label>
                    {uploadError ? <p className={styles.uploadError}>{uploadError}</p> : null}
                    {uploadedFiles.length > 0 ? (
                      <div className={styles.uploadedFiles}>
                        {uploadedFiles.map((file) => (
                          <div
                            key={`${file.name}-${file.size}-${file.lastModified}`}
                            className={styles.fileCard}
                          >
                            <span className={styles.fileName}>{file.name}</span>
                            <button
                              type="button"
                              className={styles.removeFileButton}
                              onClick={() => handleRemoveFile(file)}
                              aria-label={`Rimuovi ${file.name}`}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : null}
                    {uploadedFiles.length > 0 ? (
                      <Button type="submit" variant="solid">Conferma caricamento</Button>
                    ) : null}
                  </form>
                )}
                {selectedMethod === 'video' && (
                  <form onSubmit={handleSubmit} className={styles.form}>
                    <h3>Inserisci link YouTube</h3>
                    <p className={styles.formSubtitle}>Incolla uno o più link YouTube, aggiungili alla lista e poi conferma.</p>
                    <div className={styles.videoInputGroup}>
                      <input
                        type="url"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className={styles.themedInput}
                      />
                      <Button type="button" variant="outline" onClick={handleAddVideo}>
                        Aggiungi video
                      </Button>
                    </div>
                    {uploadError ? <p className={styles.uploadError}>{uploadError}</p> : null}
                    {uploadedVideos.length > 0 ? (
                      <div className={styles.uploadedFiles}>
                        {uploadedVideos.map((video) => (
                          <div key={video} className={styles.fileCard}>
                            <span className={styles.fileName}>{video}</span>
                            <button
                              type="button"
                              className={styles.removeFileButton}
                              onClick={() => handleRemoveVideo(video)}
                              aria-label={`Rimuovi ${video}`}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : null}
                    {uploadedVideos.length > 0 ? (
                      <Button type="submit" variant="solid">Conferma caricamento</Button>
                    ) : null}
                  </form>
                )}
                {selectedMethod === 'topic' && (
                  <form onSubmit={handleSubmit} className={styles.form}>
                    <h3>Scegli l&apos;argomento</h3>
                    <p className={styles.formSubtitle}>Scrivi uno o più argomenti da studiare, aggiungili alla lista e poi prosegui.</p>
                    <div className={styles.videoInputGroup}>
                      <input
                        type="text"
                        placeholder="Inserisci un argomento"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className={styles.themedInput}
                      />
                      <Button type="button" variant="outline" onClick={handleAddTopic}>
                        Aggiungi argomento
                      </Button>
                    </div>
                    {uploadError ? <p className={styles.uploadError}>{uploadError}</p> : null}
                    {uploadedTopics.length > 0 ? (
                      <div className={styles.uploadedFiles}>
                        {uploadedTopics.map((topic) => (
                          <div key={topic} className={styles.fileCard}>
                            <span className={styles.fileName}>{topic}</span>
                            <button
                              type="button"
                              className={styles.removeFileButton}
                              onClick={() => handleRemoveTopic(topic)}
                              aria-label={`Rimuovi ${topic}`}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : null}
                    {uploadedTopics.length > 0 ? (
                      <Button type="submit" variant="solid">Conferma caricamento</Button>
                    ) : null}
                  </form>
                )}
                <Button
                  type="button"
                  onClick={handleBack}
                  variant="outline"
                  className={styles.backButton}
                >
                  Indietro
                </Button>
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
                <h3>Conferma prima di generare</h3>
                <p className={styles.formSubtitle}>
                  Hai scelto <strong>{selectedMethodTitle}</strong>.
                </p>
                {Array.isArray(submittedValue) ? (
                  <div className={styles.confirmedFiles}>
                    <p className={styles.inputReminder}>
                      {selectedMethod === "topic" ? "Argomenti aggiunti:" : "Contenuti caricati:"}
                    </p>
                    <div className={styles.uploadedFiles}>
                      {submittedValue.map((fileName) => (
                        <div key={fileName} className={styles.fileCard}>
                          <span className={styles.fileName}>{fileName}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className={styles.inputReminder}>
                    Contenuto caricato: <strong>{submittedValue}</strong>
                  </p>
                )}
                <Button type="button" variant="solid" onClick={handleStartGeneration}>
                  Genera
                </Button>
                <Button type="button" variant="outline" onClick={handleBack}>
                  Indietro
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </main>
  );
}

const METHODS = [
  {
    id: "notes",
    title: "Carica i tuoi appunti",
    description: "Carica i tuoi file di appunti per iniziare.",
    img: "/file.png",
    alt: "Un robot che riceve file",
  },
  {
    id: "video",
    title: "Link di video da YouTube",
    description: "Inserisci link di video YouTube.",
    img: "/youtube.png",
    alt: "Un robot che riceve video",
  },
  {
    id: "topic",
    title: "Scegli l'argomento",
    description: "Seleziona un argomento da studiare.",
    img: "/argomento.png",
    alt: "Un robot che riceve argomento",
  },
];