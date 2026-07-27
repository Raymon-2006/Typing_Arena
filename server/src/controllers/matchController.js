const Match = require('../models/Match');
const gameEngine = require('../services/gameEngine');

const getMatch = async (req, res) => {
  try {
    const { roomId } = req.params;
    const match = await Match.findOne({ roomId });
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    res.json({ success: true, data: match });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

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
    .limit(parseInt(limit));

    const total = await Match.countDocuments({
      'players.userId': userId,
      status: 'finished'
    });

    res.json({
      success: true,
      data: { matches, pagination: { page, limit, total, pages: Math.ceil(total / limit) } }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

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
            health: room.players[id].health
          })),
          timeRemaining: room.startTime 
            ? Math.max(0, room.duration - ((Date.now() - room.startTime) / 1000))
            : room.duration
        });
      }
    }
    res.json({ success: true, data: liveMatches });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getMatch, getMatchHistory, getLiveMatches };