# Connection to Arc Mines

Arc Mines is the game that motivated
this kit. This is a separate companion project, not a mirror of its source.
The notes below were derived from the game's local working tree on 2026-09-16;
they do not assert that every observed change is deployed.

| Observed area        | Relevant source in the game                                  | Pattern carried into this kit                                                  |
| -------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| Server-selected ore  | `src/server/loot.ts`, `src/server/game.ts`                   | Client sends roll intent; server chooses results and enforces cooldown         |
| Command receipts     | `src/server/player.ts`                                       | Exact request replay, revision checking, bounded receipt history               |
| Client orchestration | `src/ui/mine/api-client.ts`, `src/ui/mine/game-provider.tsx` | Same-command retry, parallel anticipation and request, reconciliation          |
| Reveal presentation  | `src/ui/mine/mine-game.tsx`, `src/styles.css`                | Dedicated reveal layer, rarity text, reserved action space, landing emphasis   |
| Shared mining clock  | `src/game/mining.ts`, `src/server/game.ts`                   | Contact-triggered income, 40 ms ticks, 30 s activity lease and payout forecast |
| Ore feedback         | `src/ui/mine/ore-stub.tsx`                                   | Damage fragments, contact nonce, regrowth, sprite contact alignment            |

## Deliberate differences

The game has a larger ore catalog, multiple pedestals, placement rules, and
persistent per-player storage. The command reference isolates replay and
revision semantics with three illustrative rewards. The separate sampler
demonstrates luck-dependent prefix sums without publishing the game's table.
Example weights are illustrative, not game odds.

The game currently uses a 16-frame preview, roughly 1.2 s of anticipation,
280 ms of impact feedback, and a 1.5 s server roll cooldown. The UX specification
uses these as a starting point and adds recommended acceptance criteria.

Full focus containment and restoration, a reduced-motion path that bypasses
preview cycling, explicit preview disclosure, and all documented failure
scenarios are recommendations to verify during integration. They are not
presented as completed features of the current game.

The mine clock and ore-fragment rendering provide integration context for what
happens after placement. The current kit is scoped to opening and its handoff
to placement; it does not implement or rebalance the downstream mining economy.

## What the checks establish

Local tests establish the behavior of the included reference models. They do
not verify deployment, authentication, a real storage transaction, browser
accessibility, the live drop table, or a token contract. No private game source
or artwork is required to run this repository.
