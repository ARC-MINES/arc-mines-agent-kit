---
name: reward-reveal
description: Implement or review ore, chest, and pack reveals with server-selected rewards, retry-safe commands, animation sequencing, and detailed micro-UX. Use when building an opening interaction or fixing its request, reveal, placement, or recovery flow.
---

# Reward reveal

Build an opening interaction whose animation presents one committed reward.
Keep the recipient, selection, cost, and placement decisions on the server.

## Read for the work at hand

- Start with [workflow](references/workflow.md) for implementation or a review.
- Read [protocol](references/protocol.md) before changing requests or persistence.
- Read [micro-UX](references/micro-ux.md) before changing presentation or input.
- Read [performance](references/performance.md) when changing sampling, request
  fan-out, storage behavior, or responsiveness. Separate CPU and end-to-end claims.
- Use [the runnable model](examples/reveal.mjs) and
  [its checks](examples/reveal.test.mjs) to understand replay and revision rules.
  Run `node --test examples/reveal.test.mjs` from this skill directory.

## Invariants

1. Send intent, not the drop, luck value, price, or balance. Preview randomness
   must never become a reward or a displayed probability claim.
2. Acquire one synchronous operation guard before starting animation or fetch.
   Disabled styling alone does not prevent double activation.
3. Retry an ambiguous mutation with the same ID, revision, and serialized body.
   Check an existing receipt before revision and cooldown checks.
4. Commit reward state and receipt together. An in-memory example is not a
   substitute for a per-player transaction in a deployed backend.
5. Resolve request and anticipation independently. Reveal only a committed
   result. Failure cancels previews; skip and dismissal never create a reroll.
6. Keep committed state separate from transient presentation. Ignore stale
   snapshots, and resynchronize before a new intent after an unresolved request.
7. Preserve accessible dismissal, focus, reduced motion, and failure feedback.

Adapt to the host game's economy and framework. Do not install an animation
library or replace its state architecture just to implement this flow.
End with the changed behavior, runnable checks, and any unverified UI cases.
