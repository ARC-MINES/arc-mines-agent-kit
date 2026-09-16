# Agent execution prompts

Run these in the host game's checkout with a path to this kit. Each phase
produces a reviewable artifact and preserves the scope of the requested change.

## 1. System reconnaissance and invariant extraction

```text
Read reward-reveal/SKILL.md and references/workflow.md from this kit. Trace the
ore-opening path from every trigger through the API, server selection, durable
state, receipt handling, reveal presentation, and placement. Produce a concise
ownership map, current failure modes, and the smallest implementation plan.
Distinguish observed behavior from proposed changes. Do not modify code yet.
```

## 2. Authoritative command semantics

```text
Implement the agreed command changes using references/protocol.md. Preserve
the economy. Validate intent at the boundary, serialize per-player mutations,
check receipts before revision and cooldown, and commit state with the reply
receipt atomically. Test exact replay, conflicting intents, stale revisions,
cooldown boundaries, forged outcomes, and receipt eviction. Explain the actual
persistence guarantee of the host, not the in-memory example's assumptions.
```

## 3. Temporal orchestration and micro-UX

```text
Use references/micro-ux.md to connect authoritative results to the existing UI.
Run anticipation and the request concurrently, coordinate one in-flight action,
and keep committed identity separate from previews. Implement reserved layout,
rarity hierarchy, precise placement labels, keyboard dismissal and focus return,
reduced-motion behavior, stable waiting, and visible recovery. Verify the actual
UI at mobile width and with a slow or lost response. Report unchecked cases.
```

## 4. Allocation and load analysis

```text
Read references/performance.md. Profile the actual roll path before changing it.
Separate weighted-selection CPU, cryptographic RNG, snapshot serialization,
storage, queueing, and network time. Reuse compiled prefix tables if weights
are linear in luck; otherwise choose a correct sampler for the actual formula.
Preserve exact results in deterministic comparison tests. Report measured values
with methodology and exclusions. Omit identifying host metadata. Do not
extrapolate microbenchmarks into RPS.
```

## 5. Acceptance and evidence

```text
Review the completed flow against the acceptance matrix in workflow.md. Exercise
duplicate activation, lost-response replay, conflicting saves, background tab
return, image failure, blocked storage, reduced motion, and keyboard navigation.
Run relevant tests and production build. Produce a short closeout linking the
changed files, reproducible measurements, actual browser evidence, and remaining
integration limits. Do not publish or deploy unless separately authorized.
```
