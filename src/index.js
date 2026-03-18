require("dotenv").config();

const app = require("./app");
const connectMongo = require("./db/mongo");

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    console.log("🚀 Iniciando RPGLog API...");
    await connectMongo(process.env.MONGO_URI);

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Servidor corriendo en puerto ${PORT}`);
      console.log(`🌍 Entorno: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("❌ Error iniciando servidor:", error.message);
    process.exit(1);
  }
}

startServer();