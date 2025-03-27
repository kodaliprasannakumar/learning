
import { useState, useEffect } from 'react';

interface ImageWithFallbackProps {
  src: string;
  fallbackSrc: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
}

const ImageWithFallback = ({
  src,
  fallbackSrc,
  alt,
  className,
  loading = "lazy",
  ...props
}: ImageWithFallbackProps & React.ImgHTMLAttributes<HTMLImageElement>) => {
  const [imgSrc, setImgSrc] = useState<string>(src);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setImgSrc(src);
    setIsLoading(true);
  }, [src]);

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/20 animate-pulse">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
        </div>
      )}
      <img
        src={imgSrc}
        alt={alt}
        loading={loading}
        className={className}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setImgSrc(fallbackSrc);
          setIsLoading(false);
        }}
        {...props}
      />
    </div>
  );
};

export default ImageWithFallback;
