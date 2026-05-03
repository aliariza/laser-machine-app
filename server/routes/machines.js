const express = require("express");
const ExcelJS = require("exceljs");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();
const pool = require("../db/postgres");

const upload = multer({ storage: multer.memoryStorage() });

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
  const value = String(id || "").trim();
  return /^\d+$/.test(value) || /^[a-fA-F0-9]{24}$/.test(value);
}

function mongoOid(value) {
  if (!value) return null;

  if (typeof value === "string") return value;

  if (typeof value === "object") {
    if (value.$oid) return value.$oid;
    if (value.toString && value.toString !== Object.prototype.toString) {
      return value.toString();
    }
  }

  return String(value);
}

function mapPower(row) {
  if (!row || !row.power_id) return null;

  return {
    _id: row.power_legacy_mongo_id || String(row.power_id),
    id: row.power_id,
    legacyMongoId: row.power_legacy_mongo_id,
    name: row.power_name,
    sortOrder: row.power_sort_order,
    isActive: row.power_is_active,
  };
}

function mapMachine(row) {
  const raw = row.raw_data || {};
  const power = mapPower(row);

  const machine = {
    ...raw,

    _id: row.legacy_mongo_id || String(row.id),
    id: row.id,
    legacyMongoId: row.legacy_mongo_id,

    powerId: power || raw.powerId || null,

    tableType: raw.tableType || "",
    machineType: row.category || raw.machineType || "",
    model: row.model || raw.model || "",
    title: row.title || raw.title || "",
    description: row.description || raw.description || "",
    image: row.image || raw.image || "",
    imagePath: raw.imagePath || row.image || "",

    specifications: Array.isArray(raw.specifications)
      ? raw.specifications
      : Array.isArray(raw.specs)
        ? raw.specs.map((spec) => ({
            key: spec.key || spec.label || "",
            value: spec.value || "",
          }))
        : [],

    isActive:
      typeof raw.isActive === "boolean"
        ? raw.isActive
        : row.is_published,

    isPublished: row.is_published,

    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };

  return machine;
}

async function getPowerById(powerId) {
  const result = await pool.query(
    `
    SELECT *
    FROM laser.powers
    WHERE id::text = $1 OR legacy_mongo_id = $1
    LIMIT 1
    `,
    [String(powerId)]
  );

  return result.rows[0] || null;
}

async function getPowerByName(name) {
  const result = await pool.query(
    `
    SELECT *
    FROM laser.powers
    WHERE name = $1
    LIMIT 1
    `,
    [normalizePowerName(name)]
  );

  return result.rows[0] || null;
}

async function createPowerByName(name) {
  const normalizedName = normalizePowerName(name);

  const result = await pool.query(
    `
    INSERT INTO laser.powers (
      name,
      sort_order,
      is_active,
      raw_data
    )
    VALUES ($1, 0, true, $2)
    ON CONFLICT (name)
    DO UPDATE SET
      updated_at = NOW()
    RETURNING *
    `,
    [
      normalizedName,
      JSON.stringify({
        name: normalizedName,
        sortOrder: 0,
        isActive: true,
      }),
    ]
  );

  return result.rows[0];
}

async function queryMachines({ ids = null, filters = {} } = {}) {
  const where = [];
  const params = [];

  if (ids && ids.length) {
    params.push(ids);
    where.push(`(m.id::text = ANY($${params.length}) OR m.legacy_mongo_id = ANY($${params.length}))`);
  }

  if (filters.powerId) {
    params.push(String(filters.powerId));
    where.push(`
      (
        m.raw_data->>'powerId' = $${params.length}
        OR m.raw_data #>> '{powerId,$oid}' = $${params.length}
      )
    `);
  }

  if (filters.tableType) {
    params.push(String(filters.tableType));
    where.push(`m.raw_data->>'tableType' = $${params.length}`);
  }

  if (filters.machineType) {
    params.push(String(filters.machineType));
    where.push(`(m.category = $${params.length} OR m.raw_data->>'machineType' = $${params.length})`);
  }

  if (filters.model) {
    params.push(`%${String(filters.model)}%`);
    where.push(`m.model ILIKE $${params.length}`);
  }

  const sql = `
    SELECT
      m.*,
      p.id AS power_id,
      p.legacy_mongo_id AS power_legacy_mongo_id,
      p.name AS power_name,
      p.sort_order AS power_sort_order,
      p.is_active AS power_is_active
    FROM laser.machines m
    LEFT JOIN laser.powers p
      ON p.legacy_mongo_id = COALESCE(
        m.raw_data #>> '{powerId,$oid}',
        m.raw_data->>'powerId'
      )
      OR p.id::text = COALESCE(
        m.raw_data #>> '{powerId,$oid}',
        m.raw_data->>'powerId'
      )
    ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
    ORDER BY m.created_at DESC, m.id DESC
  `;

  const result = await pool.query(sql, params);
  return result.rows.map(mapMachine);
}

