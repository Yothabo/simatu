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
  const { cartItems } = useCart();
  const hasCartItems = cartItems.some((item) => item.quantity > 0);

  const scrollToSection = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className={`storefront-controls ${sticky ? 'storefront-controls--fixed' : ''}`} aria-label={`${storeName} storefront controls`}>
      <div className="storefront-controls__row">
        <div className="storefront-controls__search">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search products…"
            autoComplete="off"
            aria-label={`Search ${storeName}`}
          />
          {query && <button type="button" className="storefront-controls__clear" onClick={() => setQuery('')} aria-label="Clear search"><FiX /></button>}
        </div>
        {hasCartItems && (
          <Link to={pathFor('cart')} className="storefront-controls__icon" aria-label="Open shopping cart">
            <FaOpencart aria-hidden="true" />
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
      <div className={`storefront-controls__menu ${menuOpen ? 'is-open' : ''}`} aria-hidden={!menuOpen}>
        <nav aria-label={`${storeName} page sections`}>
          {scrollTargets.map((target) => (
            <button key={target.id} type="button" tabIndex={menuOpen ? 0 : -1} onClick={() => scrollToSection(target.id)}>
              {target.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
