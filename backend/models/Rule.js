const mongoose = require('mongoose');

const ruleSchema = new mongoose.Schema({
    name: { type: String, required: true },
    criteria: {
        extension: [String], // e.g., ['jpg', 'png']
        minSize: Number,
        maxSize: Number
    },
    targetFolder: { type: String, required: true }, // e.g., 'Images'
    isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('Rule', ruleSchema);
