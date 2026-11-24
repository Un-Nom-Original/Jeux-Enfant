import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

export type GradeLevel = '1re' | '3e';

const GRADE_STORAGE_KEY = 'jeux-enfant:grade:v1';

interface GradeContextValue {
  grade: GradeLevel;
  setGrade: (grade: GradeLevel) => void;
  toggleGrade: () => void;
}

const GradeContext = createContext<GradeContextValue | null>(null);

export function GradeProvider({ children }: { children: ReactNode }) {
  const [grade, setGradeState] = useState<GradeLevel>(() => {
    try {
      const saved = localStorage.getItem(GRADE_STORAGE_KEY);
      return saved === '3e' ? '3e' : '1re';
    } catch {
      return '1re';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(GRADE_STORAGE_KEY, grade);
    } catch {
      // Ignore storage errors
    }
  }, [grade]);

  const setGrade = useCallback((next: GradeLevel) => {
    setGradeState(next);
  }, []);

  const toggleGrade = useCallback(() => {
    setGradeState((prev) => (prev === '1re' ? '3e' : '1re'));
  }, []);

  return (
    <GradeContext.Provider value={{ grade, setGrade, toggleGrade }}>
      {children}
    </GradeContext.Provider>
  );
}

export function useGrade(): GradeContextValue {
  const ctx = useContext(GradeContext);
  if (!ctx) {
    throw new Error('useGrade must be used within a GradeProvider');
  }
  return ctx;
}
