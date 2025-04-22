import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme';
import { LoginPage } from './pages/Login/LoginPage';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { AddPropertyPage } from './pages/AddProperty/AddPropertyPage';
import { RoomPage } from './pages/Room';
import { RoomTypePage } from './pages/RoomType';
import { TaskPage } from './pages/Task';
import { ManageInventoryPage } from './pages/ManageInventory/ManageInventoryPage';
import { Layout } from './components/layout/Layout';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PropertyProvider } from './context/PropertyContext';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Layout>{children}</Layout> : <Navigate to="/" replace />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <PropertyProvider>
          <Router>
            <Routes>
              <Route 
                path="/" 
                element={<LoginPage />} 
              />
              <Route 
                path="/dashboard" 
                element={
                  <PrivateRoute>
                    <Navigate to="/add-property" replace />
                  </PrivateRoute>
                } 
              />
              <Route
                path="/add-property"
                element={
                  <PrivateRoute>
                    <AddPropertyPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/rooms"
                element={
                  <PrivateRoute>
                    <RoomPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/room-type"
                element={
                  <PrivateRoute>
                    <RoomTypePage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/manage-inventory"
                element={
                  <PrivateRoute>
                    <ManageInventoryPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/tasks"
                element={
                  <PrivateRoute>
                    <TaskPage />
                  </PrivateRoute>
                }
              />
            </Routes>
          </Router>
        </PropertyProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
