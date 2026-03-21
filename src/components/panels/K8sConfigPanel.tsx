import { useWorkflowStore } from '../../store/workflowStore';

export function K8sConfigPanel() {
  const k8sConfig = useWorkflowStore((s) => s.k8sConfig);
  const setK8sConfig = useWorkflowStore((s) => s.setK8sConfig);

  return (
    <div className="panel k8s-panel">
      <h3>K8s Configuration</h3>

      <label>
        API Endpoint
        <input
          type="text"
          value={k8sConfig.apiEndpoint}
          onChange={(e) => setK8sConfig({ apiEndpoint: e.target.value })}
          placeholder="https://k8s.example.com:6443"
        />
      </label>

      <label>
        API Key / Token
        <input
          type="password"
          value={k8sConfig.apiKey}
          onChange={(e) => setK8sConfig({ apiKey: e.target.value })}
          placeholder="Bearer token or service account key"
        />
      </label>

      <label>
        Namespace
        <input
          type="text"
          value={k8sConfig.namespace}
          onChange={(e) => setK8sConfig({ namespace: e.target.value })}
        />
      </label>

      <div className="k8s-status">
        <span
          className="status-dot"
          style={{ backgroundColor: k8sConfig.connected ? '#10b981' : '#64748b' }}
        />
        {k8sConfig.connected ? 'Connected' : 'Disconnected'}
      </div>

      <button
        className="connect-btn"
        onClick={() => setK8sConfig({ connected: !k8sConfig.connected })}
      >
        {k8sConfig.connected ? 'Disconnect' : 'Connect'}
      </button>
    </div>
  );
}
