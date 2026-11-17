import React, { Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import MetaTags from './components/MetaTags';
import ScrollToHash from './components/ScrollToHash';
import { useTouchSelection } from './utils/useTouchSelection';

import CorporateHome from './pages/CorporateHome';
import { CartProvider } from './context/CartContext';
import Home from './pages/Home';
import ServicesPage from './pages/ServicesPage';
import ViewCatalog from './pages/ViewCatalog';
import About from './pages/About';
import CartPage from './pages/CartPage';
import NotFound from './pages/NotFound';
import UpdatePassword from './pages/UpdatePassword';

const AdminPage = React.lazy(() => import('./pages/admin/AdminPage'));

class AdminErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Admin page rendering failed:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main
          role="alert"
          style={{
            minHeight: '100vh',
            display: 'grid',
            placeContent: 'center',
            gap: 16,
            padding: 24,
            background: '#fff',
            color: '#202124',
            textAlign: 'center',
          }}
        >
          <h1>Admin could not be loaded</h1>
          <p>Something went wrong while opening the admin dashboard.</p>
          <button type="button" onClick={() => window.location.reload()}>
            Reload admin
          </button>
        </main>
      );
    }

    return this.props.children;
  }
}

function App() {
  useTouchSelection();

  return (
    <BrowserRouter>
      <CartProvider>
        <ScrollToHash />
        <MetaTags />
        <Routes>
        <Route path="/" element={<CorporateHome />} />

        <Route path="/yotaabo" element={<Home />} />
        <Route path="/yotaabo/services" element={<ServicesPage />} />
        <Route path="/yotaabo/catalog" element={<ViewCatalog />} />
        <Route path="/yotaabo/about" element={<About />} />
        <Route path="/yotaabo/cart" element={<CartPage />} />
        <Route path="/yotaabo/*" element={<NotFound />} />

        <Route path="/poshies" element={<Home />} />
        <Route path="/poshies/services" element={<ServicesPage />} />
        <Route path="/poshies/catalog" element={<ViewCatalog />} />
        <Route path="/poshies/about" element={<About />} />
        <Route path="/poshies/cart" element={<CartPage />} />
        <Route path="/poshies/*" element={<NotFound />} />

        <Route path="/update-password" element={<UpdatePassword />} />

        <Route
          path="/admin"
          element={
            <AdminErrorBoundary>
              <Suspense
                fallback={
                  <div style={{ color: 'white', padding: 30 }}>
                    Loading admin module...
                  </div>
                }
              >
                <AdminPage />
              </Suspense>
            </AdminErrorBoundary>
          }
        />

        <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster
          position="top-right"
          containerStyle={{ top: 90, right: 20 }}
        />
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
