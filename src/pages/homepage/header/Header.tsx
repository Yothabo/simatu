import { useState } from "react";
import { navItems } from "../hero/hero.data";
import "./header.css";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="hero-navigation">
      <a href="#top" className="brand">
        simatu
      </a>

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

    </nav>
  );
}
