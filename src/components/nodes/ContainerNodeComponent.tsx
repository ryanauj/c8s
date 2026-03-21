import { memo, useCallback, useMemo } from 'react';
import {
  Handle,
  Position,
  ReactFlow,
  ReactFlowProvider,
  type NodeTypes,
  type NodeProps,
} from '@xyflow/react';
import { useWorkflowStore } from '../../store/workflowStore';
import { SubNodeComponent } from './SubNodeComponent';
import type { ContainerNodeData, SubNode } from '../../types';

const statusBadge: Record<string, { color: string; label: string }> = {
  pending: { color: '#f59e0b', label: 'Pending' },
  running: { color: '#10b981', label: 'Running' },
  succeeded: { color: '#6366f1', label: 'Done' },
  failed: { color: '#ef4444', label: 'Failed' },
  unknown: { color: '#64748b', label: '?' },
};

const subNodeTypes: NodeTypes = {
  'sub-node': SubNodeComponent as unknown as NodeTypes['sub-node'],
};

function ContainerNodeInner({ id, data }: NodeProps<ContainerNodeData & Record<string, unknown>>) {
  const toggleExpanded = useWorkflowStore((s) => s.toggleContainerExpanded);
  const setSelectedNodeId = useWorkflowStore((s) => s.setSelectedNodeId);
  const badge = statusBadge[data.status ?? 'unknown'];

  const handleToggle = useCallback(() => toggleExpanded(id), [id, toggleExpanded]);
  const handleSelect = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedNodeId(id);
    },
    [id, setSelectedNodeId],
  );

  // Build handles for each sub-node so cross-container edges can target them
  const subNodeHandles = useMemo(
    () =>
      (data.subNodes ?? []).map((sn: SubNode) => (
        <span key={sn.id}>
          <Handle
            type="target"
            position={Position.Left}
            id={`${sn.id}-target`}
            style={{ top: '50%', opacity: 0, pointerEvents: 'none' }}
          />
          <Handle
            type="source"
            position={Position.Right}
            id={`${sn.id}-source`}
            style={{ top: '50%', opacity: 0, pointerEvents: 'none' }}
          />
        </span>
      )),
    [data.subNodes],
  );

  return (
    <div
      className={`container-node ${data.expanded ? 'expanded' : 'collapsed'}`}
      onClick={handleSelect}
    >
      {/* Default handles for simple container-to-container edges */}
      <Handle type="target" position={Position.Left} id="default-target" />
      <Handle type="source" position={Position.Right} id="default-source" />
      {subNodeHandles}

      {/* Header */}
      <div className="container-header">
        <button className="expand-btn" onClick={handleToggle}>
          {data.expanded ? '▾' : '▸'}
        </button>
        <span className="container-label">{data.label}</span>
        <span className="container-badge" style={{ backgroundColor: badge.color }}>
          {badge.label}
        </span>
        {data.resources?.replicas && (
          <span className="container-replicas">×{data.resources.replicas}</span>
        )}
      </div>

      {/* Image tag */}
      <div className="container-image">{data.image}</div>

      {/* Embedded subgraph */}
      {data.expanded && data.subNodes.length > 0 && (
        <div className="container-subgraph">
          <ReactFlowProvider>
            <ReactFlow
              nodes={data.subNodes}
              edges={data.subEdges}
              nodeTypes={subNodeTypes}
              fitView
              panOnDrag={false}
              zoomOnScroll={false}
              zoomOnDoubleClick={false}
              preventScrolling={false}
              nodesDraggable={false}
              nodesConnectable={false}
              proOptions={{ hideAttribution: true }}
              className="subgraph-flow"
            />
          </ReactFlowProvider>
        </div>
      )}

      {/* Collapsed summary */}
      {!data.expanded && data.subNodes.length > 0 && (
        <div className="container-summary">
          {data.subNodes.length} process{data.subNodes.length !== 1 ? 'es' : ''}
        </div>
      )}
    </div>
  );
}

export const ContainerNodeComponent = memo(ContainerNodeInner);
