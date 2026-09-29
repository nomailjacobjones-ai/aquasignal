import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface BaseProps {
  variant?: Variant;
  size?: Size;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-aqua-700 text-white hover:bg-aqua-800 active:bg-aqua-900 shadow-soft border border-transparent',
  secondary:
    'bg-white text-aqua-800 hover:bg-aqua-50 border border-aqua-200 shadow-soft',
  ghost:
    'bg-transparent text-sand-700 hover:bg-sand-100 border border-transparent',
  danger:
    'bg-error-600 text-white hover:bg-error-700 active:bg-error-800 shadow-soft border border-transparent',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3.5 py-2 text-sm gap-1.5',
  md: 'px-5 py-2.5 text-sm gap-2',
  lg: 'px-7 py-3.5 text-base gap-2.5',
};

const baseClass =
  'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

interface ButtonProps extends BaseProps {
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  withArrow?: boolean;
}

const PrimaryButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', children, className = '', onClick, type = 'button', disabled, withArrow }, ref) => (
    <button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClass} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
      {withArrow && <ArrowRight className="w-4 h-4" />}
    </button>
  ),
);
PrimaryButton.displayName = 'PrimaryButton';

interface LinkButtonProps extends BaseProps {
  to: string;
  withArrow?: boolean;
}

function SecondaryButton({ variant = 'secondary', size = 'md', children, className = '', to, withArrow }: LinkButtonProps) {
  return (
    <Link to={to} className={`${baseClass} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
      {children}
      {withArrow && <ArrowRight className="w-4 h-4" />}
    </Link>
  );
}

export { PrimaryButton, SecondaryButton };
