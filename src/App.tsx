import { useCallback, useState } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  type NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useWorkflowStore } from './store/workflowStore';
import { ContainerNodeComponent } from './components/nodes/ContainerNodeComponent';
import { K8sConfigPanel } from './components/panels/K8sConfigPanel';
import { ContainerDetailPanel } from './components/panels/ContainerDetailPanel';
import { LogPanel } from './components/panels/LogPanel';
import { useDemoSimulation } from './hooks/useDemoSimulation';
import './App.css';

const nodeTypes: NodeTypes = {
  container: ContainerNodeComponent as unknown as NodeTypes['container'],
};

type SidePanel = 'k8s' | 'logs' | null;

function WorkflowCanvas() {
  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);
  const onNodesChange = useWorkflowStore((s) => s.onNodesChange);
  const onEdgesChange = useWorkflowStore((s) => s.onEdgesChange);
  const onConnect = useWorkflowStore((s) => s.onConnect);
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId);
  const setSelectedNodeId = useWorkflowStore((s) => s.setSelectedNodeId);

  const [sidePanel, setSidePanel] = useState<SidePanel>('logs');

  useDemoSimulation();

  const handlePaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, [setSelectedNodeId]);

  const togglePanel = useCallback(
    (panel: SidePanel) => setSidePanel((prev) => (prev === panel ? null : panel)),
    [],
  );

  return (
    <div className="app">
      {/* Toolbar */}
      <header className="toolbar">
        <div className="toolbar-left">
          <h1 className="logo">c8s</h1>
          <span className="tagline">Container Workflow Orchestrator</span>
        </div>
        <div className="toolbar-right">
          <button
            className={`toolbar-btn ${sidePanel === 'k8s' ? 'active' : ''}`}
            onClick={() => togglePanel('k8s')}
          >
            ☸ K8s Config
          </button>
          <button
            className={`toolbar-btn ${sidePanel === 'logs' ? 'active' : ''}`}
            onClick={() => togglePanel('logs')}
          >
            📋 Logs
          </button>
        </div>
      </header>

      <div className="workspace">
        {/* Main canvas */}
        <div className="canvas">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onPaneClick={handlePaneClick}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            proOptions={{ hideAttribution: true }}
          >
            <Controls />
            <MiniMap
              nodeColor={(node) => {
                const status = (node.data as Record<string, unknown>)?.status as string;
                if (status === 'running') return '#10b981';
                if (status === 'failed') return '#ef4444';
                return '#6366f1';
              }}
              maskColor="rgba(0,0,0,0.2)"
            />
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#334155" />
          </ReactFlow>
        </div>

        {/* Side panels */}
        {sidePanel === 'k8s' && <K8sConfigPanel />}
        {sidePanel === 'logs' && <LogPanel />}
        {selectedNodeId && <ContainerDetailPanel />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <WorkflowCanvas />
    </ReactFlowProvider>
  );
}
