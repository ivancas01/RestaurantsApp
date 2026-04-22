import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import FullMenu from './pages/FullMenu';
import CartDrawer from './components/CartDrawer';
import { NotificationProvider } from './context/NotificationContext';
import Toaster from './components/ui/Toaster';

// Lazy loading the admin to keep the hidden aspect
const AdminLayout = React.lazy(() => import('./admin/AdminLayout'));
const Dashboard = React.lazy(() => import('./admin/Dashboard'));
const KitchenDisplay = React.lazy(() => import('./admin/KitchenDisplay'));
const ReservationsManager = React.lazy(() => import('./admin/ReservationsManager'));
const VenueManager = React.lazy(() => import('./admin/VenueManager'));
const OrdersManager = React.lazy(() => import('./admin/OrdersManager'));
const DeliveryManager = React.lazy(() => import('./admin/DeliveryManager'));
const ProductsManager = React.lazy(() => import('./admin/ProductsManager'));
const CMSManager = React.lazy(() => import('./admin/CMSManager'));
const PersonnelManager = React.lazy(() => import('./admin/PersonnelManager'));

function App() {
  return (
    <NotificationProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/menu" element={<FullMenu />} />
          
          {/* Hidden Admin Routes */}
          <Route 
            path="/hidden-admin" 
            element={
              <React.Suspense fallback={<div className="bg-background h-screen"></div>}>
                <AdminLayout />
              </React.Suspense>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="kitchen" element={<KitchenDisplay />} />
            <Route path="reservations" element={<ReservationsManager />} />
            <Route path="venue" element={<VenueManager />} />
            <Route path="orders" element={<OrdersManager />} />
            <Route path="delivery" element={<DeliveryManager />} />
            <Route path="products" element={<ProductsManager />} />
            <Route path="cms" element={<CMSManager />} />
            <Route path="personnel" element={<PersonnelManager />} />
          </Route>

          {/* 404 Fallback to Home to maintain hidden aspect */}
          <Route path="*" element={<Home />} />
        </Routes>
        <CartDrawer />
      </Router>
      <Toaster />
    </NotificationProvider>
  );
}

export default App;
