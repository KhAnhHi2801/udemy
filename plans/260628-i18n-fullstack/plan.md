---
title: "i18n Full-Stack EN+VI"
description: "Add EN+VI i18n to Express backend (error codes) and Next.js frontend (next-i18next, URL routing)"
status: pending
priority: P2
branch: "main"
tags: [i18n, backend, frontend]
blockedBy: []
blocks: []
created: "2026-06-28T06:03:00.671Z"
createdBy: "ck:plan"
source: skill
---

# i18n Full-Stack EN+VI

## Overview

Full-stack i18n for EN + VI. Backend refactored to return semantic error codes (`{ code, message }`); frontend owns all translation via `next-i18next` with URL-based routing (`/vi/*`). Language persists via cookie. Zod validation errors use structured key patterns for parameterized translations.

Context: [brainstorm-report.md](./brainstorm-report.md)

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Backend Error Codes](./phase-01-backend-error-codes.md) | Pending |
| 2 | [Frontend i18n Setup](./phase-02-frontend-i18n-setup.md) | Pending |
| 3 | [Translation Files](./phase-03-translation-files.md) | Pending |
| 4 | [Component Updates](./phase-04-component-updates.md) | Pending |

## Dependencies

<!-- Cross-plan dependencies -->
