require('dotenv').config()
const pool = require('../../db/postgres')

async function createTables() {
  await pool.query(`
    CREATE SCHEMA IF NOT EXISTS laser;
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS laser.machines (
      id SERIAL PRIMARY KEY,
      legacy_mongo_id TEXT UNIQUE,
      category TEXT,
      brand TEXT,
      family TEXT,
      series TEXT,
      model TEXT,
      title TEXT,
      description TEXT,
      image TEXT,
      is_published BOOLEAN DEFAULT true,
      raw_data JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `)

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_laser_machines_category
    ON laser.machines(category);
  `)

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_laser_machines_series
    ON laser.machines(series);
  `)

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_laser_machines_model
    ON laser.machines(model);
  `)

  console.log('PostgreSQL tables created successfully.')

  await pool.end()
}

createTables().catch((error) => {
  console.error(error)
  process.exit(1)
})