import React, { Suspense } from 'react';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';

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
  { error: string | null }
> {
  state = { error: null as string | null };

  static getDerivedStateFromError(error: Error) {
    return { error: error.stack || error.message };
  }

  render() {
    if (this.state.error) {
      return (
        <pre
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999999,
            background: '#fff',
            color: '#b00020',
            padding: 20,
            overflow: 'auto',
            whiteSpace: 'pre-wrap',
            fontSize: 13,
          }}
        >
          ADMIN ERROR

          {this.state.error}
        </pre>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
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
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
