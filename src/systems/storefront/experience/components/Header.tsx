import { useState } from 'react';
import { FiSearch, FiMenu, FiX } from 'react-icons/fi';
import useStorefront from '../../core/hooks/useStorefront.ts';
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
  const { name: storeName } = useStorefront();

  const scrollToSection = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <header className={`storefront-header ${sticky ? 'storefront-header--sticky' : ''}`} aria-label={`${storeName} header`}>
      <div className="storefront-header__bar">
        <form className="storefront-header__search" onSubmit={(event) => { event.preventDefault(); scrollToSection('services'); }}>
          <FiSearch aria-hidden="true" className="storefront-header__search-icon" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Search ${storeName}…`}
            aria-label={`Search ${storeName}`}
          />
          {query && <button type="button" className="storefront-header__clear" onClick={() => setQuery('')} aria-label="Clear search"><FiX /></button>}
        </form>
        <button
          type="button"
          className="storefront-header__toggle"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Close storefront menu' : 'Open storefront menu'}
        >
          {menuOpen ? <FiX aria-hidden="true" /> : <FiMenu aria-hidden="true" />}
        </button>
      </div>
      <div className={`storefront-header__menu ${menuOpen ? 'is-open' : ''}`} aria-hidden={!menuOpen}>
        <nav aria-label={`${storeName} page sections`}>
          {scrollTargets.map((target) => (
            <button key={target.id} type="button" tabIndex={menuOpen ? 0 : -1} onClick={() => scrollToSection(target.id)}>
              {target.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
