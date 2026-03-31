import React, { useState, useEffect } from 'react';
import * as ROSLIB from 'roslib';

function Telemetry() {
  // 1. The "Brain" - Added isArmed state
  const [connected, setConnected] = useState(false);
  const [flightMode, setFlightMode] = useState('UNKNOWN');
  const [isArmed, setIsArmed] = useState(false); // NEW STATE
  const [altitude, setAltitude] = useState(0.00);
  const [battery, setBattery] = useState(0);
  const [gps, setGps] = useState({ lat: 0.0, lng: 0.0 });

  // 2. The "Ears"
  useEffect(() => {
    const ros = new ROSLIB.Ros({
      url: 'ws://localhost:9090'
    });

    ros.on('connection', () => { setConnected(true); });
    ros.on('error', (error) => { console.log('Error: ', error); });
    ros.on('close', () => { setConnected(false); });

    // Flight Mode & Armed Status (Both come from the same topic!)
    const stateListener = new ROSLIB.Topic({
      ros: ros,
      name: '/mavros/state',
      messageType: 'mavros_msgs/State'
    });
    stateListener.subscribe((message) => { 
      setFlightMode(message.mode); 
      setIsArmed(message.armed); // NEW: Catching the armed boolean
    });

    // Altitude
    const altListener = new ROSLIB.Topic({
      ros: ros,
      name: '/mavros/global_position/rel_alt',
      messageType: 'std_msgs/Float64'
    });
    altListener.subscribe((message) => { setAltitude(message.data.toFixed(2)); });

    // Battery
    const batteryListener = new ROSLIB.Topic({
      ros: ros,
      name: '/mavros/battery',
      messageType: 'sensor_msgs/BatteryState'
    });
    batteryListener.subscribe((message) => {
      setBattery((message.percentage * 100).toFixed(0));
    });

    // GPS
    const gpsListener = new ROSLIB.Topic({
      ros: ros,
      name: '/mavros/global_position/global',
      messageType: 'sensor_msgs/NavSatFix'
    });
    gpsListener.subscribe((message) => {
      setGps({ 
        lat: message.latitude.toFixed(5), 
        lng: message.longitude.toFixed(5) 
      });
    });

    // Cleanup
    return () => {
      stateListener.unsubscribe();
      altListener.unsubscribe();
      batteryListener.unsubscribe();
      gpsListener.unsubscribe();
      ros.close();
    };
  }, []);

  // 3. The UI Layer
  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', maxWidth: '400px' }}>
      <h2>Telemetry Data</h2>
      <p>
        <strong>Bridge Status: </strong> 
        {connected ? <span style={{color: 'green'}}>Connected</span> : <span style={{color: 'red'}}>Disconnected</span>}
      </p>
      
      {/* NEW: Armed Status Display */}
      <p>
        <strong>Armed Status: </strong> 
        {isArmed ? <span style={{color: '#dc3545', fontWeight: 'bold'}}>ARMED</span> : <span style={{color: '#28a745', fontWeight: 'bold'}}>DISARMED</span>}
      </p>
      
      <p><strong>Flight Mode: </strong> {flightMode}</p>
      <p><strong>Relative Altitude: </strong> {altitude} m</p>
      <p><strong>Battery: </strong> {battery}%</p>
      <p><strong>GPS (Lat, Lng): </strong> {gps.lat}, {gps.lng}</p>
    </div>
  );
}

export default Telemetry;