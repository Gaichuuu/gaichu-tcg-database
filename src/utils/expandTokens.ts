/**
 * Expands shorthand tokens in news content to full HTML.
 * Tokens are processed before DOMPurify sanitization.
 *
 * Supported tokens:
 * - {youtube:VIDEO_ID} - Responsive 16:9 YouTube embed
 * - {img:URL} or {img:URL|alt text} - Image
 * - {link:URL|text} - Link with target="_blank"
 * - {code}...{/code} - Styled code block
 * - {indent}...{/indent} - Indented block (no bullets)
 */

import { NEWS_CDN_BASE } from "@/utils/resolveHeroUrl";

const resolveUrl = (url: string): string =>
  url.startsWith("http") ? url : NEWS_CDN_BASE + url;

const YOUTUBE_TEMPLATE = (videoId: string) => `
<div style="position:relative;width:100%;padding-bottom:56.25%;height:0;overflow:hidden;">
<iframe src="https://www.youtube.com/embed/${videoId}" title="YouTube video player" style="position:absolute;top:0;left:0;width:100%;height:100%;" frameborder="0" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen></iframe>
</div>`.trim();

const IMG_TEMPLATE = (url: string, alt: string) =>
  `<img src="${resolveUrl(url)}" alt="${alt}">`;

const LINK_TEMPLATE = (url: string, text: string) =>
  `<a href="${url}" target="_blank">${text}</a>`;

const CODE_TEMPLATE = (content: string) =>
  `<pre style="background:var(--color-codeBg);padding:12px;border-radius:4px;overflow-x:auto;"><code>${content}</code></pre>`;

const INDENT_TEMPLATE = (content: string) =>
  `<div style="margin-left:1.25rem;">${content}</div>`;

const TOKEN_PATTERNS: Array<{
  pattern: RegExp;
  replace: (match: RegExpExecArray) => string;
}> = [
  {
    // {youtube:VIDEO_ID}
    pattern: /\{youtube:([a-zA-Z0-9_-]+)\}/g,
    replace: (match) => YOUTUBE_TEMPLATE(match[1]),
  },
  {
    // {img:URL|alt} or {img:URL}
    pattern: /\{img:([^|}]+)(?:\|([^}]*))?\}/g,
    replace: (match) => IMG_TEMPLATE(match[1], match[2] || ""),
  },
  {
    // {link:URL|text}
    pattern: /\{link:([^|]+)\|([^}]+)\}/g,
    replace: (match) => LINK_TEMPLATE(match[1], match[2]),
  },
  {
    // {code}...{/code}
    pattern: /\{code\}([\s\S]*?)\{\/code\}/g,
    replace: (match) => CODE_TEMPLATE(match[1]),
  },
  {
    // {indent}...{/indent}
    pattern: /\{indent\}([\s\S]*?)\{\/indent\}/g,
    replace: (match) => INDENT_TEMPLATE(match[1]),
  },
];

export function expandTokens(content: string): string {
  if (!content) return "";

  let result = content;

  for (const { pattern, replace } of TOKEN_PATTERNS) {
    result = result.replace(pattern, (...args) => {
      const match = args as unknown as RegExpExecArray;
      return replace(match);
    });
  }

  return result;
}
