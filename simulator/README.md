# Firefox Dashboard - Bike Data Simulator

A Node.js simulator that generates realistic bike data and sends it to the backend server in real-time for testing the guardian-ward bike tracking system.

## 🚀 Overview

The simulator generates realistic bike data for 4 different bikes (BIKE001-BIKE004) and sends it to the backend server via Socket.IO. This allows testing of the real-time dashboard functionality without actual bike hardware.

## 📁 Project Structure

```
simulator/
├── simulator.js          # Main simulator script
├── package.json          # Dependencies
└── README.md            # This file
```

## 🛠️ Technology Stack

- **Node.js** - Runtime environment
- **Socket.IO Client** - Real-time communication
- **Math.random()** - Data generation
- **setInterval** - Timed data emission

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Backend server running on port 3001

### Installation

1. **Navigate to the simulator directory**
   ```bash
   cd simulator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the simulator**
   ```bash
   npm start
   ```

4. **Simulator will connect to**
   - Backend server: http://localhost:3001
   - WebSocket: ws://localhost:3001

## 📊 Data Generation

### Bike Configuration
The simulator generates data for 4 bikes:

| Bike ID | Guardian | Ward | Bike Name |
|---------|----------|------|-----------|
| BIKE001 | Amit Sharma | Rahul Sharma | Rahul's Mountain Bike |
| BIKE002 | Amit Sharma | Priya Sharma | Priya's City Bike |
| BIKE003 | Sneha Patel | Vikram Patel | Vikram's Racing Bike |
| BIKE004 | Sneha Patel | Anjali Patel | Anjali's Kids Bike |

### Data Structure
Each bike data packet contains:

```javascript
{
  bikeId: "BIKE001",
  timestamp: "2024-01-15T10:30:00Z",
  serverTimestamp: "2024-01-15T10:30:05Z",
  receivedAt: 1705312205000,
  data: {
    avgSpeed: 25.5,        // km/h (0-100)
    distance: 12.3,        // km (0-50)
    location: {
      lat: 28.6139,        // Latitude (Delhi area)
      lng: 77.2090         // Longitude (Delhi area)
    },
    batteryLevel: 85,      // % (0-100)
    engineTemp: 45,        // °C (20-80)
    fuelLevel: 75          // % (0-100)
  }
}
```

### Realistic Data Generation

#### Speed Generation
```javascript
const generateSpeed = () => {
  // Normal distribution around 25 km/h
  const baseSpeed = 25;
  const variation = (Math.random() - 0.5) * 20;
  return Math.max(0, Math.min(100, baseSpeed + variation));
};
```

#### Location Generation
```javascript
const generateLocation = () => {
  // Delhi area coordinates
  const baseLat = 28.6139;
  const baseLng = 77.2090;
  const latVariation = (Math.random() - 0.5) * 0.1;
  const lngVariation = (Math.random() - 0.5) * 0.1;
  
  return {
    lat: baseLat + latVariation,
    lng: baseLng + lngVariation
  };
};
```

#### Distance Generation
```javascript
const generateDistance = (currentSpeed) => {
  // Distance increases based on speed
  const timeInterval = 5; // 5 seconds
  const distanceIncrement = (currentSpeed * timeInterval) / 3600; // km
  return Math.min(50, distanceIncrement);
};
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the simulator directory:

```env
SERVER_URL=http://localhost:3001
DATA_INTERVAL=5000
ENABLE_LOGGING=true
```

### Configuration Options

#### Data Interval
Control how frequently data is sent:

```javascript
const DATA_INTERVAL = process.env.DATA_INTERVAL || 5000; // 5 seconds
```

#### Logging
Enable/disable detailed logging:

```javascript
const ENABLE_LOGGING = process.env.ENABLE_LOGGING === 'true';
```

## 📡 Communication Protocol

### Socket.IO Connection
The simulator connects to the backend using Socket.IO:

```javascript
const socket = io(process.env.SERVER_URL || 'http://localhost:3001', {
  transports: ['websocket', 'polling'],
  timeout: 20000,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});
```

### Data Emission
Bike data is emitted to the server:

```javascript
socket.emit('bikeData', {
  bikeId: bikeId,
  timestamp: new Date().toISOString(),
  serverTimestamp: new Date().toISOString(),
  receivedAt: Date.now(),
  data: {
    avgSpeed: speed,
    distance: distance,
    location: location,
    batteryLevel: batteryLevel,
    engineTemp: engineTemp,
    fuelLevel: fuelLevel
  }
});
```

## 🎯 Features

