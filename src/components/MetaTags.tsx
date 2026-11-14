import { useLocation } from 'react-router-dom';
import useStorefront from '../hooks/useStorefront';

interface MetaTagsProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

export default function MetaTags({
  title,
  description,
  image,
  url = typeof window !== 'undefined' ? window.location.href : '/',
}: MetaTagsProps) {
  const { pathname } = useLocation();
  const { name: storeName } = useStorefront();
  const isCorporate = pathname === '/';
  const isYotaabo = storeName === 'Yotaabo';

  const corporateTitle = 'Simatu Cooperative | A Multi-Brand Commerce Group';
  const corporateDescription =
    'Simatu Cooperative develops and operates retail brands through distinct businesses, shared infrastructure and a connected approach to commerce.';

  const pageTitle =
    title ??
    (isCorporate
      ? corporateTitle
      : isYotaabo
        ? `${storeName} | Fragrance, With Intention`
        : `${storeName} | Comfort, Confidence, Your Way`);

  const pageDescription =
    description ??
    (isCorporate
      ? corporateDescription
      : isYotaabo
        ? 'Discover fragrances that match your mood, define your style, and leave a lasting impression.'
        : 'Discover intimate wear, everyday underwear and comfortable sleepwear at Poshies.');

  const pageImage = image ?? (isCorporate ? '/simatu.png' : isYotaabo ? '/images/hisimage.webp' : undefined);

  const keywords = isCorporate
    ? 'Simatu Cooperative, multi-brand commerce group, retail businesses, South Africa'
    : isYotaabo
      ? 'fragrances, perfume, signature scent, fragrance collection, South Africa'
      : 'intimate wear, underwear, lingerie, sleepwear, pyjamas, lounge wear, South Africa';

  const siteName = isCorporate ? 'Simatu Cooperative' : storeName;

  return (
    <>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={keywords} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      {pageImage && <meta property="og:image" content={pageImage} />}
      <meta property="og:site_name" content={siteName} />
      <meta name="twitter:card" content={pageImage ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      {pageImage && <meta name="twitter:image" content={pageImage} />}
      <link rel="canonical" href={url} />
    </>
  );
}
