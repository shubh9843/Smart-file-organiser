const express = require('express');
const router = express.Router();
const Rule = require('../models/Rule');

// GET /api/rules
router.get('/', async (req, res) => {
    try {
        const rules = await Rule.find();
        res.json(rules);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/rules
router.post('/', async (req, res) => {
    try {
        const newRule = new Rule(req.body);
        await newRule.save();
        res.json(newRule);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/rules/:id
router.delete('/:id', async (req, res) => {
    try {
        await Rule.findByIdAndDelete(req.params.id);
        res.json({ message: 'Rule deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
