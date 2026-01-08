import React, { useState } from 'react';
import './App.css';
import ContextSelector from './components/ContextSelector';
import ResourceVisualizer from './components/ResourceVisualizer';

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleContextChange = () => {
    // Trigger a refresh of the visualizer when context changes
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Kubernetes Resource Visualizer</h1>
        <ContextSelector onContextChange={handleContextChange} />
      </header>
      <main className="App-main">
        <ResourceVisualizer refreshTrigger={refreshTrigger} />
      </main>
    </div>
  );
}

export default App;
