const express = require("express");
const router = express.Router();
const pool = require("../db/postgres");

function mapPower(row) {
  return {
    _id: row.legacy_mongo_id || String(row.id),
    id: row.id,
    legacyMongoId: row.legacy_mongo_id,
    name: row.name,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        legacy_mongo_id,
        name,
        sort_order,
        is_active,
        created_at,
        updated_at
      FROM laser.powers
      WHERE is_active = true
      ORDER BY sort_order ASC, name ASC
    `);

    res.json(result.rows.map(mapPower));
  } catch (error) {
    res.status(500).json({
      message: "Güç listesi alınamadı",
      error: error.message,
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, sortOrder } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Güç adı zorunludur" });
    }

    const normalizedName = name.trim().toUpperCase();

    const existing = await pool.query(
      `
      SELECT id
      FROM laser.powers
      WHERE name = $1
      LIMIT 1
      `,
      [normalizedName]
    );

    if (existing.rows.length) {
      return res.status(409).json({ message: "Bu güç zaten mevcut" });
    }

    const rawData = {
      name: normalizedName,
      sortOrder: Number(sortOrder) || 0,
      isActive: true,
    };

    const result = await pool.query(
      `
      INSERT INTO laser.powers (
        name,
        sort_order,
        is_active,
        raw_data
      )
      VALUES ($1,$2,$3,$4)
      RETURNING
        id,
        legacy_mongo_id,
        name,
        sort_order,
        is_active,
        created_at,
        updated_at
      `,
      [
        normalizedName,
        Number(sortOrder) || 0,
        true,
        JSON.stringify(rawData),
      ]
    );

    res.status(201).json(mapPower(result.rows[0]));
  } catch (error) {
    res.status(500).json({
      message: "Güç oluşturulamadı",
      error: error.message,
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const powerId = req.params.id;

    const powerResult = await pool.query(
      `
      SELECT *
      FROM laser.powers
      WHERE id::text = $1 OR legacy_mongo_id = $1
      LIMIT 1
      `,
      [powerId]
    );

    if (!powerResult.rows.length) {
      return res.status(404).json({ message: "Güç bulunamadı" });
    }

    const power = powerResult.rows[0];
    const postgresId = String(power.id);
    const legacyMongoId = power.legacy_mongo_id;

    const machineCountResult = await pool.query(
      `
      SELECT COUNT(*)::int AS count
      FROM laser.machines
      WHERE
        raw_data->>'powerId' = $1
        OR raw_data->>'powerId' = $2
        OR raw_data #>> '{powerId,$oid}' = $1
        OR raw_data #>> '{powerId,$oid}' = $2
      `,
      [legacyMongoId, postgresId]
    );

    if (machineCountResult.rows[0].count > 0) {
      return res.status(400).json({
        message: "Bu güç mevcut makinelerde kullanıldığı için silinemez",
      });
    }

    await pool.query(
      `
      DELETE FROM laser.powers
      WHERE id = $1
      `,
      [power.id]
    );

    res.json({ message: "Güç başarıyla silindi" });
  } catch (error) {
    res.status(500).json({
      message: "Güç silinemedi",
      error: error.message,
    });
  }
});

module.exports = router;
