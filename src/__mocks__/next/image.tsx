import React from 'react';
import NextImage from 'next/image';

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

const Image = ({ src, alt, fill, className, ...props }: ImageProps) => (
  <NextImage 
    src={typeof src === 'string' ? src : src?.toString()} 
    alt={alt || ''} 
    className={className}
    fill={fill}
    {...props} 
  />
);

export default Image; 