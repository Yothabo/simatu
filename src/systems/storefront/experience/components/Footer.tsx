import { FaInstagram, FaTiktok, FaWhatsapp, FaEnvelope } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import useStorefront from '../../core/hooks/useStorefront.ts';

export default function Footer() {
  const { name: storeName, pathFor, footer } = useStorefront();
  return (
    <footer className="storefront-footer relative w-full overflow-hidden px-[var(--sf-space-6)] pb-[var(--sf-space-8)] pt-[var(--sf-space-24)] sm:px-[var(--sf-space-10)] sm:pt-[var(--sf-space-28)] lg:px-[var(--sf-space-16)]">
      <div className="storefront-footer__inner relative z-10 mx-auto w-full max-w-[var(--sf-content-max-width)]">
        <div className="grid grid-cols-2 gap-x-[var(--sf-space-8)] gap-y-[var(--sf-space-12)] border-b border-current/15 pb-[var(--sf-space-12)] md:grid-cols-4 lg:gap-[var(--sf-space-12)]">
          <div className="col-span-2 md:col-span-1">
            <p className="font-heading text-3xl tracking-tight">{storeName}</p>
            <div className="mt-[var(--sf-space-6)] flex items-center gap-[var(--sf-space-3)]">
              <a href="#" aria-label="Instagram" className="footer-social-link"><FaInstagram size={19} aria-hidden="true" /></a>
              <a href="#" aria-label="TikTok" className="footer-social-link"><FaTiktok size={19} aria-hidden="true" /></a>
              <a href="#" aria-label="WhatsApp" className="footer-social-link"><FaWhatsapp size={19} aria-hidden="true" /></a>
              <a href="#" aria-label="Email" className="footer-social-link"><FaEnvelope size={19} aria-hidden="true" /></a>
            </div>
          </div>
          {footer.policyLinks.length > 0 && <nav aria-label="Policies and information" className="col-span-2 md:col-span-1">
            <h2 className="footer-column-title">Policies & information</h2>
            <ul className="mt-[var(--sf-space-5)] space-y-[var(--sf-space-3)] text-sm">
              {footer.policyLinks.map((item) => <li key={item.path}><Link to={pathFor(item.path)} className="footer-link">{item.label}</Link></li>)}
            </ul>
          </nav>}
        </div>
        <div className="flex flex-col gap-3 pt-[var(--sf-space-6)] text-xs opacity-60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {storeName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
