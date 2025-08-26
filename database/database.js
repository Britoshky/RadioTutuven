const mongoose = require("mongoose");
const { database } = require("./keys.js");

mongoose.set("strictQuery", false);

// Conectarse a la base de datos
mongoose
  .connect(database.URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  // useCreateIndex y useFindAndModify ya no son soportadas en Mongoose 6+
  })
  .then(() => {
    console.log("DB is connected");
  })
  .catch((err) => {
    console.error("Error connecting to database:", err);
  });

// Manejar eventos de conexión y error
const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB database");
});

module.exports = db;
