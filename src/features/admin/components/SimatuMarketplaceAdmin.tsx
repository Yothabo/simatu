import KineticMoodboard from '../../../systems/homepage/discover/KineticMoodboard';
import '../../../systems/homepage/design-system/index.css';

/** Admin Market renders the shared moodboard in management-only mode. */
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
      <KineticMoodboard colorReveal interactive adminMode />
    </div>
  );
}
