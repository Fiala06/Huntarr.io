import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: string; // Font Awesome icon class
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseClass = 'button';
  const variantClass = `button-${variant}`;
  const sizeClass = `button-${size}`;
  const loadingClass = isLoading ? 'button-loading' : '';
  const fullWidthClass = fullWidth ? 'button-full-width' : '';
  
  const buttonClasses = [
    baseClass,
    variantClass, 
    sizeClass, 
    loadingClass,
    fullWidthClass,
    className
  ].filter(Boolean).join(' ');
  
  return (
    <button 
      className={buttonClasses} 
      disabled={disabled || isLoading} 
      {...props}
    >
      {isLoading && <span className="loader"></span>}
      
      {!isLoading && icon && iconPosition === 'left' && (
        <i className={`fas ${icon} icon-left`}></i>
      )}
      
      {children}
      
      {!isLoading && icon && iconPosition === 'right' && (
        <i className={`fas ${icon} icon-right`}></i>
      )}
    </button>
  );
};

export default Button;
