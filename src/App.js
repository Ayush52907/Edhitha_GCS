import React from 'react';
import Telemetry from './Telemetry';
import Commands from './Commands'; // Import the new component

function App() {
  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
      <div style={{ width: '100%' }}>
        <h1>Edhitha Ground Control Station</h1>
        <hr />
      </div>
      
      {/* Our Two Architecture Layers side-by-side */}
      <Telemetry />
      <Commands />
      
    </div>
  );
}

export default App;