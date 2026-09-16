# Reveal micro-UX specification

These are implementation targets. Timing values are starting points, not
requirements to force onto every game.

## Timing and presentation

| Moment          | Starting value                          | Behavior                                                    |
| --------------- | --------------------------------------- | ----------------------------------------------------------- |
| Press           | Immediate                               | Native button feedback; acquire guard; expose busy state    |
| Anticipation    | About 1,200 ms                          | Cosmetic preview; request runs concurrently                 |
| Preview cadence | 16 frames                               | Delay after frame n: `32 + (n / 16)^3 * 190` ms for n=1..15 |
| Slow response   | After anticipation                      | Hold a neutral waiting state until result or failure        |
| Landing         | 180 ms reveal, up to 280 ms impact      | Name and rarity appear with the committed item              |
| Cooldown        | Server-provided; game baseline 1,500 ms | Separate from animation; never restart on render            |

The 15 cadence delays total about 1,147 ms; the remaining hold brings the
reference anticipation to about 1,200 ms. Frame pacing is decorative. Never
delay committing state to line up with a CSS event.

Preview items must be identifiable as previews and must not imply drop odds.
Avoid curated near-miss sequences or fabricated probability labels. Keep the
committed drop visible long enough to read; do not auto-dismiss rare results.

## Layout and visual hierarchy

- Reserve art, name, rarity, income, and action space before fetching. Hide
  unknown values without collapsing their boxes. Long names wrap cleanly.
- Center one result at a comfortable width, around 16rem. Multiple results wrap
  or scroll within the reveal layer; keep actions reachable on short screens.
- Use a neutral backdrop to isolate the result. Place decorative rarity rays
  behind the item, with `pointer-events: none` and `aria-hidden="true"`.
- Use both rarity text and color. Test muted/common text contrast as carefully
  as high-rarity colors. Do not flash or shake the entire viewport.
- Provide a text fallback for missing art. Preload only assets that avoid a
  visible reveal failure; do not block the request on loading the entire catalog.
- Keep numbers tabular. Show actual income and price only for the committed
  result; previews show placeholders. Label the action for its real effect,
  such as `Place free` or `Buy & place · 120`, instead of an ambiguous `Claim`.
- Explain unavailable placement: no slot, insufficient funds, or pending sync.
  A disabled button without a reason leaves the player guessing.

## Input and focus

Prefer an existing accessible dialog or native modal dialog for a modal reveal.
Make background interactions inert, contain focus, label the layer, provide a
visible close button, and return focus to the trigger on dismissal. If that
trigger disappeared, choose the next meaningful control. Keep the close control
reachable during pending requests. Use comfortable targets of at least 44px.

Escape and explicit close dismiss presentation. Backdrop clicks can dismiss
when they start and end on the backdrop; dragging from content must not close
it. If the game keeps a roll toolbar active outside the layer, implement a
deliberate nonmodal focus model rather than adding an incorrect `aria-modal`.

Native button semantics cover Enter and Space. Do not register a global shortcut
that also fires while typing or while a nested dialog owns focus.

Use one polite status announcement for opening and one for the final item and
rarity. Keep cycling art decorative. Expose errors as readable inline text with
a recovery control; a transient toast alone is insufficient.

## Reduced motion and skip

Read `prefers-reduced-motion` in both CSS and the animation orchestrator. Skip
frame cycling, translation, scaling, particles, and rays animation. Show a static
waiting state while the request runs, then reveal its result immediately.
React to a setting change mid-reveal by completing presentation, not by starting
a new request. A skip control follows the same rule. Audio, if present, remains
optional and never carries information unavailable in text.

## Lifecycle and edge cases

Cancel preview timers, animation callbacks, and listeners on teardown. Mark old
operations so their callbacks cannot update a newer reveal. After tab suspension,
sync state and land the current result; do not replay a backlog of previews.

Dismiss a one-time tutorial hint after actual activation. Storage failure must
not block play; authoritative progress can supply the fallback. If a roll
replaces an unplaced item, explain replacement before the next press. On a
definite failure, restore the previous committed drop and show the error.
On an ambiguous failure, enter recovery rather than inventing a result.
