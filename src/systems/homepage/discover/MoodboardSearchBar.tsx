import React, { useState } from 'react';
import { FaHome, FaBars, FaTimes, FaUsers, FaBookmark, FaHistory, FaRandom } from 'react-icons/fa';
import { TiArrowBack } from 'react-icons/ti';
import './moodboard-search.css';
import './search-bar-expansion.css';

type SavedDiscovery = { id: string; image: string; alt: string; category: string; title: string; objectPosition?: string };

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
  onMenuClick?: () => void;\n  savedDiscoveries?: SavedDiscovery[];\n  onSavedDiscoverySelect?: (item: SavedDiscovery) => void;
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
}: MoodboardSearchBarProps) {
  const [categoriesOpen, setCategoriesOpen] = useState(false);\n  const [savedOpen, setSavedOpen] = useState(false);
  const menuExpanded = className.includes("menu-expanded");
  return (
    <div className={`kinetic-moodboard__search-header ${fixed ? 'moodboard-search-fixed' : ''} ${className}`} aria-hidden={!visible} style={!visible ? { transform: 'translate3d(0,-125%,0)', opacity: 0, pointerEvents: 'none' } : undefined}>
      <div className={`kinetic-moodboard__search-row ${showMenu ? "has-menu" : ""}`}>
        {onBack && <button type="button" className="kinetic-moodboard__search-back" aria-label="Back" onClick={onBack} tabIndex={visible ? 0 : -1}>{backIcon === 'arrow' ? <TiArrowBack size={21} aria-hidden="true" /> : <FaHome size={18} aria-hidden="true" />}</button>}
        <div className={`kinetic-moodboard__search-shell ${showMenu ? "has-menu" : ""}`}>
          {menuExpanded ? (
            <nav className="kinetic-moodboard__discover-tools" aria-label="Discover tools">
              <div className="kinetic-moodboard__discover-group">
                <div className="kinetic-moodboard__discover-group-heading"><strong>Network</strong><small>Connect and participate</small></div>
                <a href="/join-network" className="kinetic-moodboard__discover-tool"><FaUsers aria-hidden="true" /><span>Join Network</span></a>
                <button type="button" className="kinetic-moodboard__discover-tool" disabled><FaUsers aria-hidden="true" /><span>Become a Brand Partner</span></button>
                <button type="button" className="kinetic-moodboard__discover-tool" disabled><FaUsers aria-hidden="true" /><span>Submit Your Brand</span></button>
              </div>
              <div className="kinetic-moodboard__discover-group">
                <div className="kinetic-moodboard__discover-group-heading"><strong>Discovery</strong><small>Find something different</small></div>
                <button type="button" className="kinetic-moodboard__discover-tool" disabled><FaRandom aria-hidden="true" /><span>Explore Randomly</span></button>
                <button type="button" className="kinetic-moodboard__discover-tool" disabled><FaRandom aria-hidden="true" /><span>Trending Discoveries</span></button>
                <button type="button" className="kinetic-moodboard__discover-tool" disabled><FaRandom aria-hidden="true" /><span>New Discoveries</span></button>
                <button type="button" className="kinetic-moodboard__discover-tool" onClick={() => setCategoriesOpen((open) => !open)} aria-expanded={categoriesOpen}><FaRandom aria-hidden="true" /><span>Browse Categories</span></button>
                {categoriesOpen && <div className="kinetic-moodboard__discover-category-list" aria-label="Browse discovery categories">{['Spaces','Style','Fashion','Living','Objects','Culture','Ideas','Workspaces','Everyday','Explore'].map((category) => <button type="button" key={category} className="kinetic-moodboard__discover-category" onClick={() => { onChange(category); setCategoriesOpen(false); onMenuClick?.(); }}>{category}</button>)}</div>}
              </div>
              <div className="kinetic-moodboard__discover-group">
                <div className="kinetic-moodboard__discover-group-heading"><strong>Personal Library</strong><small>Your discovery history</small></div>
                <button type="button" className="kinetic-moodboard__discover-tool" onClick={() => setSavedOpen((open) => !open)} aria-expanded={savedOpen}><FaBookmark aria-hidden="true" /><span>Saved Discoveries</span><small>{savedDiscoveries.length}</small></button>
                {savedOpen && <div className="kinetic-moodboard__discover-category-list" aria-label="Saved discoveries">{savedDiscoveries.length ? savedDiscoveries.map((item) => <button type="button" key={item.id} className="kinetic-moodboard__discover-category kinetic-moodboard__saved-discovery" onClick={() => { onSavedDiscoverySelect?.(item); onMenuClick?.(); }}><img src={item.image} alt="" loading="lazy"/><span>{item.title}</span></button>) : <p className="kinetic-moodboard__saved-empty">Your saved discoveries will appear here.</p>}</div>}
                <button type="button" className="kinetic-moodboard__discover-tool" disabled><FaHistory aria-hidden="true" /><span>Recently Viewed</span></button>
                <button type="button" className="kinetic-moodboard__discover-tool" disabled><FaBookmark aria-hidden="true" /><span>Your Collections</span></button>
              </div>
              <div className="kinetic-moodboard__discover-group">
                <div className="kinetic-moodboard__discover-group-heading"><strong>Curated</strong><small>Explore collections of brands</small></div>
                <button type="button" className="kinetic-moodboard__discover-tool" disabled><FaBookmark aria-hidden="true" /><span>Editor's Picks</span></button>
                <button type="button" className="kinetic-moodboard__discover-tool" disabled><FaBookmark aria-hidden="true" /><span>Featured Collections</span></button>
                <button type="button" className="kinetic-moodboard__discover-tool" disabled><FaBookmark aria-hidden="true" /><span>Hidden Gems</span></button>
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
