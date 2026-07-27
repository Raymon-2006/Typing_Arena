// Tournament routes
const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');

// Placeholder routes - will be expanded later
router.get('/', (req, res) => {
  res.json({ message: 'Tournament routes coming soon' });
});

router.post('/create', protect, admin, (req, res) => {
  res.json({ message: 'Create tournament' });
});

module.exports = router;