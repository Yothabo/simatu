import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import PixelBlast from '../components/PixelBlast';

const stickyChapters = [
  {
    id: '01',
    label: '01 — The Foundation',
    title: 'Before the name, there was a matriarch.',
    text: 'She raised seven sons to be blood-bound, hungry, and eager. In them, she planted a vision greater than themselves.',
  },
  {
    id: '02',
    label: '02 — The Vision',
    title: 'Simatu Cooperative, aka Kopa.',
    text: 'Built to uplift, built to serve. Yet the vision crumbled, and did not reach for the sun.',
  },
  {
    id: '03',
    label: '03 — The Waiting',
    title: 'A dream handed down.',
    text: 'A tale of what could have been, the bread and butter for the generations to come, and yet the ground stood barren and the seed layed dormant.',
  },
  {
    id: '04',
    label: '04 — The Resurrection',
    title: 'The standard for modern commerce.',
    text: 'Simatu Cooperative is a digital commerce group. We build the infrastructure that independent retail brands operate on, centralizing administration, inventory, and logistics into a single source of truth. We engineer the environment for modern retail to scale.',
  },
  {
    id: '05',
    label: '05 — The Handoff',
    title: 'We build the store. We hand you the keys.',
    text: 'We handle the hard part. From the initial build to search engine optimization and full-scale marketing, the groundwork is laid. The store is ready. We hand it over to you to run, while we stand behind the infrastructure.',
  },
];

