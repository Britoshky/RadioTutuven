const mongoose = require("mongoose");
const { database } = require("./keys.js");

mongoose.set("strictQuery", false);

// Conectarse a la base de datos (las opciones useNewUrlParser/useUnifiedTopology ya no son necesarias)
mongoose
  .connect(database.URI)
  .then(() => {
    console.log("Connected to MongoDB database");
  })
  .catch((err) => {
    console.error("Error connecting to database:", err);
  });

// Manejar eventos de error
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

module.exports = db;
