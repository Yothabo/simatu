import React from 'react';
import { FaHome } from 'react-icons/fa';
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
};

export default function MoodboardSearchBar({
  value,
  onChange,
  onBack,
  placeholder = 'Search brands, products or collections…',
  ariaLabel = 'Search the brand network',
  className = '',
  visible = true,
}: MoodboardSearchBarProps) {
  return (
    <div className={`kinetic-moodboard__search-header ${fixed ? 'moodboard-search-fixed' : ''} ${className}`} aria-hidden={!visible} style={!visible ? { transform: 'translate3d(0,-125%,0)', opacity: 0, pointerEvents: 'none' } : undefined}>
      <div className="kinetic-moodboard__search-row">
        {onBack && <button type="button" className="kinetic-moodboard__search-back" aria-label="Back" onClick={onBack} tabIndex={visible ? 0 : -1}>{backIcon === 'arrow' ? <TiArrowBack size={21} aria-hidden="true" /> : <FaHome size={18} aria-hidden="true" />}</button>}
        <label className="kinetic-moodboard__search-shell">
          <input className="kinetic-moodboard__search-input" type="search" placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} tabIndex={visible ? 0 : -1} aria-label={ariaLabel} />
        </label>
      </div>
    </div>
  );
}
