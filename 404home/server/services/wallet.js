const { db } = require('../db')
const { tierByLevel, levelForCumulative } = require('../config/vipTiers')

function getUser(userId) {
  return db
    .prepare(
      `SELECT * FROM users WHERE id = ? AND status = 'active' AND (deleted_at IS NULL OR deleted_at = '')`
    )
    .get(userId)
}

function publicUser(row) {
  if (!row) return null
  return {
    id: row.id,
    email: row.email,
    vip_level: row.vip_level,
    balance_cents: row.balance_cents,
    balance_cap_cents: row.balance_cap_cents,
    cumulative_recharge_cents: row.cumulative_recharge_cents,
    status: row.status,
    created_at: row.created_at
  }
}

/** Deduct chat cost; never go below 0. Returns { user, charged_cents } */
function chargeChat(userId, costCents, refId) {
  const cost = Math.max(0, Math.floor(costCents))
  return db.transaction(() => {
    const user = getUser(userId)
    if (!user) {
      const err = new Error('用户不存在')
      err.status = 401
      err.code = 'USER_GONE'
      throw err
    }
    if (user.balance_cents <= 0) {
      const err = new Error('余额不足')
      err.status = 402
      err.code = 'INSUFFICIENT_BALANCE'
      throw err
    }
    const charged = Math.min(cost, user.balance_cents)
    const next = user.balance_cents - charged
    db.prepare('UPDATE users SET balance_cents = ? WHERE id = ?').run(next, userId)
    if (charged > 0) {
      db.prepare(
        `INSERT INTO wallet_ledger (user_id, delta_cents, reason, ref_id) VALUES (?, ?, 'chat', ?)`
      ).run(userId, -charged, refId || null)
    }
    return { user: getUser(userId), charged_cents: charged }
  })()
}

/**
 * Admin credit: adds to balance (capped), counts as cumulative recharge, may upgrade VIP (D7).
 */
function adminCredit(userId, amountCents) {
  const amount = Math.floor(amountCents)
  if (!Number.isFinite(amount) || amount <= 0) {
    const err = new Error('加额必须为正整数分')
    err.status = 400
    err.code = 'INVALID_AMOUNT'
    throw err
  }

  return db.transaction(() => {
    const user = getUser(userId)
    if (!user) {
      const err = new Error('用户不存在')
      err.status = 404
      err.code = 'USER_NOT_FOUND'
      throw err
    }

    const oldLevel = user.vip_level
    const oldTier = tierByLevel(oldLevel)
    const newCumulative = user.cumulative_recharge_cents + amount
    const newLevel = levelForCumulative(newCumulative)
    const newTier = tierByLevel(newLevel)

    let balance = user.balance_cents + amount
    let bonus = 0
    if (newLevel > oldLevel) {
      bonus = newTier.cap_cents - oldTier.cap_cents
      if (bonus > 0) balance += bonus
    }

    const cap = newTier.cap_cents
    if (balance > cap) balance = cap

    db.prepare(
      `UPDATE users SET
        balance_cents = ?,
        balance_cap_cents = ?,
        cumulative_recharge_cents = ?,
        vip_level = ?
       WHERE id = ?`
    ).run(balance, cap, newCumulative, newLevel, userId)

    db.prepare(
      `INSERT INTO wallet_ledger (user_id, delta_cents, reason, ref_id) VALUES (?, ?, 'admin', ?)`
    ).run(userId, amount, `admin_credit`)

    if (bonus > 0) {
      db.prepare(
        `INSERT INTO wallet_ledger (user_id, delta_cents, reason, ref_id) VALUES (?, ?, 'grant', ?)`
      ).run(userId, bonus, `vip_upgrade_${oldLevel}_to_${newLevel}`)
    }

    return {
      user: getUser(userId),
      credited_cents: amount,
      vip_bonus_cents: bonus,
      vip_level_from: oldLevel,
      vip_level_to: newLevel
    }
  })()
}

module.exports = { getUser, publicUser, chargeChat, adminCredit }
