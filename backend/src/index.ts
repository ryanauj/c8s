import express, { Request, Response } from 'express';
import cors from 'cors';
import * as k8s from '@kubernetes/client-node';

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for frontend
app.use(cors());
app.use(express.json());

// Initialize Kubernetes client
const kc = new k8s.KubeConfig();

// Load kubeconfig from default location
try {
  kc.loadFromDefault();
} catch (error) {
  console.warn('Warning: Could not load kubeconfig. Some endpoints may not work.');
}

// Get all available contexts
app.get('/api/contexts', (req: Request, res: Response) => {
  try {
    const contexts = kc.getContexts();
    const currentContext = kc.getCurrentContext();
    
    res.json({
      contexts: contexts.map(ctx => ({
        name: ctx.name,
        cluster: ctx.cluster,
        user: ctx.user,
        namespace: ctx.namespace
      })),
      currentContext: currentContext
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to get contexts', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Set current context
app.post('/api/contexts/:contextName', (req: Request, res: Response) => {
  try {
    const { contextName } = req.params;
    kc.setCurrentContext(contextName);
    
    res.json({ 
      success: true, 
      currentContext: contextName 
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to set context', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Get all nodes
app.get('/api/nodes', async (req: Request, res: Response) => {
  try {
    const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
    const nodesResponse = await k8sApi.listNode();
    
    const nodesList = nodesResponse as any;
    const nodes = nodesList.body.items.map((node: any) => ({
      id: node.metadata?.uid || '',
      name: node.metadata?.name || '',
      type: 'node',
      status: node.status?.conditions?.find((c: any) => c.type === 'Ready')?.status || 'Unknown',
      labels: node.metadata?.labels || {},
      creationTimestamp: node.metadata?.creationTimestamp
    }));
    
    res.json({ nodes });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to get nodes', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Get all pods across all namespaces
app.get('/api/pods', async (req: Request, res: Response) => {
  try {
    const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
    const podsResponse = await k8sApi.listPodForAllNamespaces();
    
    const podsList = podsResponse as any;
    const pods = podsList.body.items.map((pod: any) => ({
      id: pod.metadata?.uid || '',
      name: pod.metadata?.name || '',
      type: 'pod',
      namespace: pod.metadata?.namespace || '',
      nodeName: pod.spec?.nodeName || '',
      status: pod.status?.phase || 'Unknown',
      labels: pod.metadata?.labels || {},
      creationTimestamp: pod.metadata?.creationTimestamp
    }));
    
    res.json({ pods });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to get pods', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Get all services across all namespaces
app.get('/api/services', async (req: Request, res: Response) => {
  try {
    const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
    const servicesResponse = await k8sApi.listServiceForAllNamespaces();
    
    const servicesList = servicesResponse as any;
    const services = servicesList.body.items.map((service: any) => ({
      id: service.metadata?.uid || '',
      name: service.metadata?.name || '',
      type: 'service',
      namespace: service.metadata?.namespace || '',
      clusterIP: service.spec?.clusterIP || '',
      serviceType: service.spec?.type || '',
      labels: service.metadata?.labels || {},
      selector: service.spec?.selector || {},
      creationTimestamp: service.metadata?.creationTimestamp
    }));
    
    res.json({ services });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to get services', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Get all deployments across all namespaces
app.get('/api/deployments', async (req: Request, res: Response) => {
  try {
    const k8sApi = kc.makeApiClient(k8s.AppsV1Api);
    const deploymentsResponse = await k8sApi.listDeploymentForAllNamespaces();
    
    const deploymentsList = deploymentsResponse as any;
    const deployments = deploymentsList.body.items.map((deployment: any) => ({
      id: deployment.metadata?.uid || '',
      name: deployment.metadata?.name || '',
      type: 'deployment',
      namespace: deployment.metadata?.namespace || '',
      replicas: deployment.spec?.replicas || 0,
      availableReplicas: deployment.status?.availableReplicas || 0,
      labels: deployment.metadata?.labels || {},
      selector: deployment.spec?.selector?.matchLabels || {},
      creationTimestamp: deployment.metadata?.creationTimestamp
    }));
    
    res.json({ deployments });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to get deployments', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Get all resources in one call for visualization
app.get('/api/resources', async (req: Request, res: Response) => {
  try {
    const coreApi = kc.makeApiClient(k8s.CoreV1Api);
    const appsApi = kc.makeApiClient(k8s.AppsV1Api);
    
    // Fetch all resources in parallel
    const [nodesResponse, podsResponse, servicesResponse, deploymentsResponse] = await Promise.all([
      coreApi.listNode(),
      coreApi.listPodForAllNamespaces(),
      coreApi.listServiceForAllNamespaces(),
      appsApi.listDeploymentForAllNamespaces()
    ]);
    
    const nodesList = nodesResponse as any;
    const podsList = podsResponse as any;
    const servicesList = servicesResponse as any;
    const deploymentsList = deploymentsResponse as any;
    
    const nodes = nodesList.body.items.map((node: any) => ({
      id: node.metadata?.uid || '',
      name: node.metadata?.name || '',
      type: 'node',
      status: node.status?.conditions?.find((c: any) => c.type === 'Ready')?.status || 'Unknown',
      labels: node.metadata?.labels || {}
    }));
    
    const pods = podsList.body.items.map((pod: any) => ({
      id: pod.metadata?.uid || '',
      name: pod.metadata?.name || '',
      type: 'pod',
      namespace: pod.metadata?.namespace || '',
      nodeName: pod.spec?.nodeName || '',
      status: pod.status?.phase || 'Unknown',
      labels: pod.metadata?.labels || {}
    }));
    
    const services = servicesList.body.items.map((service: any) => ({
      id: service.metadata?.uid || '',
      name: service.metadata?.name || '',
      type: 'service',
      namespace: service.metadata?.namespace || '',
      clusterIP: service.spec?.clusterIP || '',
      serviceType: service.spec?.type || '',
      labels: service.metadata?.labels || {},
      selector: service.spec?.selector || {}
    }));
    
    const deployments = deploymentsList.body.items.map((deployment: any) => ({
      id: deployment.metadata?.uid || '',
      name: deployment.metadata?.name || '',
      type: 'deployment',
      namespace: deployment.metadata?.namespace || '',
      replicas: deployment.spec?.replicas || 0,
      availableReplicas: deployment.status?.availableReplicas || 0,
      labels: deployment.metadata?.labels || {},
      selector: deployment.spec?.selector?.matchLabels || {}
    }));
    
    res.json({ nodes, pods, services, deployments });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to get resources', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`Current context: ${kc.getCurrentContext() || 'None'}`);
});
