import React, { useState, useEffect } from 'react';

interface PlatformLogoProps {
  src?: string;
  name: string;
  className?: string;
  fallbackClassName?: string;
}

const PlatformLogo: React.FC<PlatformLogoProps> = ({ 
  src, 
  name, 
  className = "max-w-full max-h-full object-contain rounded-lg", 
  fallbackClassName = "text-xl font-black text-slate-500" 
}) => {
  const [error, setError] = useState(false);

  // Reset error state when src changes
  useEffect(() => {
    setError(false);
  }, [src]);

  const getLogoUrl = (logo?: string) => {
    if (!logo) return '';
    if (logo.startsWith('http') || logo.startsWith('data:')) return logo;
    const apiUrl = (import.meta as any).env.VITE_API_URL || '/api';
    const backendUrl = apiUrl.replace(/\/api$/, '');
    if (logo.startsWith('/uploads')) {
      return `${backendUrl}${logo}`;
    }
    return logo;
  };

  if (!src || error) {
    return <span className={fallbackClassName}>{name?.charAt(0) || 'P'}</span>;
  }

  return (
    <img 
      src={getLogoUrl(src)} 
      alt={name} 
      className={className}
      onError={() => setError(true)}
    />
  );
};

export default PlatformLogo;
