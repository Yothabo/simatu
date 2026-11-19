export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterLinkGroup {
  title: string;
  links: FooterLink[];
}

export const footerLinkGroups: FooterLinkGroup[] = [
  {
    title: "Company",
    links: [
      { label: "Our Vision", href: "/company/vision" },
      { label: "Our Mission", href: "/company/mission" },
      { label: "Our Philosophy", href: "/company/philosophy" },
      { label: "Our Principles", href: "/company/principles" },
    ],
  },
  {
    title: "Documentation",
    links: [
      { label: "Company Overview", href: "/documentation/company-overview" },
      { label: "Platform Architecture", href: "/documentation/platform-architecture" },
      { label: "Governance", href: "/documentation/governance" },
      { label: "Brand Guidelines", href: "/documentation/brand-guidelines" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/legal/privacy-policy" },
      { label: "Terms & Conditions", href: "/legal/terms-and-conditions" },
      { label: "Disclaimer", href: "/legal/disclaimer" },
      { label: "Cookie Policy", href: "/legal/cookie-policy" },
    ],
  },
];
