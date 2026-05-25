import React from 'react';
import { Toaster } from 'react-hot-toast';
import AppRouter from './routes/AppRouter';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import axios from 'axios';

const storedToken = localStorage.getItem("token");
if (storedToken) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
}

function App() {
  // Production unified build deployment accent
  return (
    <AuthProvider>
      <ThemeProvider>
        <NotificationProvider>
          <Toaster 
            position="top-right" 
            toastOptions={{
              style: {
                background: '#1e293b',
                color: '#fff',
                border: '1px solid #334155'
              }
            }}
          />
          <AppRouter />
        </NotificationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
