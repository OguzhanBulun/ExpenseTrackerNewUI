import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRoutes from './routes';
import '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import './styles.css'; // Yeni CSS dosyası

// App Provider
import AppProvider from './contexts/AppProvider';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <AppProvider>
      <CssBaseline />
      <AppRoutes />
    </AppProvider>
  </React.StrictMode>
);