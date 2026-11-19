import "./footer-links.css";
import { footerLinkGroups } from "./footer-links.data";

export default function FooterLinks() {
  return (
    <nav className="footer-resource-links" aria-label="Company information">
      {footerLinkGroups.map((group) => (
        <section
          className="footer-resource-group"
          key={group.title}
          aria-label={group.title}
        >
          <h3>{group.title}</h3>

          <ul>
            {group.links.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </nav>
  );
}
