import { Marked, type Tokens } from "marked";

const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Renders Markdown from AI output or the playbook. Raw HTML is shown as text and
// only http(s), mailto, anchor and relative links are kept, so nothing in the text
// can inject markup or scripts.
const marked = new Marked({
  gfm: true,
  renderer: {
    html({ text }: Tokens.HTML | Tokens.Tag) {
      return escapeHtml(text);
    },
    link(this: { parser: { parseInline: (t: Tokens.Generic[]) => string } }, { href, title, tokens }: Tokens.Link) {
      const label = this.parser.parseInline(tokens);
      // Relative links are fine; of the URL schemes, only http(s) and mailto are allowed.
      const scheme = href.replace(/[\u0000-\u0020]/g, "").match(/^([a-z][a-z0-9+.-]*):/i)?.[1]?.toLowerCase();
      if (scheme && !["http", "https", "mailto"].includes(scheme)) return label;
      const external = /^https?:/i.test(href);
      return `<a href="${escapeHtml(href)}"${title ? ` title="${escapeHtml(title)}"` : ""}${external ? ' target="_blank" rel="noopener noreferrer"' : ""}>${label}</a>`;
    },
  },
});

export function renderMarkdown(source: string) {
  return marked.parse(source, { async: false }) as string;
}

export function Markdown({ source, className = "md" }: { source: string; className?: string }) {
  return <div className={className} dangerouslySetInnerHTML={{ __html: renderMarkdown(source) }} />;
}
