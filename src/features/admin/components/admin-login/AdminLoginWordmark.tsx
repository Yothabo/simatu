import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { dotAnimation } from './constants';
import type { AdminLoginWordmarkProps } from './types';

export default function AdminLoginWordmark({
  isFullscreen,
  isResolving,
  isTransitioning,
  showAuthIndicator,
  onTransitionComplete,
}: AdminLoginWordmarkProps) {
  const [wordmarkCentered, setWordmarkCentered] = useState(false);
  const [wordmarkPosition, setWordmarkPosition] = useState({
    top: 0,
    width: 0,
  });

  const wordmarkContainerRef = useRef<HTMLDivElement>(null);
  const wordmarkTextRef = useRef<SVGTextElement>(null);
  const displacementRef = useRef<SVGFEDisplacementMapElement>(null);
  const transitionCompleteRef = useRef(onTransitionComplete);

  useLayoutEffect(() => {
    if (isFullscreen) return;

    const bounds = wordmarkContainerRef.current?.getBoundingClientRect();

    if (bounds) {
      setWordmarkPosition({
        top: bounds.top,
        width: bounds.width,
      });
    }
  }, [isFullscreen]);

  useEffect(() => {
    transitionCompleteRef.current = onTransitionComplete;
  }, [onTransitionComplete]);

  useEffect(() => {
    if (!isTransitioning) {
      setWordmarkCentered(isResolving);
      return;
    }

    const text = wordmarkTextRef.current;
    const displacement = displacementRef.current;

    if (!text || !displacement) return;

    const wordmarkText = text;
    const displacementMap = displacement;

    let disposed = false;
    let frame = 0;
    let centerFrame = 0;
    let startedAt = 0;

    const HOLD_DURATION = 900;
    const DESTRUCTION_DURATION = 1500;

    const clamp = (value: number, min: number, max: number) =>
      Math.max(min, Math.min(max, value));

    const easeInOut = (value: number) =>
      value < 0.5
        ? 4 * value * value * value
        : 1 - Math.pow(-2 * value + 2, 3) / 2;

    centerFrame = requestAnimationFrame(() => {
      setWordmarkCentered(true);
    });

    async function startAnimation() {
      try {
        await document.fonts.load('400 100px Anton');
        await document.fonts.ready;
      } catch {
        // Continue with the available font.
      }

      if (disposed) return;

      wordmarkText.style.opacity = '1';
      displacementMap.setAttribute('scale', '0');

      function animate(time: number) {
        if (disposed) return;

        if (!startedAt) startedAt = time;

        const elapsed = time - startedAt;

        if (elapsed < HOLD_DURATION) {
          wordmarkText.style.opacity = '1';
          displacementMap.setAttribute('scale', '0');
        } else {
          const progress = clamp(
            (elapsed - HOLD_DURATION) / DESTRUCTION_DURATION,
            0,
            1,
          );

          const eased = easeInOut(progress);

          displacementMap.setAttribute(
            'scale',
            String(180 * eased),
          );

          wordmarkText.style.opacity = String(1 - eased);

          if (progress >= 1) {
            wordmarkText.style.opacity = '0';
            transitionCompleteRef.current();
            return;
          }
        }

        frame = requestAnimationFrame(animate);
      }

      frame = requestAnimationFrame(animate);
    }

    void startAnimation();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      cancelAnimationFrame(centerFrame);
    };
  }, [isTransitioning, isResolving]);

  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
      >
        <div className="absolute inset-y-0 left-[8%] w-px bg-[#A39E96]/10" />
        <div className="absolute inset-y-0 left-[22%] w-px bg-[#A39E96]/15" />
        <div className="absolute inset-y-0 right-[22%] w-px bg-[#A39E96]/15" />
        <div className="absolute inset-y-0 right-[8%] w-px bg-[#A39E96]/10" />
      </div>

      <div
        ref={wordmarkContainerRef}
        className={
          isFullscreen
            ? 'absolute left-1/2 z-10'
            : 'relative w-full max-w-[1120px]'
        }
        style={
          isFullscreen
            ? {
                top: isTransitioning && !wordmarkCentered
                  ? `${wordmarkPosition.top}px`
                  : '37.5vh',
                width: isTransitioning && wordmarkPosition.width
                  ? `${wordmarkPosition.width}px`
                  : 'min(calc(100vw - 48px), 1120px)',
                maxWidth: '1120px',
                transform: 'translateX(-50%)',
                transition: isTransitioning
                  ? 'top 700ms cubic-bezier(0.22, 1, 0.36, 1)'
                  : 'none',
              }
            : undefined
        }
      >
        <div className="relative flex w-full items-center justify-center">
          {showAuthIndicator && (
            <>
              <style>{dotAnimation}</style>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-[calc(50%-10rem)] z-20 flex -translate-x-1/2 items-center gap-2"
              >
                {[0, 1, 2].map((dot) => (
                  <span
                    key={dot}
                    className="h-1.5 w-1.5 rounded-full bg-[#8aa89b]"
                    style={{
                      animation: 'yotaabo-dot-size 900ms ease-in-out infinite',
                      animationDelay: `${dot * 180}ms`,
                    }}
                  />
                ))}
              </div>
            </>
          )}

          <div className="w-full">
            <svg
              aria-hidden="true"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              style={{
                display: 'block',
                width: '100%',
                height: '25vh',
              }}
            >
              <defs>
                <filter
                  id="wordmark-destruction"
                  x="-30%"
                  y="-30%"
                  width="160%"
                  height="160%"
                  colorInterpolationFilters="sRGB"
                >
                  <feTurbulence
                    type="fractalNoise"
                    baseFrequency="0.08"
                    numOctaves="2"
                    seed="8"
                    result="noise"
                  />
                  <feDisplacementMap
                    ref={displacementRef}
                    in="SourceGraphic"
                    in2="noise"
                    scale="0"
                    xChannelSelector="R"
                    yChannelSelector="G"
                  />
                </filter>
              </defs>

              <text
                ref={wordmarkTextRef}
                x="50"
                y="50%"
                dominantBaseline="middle"
                textAnchor="middle"
                textLength="100"
                lengthAdjust="spacingAndGlyphs"
                style={{
                  fontFamily: '"Anton", sans-serif',
                  fontWeight: 400,
                  filter: 'url(#wordmark-destruction)',
                  opacity: 1,
                }}
                fill="#EDE8E0"
                fontSize="100"
              >
                simatu
              </text>
            </svg>
          </div>

          {!isFullscreen && (
            <div className="pointer-events-none absolute -bottom-1 right-4 z-10 flex w-full justify-end pr-4 sm:pr-12">
              <span className="font-heading text-[clamp(12px,2.5vw,22px)] uppercase tracking-[0.22em] text-[#A39E96]">
                cooperative
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
