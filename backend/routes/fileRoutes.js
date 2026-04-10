const express = require("express");
const multer = require("multer");
const File = require("../models/File");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});

const upload = multer({ storage });

const { generateFileHash } = require('../services/deduplication');
const { processFile, reorganizeLibrary } = require('../services/organizer');

/* Upload file */
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // 1. Process the file using the Organizer Service
    // This handles Hashing, Deduplication, Rules, Moving, and DB entry.
    await processFile(req.file.path);

    // Note: processFile doesn't return the new file object (it returns void), 
    // so we just send a success message. The frontend will reload the list.
    res.json({ message: "File uploaded and processed" });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* Get files with sorting */
router.get("/", async (req, res) => {
  const { sortBy, order } = req.query;
  let sortOption = {};

  if (sortBy) {
    sortOption[sortBy] = order === "desc" ? -1 : 1;
  }

  const files = await File.find().sort(sortOption);
  res.json(files);
});

/* Reorganize Library */
router.post("/reorganize", async (req, res) => {
  try {
    const result = await reorganizeLibrary();
    res.json({ message: "Reorganization complete", result });
  } catch (err) {
    console.error("Reorganization error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* Delete file */
router.delete("/:id", async (req, res) => {
  await File.findByIdAndDelete(req.params.id);
  res.json({ message: "File deleted" });
});

module.exports = router;
