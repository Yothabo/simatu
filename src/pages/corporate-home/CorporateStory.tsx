import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { stickyChapters } from './stickyChapters';

export default function CorporateStory() {
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

      const fadeZone = window.innerHeight * 0.3;
      let logoFade = 0;

      if (scrolled >= 0 && scrolled <= totalScrollable) {
        logoFade = 1;
      } else if (scrolled < 0 && scrolled > -fadeZone) {
        logoFade = 1 + scrolled / fadeZone;
      } else if (scrolled > totalScrollable && scrolled < totalScrollable + fadeZone) {
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
      <section
        id="story"
        ref={trackRef}
        className="relative"
        style={{ height: '400vh' }}
      >
        <div
          className="sticky top-0 h-[100dvh] w-full overflow-hidden"
          style={{
            opacity: sectionOpacity,
            pointerEvents: sectionOpacity === 0 ? 'none' : 'auto',
          }}
        >
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
                  <div className="relative w-full h-full flex flex-col overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none z-0" aria-hidden="true">
                      <div className="absolute top-0 bottom-0 left-[8%] w-px bg-[#A39E96]/10" />
                      <div className="absolute top-0 bottom-0 left-[22%] w-px bg-[#A39E96]/15" />
                      <div className="absolute top-0 bottom-0 right-[22%] w-px bg-[#A39E96]/15" />
                      <div className="absolute top-0 bottom-0 right-[8%] w-px bg-[#A39E96]/10" />

                      <div className="absolute top-1/2 -translate-y-1/2 left-[8%] w-[350px] h-[350px] rounded-full border border-[#A39E96]/10 hidden lg:block" />
                      <div className="absolute top-1/2 -translate-y-1/2 left-[8%] w-[550px] h-[550px] rounded-full border border-[#A39E96]/5 hidden lg:block" />
                    </div>

                    <header className="relative z-10 flex-shrink-0 flex items-center justify-end px-4 sm:px-12 lg:px-20 py-4 sm:py-6 border-b border-[#A39E96]/20">
                      <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.2em] sm:tracking-[0.24em] text-[#A39E96] tabular-nums">
                        {chapter.label} / 05
                      </span>
                    </header>

                    <div className="relative z-10 flex-1 min-h-0 flex items-end overflow-hidden">
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

                      <div className="w-full max-w-[1400px] mx-auto px-10 sm:px-16 lg:px-24 flex justify-center">
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
                            <span
                              style={{
                                display: 'inline',
                                padding: '0.12em 0.3em',
                                background: 'rgba(19, 18, 16, 0.58)',
                                backdropFilter: 'blur(8px)',
                                WebkitBackdropFilter: 'blur(8px)',
                                boxDecorationBreak: 'clone',
                                WebkitBoxDecorationBreak: 'clone',
                              }}
                            >
                              {chapter.text}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

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
          document.body,
        )}
    </>
  );
}
