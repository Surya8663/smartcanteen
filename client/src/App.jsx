import React, { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import NotFoundPage from './pages/NotFoundPage';

// Landing & Auth
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';

// Layouts
import StudentLayout from './components/StudentLayout';
import AdminLayout from './components/AdminLayout';

// Lazy-loaded pages
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const MenuPage = lazy(() => import('./pages/MenuPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccessPage'));
const MyOrdersPage = lazy(() => import('./pages/MyOrdersPage'));
const MessPointsPage = lazy(() => import('./pages/MessPointsPage'));
const LeaderboardPage = lazy(() => import('./pages/student/LeaderboardPage'));

const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminMenuPage = lazy(() => import('./pages/admin/AdminMenuPage'));
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage'));
const AdminCrowdPage = lazy(() => import('./pages/admin/AdminCrowdPage'));
const AdminCCTVPage = lazy(() => import('./pages/admin/AdminCCTVPage'));
const AdminAnalyticsPage = lazy(() => import('./pages/admin/AdminAnalyticsPage'));
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage'));

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Student Routes */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="menu" element={<MenuPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="order-success" element={<OrderSuccessPage />} />
        <Route path="orders" element={<MyOrdersPage />} />
        <Route path="mess-points" element={<MessPointsPage />} />
        <Route path="leaderboard" element={<LeaderboardPage />} />
      </Route>

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="menu" element={<AdminMenuPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="crowd" element={<AdminCrowdPage />} />
        <Route path="cctv" element={<AdminCCTVPage />} />
        <Route path="analytics" element={<AdminAnalyticsPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>

      {/* Catch-all 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
