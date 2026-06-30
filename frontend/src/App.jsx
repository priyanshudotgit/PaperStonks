import { Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute.jsx";
import GuestRoute from "./components/GuestRoute.jsx";

import DashboardPage from "./pages/DashboardPage.jsx";
import HoldingsPage from "./pages/HoldingsPage.jsx";
import TradesPage from "./pages/TradesPage.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import AuthPage from "./pages/AuthPage.jsx";

export default function App() {
  return (
    <Routes>
      {/* Protected */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/holdings"
        element={
          <ProtectedRoute>
            <HoldingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trades"
        element={
          <ProtectedRoute>
            <TradesPage />
          </ProtectedRoute>
        }
      />

      {/* Protection not required */}
      <Route
        path="/paper"
        element={
          <GuestRoute>
            <LandingPage />
          </GuestRoute>
        }
      />
      <Route
        path="/login"
        element={
          <GuestRoute>
            <AuthPage />
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <AuthPage />
          </GuestRoute>
        }
      />

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
