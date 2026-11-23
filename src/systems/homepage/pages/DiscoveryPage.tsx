import React from 'react';
import KineticMoodboard from '../discover/KineticMoodboard';

/** Opens the interactive Discovery experience directly, without the former homepage gate. */
export default function DiscoveryPage() {
  return (
    <main className="simatu-discovery-page">
      <KineticMoodboard colorReveal interactive />
      <style>{`
        .simatu-discovery-page {
          position: relative;
          width: 100%;
          height: 100vh;
          height: 100dvh;
          min-height: 0;
          overflow: hidden;
          background: #111;
        }
      `}</style>
    </main>
  );
}
