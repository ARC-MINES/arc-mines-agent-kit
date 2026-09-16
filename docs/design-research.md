# Comparative mechanism research

This kit includes a desk review of first-party product descriptions and game
documentation, conducted on 2026-09-16. We examined Bonanza, Sweet Bonanza, and
Ponzi Land as three distinct references for staged outcomes, resolution
boundaries, and persistent economic state. This was a documentation study,
not an instrumented playtest, operator interview, or retention experiment.

## Bonanza: cascading resolution and outcome hierarchy

Big Time Gaming describes Bonanza through its Megaways system and cascading
symbols, with a gold-mine presentation and win-effect lighting. The documented
mechanism resolves a spin through multiple visible changes rather than one
instantaneous replacement. [First-party product description](https://www.bigtimegaming.com/games/bonanza).

**Our design inference:** an outcome can be legible as a sequence of states:
activation, anticipation, stabilization, and final emphasis. For Arc Mines,
this becomes a bounded ore preview followed by one stable reward identity.
Rarity treatment increases visual emphasis without altering the authoritative
result or changing layout dimensions.

**Implementation translation:** request and presentation run concurrently.
Preview completion is a presentation barrier, not a settlement trigger. Once
the result is known and anticipation finishes, reveal the item and its action
surface together. A slow server transitions to a neutral waiting state rather
than an indefinitely escalating sequence.

We do not reproduce Megaways mathematics, reel topology, symbols, or branding.
The reference informs sequencing and hierarchy, not Arc Mines reward odds.

## Sweet Bonanza: sequence completion before aggregate presentation

Pragmatic Play documents tumbling symbols and bonus multipliers whose values
are combined at the end of the tumbling sequence. That documented distinction
between intermediate activity and final aggregation is relevant to result
presentation. [First-party product description](https://www.pragmaticplay.com/en/games/sweet-bonanza-slot/).

**Our design inference:** the UI must distinguish transient visual candidates
from the value the player can actually act on. A vivid intermediate state
should not accidentally become the inventory identity, displayed purchase
price, or accessible announcement.

**Implementation translation:** preview art is transient data. Committed ore,
rarity, income, and price arrive from the authoritative snapshot. Placement
remains unavailable while those values are unresolved. The final announcement
occurs once; screen readers do not narrate every decorative frame.

This is a presentation analogy. Arc Mines ore opening does not inherit Sweet
Bonanza's tumble evaluation, bonus multipliers, or wagering rules.

## Ponzi Land: persistent obligations and explicit transaction boundaries

Ponzi Land's documentation describes land acquisition, required resale
listings, neighboring tax flows, explicit claiming, and loss of land when
staked funds run out. It is an economic strategy reference, not a slot or an
ore-opening system. [First-party mechanics overview](https://docs.ponzi.land/docs/getting-started/).

**Our design inference:** economic consequences should be represented as
inspectable state transitions with distinct user actions. A presentation event
must not masquerade as a claim, ownership transfer, or completed settlement.

**Implementation translation:** opening and placement are separate commands.
The server checks eligibility and records a receipt. Reopening a result panel
does not acquire a second item. A lost response is resolved by replay or
reconciliation, and destructive replacement is explained before activation.

We use the exact title Ponzi Land rather than treating “Ponzi” as an engineering
category. Arc Mines does not adopt its tax model or imply the same on-chain
execution architecture.

## Synthesis: the ore-opening contract

| Research dimension                 | Arc Mines design decision                              | Verification artifact                       |
| ---------------------------------- | ------------------------------------------------------ | ------------------------------------------- |
| Sequential outcome presentation    | Bounded anticipation followed by stable landing        | Timing and slow-response browser check      |
| Intermediate versus final identity | Cosmetic previews cannot set reward, price, or balance | Command-schema and snapshot checks          |
| Persistent economic consequences   | Distinct opening and placement intents                 | Revision and eligibility tests              |
| Resolution uncertainty             | Same-intent replay, then reconciliation                | Lost-response regression test               |
| Visual hierarchy                   | Rarity text plus restrained local emphasis             | Reduced-motion, contrast, and mobile review |
| Interactive responsiveness         | Start transport and presentation together              | Request/reveal timing trace                 |

The studies above motivate design decisions; the tests in this repository
establish only the behavior of its reference code. Claims about conversion,
retention, fairness, or production capacity require separate evidence.
