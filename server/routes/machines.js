const express = require("express");
const ExcelJS = require("exceljs");
const multer = require("multer");
const router = express.Router();

const Machine = require("../models/Machine");
const Power = require("../models/Power");

const upload = multer({ storage: multer.memoryStorage() });

const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");

function normalizeSpecifications(specifications) {
  if (!Array.isArray(specifications)) return [];

  return specifications
    .filter((item) => item && String(item.key || "").trim() && String(item.value || "").trim())
    .map((item) => ({
      key: String(item.key).trim(),
      value: String(item.value).trim(),
    }));
}

function normalizePowerName(name) {
  return String(name || "").trim().toUpperCase();
}

function isValidMachineId(id) {
  return mongoose.isValidObjectId(id);
}

async function exportMachinesWorkbook(res, machines) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Laser Machine App";
  workbook.created = new Date();

  const makeBorder = (style = "thin") => ({
    top: { style },
    left: { style },
    bottom: { style },
    right: { style },
  });

  for (let index = 0; index < machines.length; index += 1) {
    const machine = machines[index];

    const safeSheetName = `${machine.model || "Machine"}_${index + 1}`
      .replace(/[\\/*?:[\]]/g, "")
      .slice(0, 31);

    const ws = workbook.addWorksheet(safeSheetName, {
      views: [{ showGridLines: false }],
    });

    ws.pageSetup = {
      paperSize: 9,
      orientation: "portrait",
      scale: 100,
      fitToPage: false,
      printTitlesRow: "5:5",
      margins: {
        left: 0.3,
        right: 0.3,
        top: 0.4,
        bottom: 0.4,
        header: 0.2,
        footer: 0.2,
      },
    };
    ws.headerFooter = {
      differentOddEven: false,
      differentFirst: false,
      oddFooter: "&LTumex Ltd. Şti.&RSayfa &P / &N",
    };

    ws.columns = [
      { width: 4 },
      { width: 22 },
      { width: 18 },
      { width: 22 },
      { width: 24 },
      { width: 4 },
    ];

    const center = { vertical: "middle", horizontal: "center", wrapText: true };

    ws.mergeCells("B2:E3");
    const titleCell = ws.getCell("B2");

    const dynamicTitleParts = [
      machine.powerId?.name || "",
      machine.model || "",
      "TEKNİK ÖZELLİKLER",
    ].filter(Boolean);

    titleCell.value = dynamicTitleParts.join(" ");
    titleCell.font = { name: "Mulish", bold: true, size: 18 };
    titleCell.alignment = center;
    titleCell.border = makeBorder("medium");
    titleCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE7E7E7" },
    };

    ws.mergeCells("B5:C5");
    ws.mergeCells("D5:E5");

    const leftHeader = ws.getCell("B5");
    leftHeader.value = "ÖZELLİKLER";
    leftHeader.font = {
      name: "Verdana",
      bold: true,
      size: 14,
    };
    leftHeader.alignment = center;
    leftHeader.border = makeBorder("thin");
    leftHeader.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFFFFFF" },
    };

    const rightHeader = ws.getCell("D5");
    rightHeader.value = "DEĞERLER";
    rightHeader.font = { name: "Verdana", bold: true, size: 14 };
    rightHeader.alignment = center;
    rightHeader.border = makeBorder("thin");
    rightHeader.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFFFFFF" },
    };

    ws.getCell("C5").border = makeBorder("thin");
    ws.getCell("E5").border = makeBorder("thin");
    ws.getRow(5).height = 35;

    ws.mergeCells("B6:E11");
    for (let r = 6; r <= 11; r += 1) {
      ws.getRow(r).height = 25;
    }

    const imageCell = ws.getCell("B6");
    imageCell.value = machine.model || "";
    imageCell.font = { bold: true, size: 13 };
    imageCell.alignment = { vertical: "top", horizontal: "center", wrapText: true };
    imageCell.border = makeBorder("thin");
    imageCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFFFFFF" },
    };

    if (machine.imagePath) {
      const absoluteImagePath = path.join(__dirname, "..", machine.imagePath);

      if (fs.existsSync(absoluteImagePath)) {
        const extension = path.extname(absoluteImagePath).replace(".", "").toLowerCase();

        if (["png", "jpg", "jpeg"].includes(extension)) {
          const imageId = workbook.addImage({
            filename: absoluteImagePath,
            extension: extension === "jpg" ? "jpeg" : extension,
          });

          ws.addImage(imageId, {
            tl: { col: 2.1, row: 6.1 },
            ext: { width: 300, height: 150 },
          });
        }
      }
    }

    const rows = [
      { name: "Güç", value: machine.powerId?.name || "" },
      { name: "Tabla Tipi", value: machine.tableType || "" },
      { name: "Makine Tipi", value: machine.machineType || "" },
      { name: "Model", value: machine.model || "" },
      ...machine.specifications.map((spec) => ({
        name: spec.key || "",
        value: spec.value || "",
      })),
    ];

    let rowNo = 12;
    rows.forEach((item, index) => {
      ws.mergeCells(`B${rowNo}:C${rowNo}`);
      ws.mergeCells(`D${rowNo}:E${rowNo}`);

      const nameCell = ws.getCell(`B${rowNo}`);
      const valueCell = ws.getCell(`D${rowNo}`);
      const midLeftCell = ws.getCell(`C${rowNo}`);
      const midRightCell = ws.getCell(`E${rowNo}`);
      const isEvenRow = index % 2 === 0;

      nameCell.value = item.name;
      valueCell.value = item.value;

      nameCell.font = {
        name: "Trebuchet MS",
        size: 14,
        bold: true,
      };

      valueCell.font = {
        name: "Trebuchet MS",
        size: 12,
        bold: false,
      };

      nameCell.alignment = center;
      valueCell.alignment = center;

      const rowFill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: isEvenRow ? "FFF2F2F2" : "FFFFFFFF" },
      };

      nameCell.fill = rowFill;
      valueCell.fill = rowFill;
      midLeftCell.fill = rowFill;
      midRightCell.fill = rowFill;

      nameCell.border = makeBorder("thin");
      valueCell.border = makeBorder("thin");
      midLeftCell.border = makeBorder("thin");
      midRightCell.border = makeBorder("thin");

      ws.getRow(rowNo).height = 30;

      rowNo += 1;
    });
  }

  const firstMachine = machines[0];

  const safePower = (firstMachine.powerId?.name || "")
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^\w.-]/g, "");

  const safeModel = (firstMachine.model || "")
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^\w.-]/g, "");

  const fileName = `${safePower}_${safeModel}_TEKNIK_OZELLIKLER.xlsx`;

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

  await workbook.xlsx.write(res);
  res.end();
}

router.get("/", async (req, res) => {
  try {
    const { powerId, tableType, machineType, model } = req.query;

    const filter = {};

    if (powerId) filter.powerId = powerId;
    if (tableType) filter.tableType = tableType;
    if (machineType) filter.machineType = machineType;
    if (model) filter.model = { $regex: model, $options: "i" };

    const machines = await Machine.find(filter)
      .populate("powerId")
      .sort({ createdAt: -1 });

    res.json(machines);
  } catch (error) {
    res.status(500).json({ message: "Makine listesi alınamadı", error: error.message });
  }
});

router.post("/export/excel/selected", async (req, res) => {
  try {
    const { machineIds } = req.body;

    if (!Array.isArray(machineIds) || machineIds.length === 0) {
      return res.status(400).json({ message: "Hiç makine seçilmedi" });
    }

    const machines = await Machine.find({ _id: { $in: machineIds } })
      .populate("powerId")
      .sort({ createdAt: -1 });

    if (!machines.length) {
      return res.status(404).json({ message: "Seçilen makineler bulunamadı" });
    }

    await exportMachinesWorkbook(res, machines);
  } catch (error) {
    res.status(500).json({
      message: "Seçilen makineler Excel'e aktarılamadı",
      error: error.message,
    });
  }
});

router.get("/export/excel/selected", async (req, res) => {
  try {
    const machineIds = String(req.query.machineIds || "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    if (!machineIds.length) {
      return res.status(400).json({ message: "Hiç makine seçilmedi" });
    }

    const invalidMachineId = machineIds.find((id) => !isValidMachineId(id));
    if (invalidMachineId) {
      return res.status(400).json({ message: "Seçimde geçersiz makine kimliği var" });
    }

    const machines = await Machine.find({ _id: { $in: machineIds } })
      .populate("powerId")
      .sort({ createdAt: -1 });

    if (!machines.length) {
      return res.status(404).json({ message: "Seçilen makineler bulunamadı" });
    }

    await exportMachinesWorkbook(res, machines);
  } catch (error) {
    res.status(500).json({
      message: "Seçilen makineler Excel'e aktarılamadı",
      error: error.message,
    });
  }
});

router.get("/export/excel/machine/:id", async (req, res) => {
  try {
    if (!isValidMachineId(req.params.id)) {
      return res.status(400).json({ message: "Geçersiz makine kimliği" });
    }

    const machine = await Machine.findById(req.params.id).populate("powerId");

    if (!machine) {
      return res.status(404).json({ message: "Makine bulunamadı" });
    }

    await exportMachinesWorkbook(res, [machine]);
  } catch (error) {
    res.status(500).json({ message: "Makine Excel'e aktarılamadı", error: error.message });
  }
});

router.get("/export/excel/all", async (req, res) => {
  try {
    const machines = await Machine.find().populate("powerId").sort({ createdAt: -1 });

    const specKeys = [...new Set(
      machines.flatMap((machine) => machine.specifications.map((spec) => spec.key))
    )];

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Machines");

    const baseColumns = [
      { header: "Güç", key: "power", width: 15 },
      { header: "Tabla Tipi", key: "tableType", width: 18 },
      { header: "Makine Tipi", key: "machineType", width: 15 },
      { header: "Model", key: "model", width: 25 },
      { header: "Aktif", key: "isActive", width: 10 },
    ];

    worksheet.columns = [
      ...baseColumns,
      ...specKeys.map((key) => ({ header: key, key, width: 20 })),
    ];

    machines.forEach((machine) => {
      const row = {
        power: machine.powerId?.name || "",
        tableType: machine.tableType,
        machineType: machine.machineType,
        model: machine.model,
        isActive: machine.isActive ? "Evet" : "Hayır",
      };

      machine.specifications.forEach((spec) => {
        row[spec.key] = spec.value;
      });

      worksheet.addRow(row);
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", 'attachment; filename="machines.xlsx"');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: "Excel dışa aktarımı başarısız oldu", error: error.message });
  }
});

router.post("/import/excel", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Excel dosyası zorunludur" });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      return res.status(400).json({ message: "Çalışma sayfası bulunamadı" });
    }

    const headers = [];
    worksheet.getRow(1).eachCell((cell, colNumber) => {
      headers[colNumber] = String(cell.value || "").trim();
    });

    const imported = [];

    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber += 1) {
      const row = worksheet.getRow(rowNumber);
      const rowData = {};

      headers.forEach((header, colNumber) => {
        if (!header) return;
        rowData[header] = row.getCell(colNumber).value?.toString?.().trim?.() || "";
      });

      if (!rowData["Güç"] || !rowData["Tabla Tipi"] || !rowData["Makine Tipi"] || !rowData["Model"]) {
        continue;
      }

      const normalizedPowerName = normalizePowerName(rowData["Güç"]);
      let power = await Power.findOne({ name: normalizedPowerName });
      if (!power) {
        power = await Power.create({ name: normalizedPowerName });
      }

      const specifications = Object.keys(rowData)
        .filter(
          (key) => !["Güç", "Tabla Tipi", "Makine Tipi", "Model", "Aktif"].includes(key)
        )
        .filter((key) => rowData[key])
        .map((key) => ({ key, value: rowData[key] }));

      const machine = await Machine.create({
        powerId: power._id,
        tableType: rowData["Tabla Tipi"],
        machineType: rowData["Makine Tipi"],
        model: rowData["Model"],
        specifications,
        isActive: rowData["Aktif"] ? rowData["Aktif"].toLowerCase() === "evet" : true,
      });

      imported.push(machine);
    }

    res.json({
      message: "Excel içe aktarma tamamlandı",
      importedCount: imported.length,
    });
  } catch (error) {
    res.status(500).json({ message: "Excel içe aktarılamadı", error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    if (!isValidMachineId(req.params.id)) {
      return res.status(400).json({ message: "Geçersiz makine kimliği" });
    }

    const machine = await Machine.findById(req.params.id).populate("powerId");

    if (!machine) {
      return res.status(404).json({ message: "Makine bulunamadı" });
    }

    res.json(machine);
  } catch (error) {
    res.status(500).json({ message: "Makine alınamadı", error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
const { powerId, tableType, machineType, model, imagePath, specifications, isActive } = req.body;

    if (!powerId || !tableType || !machineType || !model) {
      return res.status(400).json({ message: "powerId, tableType, machineType ve model zorunludur" });
    }

    const power = await Power.findById(powerId);
    if (!power) {
      return res.status(400).json({ message: "Geçersiz powerId" });
    }

    const machine = await Machine.create({
      powerId,
      tableType,
      machineType,
      model: String(model).trim(),
      imagePath: String(imagePath || "").trim(),
      specifications: normalizeSpecifications(specifications),
      isActive: typeof isActive === "boolean" ? isActive : true,
    });

    const populated = await Machine.findById(machine._id).populate("powerId");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Makine oluşturulamadı", error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    if (!isValidMachineId(req.params.id)) {
      return res.status(400).json({ message: "Geçersiz makine kimliği" });
    }

    const { powerId, tableType, machineType, model, imagePath, specifications, isActive } = req.body;

    const updateData = {
      powerId,
      tableType,
      machineType,
      model: model ? String(model).trim() : model,
      imagePath: String(imagePath || "").trim(),
      specifications: normalizeSpecifications(specifications),
      isActive,
    };

    const machine = await Machine.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate("powerId");

    if (!machine) {
      return res.status(404).json({ message: "Makine bulunamadı" });
    }

    res.json(machine);
  } catch (error) {
    res.status(500).json({ message: "Makine güncellenemedi", error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    if (!isValidMachineId(req.params.id)) {
      return res.status(400).json({ message: "Geçersiz makine kimliği" });
    }

    const machine = await Machine.findByIdAndDelete(req.params.id);

    if (!machine) {
      return res.status(404).json({ message: "Makine bulunamadı" });
    }

    res.json({ message: "Makine başarıyla silindi" });
  } catch (error) {
    res.status(500).json({ message: "Makine silinemedi", error: error.message });
  }
});

module.exports = router;
