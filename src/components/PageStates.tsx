import React from "react";
import { Link } from "react-router-dom";
import { buttonClasses } from "@/components/ui";

interface PageStateProps {
  message?: string;
  className?: string;
}

const bar = "bg-secondaryBorder animate-pulse";

export const PageLoading: React.FC<PageStateProps> = ({
  message = "Loading…",
  className = "",
}) => (
  <div
    role="status"
    aria-busy="true"
    className={`flex flex-col gap-4 py-2 ${className}`}
  >
    <span className="sr-only">{message}</span>
    <div className={`${bar} h-8 w-2/5 max-w-80`} />
    <div className={`${bar} h-3.5 w-3/5 max-w-120`} />
    <div className={`${bar} mt-2 h-64 w-full`} />
  </div>
);

export const PageError: React.FC<PageStateProps> = ({
  message = "Something went wrong. Please try again.",
  className = "",
}) => (
  <div role="alert" className={`py-12 text-center ${className}`}>
    <p className="text-errorText">{message}</p>
  </div>
);

export const PageNotFound: React.FC<PageStateProps> = ({
  message = "Nothing lives at this address. It might have been a bootleg.",
  className = "",
}) => (
  <section
    className={`mx-auto flex max-w-160 flex-col items-center gap-5 py-16 text-center ${className}`}
  >
    <h1 className="text-primaryText flex flex-wrap items-baseline justify-center gap-x-3.5 leading-[1.2]">
      404
      <span
        aria-hidden
        lang="ja"
        className="font-jp text-accentAmber text-[22px] font-normal text-shadow-none"
      >
        見つかりません
      </span>
      <span className="sr-only">Not found</span>
    </h1>
    <p className="text-secondaryText text-pretty">{message}</p>
    <div className="flex flex-wrap justify-center gap-2">
      <Link to="/cards" className={buttonClasses()}>
        Browse cards
      </Link>
      <Link to="/news" className={buttonClasses("ghost")}>
        News
      </Link>
      <Link to="/" className={buttonClasses("ghost")}>
        Home
      </Link>
    </div>
  </section>
);

export const PageEmpty: React.FC<PageStateProps> = ({
  message = "No items to display.",
  className = "",
}) => (
  <div className={`text-secondaryText py-12 text-center ${className}`}>
    {message}
  </div>
);
