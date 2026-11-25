import { FaInstagram, FaTiktok, FaWhatsapp, FaEnvelope } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import useStorefront from '../../core/hooks/useStorefront.ts';

export default function Footer() {
  const { name: storeName, pathFor } = useStorefront();
  const isPoshies = storeName === 'Poshies';

  return (
    <footer className={`storefront-footer relative w-full overflow-hidden px-6 pb-8 pt-24 sm:px-10 sm:pt-28 lg:px-16 ${isPoshies ? 'poshies-footer' : 'bg-white'}`}>
      <div className="storefront-footer__inner relative z-10 mx-auto w-full max-w-[1180px]">
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 border-b border-current/15 pb-12 md:grid-cols-4 lg:gap-12">
          <div className="col-span-2 md:col-span-1">
            <p className="font-heading text-3xl tracking-tight">{storeName}</p>
            <p className="mt-4 max-w-xs text-sm leading-7 opacity-70">
              {isPoshies
                ? 'Intimate essentials, everyday comfort and personal expression. Made for the way you feel.'
                : 'Discover considered products and experiences, curated with intention.'}
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a href="#" aria-label="Instagram" className="footer-social-link"><FaInstagram size={19} aria-hidden="true" /></a>
              <a href="#" aria-label="TikTok" className="footer-social-link"><FaTiktok size={19} aria-hidden="true" /></a>
              <a href="#" aria-label="WhatsApp" className="footer-social-link"><FaWhatsapp size={19} aria-hidden="true" /></a>
              <a href="#" aria-label="Email" className="footer-social-link"><FaEnvelope size={19} aria-hidden="true" /></a>
            </div>
          </div>
          <nav aria-label="Shop links">
            <h2 className="footer-column-title">Explore</h2>
            <ul className="mt-5 space-y-3 text-sm">
              <li><Link to={pathFor()} className="footer-link">Home</Link></li>
              <li><Link to={pathFor('services')} className="footer-link">{isPoshies ? 'Collections' : 'Explore'}</Link></li>
              <li><Link to={pathFor('catalog')} className="footer-link">Full catalogue</Link></li>
              <li><Link to={pathFor('about')} className="footer-link">Our story</Link></li>
            </ul>
          </nav>
          <nav aria-label="Customer information">
            <h2 className="footer-column-title">Customer care</h2>
            <ul className="mt-5 space-y-3 text-sm">
              <li><Link to={pathFor('about')} className="footer-link">About {storeName}</Link></li>
              <li><Link to={pathFor('services')} className="footer-link">Product collections</Link></li>
              <li><Link to={pathFor('cart')} className="footer-link">Shopping bag</Link></li>
            </ul>
          </nav>
          {isPoshies && (
            <nav aria-label="Policies and information">
              <h2 className="footer-column-title">Policies & information</h2>
              <ul className="mt-5 space-y-3 text-sm">
                <li><Link to={pathFor('privacy')} className="footer-link">Privacy policy</Link></li>
                <li><Link to={pathFor('terms')} className="footer-link">Terms of use</Link></li>
                <li><Link to={pathFor('delivery')} className="footer-link">Delivery & returns</Link></li>
              </ul>
            </nav>
          )}
        </div>
        <div className="flex flex-col gap-3 pt-6 text-xs opacity-60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {storeName}. All rights reserved.</p>
          <p>Designed with intention.</p>
        </div>
      </div>
    </footer>
  );
}
