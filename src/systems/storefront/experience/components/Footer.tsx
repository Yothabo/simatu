import { FaInstagram, FaTiktok, FaWhatsapp, FaEnvelope } from 'react-icons/fa';
import useStorefront from '../../core/hooks/useStorefront.ts';

export default function Footer() {
  const { name: storeName } = useStorefront();

  return (
    <footer className="relative w-full overflow-hidden bg-white py-10 sm:py-12 lg:py-16">

      {/* Content */}
      <div className="relative z-10 flex w-full flex-col items-center">
        {/* Huge yotaabo stretch controlled by inline height */}

        {/* Socials then copyright */}
        <div className="mt-10 flex flex-col items-center gap-5 px-6 sm:mt-12">
          <div className="flex items-center gap-4">
            <a
              href="#"
              aria-label="Instagram"
              className="flex h-14 w-14 items-center justify-center rounded-md border border-[#4d4d4d]/10 bg-transparent text-[#4d4d4d]/70 transition-colors hover:bg-[#4d4d4d]/5 hover:text-[#4d4d4d]"
            >
              <FaInstagram size={26} aria-hidden="true" />
            </a>
            <a
              href="#"
              aria-label="TikTok"
              className="flex h-14 w-14 items-center justify-center rounded-md border border-[#4d4d4d]/10 bg-transparent text-[#4d4d4d]/70 transition-colors hover:bg-[#4d4d4d]/5 hover:text-[#4d4d4d]"
            >
              <FaTiktok size={26} aria-hidden="true" />
            </a>
            <a
              href="#"
              aria-label="WhatsApp"
              className="flex h-14 w-14 items-center justify-center rounded-md border border-[#4d4d4d]/10 bg-transparent text-[#4d4d4d]/70 transition-colors hover:bg-[#4d4d4d]/5 hover:text-[#4d4d4d]"
            >
              <FaWhatsapp size={26} aria-hidden="true" />
            </a>
            <a
              href="#"
              aria-label="Email"
              className="flex h-14 w-14 items-center justify-center rounded-md border border-[#4d4d4d]/10 bg-transparent text-[#4d4d4d]/70 transition-colors hover:bg-[#4d4d4d]/5 hover:text-[#4d4d4d]"
            >
              <FaEnvelope size={26} aria-hidden="true" />
            </a>
          </div>

          <p className="mt-4 text-center font-heading text-sm tracking-[0.15em] text-[#4d4d4d] sm:text-base">
            © {new Date().getFullYear()} {storeName.toLowerCase()}
          </p>
        </div>
      </div>
    </footer>
  );
}
