const mongoose = require("mongoose");

const { database } = require("./keys.js");
mongoose.set("strictQuery", false);

mongoose
  .connect(database.URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then((db) => console.log("DB is connected"))
  .catch((err) => console.error(err));

  module.exports = mongoose.connection;