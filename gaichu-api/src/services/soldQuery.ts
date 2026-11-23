type Term = { words: string[] } | { choices: string[][] };

const DROPPED_TOKENS = new Set(["&", "+", "-", "/"]);

function toWords(text: string): string[] {
  return text
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w !== "" && !DROPPED_TOKENS.has(w));
}

function splitChoices(body: string): string[] {
  const out: string[] = [];
  let current = "";
  let inQuote = false;
  for (const ch of body) {
    if (ch === '"') inQuote = !inQuote;
    if (ch === "," && !inQuote) {
      out.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  out.push(current);
  return out;
}

function parse(query: string): Term[] {
  const terms: Term[] = [];
  let i = 0;
  while (i < query.length) {
    const ch = query[i];
    if (/\s/.test(ch)) {
      i++;
    } else if (ch === "(") {
      const end = query.indexOf(")", i);
      if (end === -1) throw new Error(`Unclosed "(" in query: ${query}`);
      const choices = splitChoices(query.slice(i + 1, end))
        .map((c) => toWords(c.replace(/"/g, "")))
        .filter((c) => c.length > 0);
      terms.push({ choices });
      i = end + 1;
    } else if (ch === '"') {
      const end = query.indexOf('"', i + 1);
      if (end === -1) throw new Error(`Unclosed quote in query: ${query}`);
      terms.push({ words: toWords(query.slice(i + 1, end)) });
      i = end + 1;
    } else {
      let end = i;
      while (end < query.length && !/[\s("]/.test(query[end])) end++;
      terms.push({ words: toWords(query.slice(i, end)) });
      i = end;
    }
  }
  return terms;
}

export function expandQuery(query: string): string[] {
  let combos: string[][] = [[]];
  for (const term of parse(query)) {
    if ("words" in term) {
      combos = combos.map((c) => [...c, ...term.words]);
    } else {
      combos = combos.flatMap((c) =>
        term.choices.map((choice) => [...c, ...choice]),
      );
    }
  }
  const queries = combos.map((c) => c.join(" ")).filter((q) => q !== "");
  return [...new Set(queries)];
}

export function excludeFor(query: string, excluded: string): string {
  const queryWords = new Set(query.toLowerCase().split(/\s+/));
  return excluded
    .split(/\s+/)
    .filter((w) => w !== "" && !queryWords.has(w.toLowerCase()))
    .join(" ");
}
