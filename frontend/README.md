# Golden Crop Distributors Ltd - Frontend

React-based web application for managing produce distribution operations. Provides role-based dashboards for CEO, managers, and sales agents.

## Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **UI Framework**: Bootstrap 5 + Material-UI (MUI)
- **Charts**: Chart.js + React-ChartJS-2 + Recharts
- **PDF Export**: html2pdf.js
- **CSV Parsing**: PapaParse
- **State Management**: React Context API

## Dependencies

```json
{
  "@emotion/react": "^11.11.1",      // MUI styling engine
  "@emotion/styled": "^11.11.0",     // MUI styled components
  "@mui/icons-material": "^5.13.6",  // Material icons
  "@mui/material": "^5.13.7",        // Material-UI components
  "axios": "^1.6.2",                 // HTTP client for API calls
  "bootstrap": "^5.3.2",             // Bootstrap CSS framework
  "chart.js": "^4.4.0",              // Charting library
  "html2pdf.js": "^0.10.1",          // PDF generation from HTML
  "papaparse": "^5.4.1",             // CSV parsing
  "react": "^18.2.0",                // React library
  "react-chartjs-2": "^5.2.0",       // React wrapper for Chart.js
  "react-dom": "^18.2.0",            // React DOM rendering
  "react-router-dom": "^6.20.0",     // Client-side routing
  "recharts": "^2.15.4"              // Additional charting library
}
```

## Installation
clone the repos

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The application will run on http://localhost:3000

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx           # Navigation bar with role-based menu
│   │   ├── ProtectedRoute.jsx   # Route guard for authentication
│   │   └── CreateAgentForm.jsx  # Reusable agent creation form
│   ├── context/
│   │   └── AuthContext.jsx      # Global authentication state
│   ├── pages/
│   │   ├── Login.jsx            # Login page with role selection
│   │   ├── CEOSignup.jsx        # CEO self-registration
│   │   ├── ManagerSignup.jsx    # Manager self-registration
│   │   ├── SalesAgentSignup.jsx # Sales agent self-registration
│   │   ├── Dashboard.jsx        # CEO dashboard
│   │   ├── ManagerDashboard.jsx # Manager dashboard
│   │   ├── Users.jsx            # User management (CEO)
│   │   ├── Procurement.jsx      # Procurement tracking
│   │   ├── Sales.jsx            # Sales recording
│   │   ├── CreditSales.jsx      # Credit sales management
│   │   ├── Stock.jsx            # Inventory management
│   │   ├── Analytics.jsx        # Analytics & reports
│   │   ├── Reports.jsx          # Report generation
│   │   ├── Buyers.jsx           # Buyer management
│   │   └── Unauthorized.jsx     # Access denied page
│   ├── utils/
│   │   ├── api.js               # Axios instance with interceptors
│   │   └── formatters.js        # Currency formatting utilities
│   ├── App.jsx                  # Main app with routing
│   ├── main.jsx                 # React entry point
│   └── index.css                # Global styles
├── vite.config.js               # Vite configuration
├── tsconfig.json                # TypeScript config (for JSX)
└── package.json
```

## Features

### Authentication
- JWT-based authentication with role-based access control
- Self-signup for CEO, Manager, and Sales Agent
- Branch selection during manager/agent signup
- Persistent login via localStorage
- Automatic token refresh

### Role-Based Dashboards

#### CEO Dashboard
- System-wide analytics and KPIs
- User management (create/remove managers and sales agents)
- View all branches
- Generate comprehensive reports
- Manage produce types

#### Manager Dashboard
- Branch-specific analytics
- Approve credit sales
- Manage sales agents in their branch
- Generate branch reports
- View branch inventory

#### Sales Agent Dashboard
- Record sales (cash and credit)
- Manage procurement
- Update stock levels
- View branch buyers
- Track daily transactions

### Core Functionality
- **Procurement**: Record stock purchases from suppliers
- **Sales**: Process cash and credit sales
- **Stock Management**: Real-time inventory tracking
- **Buyer Management**: Maintain customer database
- **Analytics**: Interactive charts and graphs
- **Reports**: Export data as PDF or Excel
- **Credit Sales Approval**: Manager approval workflow

### UI Components
- Responsive navigation bar
- Protected routes with role-based access
- Form validation and error handling
- Loading states and error messages
- Currency formatting (UGX)
- Date formatting
- Interactive charts (Chart.js, Recharts)
- Bootstrap tables and cards
- Material-UI components

## Routing

```jsx
/                       → Login page
/ceo-signup            → CEO registration
/manager-signup        → Manager registration
/agent-signup          → Sales agent registration
/dashboard             → CEO dashboard (protected)
/manager-dashboard     → Manager dashboard (protected)
/users                 → User management (CEO only)
/procurement           → Procurement (Sales Agent)
/sales                 → Sales (Sales Agent)
/credit-sales          → Credit sales (Manager/Agent)
/stock                 → Inventory (All roles)
/analytics             → Analytics (CEO/Manager)
/reports               → Reports (CEO/Manager)
/buyers                → Buyers (Sales Agent)
/unauthorized          → Access denied
```

## Connection to Backend

### API Configuration
The frontend connects to the backend API through Axios with the following setup:

```javascript
// src/utils/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Add JWT token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);
```

### Authentication Flow

1. **Login**:
   ```javascript
   const response = await api.post('/auth/login', { email, password });
   localStorage.setItem('token', response.data.token);
   localStorage.setItem('user', JSON.stringify(response.data.user));
   ```

2. **Authenticated Requests**:
   ```javascript
   // Token automatically added by interceptor
   const data = await api.get('/users/managers');
   ```

3. **Logout**:
   ```javascript
   localStorage.clear();
   navigate('/');
   ```

### Data Flow

```
User Action → Component State → Axios Request → Backend API
                    ↓                              ↓
            Update UI State ← JSON Response ← Database Query
