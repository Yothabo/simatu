import React, { Suspense } from 'react';
import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import MetaTags from './components/MetaTags';
import ScrollToHash from './components/ScrollToHash';
import { useTouchSelection } from '../shared/hooks/useTouchSelection';

import { StorefrontCartProvider, StorefrontThemeProvider } from '../systems/storefront/core';
import { GlobalCartProvider } from '../shared/cart/CartContext';

const DiscoveryPage = React.lazy(
  () => import('../systems/homepage').then(({ DiscoveryPage }) => ({ default: DiscoveryPage }))
);
const Home = React.lazy(() => import('../systems/storefront/experience').then(({ HomePage }) => ({ default: HomePage })));
const ServicesPage = React.lazy(() => import('../systems/storefront/experience').then(({ ServicesPage }) => ({ default: ServicesPage })));
const ViewCatalog = React.lazy(() => import('../systems/storefront/experience').then(({ CatalogPage }) => ({ default: CatalogPage })));
const About = React.lazy(() => import('../systems/storefront/experience').then(({ AboutPage }) => ({ default: AboutPage })));
const CartPage = React.lazy(() => import('../systems/storefront/experience').then(({ CartPage }) => ({ default: CartPage })));
const MarketplaceCartPage = React.lazy(() => import('../systems/storefront/experience').then(({ MarketplaceCartPage }) => ({ default: MarketplaceCartPage })));
const NotFound = React.lazy(() => import('../pages/NotFound'));
const UpdatePassword = React.lazy(() => import('../pages/UpdatePassword'));
const DiscoveryCategoryPage = React.lazy(
  () => import('../systems/homepage').then(({ DiscoveryCategoryPage }) => ({ default: DiscoveryCategoryPage }))
);
const NetworkApplicationPage = React.lazy(
  () => import('../systems/homepage').then(({ NetworkApplicationPage }) => ({ default: NetworkApplicationPage }))
);
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

function MarketplaceCartOverlayRoute() { return <DiscoveryPage />; }
function MarketplaceLayout() { return <GlobalCartProvider><Outlet /></GlobalCartProvider>; }
function YotaaboLayout() { return <StorefrontCartProvider storefront="yotaabo"><StorefrontThemeProvider><Outlet /></StorefrontThemeProvider></StorefrontCartProvider>; }
function PoshiesLayout() { return <StorefrontCartProvider storefront="poshies"><StorefrontThemeProvider><Outlet /></StorefrontThemeProvider></StorefrontCartProvider>; }

function App() {
  useTouchSelection();

  return (
    <BrowserRouter>
      <ScrollToHash />
      <MetaTags />

      <Suspense fallback={<RouteLoadingFallback />}>
        <Routes>
          <Route element={<MarketplaceLayout />}>
            <Route path="/" element={<DiscoveryPage />} />
            <Route path="/discover/:categoryId" element={<DiscoveryCategoryPage />} />
            <Route path="/cart" element={<MarketplaceCartOverlayRoute />} />
            <Route path="/checkout" element={<MarketplaceCartOverlayRoute />} />
          </Route>
          <Route path="/join-network" element={<NetworkApplicationPage />} />

          <Route element={<YotaaboLayout />}>
            <Route path="/yotaabo" element={<Home />} />
            <Route path="/yotaabo/services" element={<ServicesPage />} />
            <Route path="/yotaabo/catalog" element={<ViewCatalog />} />
            <Route path="/yotaabo/about" element={<About />} />
            <Route path="/yotaabo/cart" element={<CartPage />} />
            <Route path="/yotaabo/*" element={<NotFound />} />
          </Route>

          <Route element={<PoshiesLayout />}>
            <Route path="/poshies" element={<Home />} />
            <Route path="/poshies/services" element={<ServicesPage />} />
            <Route path="/poshies/catalog" element={<ViewCatalog />} />
            <Route path="/poshies/about" element={<About />} />
            <Route path="/poshies/cart" element={<CartPage />} />
            <Route path="/poshies/*" element={<NotFound />} />
          </Route>

          <Route path="/update-password" element={<UpdatePassword />} />
          <Route path="/admin" element={<AdminErrorBoundary><Suspense fallback={<div style={{ color: 'white', padding: 30 }}>Loading admin module...</div>}><AdminPage /></Suspense></AdminErrorBoundary>} />
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
