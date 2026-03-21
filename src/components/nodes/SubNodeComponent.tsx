import { Handle, Position } from '@xyflow/react';
import type { SubNodeData } from '../../types';

const typeIcons: Record<string, string> = {
  'generic': '⚙',
  'ai-tool-call': '🤖',
  'webhook': '🔗',
  'transform': '🔄',
  'custom': '📦',
};

const statusColors: Record<string, string> = {
  idle: '#64748b',
  running: '#3b82f6',
  success: '#10b981',
  error: '#ef4444',
};

interface SubNodeProps {
  data: SubNodeData;
}

export function SubNodeComponent({ data }: SubNodeProps) {
  const statusColor = statusColors[data.status ?? 'idle'];

  return (
    <div className="sub-node" style={{ borderColor: statusColor }}>
      <Handle type="target" position={Position.Left} className="sub-handle" />
      <div className="sub-node-header">
        <span className="sub-node-icon">{typeIcons[data.type] ?? '⚙'}</span>
        <span className="sub-node-label">{data.label}</span>
        <span className="sub-node-status" style={{ backgroundColor: statusColor }} />
      </div>
      {data.type === 'ai-tool-call' && data.model && (
        <div className="sub-node-meta">{data.model}</div>
      )}
      {data.description && (
        <div className="sub-node-meta">{data.description}</div>
      )}
      <Handle type="source" position={Position.Right} className="sub-handle" />
    </div>
  );
}
