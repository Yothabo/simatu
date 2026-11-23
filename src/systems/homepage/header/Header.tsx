import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { navItems } from "../hero/hero.data";
import { footerLinkGroups } from "../footer/footer-links.data";
import { TiArrowBack } from "react-icons/ti";
import "./header.css";

type HeaderProps = {
  brandName?: string;
  showBackButton?: boolean;
  onBack?: () => void;
};

export default function Header({
  brandName = "simatu",
  showBackButton = false,
  onBack,
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="hero-navigation">
      <div className="header-brand-group">
        {showBackButton && (
          <button
            type="button"
            className="header-back-button"
            onClick={() => (onBack ? onBack() : navigate("/"))}
            aria-label="Back to home"
          >
            <TiArrowBack size={24} aria-hidden="true" />
          </button>
        )}
        <a href="/" className="brand">{brandName}</a>
      </div>

      {!showBackButton && (
        <>
          <div
            className={menuOpen ? "nav-links nav-links-open" : "nav-links"}
          >
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
