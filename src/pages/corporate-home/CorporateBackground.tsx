import { createPortal } from 'react-dom';
import PixelBlast from '../../components/PixelBlast';

export default function CorporateBackground() {
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
    </div>,
    document.body,
  );
}
