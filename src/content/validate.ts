const isString = (v: unknown): v is string => typeof v === 'string' && v.length > 0;
const isStringArray = (v: unknown): v is string[] => Array.isArray(v) && v.every(isString);
const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;

const DIFFICULTIES = ['easy', 'moderate', 'hard'];
const REPAIRS = ['battery', 'screen', 'charging-port'];

interface KnownIds {
  constructionTypes: ReadonlySet<string>;
  parts: ReadonlySet<string>;
}

/** Returns a list of problems. An empty list means the model is safe to use. */
export function checkModel(raw: unknown, known: KnownIds): string[] {
  if (!isRecord(raw)) return ['file is not a JSON object'];
  const problems: string[] = [];
  for (const field of ['id', 'brand', 'name'] as const) {
    if (!isString(raw[field])) problems.push(`"${field}" must be a non-empty string`);
  }
  if (!known.constructionTypes.has(raw.constructionType as string)) {
    problems.push(`unknown constructionType "${String(raw.constructionType)}"`);
  }
  if (!DIFFICULTIES.includes(raw.difficulty as string)) {
    problems.push(`"difficulty" must be one of ${DIFFICULTIES.join(', ')}`);
  }
  if (
    !isStringArray(raw.availableRepairs) ||
    raw.availableRepairs.some((r) => !REPAIRS.includes(r))
  ) {
    problems.push(`"availableRepairs" must only contain ${REPAIRS.join(', ')}`);
  }
  if (!isStringArray(raw.parts)) {
    problems.push('"parts" must be a list of part ids');
  } else {
    for (const id of raw.parts) {
      if (!known.parts.has(id)) problems.push(`unknown part id "${id}"`);
    }
  }
  if (!Array.isArray(raw.externalLinks)) problems.push('"externalLinks" must be a list');
  if (typeof raw.isSample !== 'boolean') problems.push('"isSample" must be true or false');
  return problems;
}

export function checkLesson(raw: unknown): string[] {
  if (!isRecord(raw)) return ['file is not a JSON object'];
  const problems: string[] = [];
  for (const field of ['id', 'title', 'summary'] as const) {
    if (!isString(raw[field])) problems.push(`"${field}" must be a non-empty string`);
  }
  if (typeof raw.order !== 'number') problems.push('"order" must be a number');
  if (!Array.isArray(raw.sections) || raw.sections.length === 0) {
    problems.push('"sections" must be a non-empty list');
  }
  if (!Array.isArray(raw.quiz) || raw.quiz.length === 0) {
    problems.push('"quiz" must be a non-empty list');
  } else {
    raw.quiz.forEach((q: unknown, index: number) => {
      if (
        !isRecord(q) ||
        !isString(q.question) ||
        !isStringArray(q.options) ||
        !isString(q.explanation) ||
        typeof q.correctIndex !== 'number' ||
        q.correctIndex < 0 ||
        q.correctIndex >= q.options.length
      ) {
        problems.push(`quiz question ${index + 1} is incomplete`);
      }
    });
  }
  return problems;
}

export function checkGuide(raw: unknown, known: KnownIds): string[] {
  if (!isRecord(raw)) return ['file is not a JSON object'];
  const problems: string[] = [];
  for (const field of ['id', 'title', 'estimatedTime'] as const) {
    if (!isString(raw[field])) problems.push(`"${field}" must be a non-empty string`);
  }
  if (!REPAIRS.includes(raw.repairType as string)) problems.push('invalid "repairType"');
  if (!DIFFICULTIES.includes(raw.difficulty as string)) problems.push('invalid "difficulty"');
  if (isString(raw.modelId) === isString(raw.constructionType)) {
    problems.push('set exactly one of "modelId" or "constructionType"');
  }
  if (isString(raw.constructionType) && !known.constructionTypes.has(raw.constructionType)) {
    problems.push(`unknown constructionType "${raw.constructionType}"`);
  }
  if (!isStringArray(raw.tools)) problems.push('"tools" must be a list of strings');
  if (!isStringArray(raw.parts)) problems.push('"parts" must be a list of strings');
  if (!isRecord(raw.diyCheck) || !isStringArray(raw.diyCheck.goToShopIf)) {
    problems.push('"diyCheck.goToShopIf" must be a list of strings');
  }
  if (!Array.isArray(raw.steps) || raw.steps.length === 0) {
    problems.push('"steps" must be a non-empty list');
  } else {
    raw.steps.forEach((step: unknown, index: number) => {
      if (
        !isRecord(step) ||
        step.number !== index + 1 ||
        !isString(step.title) ||
        !isString(step.body) ||
        !isStringArray(step.warnings) ||
        !isStringArray(step.checklist)
      ) {
        problems.push(`step at position ${index + 1} is incomplete or misnumbered`);
      }
    });
  }
  return problems;
}
