import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowUpRight, FiX } from 'react-icons/fi';
import MenuIcon from '../../../../components/MenuIcon.tsx';
import { FaOpencart } from 'react-icons/fa';
import { TiArrowBack } from 'react-icons/ti';
import { useCart } from '../../core/context/CartContext.tsx';
import useStorefront from '../../core/hooks/useStorefront.ts';

type HeaderProps = {
  sticky?: boolean;
  showBack?: boolean;
};

export default function Header({ sticky = false, showBack = false }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuHovered, setMenuHovered] = useState(false);
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const { name: storeName, pathFor, primaryAccent } = useStorefront();

  const navLinks = [
    { label: 'Home', to: pathFor() },
    { label: storeName === 'Yotaabo' ? 'Fragrances' : 'Shop', to: pathFor('services') },
    { label: 'Our story', to: pathFor('about') },
  ];

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 bg-white text-black">
      <div className="mx-auto flex min-h-[76px] w-[min(1180px,calc(100%-48px))] items-center justify-between">

        {/* Left Side */}
        <div className="flex items-center gap-8">
          {showBack ? (
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center border-0 bg-transparent p-0 text-black outline-none transition-colors hover:text-[#777770]"
              aria-label="Go back"
            >
              <TiArrowBack size={24} aria-hidden="true" />
            </button>
          ) : (
            <nav
              aria-label="Main navigation"
              className="hidden items-center gap-8 md:flex"
            >
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="text-sm text-black transition-colors hover:text-[#777770]"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}


        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          <Link
            to={pathFor('services')}
            className="hidden items-center gap-2 bg-[#4d4d4d] px-4 py-3 text-xs font-semibold text-white transition-colors hover:bg-[#3a3a3a] md:inline-flex"
          >
            Explore Collection
            <FiArrowUpRight size={16} aria-hidden="true" />
          </Link>

          {/* Cart Icon - Right side, next to menu */}
          {cartItems.length > 0 && (
            <Link
              to={pathFor('cart')}
              aria-label="View cart"
              className="relative inline-flex h-11 w-11 items-center justify-center border-0 bg-transparent p-0 text-black outline-none transition-colors hover:text-[#777770]"
            >
              <FaOpencart size={26} aria-hidden="true" />
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: primaryAccent }}>
                {cartItems.length}
              </span>
            </Link>
          )}

          <button
            type="button"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            aria-controls="site-navigation"
            onClick={() => setMenuOpen((open) => !open)}
            onMouseEnter={() => setMenuHovered(true)}
            onMouseLeave={() => setMenuHovered(false)}
            className="inline-flex h-11 w-11 items-center justify-center border-0 bg-transparent p-0 text-black outline-none transition-colors hover:text-[#777770] focus-visible:ring-2 focus-visible:ring-black md:hidden"
          >
            <MenuIcon isOpen={menuOpen} isHovered={menuHovered} size={29} />
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <nav
          id="site-navigation"
          aria-label="Main navigation"
          className="absolute left-0 right-0 top-full border-y border-black/10 bg-white px-6 pb-5 md:hidden"
        >
          {navLinks.map((link, index) => (
            <Link
              key={link.label}
              to={link.to}
              onClick={closeMenu}
              className={`flex items-center justify-between py-4 text-sm text-black transition-colors hover:text-[#777770] ${
                index < navLinks.length - 1 ? 'border-b border-black/10' : ''
              }`}
            >
              {link.label}
            </Link>
          ))}

          <Link
            to={pathFor('services')}
            onClick={closeMenu}
            className="mt-4 flex min-h-12 items-center justify-between bg-[#4d4d4d] px-4 text-xs font-semibold text-white transition-colors hover:bg-[#3a3a3a]"
          >
            Explore Collection
            <FiArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </nav>
      )}
    </header>
  );
}
