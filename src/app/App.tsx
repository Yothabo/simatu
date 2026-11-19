import React, { Suspense } from 'react';
import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import MetaTags from './components/MetaTags';
import ScrollToHash from './components/ScrollToHash';
import { useTouchSelection } from '../shared/hooks/useTouchSelection';

import { CartProvider } from '../systems/storefront/core/context/CartContext';
import StorefrontThemeProvider from '../systems/storefront/core/components/StorefrontThemeProvider';

const HomepageHero = React.lazy(
  () => import('../systems/homepage/pages/HomePage')
);
const Home = React.lazy(() => import('../systems/storefront/experience/pages/HomePage'));
const ServicesPage = React.lazy(() => import('../systems/storefront/experience/pages/ServicesPage'));
const ViewCatalog = React.lazy(() => import('../systems/storefront/experience/pages/CatalogPage'));
const About = React.lazy(() => import('../systems/storefront/experience/pages/AboutPage'));
const CartPage = React.lazy(() => import('../systems/storefront/experience/pages/CartPage'));
const NotFound = React.lazy(() => import('../pages/NotFound'));
const UpdatePassword = React.lazy(() => import('../pages/UpdatePassword'));
const AdminPage = React.lazy(() => import('../pages/admin/AdminPage'));

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

function RouteLoadingFallback() {
  return (
    <main
      role="status"
      aria-live="polite"
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeContent: 'center',
        padding: 24,
        background: '#fff',
        color: '#4d4d4d',
      }}
    >
      Loading page...
    </main>
  );
}

function App() {
  useTouchSelection();

  return (
    <BrowserRouter>
      <ScrollToHash />
      <MetaTags />

      <Suspense fallback={<RouteLoadingFallback />}>
        <Routes>
          <Route path="/" element={<HomepageHero />} />


          <Route element={<CartProvider><StorefrontThemeProvider><Outlet /></StorefrontThemeProvider></CartProvider>}>
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
          </Route>

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
      </Suspense>

      <Toaster
        position="top-right"
        containerStyle={{ top: 90, right: 20 }}
      />
    </BrowserRouter>
  );
}

export default App;
