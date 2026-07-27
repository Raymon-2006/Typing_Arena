// Match routes
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { 
  getMatch, 
  getMatchHistory, 
  getLiveMatches 
} = require('../controllers/matchController');

router.get('/live', getLiveMatches);
router.get('/history', protect, getMatchHistory);
router.get('/:roomId', protect, getMatch);

module.exports = router;