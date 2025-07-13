# Firefox Dashboard - Backend Server

A Node.js/Express backend server for the guardian-ward bike tracking system with real-time data handling, JWT authentication, and RESTful APIs.

## 🚀 Overview

The backend server provides APIs for user authentication, guardian-ward management, real-time bike data handling, and WebSocket communication for live updates.

## 📁 Project Structure

```
server/
├── data/                  # JSON data files
│   ├── users.json        # User accounts
│   ├── guardians.json    # Guardian-ward relationships
│   ├── bikes.json        # Bike information
│   └── daily/           # Daily bike data logs
├── server.js             # Main server file
├── package.json          # Dependencies
└── README.md            # This file
```

## 🛠️ Technology Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.IO** - Real-time communication
- **JWT** - JSON Web Token authentication
- **CORS** - Cross-origin resource sharing
- **JSON** - File-based data storage

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Navigate to the server directory**
   ```bash
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Server will run on**
   - HTTP API: http://localhost:3001
   - WebSocket: ws://localhost:3001

### Development Mode

```bash
npm run dev
```

This will start the server with nodemon for automatic restarts during development.

## 🔐 Authentication System

### JWT Implementation
The server uses JWT tokens for secure authentication:

```javascript
// Token generation
const token = jwt.sign(
  { userId: user.id, email: user.email },
  process.env.JWT_SECRET || 'your-secret-key',
  { expiresIn: '7d' }
);
```

### Protected Routes
Routes that require authentication are protected with middleware:

```javascript
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};
```

## 📊 API Endpoints

### Authentication Endpoints

#### POST /api/login
Authenticate user and return JWT token.

**Request:**
```json
{
  "email": "amit.sharma@example.in",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Amit Sharma",
    "email": "amit.sharma@example.in"
  }
}
```

#### POST /api/signup
Register a new user account.

**Request:**
```json
{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "password123",
  "mobile": "9876543210"
}
```

#### GET /api/me
Get current user information (protected route).

### Guardian Management Endpoints

#### GET /api/guardian/me
Get guardian data for the authenticated user.

**Response:**
```json
{
  "guardian": {
    "guardianId": "G001",
    "name": "Amit Sharma",
    "wards": [
      {
        "wardId": "W001",
        "name": "Rahul Sharma",
        "bikeId": "BIKE001"
      }
    ]
  }
}
```

#### POST /api/guardian/wards
Add a new ward to the guardian.

**Request:**
```json
{
  "name": "New Ward",
  "age": 12,
  "grade": "7th",
  "bikeName": "Ward's Bike"
}
```

#### GET /api/guardian/wards
Get all wards for the guardian.

### Bike Data Endpoints

#### POST /api/bike-data
Receive bike data from simulator.

**Request:**
```json
{
  "bikeId": "BIKE001",
  "data": {
    "avgSpeed": 25.5,
    "distance": 12.3,
    "location": {
      "lat": 28.6139,
      "lng": 77.2090
    }
  }
}
```

#### GET /api/bikes
Get all bike information.

#### GET /api/bikes/:bikeId/latest
Get latest data for a specific bike.

#### GET /api/guardian/bikes
Get bikes belonging to guardian's wards.

## 📡 WebSocket Events

### Server Events

#### bikeData
Emitted when new bike data is received:

```javascript
io.emit('bikeData', {
  bikeId: 'BIKE001',
  timestamp: '2024-01-15T10:30:00Z',
  data: {
    avgSpeed: 25.5,
    distance: 12.3,
    location: { lat: 28.6139, lng: 77.2090 }
  }
});
```

### Client Events

#### connect
Client connects to WebSocket server.

#### disconnect
Client disconnects from WebSocket server.

## 📊 Data Storage

### File Structure
The server uses JSON files for data storage:

```
data/
├── users.json           # User accounts and credentials
├── guardians.json       # Guardian-ward relationships
├── bikes.json          # Bike information and metadata
└── daily/              # Daily bike data logs
    └── 2025-07-06.json # Date-specific bike data
