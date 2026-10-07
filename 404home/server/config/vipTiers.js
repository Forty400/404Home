/** vip_level → 档位额度（分）与累充阈值（分）。阈值 = 档位额度（D7） */
const VIP_TIERS = [
  { level: 0, name: 'normal', cap_cents: 300, threshold_cents: 0 },
  { level: 1, name: 'vip1', cap_cents: 1000, threshold_cents: 1000 },
  { level: 2, name: 'vip2', cap_cents: 2000, threshold_cents: 2000 },
  { level: 10, name: 'vip10', cap_cents: 10000, threshold_cents: 10000 }
]

function tierByLevel(level) {
  const sorted = [...VIP_TIERS].sort((a, b) => a.level - b.level)
  let current = sorted[0]
  for (const t of sorted) {
    if (t.level <= level) current = t
  }
  return current
}

function levelForCumulative(cents) {
  const sorted = [...VIP_TIERS].sort((a, b) => a.level - b.level)
  let level = 0
  for (const t of sorted) {
    if (cents >= t.threshold_cents) level = t.level
  }
  return level
}

module.exports = { VIP_TIERS, tierByLevel, levelForCumulative }
