const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./src/config/database');
const { errorHandler } = require('./src/middleware/errorHandler');


dotenv.config();


connectDB();


const app = express();
const server = http.createServer(app);


const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const matchRoutes = require('./src/routes/matchRoutes');
const tournamentRoutes = require('./src/routes/tournamentRoutes');
const leaderboardRoutes = require('./src/routes/leaderboardRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling
app.use(errorHandler);


require('./src/socket')(io);


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket ready for connections`);
});


process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});