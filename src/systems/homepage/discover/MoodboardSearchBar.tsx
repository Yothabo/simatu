import React from 'react';
import { FaHome, FaBars } from 'react-icons/fa';
import { TiArrowBack } from 'react-icons/ti';
import './moodboard-search.css';

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
  return (
    <div className={`kinetic-moodboard__search-header ${fixed ? 'moodboard-search-fixed' : ''} ${className}`} aria-hidden={!visible} style={!visible ? { transform: 'translate3d(0,-125%,0)', opacity: 0, pointerEvents: 'none' } : undefined}>
      <div className={`kinetic-moodboard__search-row ${showMenu ? "has-menu" : ""}`}>
        {onBack && <button type="button" className="kinetic-moodboard__search-back" aria-label="Back" onClick={onBack} tabIndex={visible ? 0 : -1}>{backIcon === 'arrow' ? <TiArrowBack size={21} aria-hidden="true" /> : <FaHome size={18} aria-hidden="true" />}</button>}
        <label className={`kinetic-moodboard__search-shell ${showMenu ? "has-menu" : ""}`}>
          <input className="kinetic-moodboard__search-input" type="search" placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} tabIndex={visible ? 0 : -1} aria-label={ariaLabel} />
        </label>
        {showMenu && <button type="button" className="kinetic-moodboard__menu-button" aria-label="Open menu" onClick={onMenuClick} tabIndex={visible ? 0 : -1}><FaBars aria-hidden="true" /></button>}
      </div>
    </div>
  );
}
