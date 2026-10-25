
import { Routes, Route, useLocation } from 'react-router-dom';

import Navbar from './components/navbar/navbar.jsx';
import Footer from './components/footer/footer.jsx';
import ProtectedRoute from './components/auth/protectedroute.jsx';

import Home from './pages/home/home.jsx';
import Login from './pages/login/login.jsx';
import Signup from './pages/signup/signup.jsx';
import Dashboard from './pages/dashboard/dashboard.jsx';
import Convert from './pages/convert/convert.jsx';
import Storage from './pages/storage/storage.jsx';
import Profile from './pages/profile/profile.jsx';
import Settings from './pages/settings/settings.jsx';
import Pricing from './pages/pricing/pricing.jsx';
import PaymentCallback from './pages/paymentcallback/paymentcallback.jsx';
import AdminRoute from './components/auth/adminroutes.jsx';
import Admin from './pages/admin/admin.jsx';

function ComingSoon({ title, description }) {
  return (
    <section className="container coming-soon-page">
      <h1>{title}</h1>
      <p>{description}</p>
    </section>
  );
}

function App() {
  const location = useLocation();

 const workspacePaths = [
  '/dashboard',
  '/convert',
  '/storage',
  '/settings',
  '/profile',
  '/admin',
];
  const isWorkspacePage = workspacePaths.includes(location.pathname);

  return (
    <>
      {!isWorkspacePage && <Navbar />}

      <main>
        <Routes>
          {/* Public pages */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          
<Route path="/pricing" element={<Pricing />} />


          {/* Protected workspace pages */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/convert" element={<Convert />} />
            <Route path="/storage" element={<Storage />} />
<Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route
  path="/payment/callback"
  element={<PaymentCallback />}
/>
<Route element={<AdminRoute />}>
  <Route path="/admin" element={<Admin />} />
</Route>
          </Route>

          {/* Fallback */}
          <Route
            path="*"
            element={
              <ComingSoon
                title="Page not found"
                description="The page you're looking for doesn't exist."
              />
            }
          />
        </Routes>
      </main>

      {!isWorkspacePage && <Footer />}
    </>
  );
}

export default App;
