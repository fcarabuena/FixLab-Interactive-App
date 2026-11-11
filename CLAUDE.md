# FixLab: Phone Repair Trainer

## What this project is
FixLab is a free Android app (built with Expo / React Native) that teaches students how to repair smartphone **hardware**. It is a learning tool in the spirit of an interactive explorer: students take a phone apart layer by layer, learn what each part does, and follow safe step-by-step repair guides.

Target users: beginner students in repair classes and people who want to do simple repairs themselves (battery, screen/LCD, charging port) instead of paying a shop for everything.

## Scope rules (important)
- **Hardware repair only.** Do NOT add any software-unlock features: no password/PIN/pattern removal, no FRP / Google account bypass, no carrier unlocking, no IMEI changes, no rooting guides. If a feature request drifts toward these, stop and ask.
- **No brand logos or copied phone designs.** All phone illustrations are generic, original SVG drawings.
- **Do not invent real-model specifications.** Sample data uses clearly labelled sample phones (e.g. "Sample Phone A — glued back"). Real models are only added later from verified sources, never guessed.
- **Do not copy text or images from iFixit, YouTube or manufacturer manuals.** The app may *link* to external guides (with attribution), opened in the in-app browser.
- **Free, no ads, no login, no analytics in v1.** This keeps the app simple for Play Store data-safety forms and compatible with linking to CC BY-NC-SA content.

## Tech stack
- Expo (latest stable SDK), TypeScript (strict), Expo Router for navigation
- react-native-svg + react-native-reanimated + react-native-gesture-handler for the interactive phone explorer
- Content stored as bundled JSON files in `/content` (offline-first); progress saved locally with expo-sqlite or AsyncStorage
- expo-web-browser for external links
- i18n-ready: all UI strings in `/src/i18n/en.json` (Filipino translation will be added later)
- Builds via EAS Build in the cloud (`eas.json` with a `production` profile producing an `.aab`). The developer uses **VS Code only, no Android Studio**: never require Android Studio or a local Android SDK.
- Only use libraries that work in **Expo Go**, so the app can be tested on a real phone by scanning the QR code from `npx expo start`. Ask before adding any library that needs a custom dev build.

## Core concepts / data model
Phones are grouped by **construction type**, because repairs follow the same method within a type:
- `glued-back` — heat and pry the glass back; battery and board underneath
- `clip-back` — plastic back held by clips/screws
- `front-entry` — screen comes off first

Define TypeScript types in `/src/types/content.ts`:
- `ConstructionType` — id, name, description, general opening method, risk notes
- `PhoneModel` — id, brand, name, constructionType, difficulty, availableRepairs[], parts[], externalLinks[] (title, url, source, license), isSample: boolean
- `Part` — id, name, layer (for the explorer), description, commonSymptoms[], safetyNotes[]
- `RepairGuide` — id, title, modelId or constructionType, difficulty, estimatedTime, tools[], parts[], diyCheck (when to go to a shop instead), steps[]
- `Step` — number, title, body, image (placeholder path), warnings[], checklist[]
- `Lesson` — id, order, title, summary, sections[], quiz[]

Adding a new phone model must only require adding one JSON file in `/content/models/` — no code changes.

## Screens (v1)
1. **Onboarding + safety disclaimer** — must be accepted once (lithium battery risks, heat, sharp glass, "you repair at your own risk").
2. **Home** — continue learning, featured lesson, quick links (Find my phone model, Explore a phone, Tools & Safety).
3. **Model picker** — brand → model list with search; shows construction type and available repairs.
4. **Explore a phone** — interactive generic phone in SVG: tap to remove layers one at a time (back cover → battery → mainboard → charging flex → display), tap hotspots to open an info panel with tabs: Overview / Symptoms / Tools / Safety.
5. **Repair guide** — step-by-step with progress bar, warnings highlighted, per-step checklist, and a **"Should you DIY this?"** gate before risky steps.
6. **Lessons** — ordered lesson track with progress tracking and short quizzes.
7. **Tools & Safety** — tool glossary and ESD/battery safety.
8. **About & Credits** — disclaimer, attributions for linked sources, version.

## Lesson track (content outlines only in v1)
1. Meet the smartphone  2. Tools and ESD safety  3. Safe opening and disassembly  4. Battery replacement and lithium safety  5. Screen/LCD replacement  6. Charging port repair  7. Multimeter basics  8. Diagnosing a phone that won't power on  9. Reading basic circuit diagrams  10. Intro to micro-soldering

## Visual design
Warm, friendly, educational: off-white/beige background, one strong orange accent, dark text, bold condensed headings, rounded cards, simple line icons, generous spacing. Large touch targets (students may have tools in hand). Support light mode first; keep colors in a single theme file so dark mode can be added later.

## Build phases
- **Phase 1 (start here):** project setup, theme, navigation, types, onboarding/disclaimer, model picker with 3 sample phones (one per construction type), the Explore screen with a working layered SVG phone, and ONE complete sample guide: battery replacement for a glued-back sample phone.
- **Phase 2:** screen and charging-port guides, lessons 1–4 with quizzes, progress saving.
- **Phase 3:** remaining lessons, Filipino translation, optional online content updates, Play Store assets.

## Working rules for Claude Code
- Before writing code for a phase, show a short plan and the file structure, then build in small steps.
- After each step, run `npx tsc --noEmit` and fix errors. Keep lint clean.
- Tell the developer exactly how to test each step on their phone (`npx expo start` → scan with Expo Go).
- Placeholder images go in `/assets/placeholders/` and are clearly named so real photos can replace them.
- Set up `app.json` (app name "FixLab", Android package `com.CHANGE_ME.fixlab`) and `eas.json` with `development`, `preview` (apk) and `production` (aab) profiles. Make sure the target Android SDK meets the current Google Play requirement.
- Keep a `README.md` explaining how to run, how to add a new phone model JSON file, and how to build/submit with EAS.
