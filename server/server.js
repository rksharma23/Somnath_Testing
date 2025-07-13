// Load environment variables first
require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const server = http.createServer(app);

// Environment variables with fallback defaults
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Directory and file paths from environment variables
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const DAILY_DIR = process.env.DAILY_DIR || path.join(__dirname, 'data', 'daily');
const USERS_FILE = process.env.USERS_FILE || path.join(__dirname, 'data', 'users.json');
const RANKS_FILE = process.env.RANKS_FILE || path.join(__dirname, 'data', 'ranks.json');
const GUARDIANS_FILE = process.env.GUARDIANS_FILE || path.join(__dirname, 'data', 'guardians.json');
const BIKES_FILE = process.env.BIKES_FILE || path.join(__dirname, 'data', 'bikes.json');

// Socket.IO configuration from environment variables
const SOCKET_PING_TIMEOUT = parseInt(process.env.SOCKET_PING_TIMEOUT) || 30000;
const SOCKET_PING_INTERVAL = parseInt(process.env.SOCKET_PING_INTERVAL) || 5000;

// Security warning for development
if (NODE_ENV === 'production' && JWT_SECRET === 'supersecretkey') {
  console.warn('⚠️  WARNING: Using default JWT secret in production! Please set JWT_SECRET environment variable.');
}

// Configure CORS for both Express and Socket.IO
const corsOptions = {
  origin: CORS_ORIGIN === '*' ? '*' : CORS_ORIGIN.split(','),
  methods: ['GET', 'POST'],
  credentials: true
};

app.use(cors(corsOptions));

const io = new Server(server, {
  cors: corsOptions,
  transports: ['websocket'],
  pingTimeout: SOCKET_PING_TIMEOUT,
  pingInterval: SOCKET_PING_INTERVAL
});

// Ensure directories exist
fs.ensureDirSync(DATA_DIR);
fs.ensureDirSync(DAILY_DIR);

app.use(express.json());

// Track connected clients
const connectedClients = new Set();

