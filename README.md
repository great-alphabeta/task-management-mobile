# Task Management

A cross-platform mobile app for managing projects and tasks, built as a take-home exercise. The brief supplied four designed screens (Onboarding, Home, Today's Task, Add Project). I implemented those faithfully, then designed and built the two screens without mocks — **Add Task** and **Task Detail** — to complete the core loop: create a project → add tasks → track them day by day → edit or finish them.

**Demo:** I did not attach a screen recording or hosted build to this repo. The fastest way to try it is a local dev build (instructions below). For a shareable APK, see [Building for reviewers](#building-for-reviewers).

---

## Setup and run

### Prerequisites

- Node.js 18+
- npm
- For device/simulator testing: [Android Studio](https://developer.android.com/studio) and/or Xcode (macOS only)
- An [OpenRouter](https://openrouter.ai/) API key if you want AI features (the app still works without it)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment (optional but recommended)

Copy the example env file and add your key:

```bash
cp .env.example .env
```

```env
EXPO_PUBLIC_OPENROUTER_API_KEY=your_key_here
EXPO_PUBLIC_OPENROUTER_MODEL=openai/gpt-oss-120b:free
```

Only variables prefixed with `EXPO_PUBLIC_` are available in the app bundle. For EAS production builds, set these as EAS secrets instead of committing `.env`.

### 3. Start the dev server

```bash
npx expo start
```

### 4. Run on a device or simulator

This project uses native modules (`expo-sqlite`, `@react-native-community/datetimepicker`, `expo-image-picker`), so you need a **development build**, not just Expo Go.

**Android (emulator or USB device):**

```bash
npx expo run:android
```

**iOS (macOS + simulator or device):**

```bash
npx expo run:ios
```

On first launch you'll see onboarding, which creates the local SQLite database. After that, the app routes straight to Home.

### Building for reviewers

If you have an Expo account and EAS CLI installed:

```bash
npm install -g eas-cli
eas login
eas build --profile preview --platform android
```

That produces an internal APK you can install without the Play Store. iOS preview builds require Apple developer credentials. Profiles are defined in `eas.json`.

---

## Tech stack and why

| Choice | Why |
|--------|-----|
| **Expo 57 + React Native** | Matches the brief's mobile focus, gives OTA-friendly tooling, and ships to both Android and iOS from one codebase. |
| **Expo Router** | File-based routing keeps navigation obvious (`src/app/...`). Deep links and stack behaviour come for free. |
| **TypeScript** | Catches shape mismatches between DB rows, API responses, and UI props early — especially important once AI returns JSON. |
| **expo-sqlite** | Offline-first persistence with no backend setup. Fine for a self-contained demo; data stays on device. |
| **NativeWind (Tailwind)** | The designs use consistent spacing, purple accents, and card shadows. Utility classes kept styling fast without a separate design-system package. |
| **react-native-svg** | Progress rings and icons render identically on Android and iOS — I deliberately avoided Android-only Compose UI. |
| **OpenRouter** | One HTTP API over many models. I used the free `openai/gpt-oss-120b:free` tier so reviewers can test AI without a paid OpenAI key. |

I kept the architecture flat on purpose: screens call small `src/db/*` modules and `src/services/ai/*` directly. No Redux, no repository abstractions — the app is small enough that extra layers would mostly add noise.

---

## App structure

```
src/
├── app/                  # Expo Router screens
│   ├── OnBoarding.tsx    # First-run DB setup
│   ├── (base)/
│   │   ├── Home.tsx
│   │   ├── TodayTask.tsx
│   │   ├── AddProject.tsx
│   │   ├── AddTask.tsx        ← undesigned screen
│   │   └── TaskDetail.tsx     ← undesigned screen
├── components/           # Reusable UI (Header, progress rings, AI fields)
├── db/                   # SQLite schema + CRUD
├── services/ai/          # OpenRouter client + feature prompts
├── utils/                # Dates, alerts, image → base64, NL date parsing
└── config/ai.ts          # Model + API URL
```

**Navigation flow**

1. Onboarding → creates DB → Home
2. Navbar `+` → Add Project
3. Home / Today → Add Task (date pre-selected from calendar when coming from Today)
4. Task row tap → Task Detail (edit, change status, delete)
5. Back navigation uses `canGoBack()` with a fallback to Home when the stack was replaced via the tab bar

---

## Design reasoning: the two screens without mocks

The brief gave polished designs for onboarding, home, today's tasks, and add project. Two screens were left open: **Add Task** and **Task Detail**. I designed both by borrowing the form language from Add Project and the task context from Today's Task — white cards, purple icons, dropdown rows — rather than inventing a new visual system.

### Add Task

**Goal:** Create a task against an existing project, usually from Today's Task or Home.

**Layout decisions:**

- **Project picker at the top** — mirrors Add Project's task-group dropdown: icon tile on the left, label + value, chevron on the right. Shows the project logo when one exists, otherwise the coloured group icon from Home.
- **Name → description → date → times → save** — same vertical rhythm as Add Project. Task name in a simple labelled card; description uses the shared `AiDescriptionField` component.
- **Date row is read-only** — the day comes from Today's Task calendar selection (via `selectedTaskDate` store), not a picker on this screen. That keeps the flow tight: pick a day on the calendar, tap add, confirm the task for that day. The calendar icon row matches Add Project's date rows visually.
- **Start / end time as tappable rows** — clock icon + chevron, same pattern as Add Project's date pickers. Defaults to 9:00–10:00 so the form is never empty.
- **Quick-add with AI below the manual form** — optional `NaturalLanguageTaskInput` for power users ("Design review tomorrow at 3pm"). Sits under the standard fields so the primary path stays familiar; AI is additive, not the only way in.
- **Empty project state** — if no projects exist yet, the dropdown is replaced with a plain message pointing users to create a project first. Save is disabled.

**Validation:** task name required, end time after start time, project must exist.

### Task Detail

**Goal:** View and edit a single task after tapping it on Today's Task.

**Layout decisions:**

- **Same skeleton as Add Task** — project dropdown, name, description, date, start/end times, primary save button. If you can add a task, you already know how to edit one. Intentional symmetry.
- **Status dropdown added** — the one field Add Task doesn't need. Uses `TaskStatusBadge` in the dropdown so to-do / in progress / done match Today's Task filter chips exactly.
- **Date shown read-only** — same rule as Add Task. Rescheduling to another day felt like a distinct feature; time editing covers the most common edit ("move 9am to 10am").
- **Description without AI chips** — kept plain `TextInput` here to reduce noise on a screen people visit briefly. AI assists creation; editing is manual.
- **Destructive delete at the bottom** — red text, separated from save, with a confirmation alert.
- **Loading gate** — header shows while data loads; missing or deleted tasks redirect back with an alert.

Both screens hide the bottom navbar (see `(base)/_layout.tsx`) so they feel like focused flows, same as Add Project.

---

## AI integration

### Provider

- **API:** [OpenRouter](https://openrouter.ai/api/v1/chat/completions) (`src/services/ai/client.ts`)
- **Model:** `EXPO_PUBLIC_OPENROUTER_MODEL` (default `openai/gpt-oss-120b:free`)
- **Auth:** `EXPO_PUBLIC_OPENROUTER_API_KEY` sent as a Bearer token
- **Config check:** `isAiConfigured()` in `src/config/ai.ts` — UI hides or degrades AI affordances when the key is missing

### Where AI shows up

| Feature | Screen | What it does |
|---------|--------|--------------|
| Description generate / improve / summarize | Add Project, Add Task | Writes or refines free-text descriptions |
| Suggest task group | Add Project | Returns `{ group_id, reason }` JSON |
| Daily summary | Home | 1–2 sentence overview of today's open tasks |
| Natural-language task creation | Today Task, Add Task | Parses "Design review tomorrow at 3pm" into structured task fields |

### Prompt approach

Prompts live in `src/services/ai/features.ts`. General principles I followed:

1. **System prompt sets the contract** — output format (plain text vs JSON), length, tone.
2. **Structured outputs use JSON** — task group suggestion and NL parsing. The client extracts the first `{...}` block and validates fields before touching the DB.
3. **Low temperature for parsing** (0.1–0.2) — dates and enums need consistency, not creativity.
4. **Reference date injected for NL tasks** — "tomorrow" is resolved relative to the selected calendar day, not whatever the model guesses.
5. **Local fallback for dates** — `src/utils/naturalLanguageDate.ts` re-parses relative phrases if the model's date looks wrong.

### Error handling and latency

- **Typed errors** — `AiServiceError` carries user-readable messages (missing key, rate limit 429, empty response, invalid JSON).
- **UI feedback** — `ActivityIndicator` on the triggering control; buttons disabled while a request is in flight.
- **Themed alerts** — `showAlert()` via `AppAlertProvider` instead of native `Alert.alert`, so errors match the app's purple/white styling.
- **Graceful degradation** — without an API key, description fields show a hint; NL input is hidden; Home summary falls back to "You have N tasks due today."
- **Daily summary fallback** — if the AI call fails, same static count message is shown. The home screen never blocks on AI.
- **Post-parse validation** — NL tasks get default times (09:00, +1 hour end) if the model omits them; end time is forced after start time.

I'm not streaming responses — every call is a single `fetch` with `max_tokens` capped per feature (700 default, 180 for summaries). For a production app I'd add request timeouts and retry with backoff; here, a clear error message felt enough.

---

## Data and edge cases

- **SQLite** with WAL mode; projects and tasks on device only
- **Logo storage** as base64 data URI (not temp file paths)
- **DB reconnect** — `executeDatabaseOperation()` retries once after `reconnectDatabase()` on Android connection errors
- **Empty states** — Home hides empty project/group sections; Today Task shows filters with zero results; Add Task warns if no projects exist
- **Cross-platform pickers** — `FormDateTimePicker` uses platform files (`.android.tsx` / `.ios.tsx`) so screens don't branch on `Platform.OS`

---

## What I'd do next with more time

Prioritised honestly:

1. **Screen recording** — 3-minute walkthrough: onboarding → create project → add task manually + via NL → edit on Task Detail → check Home summary.
2. **Project detail screen** — tap a project on Home to see its tasks and timeline.
3. **Reschedule task date** — date picker on Task Detail, not just times.
4. **Tests** — unit tests for `naturalLanguageDate.ts`, `extractJsonObject`, and DB CRUD.
5. **AI timeouts + caching** — daily summary cached per day so Home doesn't re-fetch on every focus.
6. **Accessibility pass** — screen reader labels on dropdowns and progress rings.
7. **Remove debug `console.log`** in `DailyAiSummary.tsx`.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo dev server |
| `npx expo run:android` | Native Android build + run |
| `npx expo run:ios` | Native iOS build + run |
| `npm run lint` | Expo ESLint |

---

## License

Private take-home submission. Not licensed for redistribution.
