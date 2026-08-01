import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth } from "./lib/auth";
import { BottomNav } from "./components/BottomNav";
import { LoginPage } from "./pages/Login";
import { RegisterPage } from "./pages/Register";
import { HomePage } from "./pages/Home";
import { ProvidersPage } from "./pages/Providers";
import { BookNewPage } from "./pages/BookNew";
import { MyBookingsPage } from "./pages/MyBookings";
import { ProviderDashboardPage } from "./pages/ProviderDashboard";
import { ChatPage } from "./pages/Chat";
import { ProfilePage } from "./pages/Profile";

function RequireAuth({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const location = useLocation();
  if (!token) return <Navigate to="/login" replace state={{ from: location }} />;
  return <>{children}</>;
}

function Layout({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <div style={{ flex: 1 }}>{children}</div>
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/"
        element={
          <RequireAuth>
            <Layout>
              <HomePage />
            </Layout>
          </RequireAuth>
        }
      />
      <Route
        path="/providers/:categoryId"
        element={
          <RequireAuth>
            <Layout>
              <ProvidersPage />
            </Layout>
          </RequireAuth>
        }
      />
      <Route
        path="/book/:providerId"
        element={
          <RequireAuth>
            <Layout>
              <BookNewPage />
            </Layout>
          </RequireAuth>
        }
      />
      <Route
        path="/bookings"
        element={
          <RequireAuth>
            <Layout>
              <MyBookingsPage />
            </Layout>
          </RequireAuth>
        }
      />
      <Route
        path="/provider"
        element={
          <RequireAuth>
            <Layout>
              <ProviderDashboardPage />
            </Layout>
          </RequireAuth>
        }
      />
      <Route
        path="/chat/:bookingId"
        element={
          <RequireAuth>
            <ChatPage />
          </RequireAuth>
        }
      />
      <Route
        path="/profile"
        element={
          <RequireAuth>
            <Layout>
              <ProfilePage />
            </Layout>
          </RequireAuth>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
