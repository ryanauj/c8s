import React, { useState, useEffect } from 'react';
import { api, K8sContext } from '../api';
import './ContextSelector.css';

interface ContextSelectorProps {
  onContextChange: () => void;
}

const ContextSelector: React.FC<ContextSelectorProps> = ({ onContextChange }) => {
  const [contexts, setContexts] = useState<K8sContext[]>([]);
  const [currentContext, setCurrentContext] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadContexts();
  }, []);

  const loadContexts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getContexts();
      setContexts(data.contexts);
      setCurrentContext(data.currentContext);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load contexts');
    } finally {
      setLoading(false);
    }
  };

  const handleContextChange = async (contextName: string) => {
    try {
      setError(null);
      await api.setContext(contextName);
      setCurrentContext(contextName);
      onContextChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change context');
    }
  };

  if (loading) {
    return <div className="context-selector">Loading contexts...</div>;
  }

  if (error) {
    return (
      <div className="context-selector error">
        <span>Error: {error}</span>
        <button onClick={loadContexts}>Retry</button>
      </div>
    );
  }

  return (
    <div className="context-selector">
      <label htmlFor="context-select">Kubernetes Context:</label>
      <select
        id="context-select"
        value={currentContext}
        onChange={(e) => handleContextChange(e.target.value)}
      >
        {contexts.map((ctx) => (
          <option key={ctx.name} value={ctx.name}>
            {ctx.name} ({ctx.cluster})
          </option>
        ))}
      </select>
      {currentContext && (
        <span className="current-context-info">
          Current: {currentContext}
        </span>
      )}
    </div>
  );
};

export default ContextSelector;
