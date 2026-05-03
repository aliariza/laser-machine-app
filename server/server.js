require("dotenv").config();

const app = require("./app");
const pool = require("./db/postgres");

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await pool.query("select now()");
    console.log("PostgreSQL connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup error:", error);
    process.exit(1);
  }
}

startServer();