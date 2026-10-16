import { NewsItemsSchema, type NewsItem } from "../schemas";

const NEWS_TIMEOUT_MS = 4_000;
const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
};

function decode(text: string): string {
  return text
    .replace(/^<!\[CDATA\[|\]\]>$/g, "")
    .replace(/&(?:amp|lt|gt|quot|apos|#39);/g, (entity) => ENTITIES[entity])
    .trim();
}

function tag(block: string, name: string): string | undefined {
  const match = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`));
  return match ? decode(match[1]) : undefined;
}

export function parseNewsRss(xml: string, limit: number): NewsItem[] {
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, block]) => {
    const source = tag(block, "source");
    let title = tag(block, "title") ?? "";
    if (source && title.endsWith(` - ${source}`)) title = title.slice(0, -(source.length + 3));
    return { title, link: tag(block, "link"), source, publishedAt: tag(block, "pubDate") };
  });
  const valid = items.filter((item) => NewsItemsSchema.safeParse([item]).success);
  return valid.slice(0, limit) as NewsItem[];
}

export async function getAnimeNews({
  topic,
  limit = 6,
}: { topic?: string; limit?: number } = {}): Promise<NewsItem[]> {
  const q = `${topic ? `${topic} ` : ""}anime when:7d`;
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=es-419&gl=MX&ceid=MX:es-419`;
  const res = await fetch(url, {
    next: { revalidate: 600 },
    signal: AbortSignal.timeout(NEWS_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`Google News RSS respondió ${res.status}`);
  return parseNewsRss(await res.text(), limit);
}
