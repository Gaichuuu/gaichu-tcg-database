export interface MatchParts {
  pre: string;
  match: string;
  post: string;
}

export function highlightMatch(text: string, query: string): MatchParts {
  const lower = text.toLowerCase();
  const q = query.trim().toLowerCase();
  if (!q) return { pre: text, match: "", post: "" };

  const candidates = [q, ...q.split(/\s+/).filter(Boolean)];
  for (const c of candidates) {
    const i = lower.indexOf(c);
    if (i !== -1) {
      return {
        pre: text.slice(0, i),
        match: text.slice(i, i + c.length),
        post: text.slice(i + c.length),
      };
    }
  }
  return { pre: text, match: "", post: "" };
}
