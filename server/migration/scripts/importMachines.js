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

function normalizeMachine(machine) {
  const legacyMongoId = mongoValue(machine._id)

  return {
    legacyMongoId,
    category: machine.category || machine.machineType || 'laser-cutting',
    brand: machine.brand || null,
    family: machine.family || null,
    series: machine.series || null,
    model: machine.model || machine.name || null,
    title: machine.title || machine.name || machine.model || null,
    description: machine.description || null,
    image: machine.image || null,
    isPublished:
      typeof machine.isPublished === 'boolean'
        ? machine.isPublished
        : true,
    rawData: machine
  }
}

async function importMachines() {
  const filePath = path.join(__dirname, '../mongo-export/machines.json')

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`)
  }

  const raw = fs.readFileSync(filePath, 'utf8')
  const machines = JSON.parse(raw)

  if (!Array.isArray(machines)) {
    throw new Error('machines.json must contain a JSON array')
  }

  let imported = 0

  for (const machine of machines) {
    const normalized = normalizeMachine(machine)

    await pool.query(
      `
      INSERT INTO laser.machines (
        legacy_mongo_id,
        category,
        brand,
        family,
        series,
        model,
        title,
        description,
        image,
        is_published,
        raw_data
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      ON CONFLICT (legacy_mongo_id)
      DO UPDATE SET
        category = EXCLUDED.category,
        brand = EXCLUDED.brand,
        family = EXCLUDED.family,
        series = EXCLUDED.series,
        model = EXCLUDED.model,
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        image = EXCLUDED.image,
        is_published = EXCLUDED.is_published,
        raw_data = EXCLUDED.raw_data,
        updated_at = NOW()
      `,
      [
        normalized.legacyMongoId,
        normalized.category,
        normalized.brand,
        normalized.family,
        normalized.series,
        normalized.model,
        normalized.title,
        normalized.description,
        normalized.image,
        normalized.isPublished,
        JSON.stringify(normalized.rawData)
      ]
    )

    imported++
  }

  console.log(`Imported ${imported} machines into PostgreSQL.`)

  await pool.end()
}

importMachines().catch((error) => {
  console.error(error)
  process.exit(1)
})
