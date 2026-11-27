import KineticMoodboard from '../../../systems/homepage/discover/KineticMoodboard';
import '../../../systems/homepage/design-system/index.css';

/** Admin Market renders the existing homepage moodboard without a separate dashboard UI. */
export default function SimatuMarketplaceAdmin() {
  return (
    <div
      className="admin-marketplace-moodboard"
      aria-label="Marketplace moodboard"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10,
        overflow: 'hidden',
        background: '#111',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: 'linear-gradient(180deg,rgba(12,12,12,.08) 0%,rgba(12,12,12,.28) 48%,rgba(12,12,12,.62) 100%)',
        }}
      />
      <KineticMoodboard colorReveal interactive />
    </div>
  );
}
