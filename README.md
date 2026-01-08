# c8s - Kubernetes Resource Visualizer

A full-stack application for visualizing Kubernetes resources using an interactive graph interface.

## Features

- **Backend API (BFF)**: Node.js/Express API that wraps the Kubernetes client
- **Interactive Visualization**: React frontend with react-flow for visualizing Kubernetes resources
- **Context Management**: Switch between different Kubernetes contexts directly from the UI
- **Resource Support**: Visualizes Nodes, Pods, Services, and Deployments
- **Real-time Updates**: Refresh resources when switching contexts

## Architecture

### Backend (`/backend`)
- Node.js with TypeScript
- Express.js for REST API
- `@kubernetes/client-node` for Kubernetes API interaction
- CORS enabled for frontend communication

### Frontend (`/frontend`)
- React with TypeScript
- react-flow for graph visualization
- Axios for API communication
- Responsive UI with context selector

## Prerequisites

- Node.js (v16 or higher)
- A Kubernetes cluster with `kubectl` configured
- Valid kubeconfig file (typically in `~/.kube/config`)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd c8s
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

## Running the Application

### Start the Backend

From the `backend` directory:

```bash
# Development mode with hot reload
npm run dev

# Production mode
npm run build
npm start
```

The backend will start on `http://localhost:3001`

### Start the Frontend

From the `frontend` directory:

```bash
npm start
```

The frontend will start on `http://localhost:3000`

## Usage

1. Open your browser to `http://localhost:3000`
2. Select a Kubernetes context from the dropdown menu
3. The visualizer will display:
   - **Nodes** (blue): Physical or virtual machines in your cluster
   - **Pods** (green): Running containers grouped by namespace
   - **Deployments** (orange): Deployment resources
   - **Services** (purple): Service endpoints
4. Navigate the graph using:
   - Mouse wheel to zoom
   - Click and drag to pan
   - Drag nodes to rearrange layout

## API Endpoints

### Context Management
- `GET /api/contexts` - Get all available Kubernetes contexts
- `POST /api/contexts/:contextName` - Switch to a specific context

### Resource Endpoints
- `GET /api/nodes` - Get all nodes
- `GET /api/pods` - Get all pods across all namespaces
- `GET /api/services` - Get all services across all namespaces
- `GET /api/deployments` - Get all deployments across all namespaces
- `GET /api/resources` - Get all resources in a single call (optimized for visualization)

### Health Check
- `GET /health` - API health check

## Development

### Backend Structure
```
backend/
├── src/
│   └── index.ts       # Main Express server with Kubernetes client
├── tsconfig.json      # TypeScript configuration
└── package.json
```

### Frontend Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── ContextSelector.tsx     # Context switching UI
│   │   ├── ContextSelector.css
│   │   ├── ResourceVisualizer.tsx  # Main visualization component
│   │   └── ResourceVisualizer.css
│   ├── api.ts         # API client and types
│   ├── App.tsx        # Main application component
│   └── App.css
└── package.json
```

## Configuration

### Backend Environment Variables
- `PORT` - Backend server port (default: 3001)

### Frontend Environment Variables
- `REACT_APP_API_URL` - Backend API URL (default: http://localhost:3001/api)

## Troubleshooting

### "Could not load kubeconfig" error
- Ensure you have a valid kubeconfig file at `~/.kube/config`
- Or set the `KUBECONFIG` environment variable to point to your config file

### CORS errors
- Make sure the backend is running on port 3001
- Check that CORS is properly configured in the backend

### No resources showing
- Verify you have resources in your Kubernetes cluster
- Check that the selected context has proper permissions
- Look at the browser console and backend logs for errors

## License

ISC
