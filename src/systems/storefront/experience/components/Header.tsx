import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes, FaHome, FaThLarge, FaShoppingBag, FaOpencart } from 'react-icons/fa';
import useStorefront from '../../core/hooks/useStorefront.ts';
import { useCart } from '../../core/context/CartContext';
import './storefront-header.css';

type HeaderProps = { sticky?: boolean; showBack?: boolean };

export default function Header({ sticky = true }: HeaderProps) {
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const { name: storeName, pathFor, navigation } = useStorefront();
  const { cartItems } = useCart();
  const cartCount = cartItems.reduce((total, item) => total + Math.max(0, item.quantity), 0);
  const expanded = navigation.variant === 'expanded';
  const scrollToSection = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className={`storefront-controls ${expanded ? 'storefront-controls--expanded' : ''} ${sticky ? 'storefront-controls--fixed' : ''}`} aria-label={`${storeName} storefront controls`}>
      <div className={`storefront-controls__row ${expanded && menuOpen ? 'storefront-controls__row--menu-open' : ''}`}>
        <div className={`storefront-controls__search ${expanded && menuOpen ? 'storefront-controls__search--menu-open' : ''}`}>
          {expanded && menuOpen ? (
            <nav className="storefront-controls__inline-menu" aria-label={`${storeName} navigation`}>
              <Link to={pathFor()} className="storefront-controls__menu-item" onClick={() => setMenuOpen(false)}><FaHome aria-hidden="true" /><span>{navigation.homeLabel}</span></Link>
              {navigation.categories.length > 0 && <>
                <div className="storefront-controls__menu-item storefront-controls__categories-label"><FaThLarge aria-hidden="true" /><span>{navigation.categoryLabel}</span></div>
                <div className="storefront-controls__category-submenu">
                  {navigation.categories.map((item) => <button key={item.id} type="button" onClick={() => scrollToSection(item.id)}><span>{item.label}</span></button>)}
                </div>
              </>}
              <Link to={pathFor('catalog')} className="storefront-controls__menu-item" onClick={() => setMenuOpen(false)}><FaShoppingBag aria-hidden="true" /><span>{navigation.catalogueLabel}</span></Link>
            </nav>
          ) : <>
            <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products…" autoComplete="off" aria-label={`Search ${storeName}`} />
            {query && <button type="button" className="storefront-controls__clear" onClick={() => setQuery('')} aria-label="Clear search"><FaTimes /></button>}
          </>}
        </div>
        {cartCount > 0 && <Link to={pathFor('cart')} className="storefront-controls__icon storefront-controls__cart" aria-label={`Open shopping cart, ${cartCount} ${cartCount === 1 ? 'item' : 'items'}`}><FaOpencart aria-hidden="true" /><span className="storefront-controls__cart-count" aria-hidden="true">{cartCount > 99 ? '99+' : cartCount}</span></Link>}
        <button type="button" className="storefront-controls__icon" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-label={menuOpen ? 'Close storefront menu' : 'Open storefront menu'}>{menuOpen ? <FaTimes aria-hidden="true" /> : <FaBars aria-hidden="true" />}</button>
      </div>
      {!expanded && <div className={`storefront-controls__menu ${menuOpen ? 'is-open' : ''}`} aria-hidden={!menuOpen}><nav aria-label={`${storeName} page sections`}>
        {navigation.sections.map((target) => <button key={target.id} type="button" tabIndex={menuOpen ? 0 : -1} onClick={() => scrollToSection(target.id)}>{target.label}</button>)}
      </nav></div>}
    </div>
  );
}
