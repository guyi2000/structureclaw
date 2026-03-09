---
phase: 4
slug: state-api-layer
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-09
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.ts (existing) |
| **Quick run command** | `npm test -- --run` |
| **Full suite command** | `npm test -- --run --coverage` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --run`
- **After every plan wave:** Run `npm test -- --run --coverage`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | STAT-01 | unit | `npm test -- --run stores` | ❌ W0 | ⬜ pending |
| 04-01-02 | 01 | 1 | STAT-01 | integration | `npm test -- --run stores/console-store.test.ts` | ❌ W0 | ⬜ pending |
| 04-02-01 | 02 | 1 | STAT-02 | unit | `npm test -- --run api` | ❌ W0 | ⬜ pending |
| 04-02-02 | 02 | 1 | STAT-02 | integration | `npm test -- --run api/client.test.ts` | ❌ W0 | ⬜ pending |
| 04-03-01 | 03 | 2 | STAT-03 | unit | `npm test -- --run hooks` | ❌ W0 | ⬜ pending |
| 04-03-02 | 03 | 2 | STAT-03 | integration | `npm test -- --run hooks/use-sse-stream.test.ts` | ❌ W0 | ⬜ pending |
| 04-04-01 | 01 | 1 | STAT-04 | unit | `npm test -- --run stores/preferences-store.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/setup.ts` — add EventSource mock for SSE hook testing
- [ ] `src/stores/__tests__/` — test directory for store tests
- [ ] `src/api/__tests__/` — test directory for API client tests
- [ ] `src/hooks/__tests__/` — test directory for hook tests

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Theme persistence across tabs | STAT-04 | Browser storage events require real browser | Open two tabs, change theme in one, verify sync in other |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
