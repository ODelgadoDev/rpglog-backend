const mongoose = require("mongoose");

async function connectMongo(uri) {
  if (!uri) {
    throw new Error("MONGO_URI no está definido en .env");
  }

  try {
    console.log("🔄 Conectando a MongoDB...");

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000
    });

    console.log("✅ MongoDB conectado correctamente");
    console.log("📦 Base de datos:", mongoose.connection.name);
  } catch (error) {
    console.error("❌ Error conectando a MongoDB:", error.message);
    throw error;
  }
}

module.exports = connectMongo;