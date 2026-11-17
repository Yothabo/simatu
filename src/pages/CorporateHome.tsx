import CorporateBackground from './corporate-home/CorporateBackground';
import CorporateHero from './corporate-home/CorporateHero';
import CorporateStory from './corporate-home/CorporateStory';
import CorporatePortfolio from './corporate-home/CorporatePortfolio';
import CorporateFooter from './corporate-home/CorporateFooter';

export default function CorporateHome() {
  return (
    <>
      <CorporateBackground />

      <main className="relative z-10 w-full min-h-screen font-body text-[#EDE8E0] antialiased selection:bg-[#EDE8E0] selection:text-[#181715]">
        <CorporateHero />
        <CorporateStory />
        <CorporatePortfolio />
        <CorporateFooter />
      </main>
    </>
  );
}
