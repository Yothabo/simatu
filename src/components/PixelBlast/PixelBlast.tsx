import { useRef } from 'react';
import type { PixelBlastProps } from './types';
import { usePixelBlastRenderer } from './hooks/usePixelBlastRenderer';
import './styles.css';

const PixelBlast: React.FC<PixelBlastProps> = ({
  variant = 'square',
  pixelSize = 3,
  color = '#B497CF',
  className,
  style,
  antialias = true,
  patternScale = 2,
  patternDensity = 1,
  liquid = false,
  liquidStrength = 0.1,
  liquidRadius = 1,
  pixelSizeJitter = 0,
  enableRipples = true,
  rippleIntensityScale = 1,
  rippleThickness = 0.1,
  rippleSpeed = 0.3,
  liquidWobbleSpeed = 4.5,
  autoPauseOffscreen = true,
  speed = 0.5,
  transparent = true,
  edgeFade = 0.5,
  noiseAmount = 0,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  usePixelBlastRenderer({
    containerRef,
    variant,
    pixelSize,
    color,
    antialias,
    patternScale,
    patternDensity,
    liquid,
    liquidStrength,
    liquidRadius,
    pixelSizeJitter,
    enableRipples,
    rippleIntensityScale,
    rippleThickness,
    rippleSpeed,
    liquidWobbleSpeed,
    autoPauseOffscreen,
    speed,
    transparent,
    edgeFade,
    noiseAmount,
  });

  return (
    <div
      ref={containerRef}
      className={`pixel-blast-container ${className ?? ''}`}
      style={style}
      aria-label="PixelBlast interactive background"
    />
  );
};

export default PixelBlast;
