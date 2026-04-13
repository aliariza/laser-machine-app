const express = require("express");
const cors = require("cors");

const powerRoutes = require("./routes/powers");
const machineRoutes = require("./routes/machines");

const app = express();
const corsOrigin = process.env.CORS_ORIGIN;

app.use(
  cors(
    corsOrigin
      ? {
          origin: corsOrigin.split(",").map((value) => value.trim()),
        }
      : undefined
  )
);
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/api/powers", powerRoutes);
app.use("/api/machines", machineRoutes);

module.exports = app;
