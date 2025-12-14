import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard'; // Import your new Master-Detail component

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        {/* You can add a global Navigation Bar here if you want */}
        
        <Routes>
          {/* Map the root URL ("/") directly to your Dashboard */}
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;