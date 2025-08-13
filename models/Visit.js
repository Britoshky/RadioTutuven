const mongoose = require("mongoose");

const VisitSchema = new mongoose.Schema({
  page: { type: String, required: true },
  count: { type: Number, default: 0 }
});

module.exports = mongoose.model("Visit", VisitSchema);
