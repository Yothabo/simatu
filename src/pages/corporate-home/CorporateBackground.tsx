import { useEffect, useState } from 'react';
import type { ComponentType } from 'react';
import { createPortal } from 'react-dom';
import type { PixelBlastProps } from '../../components/PixelBlast/types';

export default function CorporateBackground() {
  const [PixelBlast, setPixelBlast] = useState<ComponentType<PixelBlastProps> | null>(null);

  useEffect(() => {
    let isMounted = true;

    // Let the initial page render before loading the optional WebGL background.
    const timeoutId = window.setTimeout(() => {
      void import('../../components/PixelBlast')
        .then(({ default: PixelBlastComponent }) => {
          if (isMounted) {
            setPixelBlast(() => PixelBlastComponent);
          }
        })
        .catch((error: unknown) => {
          console.warn('[CorporateBackground] PixelBlast failed to load:', error);
        });
    }, 250);

    return () => {
      isMounted = false;
      window.clearTimeout(timeoutId);
    };
  }, []);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: '-25vh',
        left: 0,
        width: '100vw',
        height: '150vh',
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {PixelBlast && (
        <PixelBlast
          variant="circle"
          pixelSize={4}
          color="#F97316"
          patternScale={2.5}
          patternDensity={1.2}
          pixelSizeJitter={0.4}
          enableRipples={false}
          transparent={true}
          speed={0.3}
          antialias={true}
          edgeFade={0.6}
        />
      )}
    </div>,
    document.body,
  );
}
