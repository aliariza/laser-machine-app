const express = require("express");
const router = express.Router();
const Power = require("../models/Power");
const Machine = require("../models/Machine");

router.get("/", async (req, res) => {
  try {
    const powers = await Power.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });
    res.json(powers);
  } catch (error) {
    res.status(500).json({ message: "Güç listesi alınamadı", error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, sortOrder } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Güç adı zorunludur" });
    }

    const normalizedName = name.trim().toUpperCase();

    const existing = await Power.findOne({ name: normalizedName });
    if (existing) {
      return res.status(409).json({ message: "Bu güç zaten mevcut" });
    }

    const power = await Power.create({
      name: normalizedName,
      sortOrder: Number(sortOrder) || 0,
    });

    res.status(201).json(power);
  } catch (error) {
    res.status(500).json({ message: "Güç oluşturulamadı", error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const powerId = req.params.id;

    const machineCount = await Machine.countDocuments({ powerId });
    if (machineCount > 0) {
      return res.status(400).json({
        message: "Bu güç mevcut makinelerde kullanıldığı için silinemez",
      });
    }

    const deletedPower = await Power.findByIdAndDelete(powerId);

    if (!deletedPower) {
      return res.status(404).json({ message: "Güç bulunamadı" });
    }

    res.json({ message: "Güç başarıyla silindi" });
  } catch (error) {
    res.status(500).json({ message: "Güç silinemedi", error: error.message });
  }
});

module.exports = router;
