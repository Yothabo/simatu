export default function CorporateFooter() {
  return (
    <footer className="relative bg-[#131210] border-t border-[#2A2825] overflow-hidden">
      <div className="relative z-10 mx-auto max-w-[1400px] px-6 py-10 sm:px-10 lg:px-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-6">
          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#EDE8E0] mb-3">
              Social
            </h4>
            <ul className="flex flex-col gap-2 list-none pl-0 m-0">
              <li><a href="https://instagram.com/simatu" target="_blank" rel="noopener noreferrer" className="text-[13px] text-[#A39E96] hover:text-white transition-colors">Instagram</a></li>
              <li><a href="https://linkedin.com/company/simatu" target="_blank" rel="noopener noreferrer" className="text-[13px] text-[#A39E96] hover:text-white transition-colors">LinkedIn</a></li>
              <li><a href="mailto:hello@simatu.co.za" className="text-[13px] text-[#A39E96] hover:text-white transition-colors">Email</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#EDE8E0] mb-3">
              Company
            </h4>
            <ul className="flex flex-col gap-2 list-none pl-0 m-0">
              <li><a href="#story" className="text-[13px] text-[#A39E96] hover:text-white transition-colors">Our Story</a></li>
              <li><a href="/about" className="text-[13px] text-[#A39E96] hover:text-white transition-colors">About</a></li>
              <li><a href="/contact" className="text-[13px] text-[#A39E96] hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#EDE8E0] mb-3">
              Legal
            </h4>
            <ul className="flex flex-col gap-2 list-none pl-0 m-0">
              <li><a href="/privacy" className="text-[13px] text-[#A39E96] hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" className="text-[13px] text-[#A39E96] hover:text-white transition-colors">Terms of Use</a></li>
              <li><a href="/cookies" className="text-[13px] text-[#A39E96] hover:text-white transition-colors">Cookie Policy</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#EDE8E0] mb-3">
              Commerce
            </h4>
            <ul className="flex flex-col gap-2 list-none pl-0 m-0">
              <li><a href="/returns" className="text-[13px] text-[#A39E96] hover:text-white transition-colors">Returns &amp; Refunds</a></li>
              <li><a href="/shipping" className="text-[13px] text-[#A39E96] hover:text-white transition-colors">Shipping</a></li>
              <li><a href="/accessibility" className="text-[13px] text-[#A39E96] hover:text-white transition-colors">Accessibility</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-[#2A2825]">
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#A39E96]/60">
            © {new Date().getFullYear()} Simatu Cooperative. All rights reserved.
          </p>
        </div>
      </div>

      <div
        className="relative w-full pointer-events-none select-none"
        style={{
          maskImage: 'linear-gradient(to top, black 20%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to top, black 20%, transparent 100%)',
        }}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 1000 260"
          preserveAspectRatio="none"
          className="w-full block"
          style={{ height: 'clamp(100px, 16vw, 220px)' }}
        >
          <text
            x="500"
            y="220"
            textAnchor="middle"
            textLength="980"
            lengthAdjust="spacingAndGlyphs"
            style={{
              fontFamily: '"Anton", sans-serif',
              fontWeight: 400,
              fontSize: '240px',
            }}
            fill="#A39E96"
            fillOpacity="0.18"
          >
            kopa
          </text>
        </svg>
      </div>
    </footer>
  );
}
