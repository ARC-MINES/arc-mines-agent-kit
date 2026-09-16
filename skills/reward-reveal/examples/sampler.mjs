// Compile once per server isolate. Luck belongs to server state, not a request.
export function compileLoot(entries) {
  if (!Array.isArray(entries) || entries.length === 0) {
    throw new TypeError("Expected a non-empty loot table")
  }
  let base = 0
  let bias = 0
  const ids = new Set()
  return Object.freeze(
    entries.map(({ id, weight, luckBias = 0 }) => {
      if (
        typeof id !== "string" ||
        !id ||
        ids.has(id) ||
        !Number.isFinite(weight) ||
        weight <= 0 ||
        !Number.isFinite(luckBias) ||
        luckBias < 0
      )
        throw new TypeError("Invalid loot entry")
      ids.add(id)
      base += weight
      bias += weight * luckBias
      if (!Number.isFinite(base) || !Number.isFinite(bias)) {
        throw new RangeError("Loot table overflow")
      }
      return Object.freeze({ id, base, bias })
    })
  )
}

// Prefixes exploit linear weights: w_i(luck) = weight_i * (1 + luck * bias_i).
export function pickOre(table, luck, unit) {
  if (
    !Number.isFinite(luck) ||
    luck < 0 ||
    !Number.isFinite(unit) ||
    unit < 0 ||
    unit >= 1
  ) {
    throw new RangeError("Expected non-negative luck and a draw in [0, 1)")
  }
  const last = table[table.length - 1]
  const total = last.base + luck * last.bias
  if (!Number.isFinite(total)) throw new RangeError("Luck weight overflow")
  const ticket = unit * total
  let low = 0
  let high = table.length - 1
  while (low < high) {
    const mid = (low + high) >>> 1
    const row = table[mid]
    if (ticket < row.base + luck * row.bias) high = mid
    else low = mid + 1
  }
  return table[low].id
}
