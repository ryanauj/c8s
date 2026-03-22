import { useWorkflowStore } from '../../store/workflowStore';

const levelColors: Record<string, string> = {
  info: '#3b82f6',
  warn: '#f59e0b',
  error: '#ef4444',
  debug: '#64748b',
};

export function LogPanel() {
  const logs = useWorkflowStore((s) => s.logs);
  const clearLogs = useWorkflowStore((s) => s.clearLogs);
  const activeTraceId = useWorkflowStore((s) => s.activeTraceId);
  const setActiveTraceId = useWorkflowStore((s) => s.setActiveTraceId);

  const filteredLogs = activeTraceId
    ? logs.filter((l) => l.traceId === activeTraceId)
    : logs;

  return (
    <div className="panel log-panel">
      <div className="panel-header">
        <h3>Logs & Traces</h3>
        <div className="log-actions">
          {activeTraceId && (
            <button className="trace-filter-btn" onClick={() => setActiveTraceId(null)}>
              Clear filter: {activeTraceId.slice(0, 8)}…
            </button>
          )}
          <button className="clear-btn" onClick={clearLogs}>Clear</button>
        </div>
      </div>

      <div className="log-entries">
        {filteredLogs.length === 0 && (
          <div className="log-empty">No log entries. Run a trace to see activity.</div>
        )}
        {filteredLogs.map((log) => (
          <div key={log.id} className="log-entry">
            <span className="log-time">
              {new Date(log.timestamp).toLocaleTimeString()}
            </span>
            <span className="log-level" style={{ color: levelColors[log.level] }}>
              {log.level.toUpperCase()}
            </span>
            <span className="log-container">{log.containerId}</span>
            {log.subNodeId && <span className="log-subnode">{log.subNodeId}</span>}
            <span className="log-message">{log.message}</span>
            {log.traceId && (
              <button
                className="trace-btn"
                onClick={() => setActiveTraceId(log.traceId!)}
                title="Filter by trace"
              >
                🔍
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