```

### Data Models

#### User Model
```json
{
  "id": 1,
  "name": "Amit Sharma",
  "email": "amit.sharma@example.in",
  "password": "hashed-password",
  "mobile": "9876543210"
}
```

#### Guardian Model
```json
{
  "guardianId": "G001",
  "userId": 1,
  "name": "Amit Sharma",
  "email": "amit.sharma@example.in",
  "phone": "9876543210",
  "wards": [
    {
      "wardId": "W001",
      "name": "Rahul Sharma",
      "age": 12,
      "grade": "7th",
      "bikeId": "BIKE001",
      "bikeName": "Rahul's Mountain Bike"
    }
  ]
}
```

#### Bike Data Model
```json
{
  "bikeId": "BIKE001",
  "timestamp": "2024-01-15T10:30:00Z",
  "serverTimestamp": "2024-01-15T10:30:05Z",
  "receivedAt": 1705312205000,
  "data": {
    "avgSpeed": 25.5,
    "distance": 12.3,
    "location": {
      "lat": 28.6139,
      "lng": 77.2090
    },
    "batteryLevel": 85,
    "engineTemp": 45,
    "fuelLevel": 75
  }
}
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the server directory:

```env
PORT=3001
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### CORS Configuration
The server is configured to allow cross-origin requests:

```javascript
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
```

## 🛡️ Security Features

### Input Validation
All incoming data is validated:

```javascript
const validateBikeData = (data) => {
  if (!data.bikeId || !data.data) {
    throw new Error('Invalid bike data format');
  }
  
  if (typeof data.data.avgSpeed !== 'number' || 
      typeof data.data.distance !== 'number') {
    throw new Error('Invalid data types');
  }
};
```

### Error Handling
Comprehensive error handling for all endpoints:

```javascript
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});
```

### Rate Limiting
Basic rate limiting for API endpoints:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

## 📈 Performance

### Data Logging
Bike data is logged daily for historical analysis:

```javascript
const logDailyData = (bikeData) => {
  const today = new Date().toISOString().split('T')[0];
  const logFile = `./data/daily/${today}.json`;
  
  // Append data to daily log file
  fs.appendFileSync(logFile, JSON.stringify(bikeData) + '\n');
};
```

### Memory Management
Efficient data handling to prevent memory leaks:

```javascript
// Clean up old data periodically
setInterval(() => {
  // Remove data older than 30 days
  cleanupOldData();
}, 24 * 60 * 60 * 1000); // Run daily
```

## 🧪 Testing

### API Testing
Test endpoints using tools like Postman or curl:

```bash
# Test login
curl -X POST http://localhost:3001/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"amit.sharma@example.in","password":"password123"}'

# Test protected route
curl -X GET http://localhost:3001/api/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### WebSocket Testing
Test WebSocket connection using wscat:

```bash
npm install -g wscat
wscat -c ws://localhost:3001
```

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Check what's using port 3001
   lsof -i :3001
   # Kill the process
   kill -9 <PID>
   ```

2. **JWT token issues**
   - Check JWT_SECRET environment variable
   - Verify token expiration
   - Ensure proper token format in Authorization header

3. **CORS errors**
   - Verify CORS_ORIGIN environment variable
   - Check frontend URL matches CORS configuration
   - Ensure credentials are included in requests

4. **WebSocket connection issues**
   - Check if Socket.IO server is running
   - Verify client connection URL
   - Check browser console for connection errors

### Debug Mode
Enable debug logging:

```javascript
// In server.js
const debug = require('debug')('server:main');
debug('Server starting on port', process.env.PORT);
```

## 📊 Monitoring

### Health Check Endpoint
```bash
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "uptime": 3600,
  "memory": {
    "used": "45.2 MB",
    "total": "512 MB"
  }
}
```

### Logging
Server logs are written to console and can be redirected to files:

```bash
npm start > server.log 2>&1
```

## 🔄 Deployment

### Production Setup
1. Set NODE_ENV=production
2. Configure proper JWT_SECRET
3. Set up reverse proxy (nginx)
4. Configure SSL certificates
5. Set up process manager (PM2)

### PM2 Configuration
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'firefox-dashboard-server',
    script: 'server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
};
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Note**: This backend server is designed to work with the frontend client and simulator. Make sure all components are properly configured for full functionality. 