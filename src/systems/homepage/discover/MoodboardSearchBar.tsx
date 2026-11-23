import React from 'react';
import { FaHome, FaBars, FaTimes, FaUsers, FaBookmark, FaHistory, FaRandom } from 'react-icons/fa';
import { TiArrowBack } from 'react-icons/ti';
import './moodboard-search.css';
import './search-bar-expansion.css';

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
  const menuExpanded = className.includes("menu-expanded");
  return (
    <div className={`kinetic-moodboard__search-header ${fixed ? 'moodboard-search-fixed' : ''} ${className}`} aria-hidden={!visible} style={!visible ? { transform: 'translate3d(0,-125%,0)', opacity: 0, pointerEvents: 'none' } : undefined}>
      <div className={`kinetic-moodboard__search-row ${showMenu ? "has-menu" : ""}`}>
        {onBack && <button type="button" className="kinetic-moodboard__search-back" aria-label="Back" onClick={onBack} tabIndex={visible ? 0 : -1}>{backIcon === 'arrow' ? <TiArrowBack size={21} aria-hidden="true" /> : <FaHome size={18} aria-hidden="true" />}</button>}
        <div className={`kinetic-moodboard__search-shell ${showMenu ? "has-menu" : ""}`}>
          {menuExpanded ? (
            <nav className="kinetic-moodboard__discover-tools" aria-label="Discover tools">
              <a href="/join-network" className="kinetic-moodboard__discover-tool"><FaUsers aria-hidden="true" /><span>Join Network</span></a>
              <button type="button" className="kinetic-moodboard__discover-tool" disabled><FaBookmark aria-hidden="true" /><span>Saved Discoveries</span></button>
              <button type="button" className="kinetic-moodboard__discover-tool" disabled><FaHistory aria-hidden="true" /><span>Recently Viewed</span></button>
              <button type="button" className="kinetic-moodboard__discover-tool" disabled><FaRandom aria-hidden="true" /><span>Explore Randomly</span></button>
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
