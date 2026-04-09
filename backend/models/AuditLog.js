const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    eventType: {
        type: String,
        enum: ['DETECTED', 'MOVED', 'DUPLICATE_FOUND', 'DELETED', 'ERROR'],
        required: true
    },
    filePath: { type: String, required: true },
    details: { type: String }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
