import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { navItems } from "../hero/hero.data";
import { footerLinkGroups } from "../footer/footer-links.data";
import { brandIdentity, type BrandIdentity, type BrandPresentation } from "../brand/brand.config";
import { TiArrowBack } from "react-icons/ti";
import { FiSearch, FiMenu, FiX } from "react-icons/fi";
import "./header.css";

type HeaderProps = {
  brand?: BrandIdentity;
  brandName?: string;
  presentation?: BrandPresentation;
  inline?: boolean;
  showBackButton?: boolean;
  onBack?: () => void;
  floatingControls?: boolean;
};

export default function Header({
  brand = brandIdentity,
  brandName,
  presentation = brand.defaultPresentation,
  inline = false,
  showBackButton = false,
  onBack,
  floatingControls = false,
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const name = brandName ?? brand.name;
  const wordmark = presentation === "spaced" ? brand.wordmarks.spaced : brand.wordmarks.standard;
  const brandContent = presentation === "brandmark"
    ? brand.brandmark.src
      ? <img className="header-brandmark-image" src={brand.brandmark.src} alt={brand.brandmark.alt} />
      : <span className="header-brandmark-fallback" aria-label={brand.brandmark.alt}>{name.slice(0, 1)}</span>
    : wordmark;
  const menuContent = <>
    {navItems.map((item) => <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setMenuOpen(false)}>{item}</a>)}
    <a className="nav-network-link" href="/join-network" onClick={() => setMenuOpen(false)}>Join Network <span>↗</span></a>
    <div className="nav-footer-link-groups">{footerLinkGroups.map((group) => <section key={group.title} className="nav-footer-link-group"><h3>{group.title}</h3>{group.links.map((link) => <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>{link.label}</a>)}</section>)}</div>
  </>;

  return (
    <nav className={inline ? "hero-navigation header-inline" : floatingControls ? "hero-navigation header-floating" : "hero-navigation"}>
      {floatingControls ? (
        <div className="header-floating-controls">
          <button type="button" className="header-float-button" aria-label="Back" onClick={() => (onBack ? onBack() : navigate("/"))}><TiArrowBack size={21} /></button>
          <button type="button" className="header-float-button" aria-label="Search" aria-expanded={searchOpen} onClick={() => { setSearchOpen((v) => !v); setMenuOpen(false); }}><FiSearch size={20} /></button>
          <button type="button" className="header-float-button" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} onClick={() => { setMenuOpen((v) => !v); setSearchOpen(false); }}>{menuOpen ? <FiX size={21} /> : <FiMenu size={21} />}</button>
          {searchOpen && <div className="header-floating-search"><FiSearch size={18} /><input autoFocus type="search" placeholder="Search stores, products or ideas…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} aria-label="Search stores, products or ideas" /><button type="button" onClick={() => setSearchOpen(false)} aria-label="Close search"><FiX size={18}/></button></div>}
          {menuOpen && <div className="header-floating-menu">{menuContent}</div>}
        </div>
      ) : <>
        <div className="header-brand-group">
          {showBackButton && <button type="button" className="header-back-button" onClick={() => (onBack ? onBack() : navigate("/"))} aria-label="Back"><TiArrowBack size={24} aria-hidden="true" /></button>}
          <a href="/" className={`brand brand-${presentation}`} aria-label={name}>{brandContent}</a>
        </div>
        {!showBackButton && <>
          <div className={menuOpen ? "nav-links nav-links-open" : "nav-links"}>{menuContent}</div>
          <button type="button" className="menu-button" aria-label="Toggle navigation menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((v) => !v)}><span /><span /></button>
        </>}
      </>}
    </nav>
  );
}
