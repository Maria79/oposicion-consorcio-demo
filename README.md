# Oposición Consorcio — Synthetic Exam Practice Demo

A **Next.js 16 / React 19 / TypeScript** application demonstrating a topic-based practice workflow, structured quizzes, adaptive question selection, scoring and progress tracking.

This repository is intended for **engineering portfolio review**. The interface is in Spanish; the source and documentation explain the implementation for international recruiters.

> **FICTIONAL DEMO CONTENT.** The 400 included questions are synthetic office-workflow scenarios, not official examination questions, legal advice or validated learning materials. This project has no connection to or endorsement from the Consorcio de Tributos de Tenerife.

## What you can explore

- A 20-topic navigation and practice dashboard, populated with **three entirely artificial** attempt histories.
- **Quick (10 question)** and **complete (20 question)** test modes with a timer, multiple-choice answers and a 0–10 score.
- The example scoring rule deducts half a correct answer for each incorrect answer; blank responses have no penalty.
- Question selection considers prior results, concept repetition and difficulty.
- A React UI for reviewing outcomes and topic-level statistics.
- A **no-cost, read-only demo mode**: test questions are already seeded; the application does **not** call OpenAI or save the visitor's attempts to the database.

### Technical overview

| Layer | Technology |
| --- | --- |
| Frontend | Next.js App Router, React 19, TypeScript, Tailwind CSS, Radix UI |
| Persistence | Prisma ORM, local SQLite with Better SQLite3 adapter |
| Demo data | Deterministic fictional fixtures, repeatable Prisma seeding, and verification scripts |
| Engineering checks | Node.js tests, ESLint, production build and HTTP smoke tests in GitHub Actions |

**Architecture:** UI → Next.js server components/actions → Prisma → isolated local SQLite. The source also illustrates question generation and deduplication logic, but paid AI functionality is intentionally disabled for this demonstration.

## Quick start

Prerequisites: Node.js 22 or later and npm.

```bash
npm ci
npm run demo:prepare
```

This creates an **untracked, disposable** database at `prisma/portfolio-demo.sqlite`. The command refuses to overwrite an existing database. It seeds **20 topics, 400 explicitly fictional questions, 3 synthetic attempts and 30 sample answer records**, then verifies the counts.

Start on macOS/Linux:

```bash
DATABASE_URL="file:$(pwd)/prisma/portfolio-demo.sqlite" DEMO_MODE=true npm run dev
```

Open `http://localhost:3000` and choose a topic. To enter the quiz without generating anything, click Quick or Complete test. No OpenAI key is required.

On Windows, set `DEMO_MODE=true` and set `DATABASE_URL` to the absolute `portfolio-demo.sqlite` file path prefixed with `file:` in your terminal before running `npm run dev`.

### Validation

```bash
npm run test:demo
npm run lint
DATABASE_URL="file:$(pwd)/prisma/portfolio-demo.sqlite" DEMO_MODE=true npm run build
node scripts/smoke-demo.mjs
npm run demo:verify
```

The smoke test needs the same demo environment variables as the build and starts a temporary Next.js server to inspect the dashboard, topic and both test pages. See the GitHub Actions workflow for a full example.

## Code worth reviewing

- [`prisma/schema.prisma`](prisma/schema.prisma): topic, question, attempt and response relations.
- [`prisma/demo-fixtures.mjs`](prisma/demo-fixtures.mjs): deterministic synthetic cases and example scoring.
- [`prisma/seed-demo.mjs`](prisma/seed-demo.mjs): database generation with explicit safety checks.
- [`src/lib/questionSelector.ts`](src/lib/questionSelector.ts): history-aware selection and avoiding repeated concepts.
- [`src/components/test/TestPlayer.tsx`](src/components/test/TestPlayer.tsx): timer, state and scoring UI.
- [`src/actions/generateQuestions.ts`](src/actions/generateQuestions.ts): optional AI workflow shown as code, disabled in demo mode.
- [`scripts/smoke-demo.mjs`](scripts/smoke-demo.mjs): actual HTTP tests of the built application.

## Privacy and scope

This **clean release contains no personal study database**, study-attempt history, syllabus PDFs or source study Markdown documents. The only quiz content is synthetic and visibly identified as such. The archive contains **no Git history**; create an empty repository and make a *new initial commit* if publishing the archive to GitHub.

This is a **local, single-instance demo**, not a production multi-user SaaS. There is no authenticated account isolation, durable hosted SQLite design or rate limiting for the optional paid AI pathway. Do **not** deploy it publicly as a writable multi-user service without implementing those controls.

A running public website is **not claimed** here. Prefer a recorded walkthrough or genuine local screenshots until a safe hosted solution exists.

## Known limitations

- The scenarios are repeated across topics to demonstrate application mechanics, **not legal accuracy** or a faithful exam syllabus.
- The app's older real-PDF interface components are present in the code for architectural context, but the clean demo deliberately excludes PDFs and hides those controls.
- Production hosting and persistent session isolation are out of scope of this snapshot.

**No third-party license is granted by this README.** Contact the repository owner before reusing code beyond what applicable law permits.
