import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

const STORAGE_KEY = 'fixlab.progress.v1';

/** Share of quiz questions needed to complete a lesson. */
const PASS_RATIO = 0.7;

export const passingScore = (total: number): number => Math.ceil(total * PASS_RATIO);

export interface GuideProgress {
  /** True while the repair is under way, so it can be resumed. */
  active: boolean;
  completed: boolean;
  stepIndex: number;
  /** Ticked checklist items, by step index. */
  checks: Record<number, number[]>;
}

export interface LessonProgress {
  completed: boolean;
  bestScore: number;
  total: number;
}

export interface ProgressData {
  guides: Record<string, GuideProgress>;
  lessons: Record<string, LessonProgress>;
  last: { kind: 'guide' | 'lesson'; id: string } | null;
  /** Best first-try result in the Identify the parts simulation. */
  identifyBest: { score: number; total: number } | null;
}

const EMPTY: ProgressData = { guides: {}, lessons: {}, last: null, identifyBest: null };

interface ProgressActions {
  startGuide: (id: string) => void;
  setGuideStep: (id: string, stepIndex: number) => void;
  toggleGuideCheck: (id: string, stepIndex: number, item: number) => void;
  completeGuide: (id: string) => void;
  stopGuide: (id: string) => void;
  openLesson: (id: string) => void;
  recordQuiz: (id: string, score: number, total: number) => void;
  recordIdentify: (score: number, total: number) => void;
}

type ProgressState = ProgressActions & { ready: boolean; data: ProgressData };

const ProgressContext = createContext<ProgressState | null>(null);

function parse(json: string | null): ProgressData {
  if (!json) return EMPTY;
  try {
    const saved = JSON.parse(json) as Partial<ProgressData>;
    return { ...EMPTY, ...saved };
  } catch {
    return EMPTY;
  }
}

const NEW_GUIDE: GuideProgress = { active: true, completed: false, stepIndex: 0, checks: {} };

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [data, setData] = useState<ProgressData>(EMPTY);
  const loaded = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .catch(() => null)
      .then((json) => {
        setData(parse(json));
        setReady(true);
      });
  }, []);

  useEffect(() => {
    if (!ready) return;
    // Skip the first run, which only echoes what was just loaded.
    if (!loaded.current) {
      loaded.current = true;
      return;
    }
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch((error: unknown) => {
      console.warn('Could not save progress', error);
    });
  }, [ready, data]);

  const actions = useMemo<ProgressActions>(() => {
    const updateGuide = (id: string, change: (guide: GuideProgress) => GuideProgress) =>
      setData((d) => ({
        ...d,
        guides: { ...d.guides, [id]: change(d.guides[id] ?? NEW_GUIDE) },
        last: { kind: 'guide', id },
      }));

    return {
      startGuide: (id) =>
        updateGuide(id, (g) => ({ ...NEW_GUIDE, completed: g.completed })),
      setGuideStep: (id, stepIndex) => updateGuide(id, (g) => ({ ...g, stepIndex })),
      toggleGuideCheck: (id, stepIndex, item) =>
        updateGuide(id, (g) => {
          const current = g.checks[stepIndex] ?? [];
          const next = current.includes(item)
            ? current.filter((i) => i !== item)
            : [...current, item];
          return { ...g, checks: { ...g.checks, [stepIndex]: next } };
        }),
      completeGuide: (id) => updateGuide(id, (g) => ({ ...g, active: false, completed: true })),
      stopGuide: (id) => updateGuide(id, (g) => ({ ...g, active: false })),
      openLesson: (id) => setData((d) => ({ ...d, last: { kind: 'lesson', id } })),
      recordIdentify: (score, total) =>
        setData((d) => ({
          ...d,
          identifyBest: score >= (d.identifyBest?.score ?? 0) ? { score, total } : d.identifyBest,
        })),
      recordQuiz: (id, score, total) =>
        setData((d) => {
          const previous = d.lessons[id];
          return {
            ...d,
            lessons: {
              ...d.lessons,
              [id]: {
                completed: (previous?.completed ?? false) || score >= passingScore(total),
                bestScore: Math.max(previous?.bestScore ?? 0, score),
                total,
              },
            },
          };
        }),
    };
  }, []);

  const value = useMemo(() => ({ ready, data, ...actions }), [ready, data, actions]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressState {
  const value = useContext(ProgressContext);
  if (!value) throw new Error('useProgress must be used inside ProgressProvider');
  return value;
}
