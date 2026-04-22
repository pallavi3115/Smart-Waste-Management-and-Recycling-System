// iot-simulator.js
const WebSocket = require('ws');

// Configuration
const WS_PORT = 8080;
const UPDATE_INTERVAL = 15000; // 15 seconds

// Bin data
const bins = [
  { id: 'bin1', binId: 'BN001', area: 'Sector 12', fillLevel: 45, status: 'Partial', wifiStrength: 85, alerts: { fire: false, overflow: false } },
  { id: 'bin2', binId: 'BN002', area: 'Sector 15', fillLevel: 60, status: 'Partial', wifiStrength: 92, alerts: { fire: false, overflow: false } },
  { id: 'bin3', binId: 'BN003', area: 'Block A', fillLevel: 30, status: 'Empty', wifiStrength: 78, alerts: { fire: false, overflow: false } },
  { id: 'bin4', binId: 'BN004', area: 'Market Complex', fillLevel: 85, status: 'Full', wifiStrength: 45, alerts: { fire: true, overflow: true } },
  { id: 'bin5', binId: 'BN005', area: 'Sector 20', fillLevel: 55, status: 'Partial', wifiStrength: 88, alerts: { fire: false, overflow: false } },
  { id: 'bin6', binId: 'BN006', area: 'Sector 8', fillLevel: 15, status: 'Empty', wifiStrength: 95, alerts: { fire: false, overflow: false } }
];

// Function to update bin fill level
function updateBinFillLevel(bin) {
  // Random change between -5 and +15
  const change = (Math.random() * 20) - 5;
  let newLevel = bin.fillLevel + change;
  newLevel = Math.min(100, Math.max(0, newLevel));
  bin.fillLevel = Math.floor(newLevel);
  
  // Update status based on fill level
  if (bin.fillLevel >= 80) bin.status = 'Full';
  else if (bin.fillLevel >= 50) bin.status = 'Partial';
  else bin.status = 'Empty';
  
  // Random alerts (5% chance)
  bin.alerts.overflow = bin.fillLevel > 85 && Math.random() < 0.1;
  bin.alerts.fire = Math.random() < 0.02;
  
  // Update wifi strength
  bin.wifiStrength = Math.min(100, Math.max(20, bin.wifiStrength + (Math.random() * 10 - 5)));
  bin.wifiStrength = Math.floor(bin.wifiStrength);
  
  bin.lastUpdated = new Date().toISOString();
  
  return bin;
}

// Create WebSocket Server
const wss = new WebSocket.Server({ port: WS_PORT });
console.log(`🔌 IoT WebSocket server running on port ${WS_PORT}`);
console.log(`📡 WebSocket URL: ws://localhost:${WS_PORT}`);

// Store connected clients
const clients = new Set();

wss.on('connection', (ws) => {
  console.log('✅ New client connected to IoT WebSocket');
  clients.add(ws);
  
  // Send initial bin data
  ws.send(JSON.stringify({
    type: 'initial_data',
    data: bins
  }));
  
  ws.on('close', () => {
    console.log('❌ Client disconnected');
    clients.delete(ws);
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Broadcast to all connected clients
function broadcast(data) {
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// Simulate real-time bin updates
setInterval(() => {
  // Update random bin
  const randomIndex = Math.floor(Math.random() * bins.length);
  const updatedBin = updateBinFillLevel(bins[randomIndex]);
  
  console.log(`📊 [${new Date().toLocaleTimeString()}] Bin ${updatedBin.binId}: ${updatedBin.status} (${updatedBin.fillLevel}%) | WiFi: ${updatedBin.wifiStrength}%`);
  
  // Broadcast update to all clients
  broadcast({
    type: 'bin_update',
    data: updatedBin
  });
}, UPDATE_INTERVAL);

// Also update all bins periodically
setInterval(() => {
  bins.forEach(bin => updateBinFillLevel(bin));
  console.log(`🔄 All bins updated at ${new Date().toLocaleTimeString()}`);
}, 60000); // Every minute

console.log('\n🚀 IoT Bin Simulator Started!');
console.log(`📊 Simulating ${bins.length} smart bins`);
console.log(`🔄 Updates every ${UPDATE_INTERVAL/1000} seconds`);
console.log('\n📋 Initial Bin Status:');
bins.forEach(bin => {
  console.log(`   ${bin.binId} | ${bin.area} | ${bin.status} | ${bin.fillLevel}% | WiFi: ${bin.wifiStrength}%`);
});
console.log('\n💡 Waiting for frontend to connect...\n');