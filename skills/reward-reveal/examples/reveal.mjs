import { randomInt } from "node:crypto"

// Illustrative weights, not the Arc Mines drop table.
const drops = ["stone", "coal", "quartz"]
const weights = [6, 3, 1]
const cooldownMs = 1500
const receiptLimit = 16
const uuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function createPlayer() {
  return {
    revision: 0,
    rolls: 0,
    drop: null,
    nextRollAt: 0,
    receipts: new Map(),
  }
}

function hasKeys(value, keys) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.keys(value).sort().join() === keys
  )
}

function validCommand(command) {
  return (
    hasKeys(command, "action,id,revision") &&
    typeof command.id === "string" &&
    uuid.test(command.id) &&
    Number.isSafeInteger(command.revision) &&
    command.revision >= 0 &&
    hasKeys(command.action, "type") &&
    command.action.type === "roll"
  )
}

export function readPlayer(player, now) {
  const { revision, rolls, drop, nextRollAt } = player
  return { revision, rolls, drop, nextRollAt, serverTime: now }
}

// Server-only reference: execute as one serialized player operation.
// ponytail: state and receipts live in memory; use a storage transaction to deploy.
export function openReward(player, command, now, draw = randomInt) {
  if (!Number.isSafeInteger(now) || now < 0) {
    throw new RangeError("Server time must be a non-negative safe integer")
  }
  if (!validCommand(command)) {
    return { status: 400, body: { error: "Invalid command" } }
  }
  const receipt = player.receipts.get(command.id)
  if (receipt) {
    // Schema permits one action only; revision completes the original intent.
    return receipt.revision === command.revision
      ? structuredClone(receipt.reply)
      : { status: 409, body: { error: "Request ID already used" } }
  }
  if (command.revision !== player.revision) {
    return {
      status: 409,
      body: { error: "Stale revision", snapshot: readPlayer(player, now) },
    }
  }
  if (now < player.nextRollAt) {
    return {
      status: 429,
      body: {
        error: "Roll cooling down",
        retryAfterMs: player.nextRollAt - now,
        snapshot: readPlayer(player, now),
      },
    }
  }
  const ticket = draw(weights.reduce((sum, weight) => sum + weight, 0))
  if (!Number.isInteger(ticket) || ticket < 0 || ticket >= 10) {
    throw new RangeError("Draw must return an integer in [0, 10)")
  }
  let boundary = 0
  const drop =
    drops[weights.findIndex((weight) => (boundary += weight) > ticket)]
  player.drop = drop
  player.rolls += 1
  player.revision += 1
  player.nextRollAt = now + cooldownMs
  const reply = { status: 200, body: { snapshot: readPlayer(player, now) } }
  player.receipts.set(command.id, {
    revision: command.revision,
    reply: structuredClone(reply),
  })
  if (player.receipts.size > receiptLimit) {
    player.receipts.delete(player.receipts.keys().next().value)
  }
  return reply
}