export default function CorporateHome() {
  const trackRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down');
  const [sectionOpacity, setSectionOpacity] = useState(1);
  const [logoOpacity, setLogoOpacity] = useState(0);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const track = trackRef.current;
      if (!track) return;

      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current) {
        setScrollDirection('down');
      } else if (currentScrollY < lastScrollY.current) {
        setScrollDirection('up');
      }
      lastScrollY.current = currentScrollY;

      const rect = track.getBoundingClientRect();
      const totalScrollable = rect.height - window.innerHeight;
      if (totalScrollable <= 0) return;

      const scrolled = -rect.top;

      // Chapter index logic
      let targetIndex = 0;
      if (scrolled < 0) targetIndex = 0;
      else if (scrolled > totalScrollable) targetIndex = stickyChapters.length - 1;
      else {
        const progress = scrolled / totalScrollable;
        targetIndex = Math.min(
          stickyChapters.length - 1,
          Math.floor(progress * stickyChapters.length),
        );
      }

      setActiveIndex((prev) => {
        if (targetIndex > prev) return Math.min(prev + 1, stickyChapters.length - 1);
        if (targetIndex < prev) return Math.max(prev - 1, 0);
        return prev;
      });

      // Logo opacity: fade in as you enter the story, fade out as you leave
      // Entry fade zone: 30% of viewport before the story section starts
      // Exit fade zone: last 30% of viewport of the story section
      const fadeZone = window.innerHeight * 0.3;

      let logoFade = 0;

      if (scrolled >= 0 && scrolled <= totalScrollable) {
        // Inside the story — fully visible
        logoFade = 1;
      } else if (scrolled < 0 && scrolled > -fadeZone) {
        // Entering (rect.top going from +fadeZone to 0)
        logoFade = 1 + scrolled / fadeZone;
      } else if (scrolled > totalScrollable && scrolled < totalScrollable + fadeZone) {
        // Exiting
        logoFade = 1 - (scrolled - totalScrollable) / fadeZone;
      }

      setLogoOpacity(Math.max(0, Math.min(1, logoFade)));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* ---------- GLOBAL FIXED PATTERN ---------- */}
      {typeof document !== 'undefined' &&
        createPortal(
          <div
            aria-hidden="true"
            style={{
              position: 'fixed',
              top: '-25vh',
              left: 0,
              width: '100vw',
              height: '150vh',
              zIndex: 0,
              pointerEvents: 'none',
              overflow: 'hidden',
            }}
          >
            <PixelBlast
              variant="circle"
              pixelSize={4}
              color="#A39E96"
              patternScale={2.5}
              patternDensity={1.2}
              pixelSizeJitter={0.4}
              enableRipples={false}
              transparent={true}
              speed={0.3}
              antialias={true}
              edgeFade={0.6}
            />
          </div>,
          document.body
        )}

      <main className="relative z-10 w-full min-h-screen font-body text-[#EDE8E0] antialiased selection:bg-[#EDE8E0] selection:text-[#181715]">
{/* ---------- HERO: THE MATRIARCH ---------- */}
        <section className="relative flex min-h-[80vh] flex-col items-center justify-center px-6 py-24 text-center">
          
          {/* Background grid lines — matches story panels */}
          <div className="absolute inset-0 pointer-events-none z-0" aria-hidden="true">
            <div className="absolute top-0 bottom-0 left-[8%] w-px bg-[#A39E96]/10" />
            <div className="absolute top-0 bottom-0 left-[22%] w-px bg-[#A39E96]/15" />
            <div className="absolute top-0 bottom-0 right-[22%] w-px bg-[#A39E96]/15" />
            <div className="absolute top-0 bottom-0 right-[8%] w-px bg-[#A39E96]/10" />
          </div>

          <div className="relative z-10 flex flex-col items-center">

            {/* SIMATU wordmark — wide, stretched edge-to-edge */}
            <div className="relative z-10 w-full flex flex-col items-center mt-16 sm:mt-24">

              {/* SIMATU — huge, stretched to full width */}
              <div className="w-full">
                <svg
                  viewBox="0 0 1000 200"
                  preserveAspectRatio="none"
                  className="w-full block"
                  style={{ height: 'clamp(100px, 20vw, 260px)' }}
                >
                  <text
                    x="500"
                    y="150"
                    textAnchor="middle"
                    textLength="980"
                    lengthAdjust="spacingAndGlyphs"
                    style={{
                      fontFamily: '"Anton", sans-serif',
                      fontWeight: 400,
                      fontSize: '180px',
                    }}
                    fill="#EDE8E0"
                  >
                    simatu
                  </text>
                </svg>
              </div>

              {/* COOPERATIVE — smaller, offset right, tucked close */}
              <div className="w-full flex justify-end pr-4 sm:pr-12 md:pr-20 -mt-4 sm:-mt-8">
                <svg
                  viewBox="0 0 500 60"
                  preserveAspectRatio="none"
                  className="block"
                  style={{ height: 'clamp(16px, 2.5vw, 44px)', width: 'clamp(180px, 30vw, 400px)' }}
                >
                  <text
                    x="250"
                    y="45"
                    textAnchor="middle"
                    textLength="480"
                    lengthAdjust="spacingAndGlyphs"
                    style={{
                      fontFamily: '"Anton", sans-serif',
                      fontWeight: 400,
                      fontSize: '40px',
                    }}
                    fill="#A39E96"
                  >
                    cooperative
                  </text>
                </svg>
              </div>

            </div>

          </div>
        </section>

        {/* ---------- STICKY STORY (Chapters 01-05) ---------- */}
        <section
          id="story"
          ref={trackRef}
          className="relative"
          style={{ height: '400vh' }}
        >
          <div className="sticky top-0 h-[100dvh] w-full overflow-hidden" style={{ opacity: sectionOpacity, pointerEvents: sectionOpacity === 0 ? "none" : "auto" }}>
            <div className="w-full h-full relative">
              {stickyChapters.map((chapter, index) => {
                const isActive = index === activeIndex;
                
                let positionClass = '';
                
                if (isActive) {
                  positionClass = 'translate-y-0 opacity-100 pointer-events-auto';
                } else {
                  if (scrollDirection === 'down') {
                    if (index < activeIndex) {
                      positionClass = '-translate-y-[15vh] opacity-0 pointer-events-none';
                    } else {
                      positionClass = 'translate-y-[15vh] opacity-0 pointer-events-none';
                    }
                  } else {
                    if (index > activeIndex) {
                      positionClass = 'translate-y-[15vh] opacity-0 pointer-events-none';
                    } else {
                      positionClass = '-translate-y-[15vh] opacity-0 pointer-events-none';
                    }
                  }
                }
                
                return (
                  <div
                    key={chapter.id}
                    className={`absolute inset-0 transition-all duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${positionClass}`}
                  >
                    {/* Full viewport height with architectural framing */}
                    <div className="relative w-full h-full flex flex-col overflow-hidden">

                      {/* ---------- BACKGROUND GRID + FADED LOGO ---------- */}
                      <div className="absolute inset-0 pointer-events-none z-0" aria-hidden="true">
                        {/* Vertical column rules */}
                        <div className="absolute top-0 bottom-0 left-[8%] w-px bg-[#A39E96]/10" />
                        <div className="absolute top-0 bottom-0 left-[22%] w-px bg-[#A39E96]/15" />
                        <div className="absolute top-0 bottom-0 right-[22%] w-px bg-[#A39E96]/15" />
                        <div className="absolute top-0 bottom-0 right-[8%] w-px bg-[#A39E96]/10" />

                        {/* Concentric circles */}
                        <div className="absolute top-1/2 -translate-y-1/2 left-[8%] w-[350px] h-[350px] rounded-full border border-[#A39E96]/10 hidden lg:block" />
                        <div className="absolute top-1/2 -translate-y-1/2 left-[8%] w-[550px] h-[550px] rounded-full border border-[#A39E96]/5 hidden lg:block" />

                      </div>

                      {/* ---------- STICKY HEADER ---------- */}
                      <header className="relative z-10 flex-shrink-0 flex items-center justify-end px-4 sm:px-12 lg:px-20 py-4 sm:py-6 border-b border-[#A39E96]/20">
                        <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.2em] sm:tracking-[0.24em] text-[#A39E96] tabular-nums">
                          {chapter.label} / 05
                        </span>
                      </header>

                      {/* ---------- BODY ---------- */}
                      <div className="relative z-10 flex-1 min-h-0 flex items-end overflow-hidden">

                        {/* Vertical text on left edge */}
                        <div className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-6 z-20">
                          <span className="h-10 sm:h-16 w-px bg-[#A39E96]/30" />
                          <span
                            className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.3em] sm:tracking-[0.4em] text-[#A39E96]/60"
                            style={{
                              writingMode: 'vertical-rl',
                              transform: 'rotate(180deg)',
                            }}
                          >
                            Rising in her eternal honor
                          </span>
                          <span className="h-10 sm:h-16 w-px bg-[#A39E96]/30" />
                        </div>

                        {/* Vertical text on right edge */}
                        <div className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-6 z-20">
                          <span className="h-10 sm:h-16 w-px bg-[#A39E96]/30" />
                          <span
                            className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.3em] sm:tracking-[0.4em] text-[#A39E96]/60"
                            style={{
                              writingMode: 'vertical-rl',
                              transform: 'rotate(180deg)',
                            }}
                          >
                            Simatu Cooperative
                          </span>
                          <span className="h-10 sm:h-16 w-px bg-[#A39E96]/30" />
                        </div>

                        {/* Main content — grid: number left, text right */}
                        <div className="w-full max-w-[1400px] mx-auto px-10 sm:px-16 lg:px-24 flex justify-center">

                          {/* Text Content */}
                          <div className="flex flex-col max-w-[800px] pb-24 sm:pb-32 pt-6 gap-4 sm:gap-6">
                            <h2
                              className="text-white"
                              style={{
                                fontFamily: '"Playfair Display", Georgia, serif',
                                fontSize: 'clamp(22px, 3vw, 42px)',
                                fontWeight: 400,
                                lineHeight: 1.05,
                                margin: 0,
                              }}
                            >
                              {chapter.title}
                            </h2>
                            <p
                              className="text-[#A39E96]"
                              style={{
                                fontSize: 'clamp(14px, 1.4vw, 16px)',
                                lineHeight: 1.65,
                                margin: 0,
                              }}
                            >
                              {chapter.text}
                            </p>
                          </div>
                        </div>
                      </div>
</div></div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ---------- FIXED FADED LOGO (behind story panels, fades in/out) ---------- */}
        {typeof document !== 'undefined' &&
          createPortal(
            <div
              aria-hidden="true"
              style={{
                position: 'fixed',
                top: '6vh',
                left: 0,
                width: '100vw',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                pointerEvents: 'none',
                zIndex: 1,
                opacity: logoOpacity * 0.06,
                transition: 'opacity 200ms linear',
              }}
            >
              <img
                src="/simatu.png"
                alt=""
                style={{
                  height: '55vh',
                  width: 'auto',
                  maxWidth: '70vw',
                  objectFit: 'contain',
                  filter: 'grayscale(1) brightness(2)',
                }}
              />
            </div>,
            document.body
          )}

        {/* ---------- THE PORTFOLIO (BRANDS) ---------- */}
        <section id="legacy" className="relative px-6 py-20 sm:px-10 sm:py-24 lg:px-20 border-t border-[#2A2825]">

          {/* Background grid lines — matches hero and story panels */}
          <div className="absolute inset-0 pointer-events-none z-0" aria-hidden="true">
            <div className="absolute top-0 bottom-0 left-[8%] w-px bg-[#A39E96]/10" />
            <div className="absolute top-0 bottom-0 left-[22%] w-px bg-[#A39E96]/15" />
            <div className="absolute top-0 bottom-0 right-[22%] w-px bg-[#A39E96]/15" />
            <div className="absolute top-0 bottom-0 right-[8%] w-px bg-[#A39E96]/10" />
          </div>

          <div className="relative z-10 mx-auto max-w-[1200px]">

            <div className="mb-8 flex flex-col items-start gap-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#A39E96]">
                The Portfolio
              </span>
              <h2 className="font-heading text-[clamp(32px,4vw,48px)] font-normal leading-[1.1] text-white">
                Independent identities.<br />Shared foundations.
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8">

              {/* YOTAABO CARD */}
              <a href="/yotaabo" className="group flex flex-col overflow-hidden bg-[#1A1918]/80 backdrop-blur-sm" style={{ border: "1px solid rgba(163, 158, 150, 0.6)" }}>
                <div className="relative w-full aspect-[16/10] overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=1000&q=85&auto=format&fit=crop"
                    alt="Yotaabo"
                    className="h-full w-full object-cover opacity-70 transition-all duration-[1.2s] ease-out group-hover:scale-[1.03] group-hover:opacity-100 grayscale group-hover:grayscale-0"
                  />
                  <div className="absolute inset-0 bg-black/40 transition-opacity group-hover:bg-black/20" />

                  <div className="absolute inset-0 flex items-center justify-center px-8">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                      className="w-full h-[12vw] sm:h-[10vw]"
                    >
                      <text
                        x="50"
                        y="50%"
                        dominantBaseline="middle"
                        textAnchor="middle"
                        textLength="100"
                        lengthAdjust="spacingAndGlyphs"
                        style={{ fontFamily: '"Anton", sans-serif', fontWeight: 400 }}
                        className="fill-[#8aa89b]"
                        fontSize="100"
                      >
                        yotaabo
                      </text>
                    </svg>
                  </div>

                </div>

                <div className="flex flex-col px-6 py-4">
                  <p className="mb-4 text-[15px] leading-[1.6] text-[#A39E96]">
                    Fragrance for personal expression.
                  </p>
                  <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition-all group-hover:gap-3">
                    View Business <span aria-hidden="true">→</span>
                  </span>
                </div>
              </a>

              {/* POSHIES CARD */}
              <a href="/poshies" className="group flex flex-col overflow-hidden bg-[#1A1918]/80 backdrop-blur-sm" style={{ border: "1px solid rgba(163, 158, 150, 0.6)" }}>
                <div className="relative w-full aspect-[16/10] overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1000&q=85&auto=format&fit=crop"
                    alt="Poshies"
                    className="h-full w-full object-cover opacity-70 transition-all duration-[1.2s] ease-out group-hover:scale-[1.03] group-hover:opacity-100 grayscale group-hover:grayscale-0"
                  />
                  <div className="absolute inset-0 bg-black/40 transition-opacity group-hover:bg-black/20" />

                  <div className="absolute inset-0 flex items-center justify-center px-8">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                      className="w-full h-[12vw] sm:h-[10vw]"
                    >
                      <text
                        x="50"
                        y="50%"
                        dominantBaseline="middle"
                        textAnchor="middle"
                        textLength="100"
                        lengthAdjust="spacingAndGlyphs"
                        style={{ fontFamily: '"Anton", sans-serif', fontWeight: 400 }}
                        className="fill-[#ff1493]"
                        fontSize="100"
                      >
                        poshies
                      </text>
                    </svg>
                  </div>

                </div>

                <div className="flex flex-col px-6 py-4">
                  <p className="mb-4 text-[15px] leading-[1.6] text-[#A39E96]">
                    Intimate apparel for the modern life.
                  </p>
                  <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition-all group-hover:gap-3">
                    View Business <span aria-hidden="true">→</span>
                  </span>
                </div>
              </a>

            </div>
          </div>
        </section>

        {/* ---------- CORPORATE FOOTER ---------- */}
        <footer className="relative bg-[#131210] border-t border-[#2A2825] overflow-hidden">

          {/* Main content — sits above the wordmark */}
          <div className="relative z-10 mx-auto max-w-[1400px] px-6 py-10 sm:px-10 lg:px-20">

            {/* Three-column link grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-6">

              {/* Social */}
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

              {/* Company */}
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

              {/* Legal */}
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

              {/* Commerce */}
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

            {/* Divider + copyright */}
            <div className="pt-6 border-t border-[#2A2825]">
              <p className="text-[10px] uppercase tracking-[0.15em] text-[#A39E96]/60">
                © {new Date().getFullYear()} Simatu Cooperative. All rights reserved.
              </p>
            </div>

          </div>

          {/* Giant KOPA wordmark — fading upward from the bottom */}
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

      </main>
    </>
  );
}
