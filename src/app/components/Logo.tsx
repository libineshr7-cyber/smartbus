import logo from '../../imports/images.jpeg';

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  variant?: 'light' | 'dark' | 'maroon';
}

export default function Logo({
  size = 'md',
  showText = true,
  className = '',
  variant = 'maroon'
}: LogoProps) {
  const sizeMap = {
    xs: 'w-7 h-7',
    sm: 'w-9 h-9',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  const textMap = {
    xs: 'text-sm font-semibold',
    sm: 'text-base font-bold',
    md: 'text-lg font-bold',
    lg: 'text-2xl font-extrabold',
    xl: 'text-3xl font-black'
  };

  const textColor = {
    maroon: 'text-maroon-800',
    dark: 'text-slate-900',
    light: 'text-white'
  }[variant];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <div
        className={`${sizeMap[size]} rounded-xl overflow-hidden bg-white shadow-sm flex items-center justify-center p-0.5 border border-slate-200 shrink-0`}
      >
        <img
          src={logo}
          alt="Prathyusha Engineering College Logo"
          className="w-full h-full object-contain"
          onError={(e) => {
            // Fallback in case of image load error
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      </div>

      {showText && (
        <div className="flex flex-col leading-tight">
          <span className={`${textMap[size]} ${textColor} tracking-tight`}>
            PEC SmartBus
          </span>
          {size !== 'xs' && (
            <span
              className={`text-[10px] tracking-wider uppercase font-medium ${
                variant === 'light' ? 'text-maroon-100' : 'text-slate-500'
              }`}
            >
              Prathyusha Engg College
            </span>
          )}
        </div>
      )}
    </div>
  );
}
