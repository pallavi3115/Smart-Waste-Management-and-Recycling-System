const axios = require('axios');
require('dotenv').config();

const API_URL = process.env.API_URL || 'http://localhost:5000/api';

class BinSimulator {
  constructor(binId, location, area) {
    this.binId = binId;
    this.location = location;
    this.area = area;
    this.fill_level = 0;
    this.fire_alert = false;
    this.status = 'Empty';
  }

  async updateBinStatus() {
    // Simulate random fill level increase
    this.fill_level += Math.random() * 10;
    
    if (this.fill_level > 100) this.fill_level = 100;
    
    // Update status based on fill level
    if (this.fill_level < 25) this.status = 'Empty';
    else if (this.fill_level < 75) this.status = 'Partial';
    else this.status = 'Full';
    
    // Random fire alert (1% chance)
    if (Math.random() < 0.01) {
      this.fire_alert = true;
    } else {
      this.fire_alert = false;
    }

    try {
      const response = await axios.post(`${API_URL}/bins/update`, {
        binId: this.binId,
        fill_level: this.fill_level,
        fire_alert: this.fire_alert,
        status: this.status
      });
      
      console.log(`Bin ${this.binId} updated: ${this.status} (${this.fill_level}%)`);
    } catch (error) {
      console.error(`Error updating bin ${this.binId}:`, error.message);
    }
  }

  // Simulate waste collection (reset bin)
  async collectWaste() {
    this.fill_level = 0;
    this.fire_alert = false;
    this.status = 'Empty';
    
    try {
      await axios.post(`${API_URL}/bins/update`, {
        binId: this.binId,
        fill_level: this.fill_level,
        fire_alert: this.fire_alert,
        status: this.status
      });
      
      console.log(`Bin ${this.binId} collected and reset`);
    } catch (error) {
      console.error(`Error collecting bin ${this.binId}:`, error.message);
    }
  }
}

// Create multiple bin simulators
const bins = [
  new BinSimulator('65a1b2c3d4e5f6a7b8c9d0e1', { lat: 28.6139, lng: 77.2090 }, 'Central Delhi'),
  new BinSimulator('65a1b2c3d4e5f6a7b8c9d0e2', { lat: 28.5355, lng: 77.3910 }, 'South Delhi'),
  new BinSimulator('65a1b2c3d4e5f6a7b8c9d0e3', { lat: 28.7041, lng: 77.1025 }, 'North Delhi')
];

// Simulate updates every 30 seconds
setInterval(() => {
  bins.forEach(bin => {
    bin.updateBinStatus();
  });
}, 30000);

console.log('IoT Bin Simulator started...');