// JWT Auth Middleware
function authenticateJWT(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Malformed token' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

// POST /api/login
app.post('/api/login', async (req, res) => {
  const { email, mobile, password } = req.body;
  if (!password) {
    return res.status(400).json({ error: 'Password required' });
  }
  if (!email && !mobile) {
    return res.status(400).json({ error: 'Email or mobile number required' });
  }
  try {
    const users = await fs.readJson(USERS_FILE);
    let user;
    if (email) {
      user = users.find(u => u.email === email);
    } else if (mobile) {
      user = users.find(u => u.mobile === mobile);
    }
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    // Create JWT
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, mobile: user.mobile } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/me (protected)
app.get('/api/me', authenticateJWT, async (req, res) => {
  try {
    const users = await fs.readJson(USERS_FILE);
    const user = users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ id: user.id, name: user.name, email: user.email, mobile: user.mobile });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/signup
app.post('/api/signup', async (req, res) => {
  const { name, email, password, mobile } = req.body;
  if (!name || !email || !password || !mobile) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  try {
    const users = await fs.readJson(USERS_FILE);
    if (users.find(u => u.email === email)) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: users.length ? Math.max(...users.map(u => u.id)) + 1 : 1,
      name,
      email,
      password: hashedPassword,
      mobile
    };
    users.push(newUser);
    await fs.writeJson(USERS_FILE, users, { spaces: 2 });
    // Create JWT
    const token = jwt.sign(
      { id: newUser.id, name: newUser.name, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.status(201).json({ token, user: { id: newUser.id, name: newUser.name, email: newUser.email, mobile: newUser.mobile } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST endpoint to receive data from ESP32/ESP32-simulator (Both Code Integrated)
app.post('/api/bike/data', async (req, res) => {
  try {
    const data = req.body;
    
    console.log('Received data from simulator:', JSON.stringify(data, null, 2));
    
    // Validate incoming data
    if (!data || !data.bikeId || !data.data) {
      console.error('Invalid data format received:', data);
      return res.status(400).json({ 
        error: 'Invalid data format. Required: bikeId, data' 
      });
    }

    // Validate data structure
    if (!data.data.avgSpeed || !data.data.location || !data.data.battery) {
      console.error('Invalid data structure:', data.data);
      return res.status(400).json({ 
        error: 'Invalid data structure. Required: avgSpeed, location, battery' 
      });
    }

    // Add server timestamp
    const now = new Date();
    const enrichedData = {
      ...data,
      timestamp: now.toISOString(),
      serverTimestamp: now.toISOString(),
      receivedAt: now.getTime()
    };

    // Update bike status in bikes.json
    try {
      let bikes = [];
      if (await fs.pathExists(BIKES_FILE)) {
        bikes = await fs.readJson(BIKES_FILE);
      }
      
      const bikeIndex = bikes.findIndex(bike => bike.bikeId === data.bikeId);
      
      if (bikeIndex !== -1) {
        bikes[bikeIndex].lastSeen = new Date().toISOString();
        bikes[bikeIndex].currentLocation = data.data.location;
        bikes[bikeIndex].avgSpeed = parseFloat(data.data.avgSpeed);
        bikes[bikeIndex].batteryLevel = parseFloat(data.data.battery);
      } else {
        const newBike = {
          bikeId: data.bikeId,
          lastSeen: new Date().toISOString(),
          currentLocation: data.data.location,
          avgSpeed: parseFloat(data.data.avgSpeed),
          batteryLevel: parseFloat(data.data.battery),
          createdAt: new Date().toISOString(),
          status: "active"
        };
        bikes.push(newBike);
      }
      
      await fs.writeJson(BIKES_FILE, bikes, { spaces: 2 });
      console.log(`Updated bike ${data.bikeId} in bikes.json`);
    } catch (error) {
      console.error('Error updating bike status:', error);
    }

    // Save to daily log file
    const today = moment().format('YYYY-MM-DD');
    const dailyFile = path.join(DAILY_DIR, `${today}.json`);
    
    let dailyData = [];
    if (await fs.pathExists(dailyFile)) {
      dailyData = await fs.readJson(dailyFile);
    }
    
    dailyData.push(enrichedData);
    await fs.writeJson(dailyFile, dailyData, { spaces: 2 });
    console.log(`Saved data to daily log: ${dailyFile}`);

    // Broadcast real-time data to all connected clients
    io.emit('bikeData', enrichedData);
    
    // Also emit a specific event for bike updates
    io.emit('bikeUpdate', {
      bikeId: data.bikeId,
      data: data.data,
      timestamp: enrichedData.timestamp
    });
    
    console.log(`[${new Date().toISOString()}] Data received from ${data.bikeId}:`, {
      speed: data.data.avgSpeed,
      location: data.data.location,
      battery: data.data.battery
    });

    res.json({ 
      message: 'data received'
    });

  } catch (error) {
    console.error('Error processing bike data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET endpoint to retrieve historical data
app.get('/api/history/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const historyFile = path.join(DAILY_DIR, `${date}.json`);
    
    if (await fs.pathExists(historyFile)) {
      const data = await fs.readJson(historyFile);
      res.json({ date, data });
    } else {
      res.status(404).json({ error: 'No data found for this date' });
    }
  } catch (error) {
    console.error('Error retrieving history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET endpoint to list available dates
app.get('/api/history', async (req, res) => {
  try {
    const files = await fs.readdir(DAILY_DIR);
    const dates = files
      .filter(file => file.endsWith('.json'))
      .map(file => file.replace('.json', ''))
      .sort();
    
    res.json({ availableDates: dates });
  } catch (error) {
    console.error('Error listing history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET endpoint to retrieve ranks data
app.get('/api/ranks', async (req, res) => {
  try {
    if (await fs.pathExists(RANKS_FILE)) {
      const ranks = await fs.readJson(RANKS_FILE);
      res.json({ ranks });
    } else {
      res.status(404).json({ error: 'Ranks data not found' });
    }
  } catch (error) {
    console.error('Error retrieving ranks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET endpoint to retrieve guardians data
app.get('/api/guardians', async (req, res) => {
  try {
    if (await fs.pathExists(GUARDIANS_FILE)) {
      const guardians = await fs.readJson(GUARDIANS_FILE);
      res.json({ guardians });
    } else {
      res.status(404).json({ error: 'Guardians data not found' });
    }
  } catch (error) {
    console.error('Error retrieving guardians:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET endpoint to retrieve bikes data
app.get('/api/bikes', async (req, res) => {
  try {
    if (await fs.pathExists(BIKES_FILE)) {
      const bikes = await fs.readJson(BIKES_FILE);
      res.json({ bikes });
    } else {
      res.status(404).json({ error: 'Bikes data not found' });
    }
  } catch (error) {
    console.error('Error retrieving bikes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET endpoint to retrieve bike by ID
app.get('/api/bikes/:bikeId', async (req, res) => {
  try {
    const { bikeId } = req.params;
    if (await fs.pathExists(BIKES_FILE)) {
      const bikes = await fs.readJson(BIKES_FILE);
      const bike = bikes.find(b => b.bikeId === bikeId);
      if (bike) {
        res.json({ bike });
      } else {
        res.status(404).json({ error: 'Bike not found' });
      }
    } else {
      res.status(404).json({ error: 'Bikes data not found' });
    }
  } catch (error) {
    console.error('Error retrieving bike:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET endpoint to get guardian data for logged-in user
app.get('/api/guardian/me', authenticateJWT, async (req, res) => {
  try {
    const guardians = await fs.readJson(GUARDIANS_FILE);
    const guardian = guardians.find(g => g.userId === req.user.id);
    
    if (guardian) {
      res.json({ guardian });
    } else {
      const newGuardian = {
        guardianId: `G${String(guardians.length + 1).padStart(3, '0')}`,
        userId: req.user.id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.mobile,
        createdAt: new Date().toISOString(),
        status: "active",
        wards: []
      };
      
      guardians.push(newGuardian);
      await fs.writeJson(GUARDIANS_FILE, guardians, { spaces: 2 });
      
      res.json({ guardian: newGuardian });
    }
  } catch (error) {
    console.error('Error retrieving guardian data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST endpoint to add a new ward
app.post('/api/guardian/wards', authenticateJWT, async (req, res) => {
  try {
    const { name, age, grade, bikeName } = req.body;
    
    if (!name || !age || !grade || !bikeName) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    const guardians = await fs.readJson(GUARDIANS_FILE);
    const guardianIndex = guardians.findIndex(g => g.userId === req.user.id);
    
    if (guardianIndex === -1) {
      return res.status(404).json({ error: 'Guardian not found' });
    }
    
    const wardId = `W${String(guardians[guardianIndex].wards.length + 1).padStart(3, '0')}`;
    const bikeId = `BIKE${String(guardians[guardianIndex].wards.length + 1).padStart(3, '0')}`;
    
    const newWard = {
      wardId,
      name,
      age: parseInt(age),
      grade,
      bikeId,
      bikeName,
      createdAt: new Date().toISOString(),
      status: "active"
    };
    
    guardians[guardianIndex].wards.push(newWard);
    await fs.writeJson(GUARDIANS_FILE, guardians, { spaces: 2 });
    
    const bikes = await fs.readJson(BIKES_FILE);
    const newBike = {
      bikeId,
      wardId,
      guardianId: guardians[guardianIndex].guardianId,
      bikeName,
      wardName: name,
      guardianName: req.user.name,
      status: "active",
      lastSeen: new Date().toISOString(),
      totalDistance: 0,
      totalRides: 0,
      avgSpeed: 0,
      currentLocation: {
        lat: 19.0760,
        lng: 72.8777
      }
    };
    
    bikes.push(newBike);
    await fs.writeJson(BIKES_FILE, bikes, { spaces: 2 });
    
    res.status(201).json({ 
      message: 'Ward added successfully',
      ward: newWard,
      bike: newBike
    });
    
  } catch (error) {
    console.error('Error adding ward:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET endpoint to get wards for logged-in guardian
app.get('/api/guardian/wards', authenticateJWT, async (req, res) => {
  try {
    const guardians = await fs.readJson(GUARDIANS_FILE);
    const guardian = guardians.find(g => g.userId === req.user.id);
    
    if (guardian) {
      res.json({ wards: guardian.wards });
    } else {
      res.json({ wards: [] });
    }
  } catch (error) {
    console.error('Error retrieving wards:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET endpoint to get real-time bike data for guardian's wards
app.get('/api/guardian/bikes', authenticateJWT, async (req, res) => {
  try {
    const guardians = await fs.readJson(GUARDIANS_FILE);
    const guardian = guardians.find(g => g.userId === req.user.id);
    
    if (!guardian) {
      return res.json({ bikes: [] });
    }
    
    const bikes = await fs.readJson(BIKES_FILE);
    const guardianBikes = bikes.filter(bike => bike.guardianId === guardian.guardianId);
    
    res.json({ bikes: guardianBikes });
  } catch (error) {
    console.error('Error retrieving guardian bikes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET endpoint to get latest bike data for a specific bike
app.get('/api/bikes/:bikeId/latest', async (req, res) => {
  try {
    const { bikeId } = req.params;
    const today = moment().format('YYYY-MM-DD');
    const dailyFile = path.join(DAILY_DIR, `${today}.json`);
    
    if (await fs.pathExists(dailyFile)) {
      const dailyData = await fs.readJson(dailyFile);
      const bikeData = dailyData
        .filter(entry => entry.bikeId === bikeId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      if (bikeData.length > 0) {
        res.json({ latestData: bikeData[0] });
      } else {
        res.status(404).json({ error: 'No data found for this bike today' });
      }
    } else {
      res.status(404).json({ error: 'No data found for today' });
    }
  } catch (error) {
    console.error('Error retrieving latest bike data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  connectedClients.add(socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    connectedClients.delete(socket.id);
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    clientsConnected: connectedClients.size,
    uptime: process.uptime(),
    environment: NODE_ENV
  });
});

// Environment info endpoint (for debugging - remove in production)
app.get('/env-info', (req, res) => {
  if (NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not found' });
  }
  
  res.json({
    nodeEnv: NODE_ENV,
    port: PORT,
    host: HOST,
    dataDir: DATA_DIR,
    dailyDir: DAILY_DIR,
    corsOrigin: CORS_ORIGIN,
    jwtSecretSet: !!JWT_SECRET && JWT_SECRET !== 'supersecretkey'
  });
});

server.listen(PORT, HOST, () => {
  console.log(`🚴 Smart-Cycle Server running on ${HOST}:${PORT}`);
  console.log(`🌍 Environment: ${NODE_ENV}`);
  console.log(`📡 WebSocket server ready for real-time connections`);
  console.log(`💾 Data will be saved to: ${DAILY_DIR}`);
  console.log(`🔑 JWT Secret: ${JWT_SECRET === 'supersecretkey' ? '⚠️  Using default (change in production!)' : '✅ Custom secret set'}`);
  console.log(`🌐 CORS Origin: ${CORS_ORIGIN}`);
  console.log(`🌐 Accessible on local network at: http://${HOST}:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});