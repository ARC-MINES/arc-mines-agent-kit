# Implementation workflow

## 1. Trace the complete action

Find the trigger, all mutation callers, fetch wrapper, server parser, reward
selection, persistence, animation owner, and placement action. Record where
reward state lives and what survives reload. Inspect existing dialog, button,
toast, and reduced-motion primitives before creating replacements.

Deliver a short ownership map and list of affected files. Do not begin by
building an isolated animation that later dictates the protocol.

## 2. Establish the command boundary

Implement the [protocol](protocol.md) with a strict intent schema, server-owned
selection, monotonic revision, cooldown, and an atomic state-plus-receipt write.
Test a repeated request, changed body under the same ID, concurrent revision,
and a lost response before connecting any animation.

Keep first-roll guarantees and replacement/burn behavior explicit. If opening
replaces an unplaced item, show that consequence before activation. Do not add
a purchase, wallet interaction, or burn mechanic that the product did not ask for.

## 3. Connect presentation

Maintain committed snapshot, in-flight operation, and presentation separately.
The following are conceptual states; reuse the host's existing state primitives.

| State      | Entry                                       | Exit                                   | Allowed controls                 |
| ---------- | ------------------------------------------- | -------------------------------------- | -------------------------------- |
| Ready      | Current snapshot loaded                     | One accepted activation                | Open; existing inventory actions |
| Opening    | Guard acquired; request and preview started | Both finish, or request fails          | Dismiss; skip presentation       |
| Waiting    | Preview finished; request unresolved        | Result or bounded request failure      | Dismiss; no new mutation         |
| Landed     | Authoritative result available              | Place, dismiss, or next permitted open | Inspect; place if eligible       |
| Cooldown   | Server gate still active                    | Estimated server time reaches gate     | Dismiss; inspect                 |
| Recovering | Outcome ambiguous or session stale          | Fresh snapshot or explicit reconnect   | Reconnect; dismiss               |

Cooldown is a gate, not necessarily a separate screen. Dismissal only changes
visibility. Reopening an unresolved reveal must show its current operation.

Start fetch and anticipation together; await both without a second artificial
delay. After preview completion, use a stable waiting view instead of endless
rare-item cycling. Record response receipt time before waiting for animation
so applying a delayed snapshot does not start its clock late.

Abort timers and listeners on cleanup. Aborting fetch cannot undo a server
commit. A new mount must fetch current state before accepting another command.

## 4. Apply the interaction specification

Implement [micro-UX](micro-ux.md): reserved geometry, clear rarity and action
labels, input containment, recovery, and a complete reduced-motion path.
Keep preview names and transient frames out of live announcements.

Placement is a separate server command. Revalidate slots and price there, then
render the returned inventory and balance. Do not locally grant the ore on
`animationend`, dismiss, or optimistic placement.

## 5. Verify observable behavior

| Scenario                                     | Required observation                                   |
| -------------------------------------------- | ------------------------------------------------------ |
| Double click, Enter repeat, touch then click | One command ID; one reward                             |
| Response arrives before anticipation ends    | Result remains authoritative; one landing              |
| Response arrives after anticipation ends     | Stable waiting view; no fabricated landing             |
| Server commits, response is lost             | Exact retry returns the same reward                    |
| Same ID with changed body                    | Conflict; no second mutation                           |
| Another tab changes the save                 | Refresh from conflict snapshot; no silent new roll     |
| 429 / 401 / 5xx                              | Clear wait / reconnect / recovery action               |
| Dismiss or navigate during request           | No orphan timers; later sync recovers committed state  |
| Reduce motion before or during reveal        | No cycling or impact motion; result remains readable   |
| Keyboard, 320 px width, zoomed text          | Reachable controls; contained focus; no clipped result |
| Broken image or blocked storage              | Text result and opening still usable                   |

Run protocol tests in the repository's runner, then the actual UI in a browser.
Report separately what was automated and what was manually verified. A passing
model test does not establish a working focus trap or production persistence.
