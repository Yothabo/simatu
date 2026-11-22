import React from "react";
import "./footer.css";

const footerGroups = [
  {
    title: "Brand",
    items: ["Our Vision", "Our Mission", "Our Philosophy"],
  },
  {
    title: "Documentation",
    items: [
      "Company Overview",
      "Platform Architecture",
      "Governance",
      "Brand Guidelines",
      "Our Principles",
      "A collective of brands",
      "Privacy Policy",
      "Terms & Conditions",
      "Disclaimer",
      "Cookie Policy",
    ],
  },
];

const toSlug = (label: string) =>
  label.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function Footer() {
  return (
    <footer className="homepage-footer" id="footer">
      <div className="homepage-footer__top">
        {footerGroups.map((group) => (
          <section key={group.title} className="homepage-footer__group">
            <h2 className="homepage-footer__group-title">{group.title}</h2>
            <nav aria-label={group.title}>
              {group.items.map((item) => (
                <a key={item} href={`/documents/${toSlug(item)}`}>{item}</a>
              ))}
            </nav>
          </section>
        ))}
      </div>

      <img
        className="footer-wordmark"
        src="/systems/homepage/images/simatu-wordmark.svg"
        alt="Simatu"
        aria-hidden="true"
      />

      <div className="homepage-footer__bottom">
        <span>© 2026 Simatu</span>
        <span>All rights reserved.</span>
      </div>
    </footer>
  );
}
