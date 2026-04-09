const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  filename: String,
  originalName: String,
  fileType: String,
  fileSize: Number,
  fileHash: { type: String, index: true }, // [NEW] SHA-256 hash for deduplication
  version: { type: Number, default: 1 },   // [NEW] Version tracking
  uploadDate: {
    type: Date,
    default: Date.now
  },
  filePath: String
});

module.exports = mongoose.model("File", fileSchema);
