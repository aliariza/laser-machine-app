const express = require("express");
const cors = require("cors");

const powerRoutes = require("./routes/powers");
const machineRoutes = require("./routes/machines");

const app = express();
const corsOrigin = process.env.CORS_ORIGIN;

const allowedOrigins = [
  "https://laser-machine-app.vercel.app",
  "https://laser-machine.tum-ex.com",
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
  })
);
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/api/powers", powerRoutes);
app.use("/api/machines", machineRoutes);

module.exports = app;
