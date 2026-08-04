import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth } from "./lib/auth";
import { useTelegramBackButton } from "./lib/telegram";
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
  if (!token)
    return <Navigate to='/login' replace state={{ from: location }} />;
  return <>{children}</>;
}

function Layout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <div style={{ flex: 1 }}>{children}</div>
      <BottomNav />
    </div>
  );
}

// The root screen differs by role: customers land on the category browser,
// providers land on their job dashboard. Previously "/" always rendered
// HomePage regardless of role, which is why providers saw the customer
// screen after login.
function RoleHome() {
  const { user } = useAuth();
  return user?.role === "provider" ? <ProviderDashboardPage /> : <HomePage />;
}

export default function App() {
  // Shows/hides Telegram's native header back-arrow based on the current
  // route — must run inside the Router, so it lives here rather than main.tsx.
  useTelegramBackButton();

  return (
    <Routes>
      <Route path='/login' element={<LoginPage />} />
      <Route path='/register' element={<RegisterPage />} />

      <Route
        path='/'
        element={
          <RequireAuth>
            <Layout>
              <RoleHome />
            </Layout>
          </RequireAuth>
        }
      />
      <Route
        path='/providers/:categoryId'
        element={
          <RequireAuth>
            <Layout>
              <ProvidersPage />
            </Layout>
          </RequireAuth>
        }
      />
      <Route
        path='/book/:providerId'
        element={
          <RequireAuth>
            <Layout>
              <BookNewPage />
            </Layout>
          </RequireAuth>
        }
      />
      <Route
        path='/bookings'
        element={
          <RequireAuth>
            <Layout>
              <MyBookingsPage />
            </Layout>
          </RequireAuth>
        }
      />
      <Route
        path='/chat/:bookingId'
        element={
          <RequireAuth>
            <ChatPage />
          </RequireAuth>
        }
      />
      <Route
        path='/profile'
        element={
          <RequireAuth>
            <Layout>
              <ProfilePage />
            </Layout>
          </RequireAuth>
        }
      />

      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  );
}
