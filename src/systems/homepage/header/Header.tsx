import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { navItems } from "../hero/hero.data";
import { footerLinkGroups } from "../footer/footer-links.data";
import { brandIdentity, type BrandIdentity, type BrandPresentation } from "../brand/brand.config";
import { TiArrowBack } from "react-icons/ti";
import "./header.css";

type HeaderProps = {
  /** Optional brand configuration for alternate network/app headers. */
  brand?: BrandIdentity;
  /** Legacy override retained for existing header consumers. Prefer brand config. */
  brandName?: string;
  presentation?: BrandPresentation;
  inline?: boolean;
  showBackButton?: boolean;
  onBack?: () => void;
};

export default function Header({
  brand = brandIdentity,
  brandName,
  presentation = brand.defaultPresentation,
  inline = false,
  showBackButton = false,
  onBack,
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const name = brandName ?? brand.name;
  const wordmark = presentation === "spaced"
    ? brand.wordmarks.spaced
    : brand.wordmarks.standard;
  const brandContent = presentation === "brandmark"
    ? brand.brandmark.src
      ? <img className="header-brandmark-image" src={brand.brandmark.src} alt={brand.brandmark.alt} />
      : <span className="header-brandmark-fallback" aria-label={brand.brandmark.alt}>{name.slice(0, 1)}</span>
    : wordmark;

  return (
    <nav className={inline ? "hero-navigation header-inline" : "hero-navigation"}>
      <div className="header-brand-group">
        {showBackButton && (
          <button
            type="button"
            className="header-back-button"
            onClick={() => (onBack ? onBack() : navigate("/"))}
            aria-label="Back"
          >
            <TiArrowBack size={24} aria-hidden="true" />
          </button>
        )}
        <a href="/" className={`brand brand-${presentation}`} aria-label={name}>
          {brandContent}
        </a>
      </div>

      {!showBackButton && (
        <>
          <div className={menuOpen ? "nav-links nav-links-open" : "nav-links"}>
            {navItems.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                onClick={() => setMenuOpen(false)}
              >
                {item}
              </a>
            ))}
            <a className="nav-network-link" href="/join-network" onClick={() => setMenuOpen(false)}>Join Network <span>↗</span></a>
            <div className="nav-footer-link-groups">
              {footerLinkGroups.map((group) => (
                <section key={group.title} className="nav-footer-link-group">
                  <h3>{group.title}</h3>
                  {group.links.map((link) => (
                    <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
                      {link.label}
                    </a>
                  ))}
                </section>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="menu-button"
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((current) => !current)}
          >
            <span />
            <span />
          </button>
        </>
      )}
    </nav>
  );
}
