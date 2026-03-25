const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String }, // Added
  status: { type: String, enum: ["todo", "in-progress", "done"], default: "todo" }, // Added
  boardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true },
  columnId: { type: String }, // Made optional/string if you aren't using a separate Column collection yet
  position: { type: Number, default: 0 },
  version: { type: Number, default: 1 },
});

module.exports = mongoose.model("Card", cardSchema);