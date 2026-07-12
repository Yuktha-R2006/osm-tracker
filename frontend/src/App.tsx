import React from 'react';
import { Toaster } from 'react-hot-toast';
import AppRouter from './routes/AppRouter';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { DataProvider } from './context/DataContext';

function App() {
  // Production unified build deployment accent
  return (
    <AuthProvider>
      <ThemeProvider>
        <NotificationProvider>
          <DataProvider>
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
          </DataProvider>
        </NotificationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
