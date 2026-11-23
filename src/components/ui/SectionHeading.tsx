import React from "react";

export interface SectionHeadingProps {
  children: React.ReactNode;
  label: string;
  action?: React.ReactNode;
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  children,
  label,
  action,
  className = "",
}) => (
  <div className={`flex items-center gap-3.5 ${className}`}>
    <h2 className="section-heading" title={label}>
      <span aria-hidden>{children}</span>
      <span className="sr-only">{label}</span>
    </h2>
    {action && <div className="ml-auto">{action}</div>}
  </div>
);

export default SectionHeading;
