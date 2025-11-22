import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./page/Home";
import Login from "./page/Login";
import Dashboard from "./admin/Dashboard";
// import Prescription from "./admin/Prescription";
import Items from "./admin/Items";
import PurshaseBill from "./admin/PurshaseBill";
import OrderSummary from "./admin/OrderSummary";
import Ordered from "./admin/Ordered";
import Delivered from "./admin/Delivered";
import CustomerList from "./admin/CustomerList";
import EyeGlasses from "./page/EyeGlasses";
import SunGlasses from "./page/SunGlasses";
import ContactLens from "./page/ContactLens";

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("isAuthenticated");
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/eyeglasses" element={<EyeGlasses />} />
      <Route path="/sunglasses" element={<SunGlasses />} />
      <Route path="/contact-lenses" element={<ContactLens />} />
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
      {/* <Route
        path="/prescription"
        element={
          <ProtectedRoute>
            <Prescription />
          </ProtectedRoute>
        }
      /> */}
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
        path="/order-summary"
        element={
          <ProtectedRoute>
            <OrderSummary />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ordered"
        element={
          <ProtectedRoute>
            <Ordered />
          </ProtectedRoute>
        }
      />
      <Route
        path="/delivered"
        element={
          <ProtectedRoute>
            <Delivered />
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
