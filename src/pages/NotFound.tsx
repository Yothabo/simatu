export default function NotFound() {
  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#181715] px-6 py-16 text-[#EDE8E0]">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-y-0 left-[8%] w-px bg-[#A39E96]/10" />
        <div className="absolute inset-y-0 left-[22%] w-px bg-[#A39E96]/15" />
        <div className="absolute inset-y-0 right-[22%] w-px bg-[#A39E96]/15" />
        <div className="absolute inset-y-0 right-[8%] w-px bg-[#A39E96]/10" />
      </div>

      <div className="relative z-10 flex w-full max-w-[1120px] flex-col items-center">
        <div className="relative w-full">
          <h1 className="select-none text-center font-heading text-[clamp(150px,32vw,360px)] font-bold leading-[0.8] tracking-[-0.09em] text-[#EDE8E0]">
            404
          </h1>
          <div className="absolute bottom-[-14px] left-[5%] h-2 w-20 bg-orange-500 sm:bottom-[-20px] sm:h-3 sm:w-28" />
        </div>

        <div className="mt-10 max-w-xl text-center sm:mt-14">
          <p className="text-sm leading-7 text-[#A39E96] sm:text-base">
            The page you're looking for doesn't exist or may have been moved.
          </p>

          <a
            href="/"
            className="mt-8 inline-flex items-center justify-center bg-orange-500 px-8 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[#181715] transition-colors hover:bg-orange-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-400"
          >
            Back to Home
          </a>
        </div>

        <div className="mt-16 w-full sm:mt-20" aria-label="Simatu Cooperative">
          <div className="w-full">
            <svg
              viewBox="0 0 1000 200"
              preserveAspectRatio="none"
              className="block w-full"
              style={{ height: 'clamp(70px, 13vw, 170px)' }}
              role="img"
              aria-label="Simatu"
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

          <div className="-mt-3 flex w-full justify-end pr-4 sm:-mt-6 sm:pr-12 md:pr-20">
            <svg
              viewBox="0 0 500 60"
              preserveAspectRatio="none"
              className="block"
              style={{
                height: 'clamp(16px, 2.5vw, 44px)',
                width: 'clamp(180px, 30vw, 400px)',
              }}
              role="img"
              aria-label="Cooperative"
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
    </main>
  );
}
