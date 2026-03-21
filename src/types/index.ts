import { type Node, type Edge } from '@xyflow/react';

// ─── Sub-node types (processes inside a container) ────────────────────────────

export type SubNodeType = 'generic' | 'ai-tool-call' | 'webhook' | 'transform' | 'custom';

export interface SubNodeData extends Record<string, unknown> {
  label: string;
  type: SubNodeType;
  description?: string;
  status?: 'idle' | 'running' | 'success' | 'error';
  // AI tool call specific
  model?: string;
  toolName?: string;
  // Custom container process
  command?: string;
  image?: string;
}

export type SubNode = Node<SubNodeData, 'sub-node'>;
export type SubEdge = Edge;

// ─── Container node types (top-level k8s containers) ──────────────────────────

export interface ContainerResources {
  cpuRequest?: string;
  cpuLimit?: string;
  memoryRequest?: string;
  memoryLimit?: string;
  replicas?: number;
}

export interface ContainerNodeData extends Record<string, unknown> {
  label: string;
  image: string;
  namespace?: string;
  status?: 'pending' | 'running' | 'succeeded' | 'failed' | 'unknown';
  resources?: ContainerResources;
  env?: Record<string, string>;
  // Embedded subgraph
  subNodes: SubNode[];
  subEdges: SubEdge[];
  // Expand/collapse
  expanded?: boolean;
}

export type ContainerNode = Node<ContainerNodeData, 'container'>;

// ─── Top-level flow types ─────────────────────────────────────────────────────

/** An edge that connects sub-nodes across containers */
export interface CrossContainerEdgeData extends Record<string, unknown> {
  sourceContainerId: string;
  targetContainerId: string;
  sourceSubNodeId: string;
  targetSubNodeId: string;
  protocol?: 'http' | 'grpc' | 'tcp' | 'event';
}

export type WorkflowNode = ContainerNode;
export type WorkflowEdge = Edge<CrossContainerEdgeData | Record<string, unknown>>;

// ─── K8s config ───────────────────────────────────────────────────────────────

export interface K8sConfig {
  apiEndpoint: string;
  apiKey: string;
  namespace: string;
  connected: boolean;
}

// ─── Log / trace ──────────────────────────────────────────────────────────────

export interface LogEntry {
  id: string;
  timestamp: number;
  containerId: string;
  subNodeId?: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  traceId?: string;
}

export interface SignalTrace {
  traceId: string;
  path: { containerId: string; subNodeId: string; timestamp: number }[];
  status: 'active' | 'completed' | 'error';
}
