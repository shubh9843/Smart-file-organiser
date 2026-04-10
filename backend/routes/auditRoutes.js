const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');

// GET /api/logs - Fetch recent logs
router.get('/', async (req, req_res) => {
    try {
        const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(50);
        req_res.json(logs);
    } catch (err) {
        req_res.status(500).json({ error: err.message });
    }
});

module.exports = router;
