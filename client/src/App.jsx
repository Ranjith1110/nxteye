import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./page/Home";
import Login from "./page/Login";
import Dashboard from "./admin/Dashboard";
import Prescription from "./admin/Prescription";
import Items from "./admin/Items";
import PurshaseBill from "./admin/PurshaseBill";
import Billing from "./admin/Billing";
import Remaining from "./admin/Remaining";
import History from "./admin/History";
import CustomerList from "./admin/CustomerList";

// 🔒 Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("isAuthenticated");
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      {/* Protected Dashboard Route */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/prescription"
        element={
          <ProtectedRoute>
            <Prescription />
          </ProtectedRoute>
        }
      />
      <Route
        path="/items"
        element={
          <ProtectedRoute>
            <Items />
          </ProtectedRoute>
        }
      />
      <Route
        path="/purshase-bill"
        element={
          <ProtectedRoute>
            <PurshaseBill />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sale-bill"
        element={
          <ProtectedRoute>
            <Billing />
          </ProtectedRoute>
        }
      />
      <Route
        path="/remaining-bill"
        element={
          <ProtectedRoute>
            <Remaining />
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer-list"
        element={
          <ProtectedRoute>
            <CustomerList />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default App;
