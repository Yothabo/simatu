import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGlobalCart } from '../../../shared/cart/CartContext';
import { FaHome, FaBars, FaTimes, FaUsers, FaBookmark, FaHistory, FaRandom, FaThLarge, FaOpencart, FaCreditCard } from 'react-icons/fa';
import { TiArrowBack } from 'react-icons/ti';
import './moodboard-search.css';
import './search-bar-expansion.css';

type SavedDiscovery = { id: string; image: string; alt: string; category: string; title: string; objectPosition?: string };
type DiscoveryCategory = { id: string; category: string; title: string; image: string; alt: string };
type StorefrontMenuLink = { label: string; to: string };

type MoodboardSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onBack?: () => void;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
  visible?: boolean;
  backIcon?: 'home' | 'arrow';
  fixed?: boolean;
  showMenu?: boolean;
  onMenuClick?: () => void;
  savedDiscoveries?: SavedDiscovery[];
  onSavedDiscoverySelect?: (item: SavedDiscovery) => void;
  categories?: DiscoveryCategory[];
  recentCategories?: DiscoveryCategory[];
  activeCategory?: string | null;
  onCategorySelect?: (category: string) => void;
  onRecentCategorySelect?: (category: string) => void;
  onClearCategory?: () => void;
  onRandomDiscovery?: () => void;\n  storefrontMenuLinks?: StorefrontMenuLink[];
};

