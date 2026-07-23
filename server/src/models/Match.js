const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true
  },
  players: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    username: {
      type: String,
      required: true
    },
    department: {
      type: String,
      enum: ['computer', 'civil', 'architecture', 'common'],
      required: true
    },
    wpm: {
      type: Number,
      default: 0
    },
    accuracy: {
      type: Number,
      default: 0
    },
    combo: {
      type: Number,
      default: 0
    },
    correctWords: {
      type: Number,
      default: 0
    },
    wrongWords: {
      type: Number,
      default: 0
    },
    health: {
      type: Number,
      default: 100
    }
  }],
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  duration: {
    type: Number,
    default: 60
  },
  status: {
    type: String,
    enum: ['waiting', 'countdown', 'active', 'finished', 'abandoned'],
    default: 'waiting'
  },
  tournamentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament'
  },
  round: {
    type: String,
    enum: ['group', 'knockout', 'final']
  },
  groupName: {
    type: String
  },
  startTime: {
    type: Date
  },
  endTime: {
    type: Date
  },
  textPool: [String]
}, {
  timestamps: true
});

// Indexes
matchSchema.index({ roomId: 1 });
matchSchema.index({ 'players.userId': 1 });
matchSchema.index({ status: 1 });
matchSchema.index({ tournamentId: 1 });
matchSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Match', matchSchema);