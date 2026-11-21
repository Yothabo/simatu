import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { navItems } from "../hero/hero.data";
import "./header.css";

type HeaderProps = {
  brandName?: string;
  showBackButton?: boolean;
};

export default function Header({
  brandName = "simatu",
  showBackButton = false,
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
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <span aria-hidden="true">←</span>
          </button>
        )}
        <a href="/" className="brand">
          {brandName}
        </a>
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