export default function MoodboardSearchBar({
  value,
  onChange,
  onBack,
  placeholder = 'Search brands, products or collections…',
  ariaLabel = 'Search the brand network',
  className = '',
  visible = true,
  backIcon = 'home',
  fixed = false,
  showMenu = false,
  onMenuClick,
  savedDiscoveries = [],
  onSavedDiscoverySelect,
  categories = [],
  recentCategories = [],
  activeCategory = null,
  onCategorySelect,
  onRecentCategorySelect,
  onClearCategory,
  onRandomDiscovery,
}: MoodboardSearchBarProps) {
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);
  const [recentOpen, setRecentOpen] = useState(false);
  const { cartItems } = useGlobalCart();
  const cartQuantity = cartItems.reduce((total, item) => total + item.quantity, 0);
  const menuExpanded = className.includes("menu-expanded");
  return (
    <div className={`kinetic-moodboard__search-header ${fixed ? 'moodboard-search-fixed' : ''} ${className}`} aria-hidden={!visible} style={!visible ? { transform: 'translate3d(0,-125%,0)', opacity: 0, pointerEvents: 'none' } : undefined}>
      <div className={`kinetic-moodboard__search-row ${showMenu ? "has-menu" : ""}`}>
        {onBack && <button type="button" className="kinetic-moodboard__search-back" aria-label="Back" onClick={onBack} tabIndex={visible ? 0 : -1}>{backIcon === 'arrow' ? <TiArrowBack size={21} aria-hidden="true" /> : <FaHome size={18} aria-hidden="true" />}</button>}
        <div className={`kinetic-moodboard__search-shell ${showMenu ? "has-menu" : ""}`}>
          {menuExpanded ? (
            <nav className="kinetic-moodboard__discover-tools" aria-label="Discover tools">
              {activeCategory && <div className="kinetic-moodboard__active-category"><span>Showing {activeCategory}</span><button type="button" onClick={() => { onClearCategory?.(); onMenuClick?.(); }}>Show all discoveries</button></div>}
              <div className="kinetic-moodboard__discover-group">
                <div className="kinetic-moodboard__discover-group-heading"><strong>Network</strong><small>Connect and participate</small></div>
                <a href="/join-network" className="kinetic-moodboard__discover-tool"><FaUsers aria-hidden="true" /><span>Join Network</span></a>
              </div>
              <div className="kinetic-moodboard__discover-group">
                <div className="kinetic-moodboard__discover-group-heading"><strong>Discovery</strong><small>Find something different</small></div>
                <button type="button" className="kinetic-moodboard__discover-tool" onClick={() => { onRandomDiscovery?.(); onMenuClick?.(); }}><FaRandom aria-hidden="true" /><span>Explore Randomly</span></button>
                <button type="button" className="kinetic-moodboard__discover-tool" onClick={() => setCategoriesOpen((open) => !open)} aria-expanded={categoriesOpen}><FaThLarge aria-hidden="true" /><span>Browse Categories</span></button>
                {categoriesOpen && <div className="kinetic-moodboard__discover-category-list" aria-label="Browse discovery categories">{categories.map((category) => <button type="button" key={category.id} className="kinetic-moodboard__discover-category" onClick={() => { onCategorySelect?.(category.category); setCategoriesOpen(false); onMenuClick?.(); }}>{category.category}</button>)}</div>}
              </div>
              <div className="kinetic-moodboard__discover-group">
                <div className="kinetic-moodboard__discover-group-heading"><strong>Shopping</strong><small>Your shared Simatu basket</small></div>
                <Link to="/cart" className="kinetic-moodboard__discover-tool"><FaOpencart aria-hidden="true" /><span>Cart</span><small>{cartQuantity}</small></Link>
                <Link to="/checkout" className="kinetic-moodboard__discover-tool"><FaCreditCard aria-hidden="true" /><span>Checkout</span></Link>
              </div>
              <div className="kinetic-moodboard__discover-group">
                <div className="kinetic-moodboard__discover-group-heading"><strong>Personal Library</strong><small>Your discovery history</small></div>
                <button type="button" className="kinetic-moodboard__discover-tool" onClick={() => setSavedOpen((open) => !open)} aria-expanded={savedOpen}><FaBookmark aria-hidden="true" /><span>Saved Discoveries</span><small>{Math.min(savedDiscoveries.length, 5)}</small></button>
                {savedOpen && <div className="kinetic-moodboard__discover-category-list" aria-label="Saved discoveries">{savedDiscoveries.length ? savedDiscoveries.slice(0, 5).map((item) => <button type="button" key={item.id} className="kinetic-moodboard__discover-category kinetic-moodboard__saved-discovery" onClick={() => { onSavedDiscoverySelect?.(item); onMenuClick?.(); }}><img src={item.image} alt="" loading="lazy"/><span>{item.title}</span></button>) : <p className="kinetic-moodboard__saved-empty">Your saved discoveries will appear here.</p>}</div>}
                <button type="button" className="kinetic-moodboard__discover-tool" onClick={() => setRecentOpen((open) => !open)} aria-expanded={recentOpen}><FaHistory aria-hidden="true" /><span>Recently Visited Categories</span><small>{recentCategories.length}</small></button>
                {recentOpen && <div className="kinetic-moodboard__discover-category-list" aria-label="Recently visited categories">{recentCategories.length ? recentCategories.map((category) => <button type="button" key={category.id} className="kinetic-moodboard__discover-category kinetic-moodboard__saved-discovery" onClick={() => { onRecentCategorySelect?.(category.category); onMenuClick?.(); }}><img src={category.image} alt="" loading="lazy"/><span>{category.category}</span></button>) : <p className="kinetic-moodboard__saved-empty">Categories you visit will appear here.</p>}</div>}
              </div>
            </nav>
          ) : (
            <input className="kinetic-moodboard__search-input" type="search" placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} tabIndex={visible ? 0 : -1} aria-label={ariaLabel} />
          )}
        </div>
        {showMenu && <button type="button" className="kinetic-moodboard__menu-button" aria-label={className.includes("menu-expanded") ? "Close menu" : "Open menu"} onClick={onMenuClick} tabIndex={visible ? 0 : -1}>{className.includes("menu-expanded") ? <FaTimes aria-hidden="true" /> : <FaBars aria-hidden="true" />}</button>}
      </div>
    </div>
  );
}
