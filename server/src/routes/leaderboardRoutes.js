const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get global leaderboard
router.get('/', async (req, res) => {
  try {
    const { department, limit = 20 } = req.query;
    const query = { isActive: true };
    if (department && department !== 'all') {
      query.department = department;
    }

    const users = await User.find(query)
      .select('username department elo stats highestWPM bestAccuracy')
      .sort({ elo: -1, 'stats.wins': -1 })
      .limit(parseInt(limit));

    const formatted = users.map((user, index) => ({
      rank: index + 1,
      username: user.username,
      department: user.department,
      elo: user.elo,
      wins: user.stats.wins,
      losses: user.stats.losses,
      highestWPM: user.stats.highestWPM || 0,
      bestAccuracy: user.stats.bestAccuracy || 0,
      totalGames: user.stats.totalGames || 0
    }));

    res.json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get department stats
router.get('/departments', async (req, res) => {
  try {
    const departments = ['computer', 'civil', 'architecture', 'common'];
    const stats = {};

    for (const dept of departments) {
      const users = await User.find({ department: dept, isActive: true });
      let totalWins = 0, totalGames = 0, totalWPM = 0, totalAccuracy = 0;

      for (const user of users) {
        totalWins += user.stats.wins;
        totalGames += user.stats.totalGames;
        totalWPM += user.stats.totalWPM;
        totalAccuracy += user.stats.totalAccuracy;
      }

      stats[dept] = {
        players: users.length,
        wins: totalWins,
        games: totalGames,
        avgWPM: users.length > 0 ? Math.round(totalWPM / users.length) : 0,
        avgAccuracy: users.length > 0 ? Math.round(totalAccuracy / users.length) : 0,
        winRate: totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0
      };
    }

    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;