import "./footer.css";
import FooterLinks from "./FooterLinks";

export default function Footer() {
  return (
    <footer className="homepage-footer relative flex min-h-[440px] w-full flex-col items-start justify-center overflow-hidden border-t border-[rgba(255,255,255,0.08)] bg-[#1c1c1c] px-[10%] pt-[120px] max-[768px]:min-h-[400px] max-[768px]:px-[7%] max-[520px]:min-h-[380px] max-[520px]:px-[6%] max-[520px]:pt-[88px]" id="services">
      <div className="footer-content">
        <h2 className="max-w-[700px] m-0 mb-[22px] text-white text-[clamp(34px,5vw,62px)] font-medium leading-[1.08] tracking-[-0.06em] max-[520px]:text-[clamp(34px,9vw,46px)]" id="contact">How can we shape your next idea?</h2>

        <p className="max-w-[560px] m-0 text-[rgba(245,245,245,0.67)] text-base font-normal leading-[1.75] tracking-[0.1px] max-[820px]:text-[15px] max-[520px]:leading-[1.7]">
          We build distinctive identities and immersive digital
          experiences through strategy, imagination and precise
          creative execution.
        </p>

        <div className="footer-service-tags mt-[35px] flex flex-wrap gap-3 max-[520px]:mt-[25px] max-[520px]:gap-2">
          <a className="inline-flex min-h-[42px] items-center rounded-[30px] border border-[rgba(242,140,40,0.2)] px-5 text-[rgba(255,255,255,0.75)] text-sm tracking-[0.7px] transition-[border-color,background,color] duration-300 hover:border-[#F28C28] hover:bg-[rgba(242,140,40,0.1)] hover:text-white max-[520px]:min-h-[38px] max-[520px]:px-[14px] max-[520px]:text-[13px]" href="/yotaabo">Yotaabo</a>
          <a className="inline-flex min-h-[42px] items-center rounded-[30px] border border-[rgba(242,140,40,0.2)] px-5 text-[rgba(255,255,255,0.75)] text-sm tracking-[0.7px] transition-[border-color,background,color] duration-300 hover:border-[#F28C28] hover:bg-[rgba(242,140,40,0.1)] hover:text-white max-[520px]:min-h-[38px] max-[520px]:px-[14px] max-[520px]:text-[13px]" href="/poshies">Poshies</a>
          <a className="inline-flex min-h-[42px] items-center rounded-[30px] border border-[rgba(242,140,40,0.2)] px-5 text-[rgba(255,255,255,0.75)] text-sm tracking-[0.7px] transition-[border-color,background,color] duration-300 hover:border-[#F28C28] hover:bg-[rgba(242,140,40,0.1)] hover:text-white max-[520px]:min-h-[38px] max-[520px]:px-[14px] max-[520px]:text-[13px]" href="#contact">Let's Talk</a>
        </div>
      </div>

      <FooterLinks />

      <img
        className="footer-wordmark relative block w-screen max-w-none h-[clamp(240px,35vw,480px)] mt-[45px] ml-[calc(50%-50vw)] shrink-0 object-fill pointer-events-none select-none max-[520px]:h-[220px] max-[520px]:mt-[35px]"
        src="/systems/homepage/images/simatu-wordmark.svg"
        alt="Simatu"
      />
    </footer>
  );
}
