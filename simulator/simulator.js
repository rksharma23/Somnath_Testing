const axios = require('axios');

// Get server URL from command line argument or environment variable
// Default to your current setup but allow flexibility
const SERVER_URL = process.argv[2] || process.env.SERVER_URL || 'http://10.107.255.99:3001';
const INTERVAL_MS = process.env.INTERVAL_MS || 5000;

// Define 1 bike with realistic bicycle speed
const BIKE = {
  bikeId: 'BIKE001',
  baseLocation: { lat: 19.0760, lng: 72.8777 }, // Mumbai
  avgSpeedRange: [12, 28], // Realistic bicycle speeds in km/h
  distanceRange: [1, 8]
};

console.log(`Using server URL: ${SERVER_URL}`);
console.log(`Simulating 1 bike`);
console.log(`Interval: ${INTERVAL_MS}ms`);

function getCurrentTimestampISO() {
  return new Date().toISOString();
}

// Battery and send counter logic
let battery = 70;
let sendCount = 0;
let lastBatteryUpdate = Date.now();

// Function to generate random data for the bike
function generateData(bike) {
  const [minSpeed, maxSpeed] = bike.avgSpeedRange;
  const [minDistance, maxDistance] = bike.distanceRange;
  
  // Add some randomness to location around base location
  const locationOffset = 0.005; // Small offset for realistic movement
  const lat = bike.baseLocation.lat + (Math.random() - 0.5) * locationOffset;
  const lng = bike.baseLocation.lng + (Math.random() - 0.5) * locationOffset;
  
  return {
    avgSpeed: parseFloat((Math.random() * (maxSpeed - minSpeed) + minSpeed).toFixed(2)),
    location: { lat, lng },
    battery: battery
  };
}

// Send data for the bike
const sendBikeData = async (bike) => {
  const payload = {
    bikeId: bike.bikeId,
    data: generateData(bike)
  };

  try {
    const response = await axios.post(`${SERVER_URL}/api/bike/data`, payload);
    console.log(`[✓] ${bike.bikeId} - Status: ${response.status} | Battery: ${battery}%`);
  } catch (error) {
    console.error(`[x] Error sending data for ${bike.bikeId}:`, error.message);
  }
};

// Send data for the bike and update battery logic
const sendBikeDataOnce = async () => {
  console.log(`\n🔄 Sending data for bike at ${getCurrentTimestampISO()}`);
  await sendBikeData(BIKE);
  sendCount++;

  // Battery logic: decrease after every 5 sends or 30 seconds
  const now = Date.now();
  if (sendCount >= 5 || (now - lastBatteryUpdate) >= 30000) {
    battery--;
    sendCount = 0;
    lastBatteryUpdate = now;
    if (battery < 30) {
      battery = 70;
      console.log('🔋 Battery reset to 70%');
    }
  }

  console.log('✅ Bike data sent successfully\n');
};

// Check server health
async function checkHealth() {
  try {
    const response = await axios.get(`${SERVER_URL}/health`);
    console.log('Server health:', response.data);
    return true;
  } catch (error) {
    console.error('Server health check failed:', error.message);
    return false;
  }
}

// Main simulation loop
async function startSimulation() {
  console.log('🚴 Single Bike ESP32 Simulator started...');
  console.log(`Target server: ${SERVER_URL}`);
  console.log('Bike being simulated:');
  console.log(`  - ${BIKE.bikeId}`);
  
  // Check if server is running
  const isHealthy = await checkHealth();
  if (!isHealthy) {
    console.log('Server is not running. Please start the server first.');
    console.log('Make sure the server URL is correct and accessible from this device.');
    return;
  }

  console.log('\nConnected to server. Starting bike data transmission...');
  console.log('Press Ctrl+C to stop the simulator');

  // Send initial data immediately
  sendBikeDataOnce();
  
  // Then send data at regular intervals
  setInterval(sendBikeDataOnce, INTERVAL_MS);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Single bike simulator stopped.');
  process.exit(0);
});

// Start the simulation
startSimulation();