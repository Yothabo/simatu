export default function CorporatePortfolio() {
  return (
    <section id="legacy" className="relative px-6 py-20 sm:px-10 sm:py-24 lg:px-20 border-t border-[#2A2825]">
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
          <a
            href="/yotaabo"
            className="group flex flex-col overflow-hidden bg-[#1A1918]/80 backdrop-blur-sm"
            style={{ border: '1px solid rgba(163, 158, 150, 0.6)' }}
          >
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

          <a
            href="/poshies"
            className="group flex flex-col overflow-hidden bg-[#1A1918]/80 backdrop-blur-sm"
            style={{ border: '1px solid rgba(163, 158, 150, 0.6)' }}
          >
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
  );
}
