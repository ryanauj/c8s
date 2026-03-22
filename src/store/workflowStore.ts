import { create } from 'zustand';
import {
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from '@xyflow/react';
import type {
  WorkflowNode,
  WorkflowEdge,
  K8sConfig,
  LogEntry,
  SignalTrace,
  SubNode,
  SubEdge,
} from '../types';
import { initialNodes, initialEdges } from '../utils/demoData';

interface WorkflowState {
  // Flow state
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  onNodesChange: OnNodesChange<WorkflowNode>;
  onEdgesChange: OnEdgesChange<WorkflowEdge>;
  onConnect: OnConnect;

  // Container actions
  toggleContainerExpanded: (nodeId: string) => void;
  updateContainerData: (nodeId: string, data: Partial<WorkflowNode['data']>) => void;
  addSubNode: (containerId: string, subNode: SubNode) => void;
  addSubEdge: (containerId: string, edge: SubEdge) => void;
  updateSubNodeStatus: (containerId: string, subNodeId: string, status: SubNode['data']['status']) => void;

  // K8s
  k8sConfig: K8sConfig;
  setK8sConfig: (config: Partial<K8sConfig>) => void;

  // Logs & traces
  logs: LogEntry[];
  addLog: (log: LogEntry) => void;
  clearLogs: () => void;
  traces: SignalTrace[];
  activeTraceId: string | null;
  setActiveTraceId: (id: string | null) => void;

  // Panel
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) as WorkflowNode[] });
  },
  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },
  onConnect: (connection) => {
    set({ edges: addEdge({ ...connection, animated: true, style: { stroke: '#6366f1' } }, get().edges) });
  },

  toggleContainerExpanded: (nodeId) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === nodeId
          ? {
              ...n,
              data: { ...n.data, expanded: !n.data.expanded },
              style: {
                ...n.style,
                height: n.data.expanded ? 100 : undefined,
              },
            }
          : n,
      ),
    });
  },

  updateContainerData: (nodeId, data) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n,
      ),
    });
  },

  addSubNode: (containerId, subNode) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === containerId
          ? { ...n, data: { ...n.data, subNodes: [...n.data.subNodes, subNode] } }
          : n,
      ),
    });
  },

  addSubEdge: (containerId, edge) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === containerId
          ? { ...n, data: { ...n.data, subEdges: [...n.data.subEdges, edge] } }
          : n,
      ),
    });
  },

  updateSubNodeStatus: (containerId, subNodeId, status) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === containerId
          ? {
              ...n,
              data: {
                ...n.data,
                subNodes: n.data.subNodes.map((sn: SubNode) =>
                  sn.id === subNodeId ? { ...sn, data: { ...sn.data, status } } : sn,
                ),
              },
            }
          : n,
      ),
    });
  },

  k8sConfig: {
    apiEndpoint: '',
    apiKey: '',
    namespace: 'default',
    connected: false,
  },
  setK8sConfig: (config) => {
    set({ k8sConfig: { ...get().k8sConfig, ...config } });
  },

  logs: [],
  addLog: (log) => {
    set({ logs: [...get().logs.slice(-499), log] });
  },
  clearLogs: () => set({ logs: [] }),

  traces: [],
  activeTraceId: null,
  setActiveTraceId: (id) => set({ activeTraceId: id }),

  selectedNodeId: null,
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
}));
