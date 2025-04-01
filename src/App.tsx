import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import AdminPage from './pages/AdminPage'
import Navbar from './components/Navbar'
import { AuthProvider, useAuth } from './context/AuthContext' // Assuming AuthContext provides useAuth

// Placeholder for ProtectedRoute component
const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth(); // Assuming useAuth provides user and loading state

  if (loading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
     // Redirect non-admins trying to access admin routes
     // Optionally show an 'Unauthorized' page or redirect to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};


function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected User Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

             {/* Protected Admin Routes */}
             <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminPage />
                </ProtectedRoute>
              }
            />

            {/* Redirect root to login or dashboard based on auth status */}
             <Route
              path="/"
              element={
                <AuthRedirector />
              }
            />

            {/* Catch-all for 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  )
}

// Helper component to redirect based on auth status
const AuthRedirector: React.FC = () => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>; // Or a spinner
  return user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
};

// Placeholder for NotFoundPage
const NotFoundPage: React.FC = () => {
  return (
    <div className="text-center py-10">
      <h1 className="text-3xl font-bold text-red-600">404 - Not Found</h1>
      <p className="mt-4">The page you are looking for does not exist.</p>
    </div>
  );
};


export default App
