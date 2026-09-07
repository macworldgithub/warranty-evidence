interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

export function Loading({ size = 'md', className = '', text }: LoadingProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-6 ${className}`}>
      <div
        className={`
          ${sizeClasses[size]}
          border-2 border-slate-200 border-t-primary
          rounded-full animate-spin
        `}
      />
      {text && <p className="mt-3 text-xs font-medium text-slate-500">{text}</p>}
    </div>
  );
}
