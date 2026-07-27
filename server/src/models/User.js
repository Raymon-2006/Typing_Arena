const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [20, 'Username cannot exceed 20 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscore']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  department: {
    type: String,
    enum: ['computer', 'civil', 'architecture', 'common'],
    required: [true, 'Department is required']
  },
  role: {
    type: String,
    enum: ['player', 'admin'],
    default: 'player'
  },
  stats: {
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    totalGames: { type: Number, default: 0 },
    totalWPM: { type: Number, default: 0 },
    totalAccuracy: { type: Number, default: 0 },
    highestWPM: { type: Number, default: 0 },
    bestAccuracy: { type: Number, default: 0 },
    longestCombo: { type: Number, default: 0 }
  },
  elo: {
    type: Number,
    default: 1200
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update stats
userSchema.methods.updateStats = function(matchResult) {
  this.stats.totalGames += 1;
  
  if (matchResult.won) {
    this.stats.wins += 1;
    this.elo = Math.min(this.elo + 10, 2000);
  } else {
    this.stats.losses += 1;
    this.elo = Math.max(this.elo - 5, 800);
  }
  
  this.stats.totalWPM += matchResult.wpm;
  this.stats.totalAccuracy += matchResult.accuracy;
  
  if (matchResult.wpm > this.stats.highestWPM) {
    this.stats.highestWPM = matchResult.wpm;
  }
  
  if (matchResult.accuracy > this.stats.bestAccuracy) {
    this.stats.bestAccuracy = matchResult.accuracy;
  }
  
  if (matchResult.combo > this.stats.longestCombo) {
    this.stats.longestCombo = matchResult.combo;
  }
  
  this.lastActive = Date.now();
};

// Get average WPM
userSchema.virtual('avgWPM').get(function() {
  return this.stats.totalGames > 0 
    ? Math.round(this.stats.totalWPM / this.stats.totalGames) 
    : 0;
});

// Get average accuracy
userSchema.virtual('avgAccuracy').get(function() {
  return this.stats.totalGames > 0 
    ? Math.round(this.stats.totalAccuracy / this.stats.totalGames) 
    : 0;
});

userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);