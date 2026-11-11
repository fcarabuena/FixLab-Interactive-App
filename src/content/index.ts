import type { ImageSourcePropType } from 'react-native';

import { getLocale, type Locale } from '@/i18n';
import type {
  ConstructionType,
  ConstructionTypeId,
  ExternalLink,
  IdentifyTarget,
  Lesson,
  Part,
  PhoneModel,
  RepairGuide,
  RepairType,
  SafetyTopic,
  Tool,
} from '@/types/content';

import { checkGuide, checkLesson, checkModel } from './validate';
import constructionTypesJson from '../../content/construction-types.json';
import identifyPartsJson from '../../content/identify-parts.json';
import partsJson from '../../content/parts.json';
import safetyJson from '../../content/safety.json';
import toolsJson from '../../content/tools.json';

const known = {
  constructionTypes: new Set<string>(constructionTypesJson.map((c) => c.id)),
  parts: new Set(partsJson.map((p) => p.id)),
};

/**
 * Loads every JSON file in a folder. Invalid files are skipped with a warning
 * so one bad file cannot crash the app.
 */
function loadFolder<T extends { id: string }>(
  context: __MetroModuleApi.RequireContext,
  check: (raw: unknown) => string[],
): T[] {
  const seen = new Set<string>();
  const items: T[] = [];
  for (const file of context.keys()) {
    const raw: unknown = context(file);
    const problems = check(raw);
    if (problems.length > 0) {
      console.warn(`Skipping content file ${file}:\n- ${problems.join('\n- ')}`);
      continue;
    }
    const item = raw as T;
    if (seen.has(item.id)) {
      console.warn(`Skipping content file ${file}: duplicate id "${item.id}"`);
      continue;
    }
    seen.add(item.id);
    items.push(item);
  }
  return items;
}

type Overlay = Record<string, unknown> & { id: string };

/** Translated text, keyed by "locale/collection/id". */
const overlays = new Map<string, Overlay>();

// Files look like ./fil/parts.json (a list) or ./fil/guides/some-guide.json (one item).
const translationFiles = require.context('../../content/translations', true, /\.json$/);
for (const file of translationFiles.keys()) {
  const [, locale, collection] = file.split('/');
  const raw = translationFiles(file) as Overlay | Overlay[];
  for (const entry of Array.isArray(raw) ? raw : [raw]) {
    overlays.set(`${locale}/${collection.replace(/\.json$/, '')}/${entry.id}`, entry);
  }
}

/** Fields that are data rather than wording, so a translation can never change them. */
const LOCKED_FIELDS = new Set([
  'id',
  'constructionType',
  'modelId',
  'repairType',
  'difficulty',
  'layer',
  'image',
  'number',
  'order',
  'correctIndex',
  'diagram',
  'includes',
  'zones',
  'isSample',
  'availableRepairs',
  'externalLinks',
]);

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/** Lays translated strings over the English item, keeping English wherever one is missing. */
function applyOverlay(base: unknown, overlay: unknown, path: string): unknown {
  if (typeof base === 'string') {
    return typeof overlay === 'string' && overlay.length > 0 ? overlay : base;
  }
  if (Array.isArray(base)) {
    if (!Array.isArray(overlay) || overlay.length !== base.length) {
      console.warn(`Translation for ${path} has the wrong number of items, using English`);
      return base;
    }
    return base.map((item, i) => applyOverlay(item, overlay[i], `${path}[${i}]`));
  }
  if (isObject(base) && isObject(overlay)) {
    return Object.fromEntries(
      Object.entries(base).map(([key, value]) => [
        key,
        LOCKED_FIELDS.has(key) || !(key in overlay)
          ? value
          : applyOverlay(value, overlay[key], `${path}.${key}`),
      ]),
    );
  }
  return base;
}

/** Returns a getter for the items in the current language, cached per language. */
function localized<T extends { id: string }>(collection: string, base: T[]): () => T[] {
  const cache = new Map<Locale, T[]>();
  return () => {
    const locale = getLocale();
    let items = cache.get(locale);
    if (!items) {
      items = base.map((item) => {
        const overlay = overlays.get(`${locale}/${collection}/${item.id}`);
        return overlay ? (applyOverlay(item, overlay, `${collection}/${item.id}`) as T) : item;
      });
      cache.set(locale, items);
    }
    return items;
  };
}

const constructionTypes = localized(
  'construction-types',
  constructionTypesJson as ConstructionType[],
);
const parts = localized('parts', partsJson as Part[]);
const tools = localized('tools', toolsJson as Tool[]);
const safetyTopics = localized('safety', safetyJson as SafetyTopic[]);
const identifyTargets = localized('identify-parts', identifyPartsJson as IdentifyTarget[]);

const models = localized(
  'models',
  loadFolder<PhoneModel>(require.context('../../content/models', false, /\.json$/), (raw) =>
    checkModel(raw, known),
  ).sort((a, b) => a.brand.localeCompare(b.brand) || a.name.localeCompare(b.name)),
);

const guides = localized(
  'guides',
  loadFolder<RepairGuide>(require.context('../../content/guides', false, /\.json$/), (raw) =>
    checkGuide(raw, known),
  ),
);

const lessons = localized(
  'lessons',
  loadFolder<Lesson>(require.context('../../content/lessons', false, /\.json$/), checkLesson).sort(
    (a, b) => a.order - b.order,
  ),
);

const images = require.context('../../assets/placeholders', false, /\.(png|jpe?g|webp)$/);

export const getModels = (): PhoneModel[] => models();
export const getModel = (id: string): PhoneModel | undefined => models().find((m) => m.id === id);
export const getBrands = (): string[] => [...new Set(models().map((m) => m.brand))];

export const getConstructionType = (id: ConstructionTypeId): ConstructionType | undefined =>
  constructionTypes().find((c) => c.id === id);

export const getPart = (id: string): Part | undefined => parts().find((p) => p.id === id);

export const getGuide = (id: string): RepairGuide | undefined => guides().find((g) => g.id === id);

export const getTools = (): Tool[] => tools();
export const getSafetyTopics = (): SafetyTopic[] => safetyTopics();
export const getIdentifyTargets = (): IdentifyTarget[] => identifyTargets();

/** Every external guide linked from any phone, listed once each for the credits page. */
export function getLinkedSources(): ExternalLink[] {
  const byUrl = new Map(models().flatMap((m) => m.externalLinks).map((l) => [l.url, l]));
  return [...byUrl.values()];
}

export const getLessons = (): Lesson[] => lessons();
export const getLesson = (id: string): Lesson | undefined => lessons().find((l) => l.id === id);

/** A guide written for this exact model wins over one for its construction type. */
export function findGuideFor(model: PhoneModel, repair: RepairType): RepairGuide | undefined {
  const matching = guides().filter((g) => g.repairType === repair);
  return (
    matching.find((g) => g.modelId === model.id) ??
    matching.find((g) => g.constructionType === model.constructionType)
  );
}

/** Turns a Step.image path such as "placeholders/x.png" into a bundled image. */
export function resolveStepImage(path: string): ImageSourcePropType | undefined {
  const key = `./${path.replace(/^placeholders\//, '')}`;
  return images.keys().includes(key) ? (images(key) as ImageSourcePropType) : undefined;
}
