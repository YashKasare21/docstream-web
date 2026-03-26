# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI-powered document conversion system: PDFs → publication-quality LaTeX/PDF.
Pipeline: PyMuPDF extraction → Gemini AI structuring → Pandoc + XeLaTeX rendering.

**Stack:**
- Frontend: Next.js (App Router), TypeScript (strict), Tailwind CSS v4, shadcn/ui, Framer Motion
- Backend: FastAPI (Python 3.11+), `docstream` library
- Deployment: Vercel (frontend), Railway (backend)

## Commands

### Frontend (repo root)
```bash
npm run dev          # dev server
npm run build        # production build — must pass before merging
npm run lint         # ESLint
npx tsc --noEmit     # type check — zero errors allowed
```

### Backend (`docstream-api/`)
```bash
source .venv/bin/activate
uvicorn main:app --reload   # dev server
pytest                       # all tests
pytest tests/test_file.py::test_specific_function  # single test
```

Run `npm run lint`, `npx tsc --noEmit`, and `npm run build` before finishing any frontend task. Run `pytest` before finishing any backend task.

## Architecture

**Boundary rules:**
- UI/page composition → `src/app/**` and `src/components/**`
- Frontend API client → `src/lib/api.ts` (currently has mocked conversion — verify before changing flow logic)
- HTTP route definitions → `docstream-api/routes/**` (keep thin)
- Business logic → `docstream-api/services/**`
- Pydantic schemas → `docstream-api/models/**`

**Key reference files:**
- `src/app/convert/page.tsx` — conversion flow/state pattern
- `src/components/convert/DropZone.tsx` — upload UX and validation
- `docstream-api/routes/convert.py` — API route shape and response contract
- `docstream-api/tests/test_convert.py` + `conftest.py` — backend test patterns

Do not edit `src/components/ui/**` unless explicitly requested (shadcn/ui primitives).

## Conventions

**TypeScript:** strict mode, no implicit `any`, all component props must have explicit interfaces, all API responses must be typed. Use `zod` for runtime validation.

**Naming:** Components `PascalCase`, hooks/utils `camelCase`, constants `UPPER_SNAKE_CASE`.

**Backend:** Python type hints mandatory on all functions; Pydantic models for all request/response schemas; custom exception classes mapped to HTTP status codes (no raw 500s for expected errors).

**Errors:** Never expose raw backend/internal exception text in user-facing messages. No empty `catch` blocks.

## Git & Branching

- `main`: production only — never push directly
- `dev`: integration branch — all PRs target here
- Branch prefixes: `feature/`, `fix/`, `chore/`

Commit format: `<type>(<scope>): <short summary>` — types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.

## Design System

Dark mode first — never use white backgrounds.

| Token | Value | Usage |
|---|---|---|
| `bg-base` | `#0F172A` | Page background |
| `bg-surface` | `#1E293B` | Cards, panels |
| `primary` | `#1E40AF` | CTAs, active |
| `accent` | `#3B82F6` | Highlights |
| `border` | `#334155` | Dividers |
| `text-primary` | `#F8FAFC` | Headings, body |
| `text-muted` | `#94A3B8` | Captions |
| `success` | `#22C55E` | Done states |
| `error` | `#EF4444` | Failures |

Animations: 200–300ms ease-in-out via Framer Motion; always respect `prefers-reduced-motion`. Use subtle glow (`0 0 20px rgba(59,130,246,0.15)`) instead of harsh shadows. Glass morphism (`backdrop-blur`) on overlapping layers.

Standard animation variants in `.superdesign/design-system.md`.

## Pitfalls

- `src/lib/api.ts` currently has mocked conversion behavior — check whether a task expects real backend calls before changing flow logic.
- Local backend requires system tools (`pandoc`, TeX packages, `tesseract`) for full rendering; Docker container installs them automatically.
- Do not introduce breaking assumptions about the external `docstream` library from within this repo.
