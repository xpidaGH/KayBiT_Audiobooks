import React from 'react';

// Exact generated image asset paths
export const KBT_ASSETS = {
  desktopIcon: '/src/assets/images/kbt_desktop_icon_1793494751306.jpg',
  mobileLogo: '/src/assets/images/kbt_mobile_logo_1793494752291.jpg',
  webLogo: '/src/assets/images/kbt_web_logo_1793494751387.jpg',
};

interface BrandLogoProps {
  variant?: 'web' | 'mobile' | 'desktop' | 'large';
  className?: string;
  showText?: boolean;
  onClick?: () => void;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'web',
  className = '',
  showText = true,
  onClick,
}) => {
  // Select appropriate generated asset tailored to the use-case
  const getImageSrc = () => {
    switch (variant) {
      case 'desktop':
        return KBT_ASSETS.desktopIcon;
      case 'mobile':
        return KBT_ASSETS.mobileLogo;
      case 'large':
        return KBT_ASSETS.desktopIcon;
      case 'web':
      default:
        return KBT_ASSETS.webLogo;
    }
  };

  // Dimensions tailored to use cases
  const getSizeClasses = () => {
    switch (variant) {
      case 'desktop':
        // Desktop window title bar icon (20px to 24px)
        return 'w-6 h-6 rounded-md';
      case 'mobile':
        // Mobile App Bar (32px to 36px) with squircle mask
        return 'w-9 h-9 mask-squircle';
      case 'large':
        // Full splash or showcase size
        return 'w-20 h-20 mask-squircle';
      case 'web':
      default:
        // Web Header Bar (36px to 40px)
        return 'w-9 h-9 rounded-xl';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 ${onClick ? 'cursor-pointer group' : ''} ${className}`}
    >
      <div
        className={`relative ${getSizeClasses()} p-0.5 bg-gradient-to-br from-lime-500/30 via-yellow-400/20 to-black border border-lime-400/30 flex items-center justify-center overflow-hidden shadow-lg shadow-lime-500/10 transition-transform ${
          onClick ? 'group-hover:scale-105' : ''
        }`}
      >
        <img
          src={getImageSrc()}
          alt="KBT Tech Cyber Spider Brand Logo"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter drop-shadow-[0_0_6px_rgba(163,230,53,0.4)]"
        />
      </div>

      {showText && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5 font-extrabold text-sm sm:text-base tracking-tight text-white leading-tight">
            <span>KayBiT</span>
            <span className="text-lime-400 font-mono text-xs sm:text-sm px-1.5 py-0.2 bg-lime-950/60 rounded border border-lime-500/30">
              KBT
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono hidden sm:block -mt-0.5">
            Multiplatform Audio & Systems
          </span>
        </div>
      )}
    </div>
  );
};
