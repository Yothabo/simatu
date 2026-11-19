type SocialLinkItem = {
  label: string;
  href: string;
};

type SocialLinksProps = {
  links: SocialLinkItem[];
  className?: string;
};

export default function SocialLinks({
  links,
  className = "",
}: SocialLinksProps) {
  return (
    <nav
      className={`hp-social-links ${className}`.trim()}
      aria-label="Social media"
    >
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noreferrer"
          aria-label={link.label}
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
}
