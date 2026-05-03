require('dotenv').config()
const pool = require('../../db/postgres')

async function createPowersTable() {
  await pool.query(`
    CREATE SCHEMA IF NOT EXISTS laser;
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS laser.powers (
      id SERIAL PRIMARY KEY,
      legacy_mongo_id TEXT UNIQUE,
      name TEXT NOT NULL UNIQUE,
      sort_order INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      raw_data JSONB,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `)

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_laser_powers_name
    ON laser.powers(name);
  `)

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_laser_powers_sort_order
    ON laser.powers(sort_order);
  `)

  console.log('laser.powers table created successfully.')

  await pool.end()
}

createPowersTable().catch((error) => {
  console.error(error)
  process.exit(1)
})
