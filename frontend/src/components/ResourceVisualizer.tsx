import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MiniMap,
  BackgroundVariant,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { api, K8sResources } from '../api';
import './ResourceVisualizer.css';

const ResourceVisualizer: React.FC<{ refreshTrigger: number }> = ({ refreshTrigger }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadResources = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const resources: K8sResources = await api.getResources();
      
      const flowNodes: Node[] = [];
      const flowEdges: Edge[] = [];
      
      // Create nodes for each K8s node
      resources.nodes.forEach((node, index) => {
        flowNodes.push({
          id: node.id,
          type: 'default',
          position: { x: 100 + (index * 300), y: 100 },
          data: {
            label: (
              <div className="node-label">
                <div className="node-icon">🖥️</div>
                <div className="node-name">{node.name}</div>
                <div className="node-type">Node</div>
                <div className={`node-status status-${node.status.toLowerCase()}`}>
                  {node.status}
                </div>
              </div>
            ),
          },
          style: {
            background: '#1976d2',
            color: 'white',
            border: '2px solid #115293',
            borderRadius: '8px',
            padding: '10px',
            width: 180,
          },
        });
      });
      
      // Group pods by namespace
      const podsByNamespace: Record<string, typeof resources.pods> = {};
      resources.pods.forEach(pod => {
        if (!podsByNamespace[pod.namespace]) {
          podsByNamespace[pod.namespace] = [];
        }
        podsByNamespace[pod.namespace].push(pod);
      });
      
      // Create nodes for pods (grouped by namespace)
      let podYOffset = 300;
      Object.entries(podsByNamespace).forEach(([namespace, pods], nsIndex) => {
        pods.slice(0, 20).forEach((pod, podIndex) => {
          const podNode: Node = {
            id: pod.id,
            type: 'default',
            position: { 
              x: 50 + (podIndex % 6) * 200, 
              y: podYOffset + Math.floor(podIndex / 6) * 120 
            },
            data: {
              label: (
                <div className="node-label">
                  <div className="node-icon">📦</div>
                  <div className="node-name">{pod.name}</div>
                  <div className="node-namespace">{namespace}</div>
                  <div className={`node-status status-${pod.status.toLowerCase()}`}>
                    {pod.status}
                  </div>
                </div>
              ),
            },
            style: {
              background: '#4caf50',
              color: 'white',
              border: '2px solid #2e7d32',
              borderRadius: '8px',
              padding: '8px',
              width: 160,
              fontSize: '11px',
            },
          };
          flowNodes.push(podNode);
          
          // Connect pod to its node if nodeName is available
          if (pod.nodeName) {
            const k8sNode = resources.nodes.find(n => n.name === pod.nodeName);
            if (k8sNode) {
              flowEdges.push({
                id: `${k8sNode.id}-${pod.id}`,
                source: k8sNode.id,
                target: pod.id,
                type: 'smoothstep',
                animated: true,
                style: { stroke: '#1976d2' },
              });
            }
          }
        });
        podYOffset += Math.ceil(Math.min(pods.length, 20) / 6) * 120 + 50;
      });
      
      // Create nodes for deployments
      resources.deployments.forEach((deployment, index) => {
        flowNodes.push({
          id: deployment.id,
          type: 'default',
          position: { x: 1100 + (index % 3) * 220, y: 100 + Math.floor(index / 3) * 150 },
          data: {
            label: (
              <div className="node-label">
                <div className="node-icon">🚀</div>
                <div className="node-name">{deployment.name}</div>
                <div className="node-namespace">{deployment.namespace}</div>
                <div className="node-replicas">
                  {deployment.availableReplicas}/{deployment.replicas} replicas
                </div>
              </div>
            ),
          },
          style: {
            background: '#ff9800',
            color: 'white',
            border: '2px solid #e65100',
            borderRadius: '8px',
            padding: '8px',
            width: 180,
          },
        });
        
        // Connect deployments to matching pods by labels
        resources.pods.forEach(pod => {
          if (pod.namespace === deployment.namespace) {
            const matchesSelector = Object.entries(deployment.selector).every(
              ([key, value]) => pod.labels[key] === value
            );
            if (matchesSelector) {
              flowEdges.push({
                id: `${deployment.id}-${pod.id}`,
                source: deployment.id,
                target: pod.id,
                type: 'smoothstep',
                animated: false,
                style: { stroke: '#ff9800', strokeDasharray: '5,5' },
              });
            }
          }
        });
      });
      
      // Create nodes for services
      resources.services.forEach((service, index) => {
        flowNodes.push({
          id: service.id,
          type: 'default',
          position: { x: 1400 + (index % 3) * 220, y: 100 + Math.floor(index / 3) * 150 },
          data: {
            label: (
              <div className="node-label">
                <div className="node-icon">🌐</div>
                <div className="node-name">{service.name}</div>
                <div className="node-namespace">{service.namespace}</div>
                <div className="node-service-type">{service.serviceType}</div>
              </div>
            ),
          },
          style: {
            background: '#9c27b0',
            color: 'white',
            border: '2px solid #6a0080',
            borderRadius: '8px',
            padding: '8px',
            width: 180,
          },
        });
        
        // Connect services to matching pods by selector
        resources.pods.forEach(pod => {
          if (pod.namespace === service.namespace) {
            const matchesSelector = Object.entries(service.selector).every(
              ([key, value]) => pod.labels[key] === value
            );
            if (matchesSelector) {
              flowEdges.push({
                id: `${service.id}-${pod.id}`,
                source: service.id,
                target: pod.id,
                type: 'smoothstep',
                animated: false,
                style: { stroke: '#9c27b0' },
              });
            }
          }
        });
      });
      
      setNodes(flowNodes);
      setEdges(flowEdges);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load resources');
    } finally {
      setLoading(false);
    }
  }, [setNodes, setEdges]);

  useEffect(() => {
    loadResources();
  }, [loadResources, refreshTrigger]);

  if (loading) {
    return (
      <div className="resource-visualizer loading">
        <div className="loading-spinner">Loading Kubernetes resources...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="resource-visualizer error">
        <div className="error-message">
          <h3>Error loading resources</h3>
          <p>{error}</p>
          <button onClick={loadResources}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="resource-visualizer">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        <Panel position="top-right">
          <div className="legend">
            <h4>Legend</h4>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#1976d2' }}></span>
              <span>Nodes</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#4caf50' }}></span>
              <span>Pods</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#ff9800' }}></span>
              <span>Deployments</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#9c27b0' }}></span>
              <span>Services</span>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};

export default ResourceVisualizer;
