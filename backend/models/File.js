const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  filename: String,
  originalName: String,
  fileType: String,
  fileSize: Number,
  uploadDate: {
    type: Date,
    default: Date.now
  },
  filePath: String
});

module.exports = mongoose.model("File", fileSchema);
