import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export interface K8sContext {
  name: string;
  cluster: string;
  user: string;
  namespace?: string;
}

export interface K8sNode {
  id: string;
  name: string;
  type: 'node';
  status: string;
  labels: Record<string, string>;
}

export interface K8sPod {
  id: string;
  name: string;
  type: 'pod';
  namespace: string;
  nodeName: string;
  status: string;
  labels: Record<string, string>;
}

export interface K8sService {
  id: string;
  name: string;
  type: 'service';
  namespace: string;
  clusterIP: string;
  serviceType: string;
  labels: Record<string, string>;
  selector: Record<string, string>;
}

export interface K8sDeployment {
  id: string;
  name: string;
  type: 'deployment';
  namespace: string;
  replicas: number;
  availableReplicas: number;
  labels: Record<string, string>;
  selector: Record<string, string>;
}

export interface K8sResources {
  nodes: K8sNode[];
  pods: K8sPod[];
  services: K8sService[];
  deployments: K8sDeployment[];
}

export const api = {
  getContexts: async () => {
    const response = await axios.get<{
      contexts: K8sContext[];
      currentContext: string;
    }>(`${API_BASE_URL}/contexts`);
    return response.data;
  },

  setContext: async (contextName: string) => {
    const response = await axios.post(`${API_BASE_URL}/contexts/${contextName}`);
    return response.data;
  },

  getResources: async () => {
    const response = await axios.get<K8sResources>(`${API_BASE_URL}/resources`);
    return response.data;
  },

  getNodes: async () => {
    const response = await axios.get<{ nodes: K8sNode[] }>(`${API_BASE_URL}/nodes`);
    return response.data;
  },

  getPods: async () => {
    const response = await axios.get<{ pods: K8sPod[] }>(`${API_BASE_URL}/pods`);
    return response.data;
  },

  getServices: async () => {
    const response = await axios.get<{ services: K8sService[] }>(`${API_BASE_URL}/services`);
    return response.data;
  },

  getDeployments: async () => {
    const response = await axios.get<{ deployments: K8sDeployment[] }>(`${API_BASE_URL}/deployments`);
    return response.data;
  },
};
