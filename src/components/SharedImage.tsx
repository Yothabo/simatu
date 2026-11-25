import React from 'react';

type SharedImageProps = {
  src: string;
  alt: string;
  className?: string;
  objectPosition?: string;
  style?: React.CSSProperties;
  loading?: 'eager' | 'lazy';
  fetchPriority?: 'high' | 'low' | 'auto';
  decoding?: 'async' | 'sync' | 'auto';
  draggable?: boolean;
  onError?: React.ReactEventHandler<HTMLImageElement>;
};

/** Shared image rendering used by Moodboard and storefront product cards. */
export default function SharedImage({
  src,
  alt,
  className = '',
  objectPosition = 'center',
  style,
  loading = 'lazy',
  fetchPriority = 'auto',
  decoding = 'async',
  draggable = false,
  onError,
}: SharedImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      fetchPriority={fetchPriority}
      decoding={decoding}
      draggable={draggable}
      onError={onError}
      className={className}
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition,
        ...style,
      }}
    />
  );
}
