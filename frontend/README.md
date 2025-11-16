# GCDL Frontend Setup

## Installation

1. Navigate to the frontend folder:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

The application will run on http://localhost:3000

## Project Structure

- `src/pages/` - Page components for each feature
- `src/components/` - Reusable components
- `src/context/` - React context for state management (Authentication)
- `src/utils/` - Utility functions (API calls, formatters)
- `src/index.css` - Global styles with Tailwind CSS
- `vite.config.js` - Vite configuration with dev server proxy to backend

## Features

- User authentication with role-based access control
- Responsive navigation bar
- Protected routes
- Currency formatting for Ugandan Shillings (UGX)
- Integration with backend API

## Build

To create a production build:
```
npm run build
```

## Styling

This project uses **Bootstrap** and **Material UI (MUI)** for styling and components. Bootstrap provides the base CSS and responsive layout; MUI provides component primitives for richer UI elements.

