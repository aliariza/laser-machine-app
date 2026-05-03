require('dotenv').config()

const fs = require('fs')
const path = require('path')
const pool = require('../../db/postgres')

function mongoValue(value) {
  if (value && typeof value === 'object') {
    if (value.$oid) return value.$oid
    if (value.$numberInt) return Number(value.$numberInt)
    if (value.$numberLong) return Number(value.$numberLong)
    if (value.$numberDouble) return Number(value.$numberDouble)
    if (value.$numberDecimal) return Number(value.$numberDecimal)
    if (value.$date) return value.$date
  }

  return value
}

function normalizePower(power) {
  const legacyMongoId = mongoValue(power._id)

  return {
    legacyMongoId,
    name: String(power.name || '').trim().toUpperCase(),
    sortOrder: Number(mongoValue(power.sortOrder)) || 0,
    isActive:
      typeof power.isActive === 'boolean'
        ? power.isActive
        : true,
    rawData: power
  }
}

async function importPowers() {
  const filePath = path.join(__dirname, '../mongo-export/powers.json')

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`)
  }

  const raw = fs.readFileSync(filePath, 'utf8')
  const powers = JSON.parse(raw)

  if (!Array.isArray(powers)) {
    throw new Error('powers.json must contain a JSON array')
  }

  let imported = 0

  for (const power of powers) {
    const normalized = normalizePower(power)

    if (!normalized.name) {
      continue
    }

    await pool.query(
      `
      INSERT INTO laser.powers (
        legacy_mongo_id,
        name,
        sort_order,
        is_active,
        raw_data
      )
      VALUES ($1,$2,$3,$4,$5)
      ON CONFLICT (name)
      DO UPDATE SET
        legacy_mongo_id = EXCLUDED.legacy_mongo_id,
        sort_order = EXCLUDED.sort_order,
        is_active = EXCLUDED.is_active,
        raw_data = EXCLUDED.raw_data,
        updated_at = NOW()
      `,
      [
        normalized.legacyMongoId,
        normalized.name,
        normalized.sortOrder,
        normalized.isActive,
        JSON.stringify(normalized.rawData)
      ]
    )

    imported++
  }

  console.log(`Imported ${imported} powers into PostgreSQL.`)

  await pool.end()
}

importPowers().catch((error) => {
  console.error(error)
  process.exit(1)
})
