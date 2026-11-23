import React from "react";

import {
  buttonClasses,
  type ButtonSize,
  type ButtonVariant,
} from "./buttonClasses";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  type = "button",
  className = "",
  children,
  ...rest
}) => (
  <button
    type={type}
    className={`${buttonClasses(variant, size)} ${className}`}
    {...rest}
  >
    {children}
  </button>
);

export default Button;
