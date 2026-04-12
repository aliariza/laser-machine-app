const express = require("express");
const cors = require("cors");

const powerRoutes = require("./routes/powers");
const machineRoutes = require("./routes/machines");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/api/powers", powerRoutes);
app.use("/api/machines", machineRoutes);

module.exports = app;