### Real-time Data Generation
- **Continuous data flow** every 5 seconds
- **Realistic speed variations** based on normal distribution
- **Location tracking** with GPS-like coordinates
- **Battery and fuel simulation** with gradual depletion

### Multiple Bike Support
- **4 bikes simultaneously** generating data
- **Independent data streams** for each bike
- **Unique characteristics** for each bike/ward

### Error Handling
- **Connection retry logic** for network issues
- **Data validation** before sending
- **Graceful shutdown** on process termination

### Logging and Monitoring
- **Connection status** logging
- **Data emission** confirmation
- **Error reporting** for debugging

## 🔄 Data Flow

### 1. Initialization
```javascript
// Connect to server
socket.connect();

// Set up data generation intervals
bikes.forEach(bikeId => {
  setInterval(() => generateBikeData(bikeId), DATA_INTERVAL);
});
```

### 2. Data Generation
```javascript
const generateBikeData = (bikeId) => {
  const speed = generateSpeed();
  const location = generateLocation();
  const distance = generateDistance(speed);
  
  const bikeData = {
    bikeId,
    timestamp: new Date().toISOString(),
    data: { speed, location, distance }
  };
  
  return bikeData;
};
```

### 3. Data Transmission
```javascript
socket.emit('bikeData', bikeData);
```

### 4. Server Processing
The backend receives the data and:
- Validates the data format
- Stores it in memory/database
- Broadcasts to connected clients
- Logs for historical analysis

## 🧪 Testing Scenarios

### Normal Operation
- All 4 bikes generating data
- Realistic speed and location variations
- Continuous data flow

### High Activity Simulation
```javascript
// Increase data frequency for testing
const HIGH_ACTIVITY_INTERVAL = 1000; // 1 second
```

### Network Issues
- Simulate connection drops
- Test reconnection logic
- Verify data loss handling

### Data Validation
- Test with invalid data formats
- Verify server error handling
- Check data type validation

## 🐛 Troubleshooting

### Common Issues

1. **Connection refused**
   ```bash
   # Check if backend is running
   curl http://localhost:3001/api/health
   ```

2. **No data appearing in dashboard**
   - Verify simulator is running
   - Check browser console for WebSocket errors
   - Ensure guardian has assigned wards

3. **Data not being received**
   - Check Socket.IO connection status
   - Verify event name matches server expectation
   - Check server logs for errors

### Debug Mode
Enable detailed logging:

```javascript
// In simulator.js
const DEBUG = process.env.DEBUG === 'true';

if (DEBUG) {
  console.log('Generated data:', bikeData);
  console.log('Connection status:', socket.connected);
}
```

## 📊 Performance

### Data Generation Rate
- **Default**: 1 data packet per bike every 5 seconds
- **Total**: 4 bikes × 12 packets/minute = 48 packets/minute
- **Configurable**: Adjust DATA_INTERVAL for different rates

### Memory Usage
- **Minimal**: Only stores current data state
- **Efficient**: No historical data storage
- **Scalable**: Can handle multiple simulators

### Network Usage
- **Small packets**: ~200 bytes per data packet
- **Low bandwidth**: ~1KB/minute total
- **Efficient**: Uses WebSocket for persistent connection

## 🔧 Customization

### Adding More Bikes
```javascript
const ADDITIONAL_BIKES = ['BIKE005', 'BIKE006'];

bikes.push(...ADDITIONAL_BIKES);
```

### Custom Data Patterns
```javascript
const customSpeedPattern = (bikeId) => {
  // Custom speed generation for specific bikes
  switch(bikeId) {
    case 'BIKE001': return generateHighSpeed();
    case 'BIKE004': return generateLowSpeed();
    default: return generateNormalSpeed();
  }
};
```

### Location Boundaries
```javascript
const generateLocationInBounds = (bounds) => {
  const { minLat, maxLat, minLng, maxLng } = bounds;
  return {
    lat: minLat + Math.random() * (maxLat - minLat),
    lng: minLng + Math.random() * (maxLng - minLng)
  };
};
```

## 🚀 Deployment

### Production Setup
1. Set environment variables
2. Configure logging
3. Set up process monitoring
4. Configure network access

### PM2 Configuration
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'bike-simulator',
    script: 'simulator.js',
    instances: 1,
    autorestart: true,
    watch: false,
    env: {
      NODE_ENV: 'production',
      SERVER_URL: 'http://localhost:3001',
      DATA_INTERVAL: 5000
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

**Note**: This simulator is designed for testing and development purposes. For production use, replace with actual bike hardware and GPS data. 