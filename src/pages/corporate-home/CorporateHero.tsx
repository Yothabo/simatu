export default function CorporateHero() {
  return (
    <section className="relative flex min-h-[80vh] flex-col items-center justify-center px-6 py-24 text-center">
      <div className="absolute inset-0 pointer-events-none z-0" aria-hidden="true">
        <div className="absolute top-0 bottom-0 left-[8%] w-px bg-[#A39E96]/10" />
        <div className="absolute top-0 bottom-0 left-[22%] w-px bg-[#A39E96]/15" />
        <div className="absolute top-0 bottom-0 right-[22%] w-px bg-[#A39E96]/15" />
        <div className="absolute top-0 bottom-0 right-[8%] w-px bg-[#A39E96]/10" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="relative z-10 w-full flex flex-col items-center mt-16 sm:mt-24">
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

          <div className="w-full flex justify-end pr-4 sm:pr-12 md:pr-20 -mt-4 sm:-mt-8">
            <svg
              viewBox="0 0 500 60"
              preserveAspectRatio="none"
              className="block"
              style={{
                height: 'clamp(16px, 2.5vw, 44px)',
                width: 'clamp(180px, 30vw, 400px)',
              }}
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
  );
}