```

### Example API Calls

```javascript
// Fetch branches (public endpoint)
const branches = await api.get('/branches');

// Create manager (CEO only)
const manager = await api.post('/auth/create-manager', formData);

// Record sale (Sales Agent)
const sale = await api.post('/sales', saleData);

// Get analytics (Manager)
const analytics = await api.get('/analytics/branch');

// Delete sales agent (Manager/CEO)
await api.delete(`/users/agents/${agentId}`);
```

## Environment Configuration

The Vite config includes a proxy to avoid CORS issues during development:

```javascript
// vite.config.js
export default defineConfig({
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
```

## Styling

This project uses **Bootstrap 5** for layout and responsive design, with **Material-UI (MUI)** components for enhanced UI elements.

### Bootstrap
- Grid system for responsive layouts
- Utility classes for spacing, colors, typography
- Form components and validation styles
- Navigation components
- Card layouts

### Material-UI
- Icons from `@mui/icons-material`
- Styled components with emotion
- Theme customization
- Advanced components (dialogs, autocomplete, etc.)

### Custom Styles
- Currency formatting for UGX
- Custom card designs
- Responsive tables
- Loading spinners

## Build & Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

Builds the app for production to the `dist/` folder. The build is optimized and minified.

### Preview Production Build
```bash
npm run preview
```

### Linting
```bash
npm run lint
```

## Business Rules Implementation

- **Branch Selection**: Managers and sales agents must select a branch during signup
- **Branch Capacity**: UI disables branches that already have a manager or 2 agents
- **Role-Based Access**: ProtectedRoute component enforces role requirements
- **Manager Restriction**: Managers can only manage/view their own branch data
- **CEO Privileges**: CEO can access all branches and manage all users
- **Credit Approval**: Only managers can approve credit sales
- **Stock Updates**: Real-time inventory updates after sales/procurement

## Error Handling

- Form validation with user-friendly error messages
- Network error handling with retry options
- 401/403 automatic redirect to login
- Loading states during API calls
- Toast notifications for success/error feedback

## How Frontend and Backend Connect

### Overview
The frontend and backend communicate through a RESTful API architecture:

1. **Frontend (React)** runs on `http://localhost:3000`
2. **Backend (Express)** runs on `http://localhost:5000`
3. **Communication** happens via HTTP requests using Axios

### Connection Steps

1. **CORS Configuration** (Backend):
   ```javascript
   // Backend enables CORS to accept requests from frontend
   app.use(cors());
   ```

2. **Axios Base URL** (Frontend):
   ```javascript
   // Frontend configures Axios to point to backend
   const api = axios.create({
     baseURL: 'http://localhost:5000/api'
   });
   ```

3. **Request Flow**:
   - User interacts with React component
   - Component calls `api.get()` or `api.post()`
   - Axios adds JWT token to request headers
   - Backend receives request, validates token
   - Backend processes request, queries database
   - Backend returns JSON response
   - Frontend updates UI with response data

### Security
- JWT tokens authenticate requests
- Backend middleware validates tokens before processing
- Unauthorized requests return 401 status
- Frontend intercepts 401 errors and redirects to login
