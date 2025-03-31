import React from 'react';

interface ImageProps {
  src: string | { toString: () => string };
  alt?: string;
  fill?: boolean;
  priority?: boolean;
  className?: string;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
}

const Image = ({ src, alt, fill, ...props }: ImageProps) => (
  <img 
    src={typeof src === 'string' ? src : src?.toString()} 
    alt={alt || ''} 
    style={{ 
      objectFit: 'cover',
      ...(fill ? { position: 'absolute', height: '100%', width: '100%' } : {}),
    }}
    {...props} 
  />
);

export default Image; 