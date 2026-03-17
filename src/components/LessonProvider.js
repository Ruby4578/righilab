"use client";

import { createContext, useContext, useMemo, useState } from "react";

const LessonContext = createContext(undefined);

export function LessonProvider({ children }) {
  const [lesson, setLesson] = useState(null);

  const value = useMemo(() => ({ lesson, setLesson }), [lesson]);

  return (
    <LessonContext.Provider value={value}>
      {children}
    </LessonContext.Provider>
  );
}

export function useLesson() {
  const context = useContext(LessonContext);

  if (!context) {
    throw new Error("useLesson must be used within a LessonProvider");
  }

  return context;
}