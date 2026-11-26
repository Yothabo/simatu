import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';
import { FaOpencart } from 'react-icons/fa';
import useStorefront from '../../core/hooks/useStorefront.ts';
import { useCart } from '../../core/context/CartContext';
import './storefront-header.css';

type HeaderProps = {
  sticky?: boolean;
  showBack?: boolean;
};

const scrollTargets = [
  { id: 'home', label: 'Home' },
  { id: 'services', label: 'Collections' },
  { id: 'about', label: 'About' },
];

export default function Header({ sticky = true }: HeaderProps) {
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const { name: storeName, pathFor } = useStorefront();
  const isPoshies = storeName === "Poshies";
  const { cartItems } = useCart();
  const cartCount = cartItems.reduce((total, item) => total + Math.max(0, item.quantity), 0);
  const hasCartItems = cartCount > 0;

  const scrollToSection = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className={`storefront-controls ${isPoshies ? 'storefront-controls--poshies' : ''} ${sticky ? 'storefront-controls--fixed' : ''}`} aria-label={`${storeName} storefront controls`}>
      <div className="storefront-controls__row">
        <div className={`storefront-controls__search ${isPoshies && menuOpen ? 'storefront-controls__search--menu-open' : ''}`}>
          {isPoshies && menuOpen ? (
            <nav className="storefront-controls__inline-menu" aria-label={`${storeName} page sections`}>
              {scrollTargets.map((target) => (
                <button key={target.id} type="button" onClick={() => scrollToSection(target.id)}>
                  {target.label}
                </button>
              ))}
            </nav>
          ) : (
            <>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search products…"
                autoComplete="off"
                aria-label={`Search ${storeName}`}
              />
              {query && <button type="button" className="storefront-controls__clear" onClick={() => setQuery('')} aria-label="Clear search"><FiX /></button>}
            </>
          )}
        </div>
        {hasCartItems && (
          <Link to={pathFor('cart')} className="storefront-controls__icon storefront-controls__cart" aria-label={`Open shopping cart, ${cartCount} ${cartCount === 1 ? 'item' : 'items'}`}>
            <FaOpencart aria-hidden="true" />
            <span className="storefront-controls__cart-count" aria-hidden="true">{cartCount > 99 ? '99+' : cartCount}</span>
          </Link>
        )}
        <button
          type="button"
          className="storefront-controls__icon"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Close storefront menu' : 'Open storefront menu'}
        >
          {menuOpen ? <FiX aria-hidden="true" /> : <FiMenu aria-hidden="true" />}
        </button>
      </div>
      {!isPoshies && (
        <div className={`storefront-controls__menu ${menuOpen ? 'is-open' : ''}`} aria-hidden={!menuOpen}>
          <nav aria-label={`${storeName} page sections`}>
            {scrollTargets.map((target) => (
              <button key={target.id} type="button" tabIndex={menuOpen ? 0 : -1} onClick={() => scrollToSection(target.id)}>
                {target.label}
              </button>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