async function getMachineById(id) {
  const machines = await queryMachines({ ids: [String(id)] });
  return machines[0] || null;
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
    rows.forEach((item, rowIndex) => {
      ws.mergeCells(`B${rowNo}:C${rowNo}`);
      ws.mergeCells(`D${rowNo}:E${rowNo}`);

      const nameCell = ws.getCell(`B${rowNo}`);
      const valueCell = ws.getCell(`D${rowNo}`);
      const midLeftCell = ws.getCell(`C${rowNo}`);
      const midRightCell = ws.getCell(`E${rowNo}`);
      const isEvenRow = rowIndex % 2 === 0;

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

    const machines = await queryMachines({
      filters: { powerId, tableType, machineType, model },
    });

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

    const invalidMachineId = machineIds.find((id) => !isValidMachineId(id));
    if (invalidMachineId) {
      return res.status(400).json({ message: "Seçimde geçersiz makine kimliği var" });
    }

    const machines = await queryMachines({
      ids: machineIds.map(String),
    });

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

    const machines = await queryMachines({ ids: machineIds });

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

    const machine = await getMachineById(req.params.id);

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
    const machines = await queryMachines();

    const specKeys = [
      ...new Set(
        machines.flatMap((machine) =>
          Array.isArray(machine.specifications)
            ? machine.specifications.map((spec) => spec.key)
            : []
        )
      ),
    ].filter(Boolean);

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

      const power = await createPowerByName(rowData["Güç"]);

      const specifications = Object.keys(rowData)
        .filter(
          (key) => !["Güç", "Tabla Tipi", "Makine Tipi", "Model", "Aktif"].includes(key)
        )
        .filter((key) => rowData[key])
        .map((key) => ({ key, value: rowData[key] }));

      const rawData = {
        powerId: String(power.id),
        tableType: rowData["Tabla Tipi"],
        machineType: rowData["Makine Tipi"],
        model: rowData["Model"],
        specifications,
        isActive: rowData["Aktif"] ? rowData["Aktif"].toLowerCase() === "evet" : true,
      };

      const result = await pool.query(
        `
        INSERT INTO laser.machines (
          category,
          model,
          title,
          is_published,
          raw_data
        )
        VALUES ($1,$2,$3,$4,$5)
        RETURNING id
        `,
        [
          rawData.machineType,
          rawData.model,
          rawData.model,
          rawData.isActive,
          JSON.stringify(rawData),
        ]
      );

      const machine = await getMachineById(String(result.rows[0].id));
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

    const machine = await getMachineById(req.params.id);

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

    const power = await getPowerById(powerId);

    if (!power) {
      return res.status(400).json({ message: "Geçersiz powerId" });
    }

    const cleanSpecs = normalizeSpecifications(specifications);

    const rawData = {
      powerId: power.legacy_mongo_id || String(power.id),
      tableType,
      machineType,
      model: String(model).trim(),
      imagePath: String(imagePath || "").trim(),
      specifications: cleanSpecs,
      isActive: typeof isActive === "boolean" ? isActive : true,
    };

    const result = await pool.query(
      `
      INSERT INTO laser.machines (
        category,
        model,
        title,
        image,
        is_published,
        raw_data
      )
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING id
      `,
      [
        rawData.machineType,
        rawData.model,
        rawData.model,
        rawData.imagePath,
        rawData.isActive,
        JSON.stringify(rawData),
      ]
    );

    const machine = await getMachineById(String(result.rows[0].id));
    res.status(201).json(machine);
  } catch (error) {
    res.status(500).json({ message: "Makine oluşturulamadı", error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    if (!isValidMachineId(req.params.id)) {
      return res.status(400).json({ message: "Geçersiz makine kimliği" });
    }

    const existing = await getMachineById(req.params.id);

    if (!existing) {
      return res.status(404).json({ message: "Makine bulunamadı" });
    }

    const { powerId, tableType, machineType, model, imagePath, specifications, isActive } = req.body;

    let power = null;

    if (powerId) {
      power = await getPowerById(powerId);

      if (!power) {
        return res.status(400).json({ message: "Geçersiz powerId" });
      }
    }

    const rawData = {
      ...(existing.raw_data || {}),
      ...(existing || {}),
      powerId: power ? power.legacy_mongo_id || String(power.id) : mongoOid(existing.powerId?._id || existing.powerId),
      tableType,
      machineType,
      model: model ? String(model).trim() : existing.model,
      imagePath: String(imagePath || "").trim(),
      specifications: normalizeSpecifications(specifications),
      isActive: typeof isActive === "boolean" ? isActive : true,
    };

    delete rawData.id;
    delete rawData.legacyMongoId;

    const result = await pool.query(
      `
      UPDATE laser.machines
      SET
        category = $1,
        model = $2,
        title = $3,
        image = $4,
        is_published = $5,
        raw_data = $6,
        updated_at = NOW()
      WHERE id::text = $7 OR legacy_mongo_id = $7
      RETURNING id
      `,
      [
        rawData.machineType,
        rawData.model,
        rawData.model,
        rawData.imagePath,
        rawData.isActive,
        JSON.stringify(rawData),
        String(req.params.id),
      ]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Makine bulunamadı" });
    }

    const machine = await getMachineById(String(result.rows[0].id));
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

    const result = await pool.query(
      `
      DELETE FROM laser.machines
      WHERE id::text = $1 OR legacy_mongo_id = $1
      RETURNING id
      `,
      [String(req.params.id)]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Makine bulunamadı" });
    }

    res.json({ message: "Makine başarıyla silindi" });
  } catch (error) {
    res.status(500).json({ message: "Makine silinemedi", error: error.message });
  }
});

module.exports = router;
