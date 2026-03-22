import { useWorkflowStore } from '../../store/workflowStore';
import type { ContainerNodeData } from '../../types';

export function ContainerDetailPanel() {
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId);
  const nodes = useWorkflowStore((s) => s.nodes);
  const updateContainerData = useWorkflowStore((s) => s.updateContainerData);
  const setSelectedNodeId = useWorkflowStore((s) => s.setSelectedNodeId);

  const node = nodes.find((n) => n.id === selectedNodeId);
  if (!node) return null;
  const data = node.data as ContainerNodeData;

  return (
    <div className="panel detail-panel">
      <div className="panel-header">
        <h3>{data.label}</h3>
        <button className="close-btn" onClick={() => setSelectedNodeId(null)}>✕</button>
      </div>

      <section>
        <h4>Container Config</h4>
        <label>
          Image
          <input
            type="text"
            value={data.image}
            onChange={(e) => updateContainerData(node.id, { image: e.target.value })}
          />
        </label>
        <label>
          Namespace
          <input
            type="text"
            value={data.namespace ?? 'default'}
            onChange={(e) => updateContainerData(node.id, { namespace: e.target.value })}
          />
        </label>
      </section>

      <section>
        <h4>Resources</h4>
        <div className="resource-grid">
          <label>
            CPU Req
            <input
              type="text"
              value={data.resources?.cpuRequest ?? ''}
              onChange={(e) =>
                updateContainerData(node.id, {
                  resources: { ...data.resources, cpuRequest: e.target.value },
                })
              }
            />
          </label>
          <label>
            CPU Limit
            <input
              type="text"
              value={data.resources?.cpuLimit ?? ''}
              onChange={(e) =>
                updateContainerData(node.id, {
                  resources: { ...data.resources, cpuLimit: e.target.value },
                })
              }
            />
          </label>
          <label>
            Mem Req
            <input
              type="text"
              value={data.resources?.memoryRequest ?? ''}
              onChange={(e) =>
                updateContainerData(node.id, {
                  resources: { ...data.resources, memoryRequest: e.target.value },
                })
              }
            />
          </label>
          <label>
            Mem Limit
            <input
              type="text"
              value={data.resources?.memoryLimit ?? ''}
              onChange={(e) =>
                updateContainerData(node.id, {
                  resources: { ...data.resources, memoryLimit: e.target.value },
                })
              }
            />
          </label>
          <label>
            Replicas
            <input
              type="number"
              min={0}
              value={data.resources?.replicas ?? 1}
              onChange={(e) =>
                updateContainerData(node.id, {
                  resources: { ...data.resources, replicas: parseInt(e.target.value) || 1 },
                })
              }
            />
          </label>
        </div>
      </section>

      <section>
        <h4>Sub-processes ({data.subNodes.length})</h4>
        <ul className="sub-process-list">
          {data.subNodes.map((sn) => (
            <li key={sn.id}>
              <span className="sub-type-badge">{sn.data.type}</span>
              {sn.data.label}
              <span
                className="sub-status-dot"
                style={{
                  backgroundColor:
                    sn.data.status === 'running'
                      ? '#3b82f6'
                      : sn.data.status === 'success'
                        ? '#10b981'
                        : sn.data.status === 'error'
                          ? '#ef4444'
                          : '#64748b',
                }}
              />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
