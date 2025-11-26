import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./page/Home";
import Login from "./page/Login";
import Dashboard from "./admin/Dashboard";
// import Prescription from "./admin/Prescription";
import Items from "./admin/Items";
import PurchaseBill from "./admin/PurchaseBill";
import OrderSummary from "./admin/OrderSummary";
import Ordered from "./admin/Ordered";
import Delivered from "./admin/Delivered";
import CustomerList from "./admin/CustomerList";
import AddProducts from "./admin/AddProducts";
import EyeGlasses from "./page/EyeGlasses";
import SunGlasses from "./page/SunGlasses";
import ContactLens from "./page/ContactLens";
import Cart from "./page/Cart";
import PurchaseHistory from "./admin/PurchaseHistory";
import TermsConditions from "./page/TermsConditions";
import PrivacyPolicy from "./page/PrivacyPolicy";

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
      <Route path="/cart" element={<Cart />} />
      <Route path="/terms-conditions" element={<TermsConditions />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
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
        path="/purchase-bill"
        element={
          <ProtectedRoute>
            <PurchaseBill />
          </ProtectedRoute>
        }
      />
      <Route
        path="/purchase-history"
        element={
          <ProtectedRoute>
            <PurchaseHistory />
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
      <Route
        path="/customer-list"
        element={
          <ProtectedRoute>
            <CustomerList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/add-products"
        element={
          <ProtectedRoute>
            <AddProducts />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default App;
