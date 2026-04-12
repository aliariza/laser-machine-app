const mongoose = require("mongoose");

const specificationSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      trim: true,
    },
    value: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const machineSchema = new mongoose.Schema(
  {
    powerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Power",
      required: true,
    },
    tableType: {
      type: String,
      enum: ["Tek Tabla", "Çift Tabla"],
      required: true,
    },
    machineType: {
      type: String,
      enum: ["Açık Kasa", "Kapalı Kasa"],
      required: true,
    },
    model: {
      type: String,
      required: true,
      trim: true,
    },
    imagePath: {
      type: String,
      default: "",
    },

    specifications: {
      type: [specificationSchema],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Machine", machineSchema);