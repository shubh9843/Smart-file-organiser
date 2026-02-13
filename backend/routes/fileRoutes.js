const express = require("express");
const multer = require("multer");
const File = require("../models/File");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});

const upload = multer({ storage });

/* Upload file */
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const newFile = new File({
      filename: req.file.filename,
      originalName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      filePath: req.file.path,
    });

    await newFile.save();
    res.json({ message: "File uploaded successfully" });
  } catch (err) {
    res.status(500).json(err);
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

/* Delete file */
router.delete("/:id", async (req, res) => {
  await File.findByIdAndDelete(req.params.id);
  res.json({ message: "File deleted" });
});

module.exports = router;
