import React, { useMemo } from "react";
import DOMPurify from "dompurify";

type HtmlCellProps<T extends React.ElementType = "td"> = {
  html?: string | null;
  as?: T;
  className?: string;
  preserveNewlines?: boolean;
} & Omit<
  React.ComponentPropsWithoutRef<T>,
  "dangerouslySetInnerHTML" | "children"
>;

const ALLOWED_TAGS = ["img", "a", "b", "i", "em", "strong", "u", "br", "span"];
const ALLOWED_ATTR = [
  "src",
  "alt",
  "title",
  "width",
  "height",
  "style",
  "class",
  "href",
  "target",
  "rel",
];

export default function HtmlCell<T extends React.ElementType = "td">({
  html,
  as,
  className = "",
  preserveNewlines = true,
  ...rest
}: HtmlCellProps<T>) {
  const Tag = (as || "td") as React.ElementType;

  const cleaned = useMemo(() => {
    if (!html) return "";
    const withBreaks = preserveNewlines ? html.replace(/\n/g, "<br/>") : html;
    return DOMPurify.sanitize(withBreaks, {
      ALLOWED_TAGS,
      ALLOWED_ATTR,
    });
  }, [html, preserveNewlines]);

  if (!cleaned) return null;

  return (
    <Tag
      className={className}
      dangerouslySetInnerHTML={{ __html: cleaned }}
      {...rest}
    />
  );
}
