import React, { useState } from 'react';
import * as ROSLIB from 'roslib';

function Commands() {
  const [status, setStatus] = useState('Standing by...');

  // Helper to establish connection
  const getRosConnection = () => new ROSLIB.Ros({ url: 'ws://localhost:9090' });

  // 1. FLIGHT MODE SERVICE
  const changeFlightMode = (modeName) => {
    setStatus(`Sending request to change to ${modeName}...`);
    const setModeClient = new ROSLIB.Service({
      ros: getRosConnection(),
      name: '/mavros/set_mode',
      serviceType: 'mavros_msgs/SetMode'
    });

    const request = { base_mode: 0, custom_mode: modeName };

    setModeClient.callService(request, 
      (result) => {
        if (result.mode_sent) setStatus(`Success! Mode changed to ${modeName}.`);
        else setStatus(`Failed to change mode to ${modeName}.`);
      }, 
      (error) => setStatus(`Service failed: ${error}`)
    );
  };

  // 2. ARMING SERVICE
  const setArmState = (armDrone) => {
    setStatus(armDrone ? 'Arming motors...' : 'Disarming motors...');
    const armingClient = new ROSLIB.Service({
      ros: getRosConnection(),
      name: '/mavros/cmd/arming',
      serviceType: 'mavros_msgs/CommandBool'
    });

    const request = { value: armDrone };

    armingClient.callService(request, 
      (result) => {
        if (result.success) setStatus(armDrone ? 'Success! Drone is ARMED.' : 'Success! Drone is DISARMED.');
        else setStatus('Arming command rejected.');
      }, 
      (error) => setStatus(`Service failed: ${error}`)
    );
  };

  // 3. TAKEOFF SERVICE
  const triggerTakeoff = (targetAltitude) => {
    setStatus(`Commanding takeoff to ${targetAltitude} meters...`);
    const takeoffClient = new ROSLIB.Service({
      ros: getRosConnection(),
      name: '/mavros/cmd/takeoff',
      serviceType: 'mavros_msgs/CommandTOL'
    });

    // We only need to provide the altitude, ArduPilot handles the rest
    const request = { altitude: targetAltitude, latitude: 0, longitude: 0, min_pitch: 0, yaw: 0 };

    takeoffClient.callService(request, 
      (result) => {
        if (result.success) setStatus(`Success! Taking off to ${targetAltitude}m.`);
        else setStatus('Takeoff rejected. (Are you Armed and in GUIDED mode?)');
      }, 
      (error) => setStatus(`Service failed: ${error}`)
    );
  };

  // The UI Layer
  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', maxWidth: '400px', marginTop: '20px' }}>
      <h2>Flight Controls</h2>
      
      <h4>1. Flight Modes</h4>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <button onClick={() => changeFlightMode('STABILIZE')} style={btnStyle}>Stabilize</button>
        <button onClick={() => changeFlightMode('GUIDED')} style={btnStyle}>Guided</button>
        <button onClick={() => changeFlightMode('LOITER')} style={btnStyle}>Loiter</button>
      </div>

      <h4>2. Motor Control</h4>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <button onClick={() => setArmState(true)} style={{...btnStyle, backgroundColor: '#dc3545'}}>ARM</button>
        <button onClick={() => setArmState(false)} style={{...btnStyle, backgroundColor: '#6c757d'}}>DISARM</button>
      </div>

      <h4>3. Actions</h4>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        {/* Takes off to 10 meters */}
        <button onClick={() => triggerTakeoff(10.0)} style={{...btnStyle, backgroundColor: '#28a745'}}>Takeoff (10m)</button>
        
        {/* In ArduCopter, the safest way to land is simply changing the flight mode to LAND */}
        <button onClick={() => changeFlightMode('LAND')} style={{...btnStyle, backgroundColor: '#ffc107', color: 'black'}}>Land</button>
      </div>
      
      <p><strong>Command Status:</strong> {status}</p>
    </div>
  );
}

const btnStyle = {
  padding: '10px 15px',
  backgroundColor: '#007BFF',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontWeight: 'bold'
};

export default Commands;