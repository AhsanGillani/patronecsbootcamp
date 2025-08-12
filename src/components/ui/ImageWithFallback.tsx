import { useState } from "react";

type Props = {
  src?: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  loading?: "eager" | "lazy";
};

export const ImageWithFallback = ({
  src,
  alt,
  className,
  fallbackSrc = "/placeholder.svg",
  loading = "lazy",
}: Props) => {
  const [error, setError] = useState(false);
  const finalSrc = !error && src ? src : fallbackSrc;
  return (
    <img
      src={finalSrc}
      alt={alt}
      className={className}
      loading={loading}
      onError={() => setError(true)}
    />
  );
};

export default ImageWithFallback;


