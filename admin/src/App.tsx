import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import BookingsPage from "@/pages/BookingsPage";
import ProvidersPage from "@/pages/ProvidersPage";
import UsersPage from "@/pages/UsersPage";
import CategoriesPage from "@/pages/CategoriesPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path='/login' element={<LoginPage />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path='/' element={<DashboardPage />} />
            <Route path='/bookings' element={<BookingsPage />} />
            <Route path='/providers' element={<ProvidersPage />} />
            <Route path='/users' element={<UsersPage />} />
            <Route path='/categories' element={<CategoriesPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
