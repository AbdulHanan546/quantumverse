import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';
import AdminHome from './pages/admin/Home';
import StudentHome from './pages/student/Home';
import Navbar from './components/Navbar';

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-dvh">
        <Routes>
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['admin']}>
                <Navbar />
                <AdminHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student"
            element={
              <ProtectedRoute roles={['student', 'admin']}>
                <Navbar />
                <StudentHome />
              </ProtectedRoute>
            }
          />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/" element={<Navigate to="/signin" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

function NotFound() {
  return (
    <div className="min-h-dvh grid place-items-center px-4">
      <div className="text-center space-y-4">
        <div className="text-8xl font-black text-green-500 neon">404</div>
        <p className="text-slate-300">Page not found</p>
        <a href="/signin" className="btn-primary">Go Home</a>
      </div>
    </div>
  );
}