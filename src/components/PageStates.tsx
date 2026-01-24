import React from "react";

interface PageStateProps {
  message?: string;
  className?: string;
}

export const PageLoading: React.FC<PageStateProps> = ({
  message = "Loading…",
  className = "",
}) => (
  <div className={`text-secondaryText container mx-auto px-4 py-2 ${className}`}>
    {message}
  </div>
);

export const PageError: React.FC<PageStateProps> = ({
  message = "Something went wrong. Please try again.",
  className = "",
}) => (
  <div className={`container mx-auto px-4 py-2 ${className}`}>
    <p className="text-errorText">{message}</p>
  </div>
);

export const PageNotFound: React.FC<PageStateProps> = ({
  message = "Not found.",
  className = "",
}) => (
  <div className={`container mx-auto px-4 py-2 ${className}`}>
    <p className="text-errorText text-center">{message}</p>
  </div>
);

export const PageEmpty: React.FC<PageStateProps> = ({
  message = "No items to display.",
  className = "",
}) => (
  <div className={`text-secondaryText container mx-auto px-4 py-2 ${className}`}>
    {message}
  </div>
);
