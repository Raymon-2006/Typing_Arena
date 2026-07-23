// Match management
const Match = require('../models/Match');
const User = require('../models/User');
const WordPool = require('../models/WordPool');
const gameEngine = require('../services/gameEngine');

// @desc    Get match details
// @route   GET /api/matches/:roomId
// @access  Private
const getMatch = async (req, res) => {
  try {
    const { roomId } = req.params;
    const match = await Match.findOne({ roomId });
    
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    res.json({
      success: true,
      data: match
    });
  } catch (error) {
    console.error('Get match error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get match history for user
// @route   GET /api/matches/history
// @access  Private
const getMatchHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 20, page = 1 } = req.query;

    const matches = await Match.find({
      'players.userId': userId,
      status: 'finished'
    })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .populate('players.userId', 'username department');

    const total = await Match.countDocuments({
      'players.userId': userId,
      status: 'finished'
    });

    const formatted = matches.map(match => {
      const player = match.players.find(p => p.userId._id.toString() === userId.toString());
      const opponent = match.players.find(p => p.userId._id.toString() !== userId.toString());
      const isWinner = match.winner && match.winner.toString() === userId.toString();

      return {
        matchId: match.roomId,
        date: match.createdAt,
        opponent: opponent ? opponent.username : 'Unknown',
        opponentDepartment: opponent ? opponent.department : 'unknown',
        won: isWinner,
        wpm: player ? player.wpm : 0,
        accuracy: player ? player.accuracy : 0,
        duration: match.duration
      };
    });

    res.json({
      success: true,
      data: {
        matches: formatted,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get match history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get live matches (for spectator)
// @route   GET /api/matches/live
// @access  Public
const getLiveMatches = async (req, res) => {
  try {
    const liveMatches = [];
    
    for (const [roomId, room] of gameEngine.activeRooms) {
      if (room.status === 'active') {
        liveMatches.push({
          roomId,
          players: Object.keys(room.players).map(id => ({
            userId: id,
            username: room.players[id].username,
            department: room.players[id].department,
            health: room.players[id].health,
            wpm: room.players[id].wpm || 0
          })),
          timeRemaining: room.startTime 
            ? Math.max(0, room.duration - ((Date.now() - room.startTime) / 1000))
            : room.duration
        });
      }
    }

    res.json({
      success: true,
      data: liveMatches
    });
  } catch (error) {
    console.error('Get live matches error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getMatch,
  getMatchHistory,
  getLiveMatches
};