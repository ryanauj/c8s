# Quick Start Guide

## Prerequisites

1. **Node.js** (v16 or higher)
2. **Kubernetes cluster** access with a valid kubeconfig
3. **kubectl** configured with at least one context

## Installation

1. Clone the repository:
```bash
git clone https://github.com/ryanauj/c8s.git
cd c8s
```

2. Install dependencies for both backend and frontend:
```bash
npm run install:all
```

Or install them separately:
```bash
cd backend && npm install
cd ../frontend && npm install
```

## Running the Application

### Option 1: Run Both Servers Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
The backend will start on http://localhost:3001

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```
The frontend will start on http://localhost:3000 and open in your browser

### Option 2: Production Build

Build both projects:
```bash
npm run build:all
```

Start the backend in production mode:
```bash
cd backend
npm start
```

Serve the frontend build (you'll need a static server):
```bash
cd frontend
npx serve -s build
```

## Using the Application

1. Open your browser to http://localhost:3000
2. The application will load your Kubernetes contexts from your kubeconfig
3. Select a context from the dropdown menu at the top
4. The visualization will display your Kubernetes resources:
   - **Blue nodes**: Kubernetes nodes (physical/virtual machines)
   - **Green nodes**: Pods (running containers)
   - **Orange nodes**: Deployments
   - **Purple nodes**: Services
5. Use the controls to navigate:
   - Scroll to zoom in/out
   - Click and drag to pan
   - Drag individual nodes to rearrange
   - Use the minimap (bottom-left) for navigation

## Troubleshooting

### Backend won't start
- Ensure you have a valid kubeconfig file (usually at `~/.kube/config`)
- Check that the kubeconfig has at least one context defined
- Verify Node.js version: `node --version` (should be v16+)

### Frontend shows "Failed to load contexts"
- Make sure the backend is running on port 3001
- Check browser console for CORS or network errors
- Verify the backend is accessible: `curl http://localhost:3001/health`

### No resources showing in the visualization
- Ensure the selected Kubernetes context has proper permissions
- Check that your cluster is running and accessible
- Verify resources exist: `kubectl get pods,nodes,services,deployments --all-namespaces`
- Check backend logs for connection errors

### Connection/TLS errors
- Verify your kubeconfig cluster URL is correct
- Check if your cluster requires VPN access
- Ensure certificates in kubeconfig are valid

## Configuration

### Backend Environment Variables
Create a `.env` file in the `backend` directory:
```
PORT=3001
```

### Frontend Environment Variables
Create a `.env` file in the `frontend` directory:
```
REACT_APP_API_URL=http://localhost:3001/api
```

## API Endpoints

- `GET /health` - Health check
- `GET /api/contexts` - Get all available contexts
- `POST /api/contexts/:name` - Switch to a specific context
- `GET /api/resources` - Get all resources (optimized for visualization)
- `GET /api/nodes` - Get all nodes
- `GET /api/pods` - Get all pods
- `GET /api/services` - Get all services
- `GET /api/deployments` - Get all deployments

## Development

### Backend (TypeScript + Express)
```bash
cd backend
npm run dev    # Start with hot reload
npm run build  # Compile TypeScript
npm start      # Run production build
```

### Frontend (React + TypeScript)
```bash
cd frontend
npm start      # Start development server
npm run build  # Create production build
npm test       # Run tests
```

## Architecture

```
c8s/
├── backend/              # Node.js Express API
│   ├── src/
│   │   └── index.ts     # Main server with Kubernetes client
│   ├── package.json
│   └── tsconfig.json
├── frontend/             # React application
│   ├── src/
│   │   ├── components/  # React components
│   │   │   ├── ContextSelector.tsx
│   │   │   └── ResourceVisualizer.tsx
│   │   ├── api.ts       # API client
│   │   └── App.tsx      # Main app
│   ├── package.json
│   └── tsconfig.json
└── package.json         # Root scripts
```

## Next Steps

- Add filtering by namespace
- Implement real-time updates with WebSockets
- Add more resource types (StatefulSets, DaemonSets, etc.)
- Implement resource details panel
- Add search functionality
- Export visualization as image
