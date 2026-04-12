require("dotenv").config();
console.log("MONGO URI USED =>", process.env.MONGODB_URI);


const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const fileRoutes = require("./routes/fileRoutes");
console.log("Resolved fileRoutes:", require.resolve("./routes/fileRoutes"));
const ruleRoutes = require("./routes/ruleRoutes");
const auditRoutes = require("./routes/auditRoutes");
const { startWatcher } = require("./services/watcher");
const { seedDefaultRules } = require("./services/ruleSeeder");
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use("/organized", express.static(path.join(__dirname, "../organized")));

// Serve frontend static files
const frontendPath = path.join(__dirname, "../frontend");
app.use(express.static(frontendPath));

// Check if we need to use in-memory DB (fallback or explicit)
const startDB = async () => {
  try {
    let uri = process.env.MONGODB_URI;

    // Try connecting to local/env URI first
    if (uri) {
      console.log("Attempting to connect to:", uri);
      try {
        await mongoose.connect(uri);
        console.log("MongoDB Connected (Local/Atlas)");

        // Seed Rules (FORCE for now to fix user issue)
        await seedDefaultRules(true);

        return;
      } catch (err) {
        console.error("Local connection failed:", err.message);
        console.log("Switching to In-Memory DB...");
      }
    }

    // Fallback to In-Memory
    const { MongoMemoryServer } = require('mongodb-memory-server');
    console.log("Starting In-Memory DB (this may take a moment)...");

    // Ensure db_data directory exists
    const dbPath = path.join(__dirname, "db_data");
    if (!fs.existsSync(dbPath)) {
      fs.mkdirSync(dbPath);
    }

    const mongod = await MongoMemoryServer.create({
      instance: {
        dbPath: dbPath,
        storageEngine: 'wiredTiger'
      },
      binary: {
        checkMD5: true
      },
      spawn: {
        startupTimeout: 120000 // Increase timeout to 120s for slow downloads
      }
    });

    uri = mongod.getUri();
    console.log("Starting In-Memory MongoDB at:", uri);
    await mongoose.connect(uri);
    console.log("MongoDB Connected (In-Memory)");

    // Seed Rules (FORCE)
    await seedDefaultRules(true);

  } catch (err) {
    console.error("Database connection error:", err);
  }
};

startDB();

app.use("/api/files", fileRoutes);
app.use("/api/rules", ruleRoutes);
app.use("/api/logs", auditRoutes);

// Catch-all to serve index.html for non-API routes (SPA support)
app.use((req, res) => {
  const indexPath = path.join(__dirname, "../frontend/index.html");
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error("Error serving index.html:", err);
      if (!res.headersSent) {
        res.status(500).json({
          error: "Frontend not found",
          details: err.message,
          path: indexPath
        });
      }
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
