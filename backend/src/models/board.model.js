const mongoose = require("mongoose");

const boardSchema = new mongoose.Schema({
  title: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  color:   { type: String, default: "#F59E0B" },
colorId: { type: String, default: "amber"   },
});

module.exports = mongoose.model("Board", boardSchema);