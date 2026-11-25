import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MoodboardSearchBar from '../../../homepage/discover/MoodboardSearchBar';
import useStorefront from '../../core/hooks/useStorefront.ts';
import './storefront-search-header.css';

type HeaderProps = {
  sticky?: boolean;
  showBack?: boolean;
};

export default function Header({ showBack = false }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { name: storeName, pathFor } = useStorefront();

  const menuLinks = [
    { label: 'Home', to: pathFor() },
    { label: 'Collections', to: pathFor('services') },
    { label: 'Catalogue', to: pathFor('catalog') },
    { label: `About ${storeName}`, to: pathFor('about') },
    { label: 'Shopping bag', to: pathFor('cart') },
    ...(storeName === 'Poshies'
      ? [
          { label: 'Privacy policy', to: pathFor('privacy') },
          { label: 'Terms of use', to: pathFor('terms') },
          { label: 'Delivery policy', to: pathFor('delivery') },
          { label: 'Refund & returns', to: pathFor('refund') },
        ]
      : []),
  ];

  return (
    <MoodboardSearchBar
      value={searchQuery}
      onChange={setSearchQuery}
      placeholder={`Search ${storeName} products and collections…`}
      ariaLabel={`Search ${storeName}`}
      fixed
      visible
      showMenu
      storefrontMenuLinks={menuLinks}
      onBack={showBack ? () => navigate(-1) : undefined}
      backIcon="arrow"
      onMenuClick={() => setMenuOpen((open) => !open)}
      className={menuOpen ? 'menu-expanded storefront-search-header' : 'storefront-search-header'}
    />
  );
}
