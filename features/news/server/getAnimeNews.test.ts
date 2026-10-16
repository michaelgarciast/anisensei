import { expect, test } from "bun:test";
import { parseNewsRss } from "./getAnimeNews";

const xml = `<rss><channel><item><title>Nuevo anime &amp; más - Crunchyroll</title><link>https://example.com/a</link><pubDate>Mon, 12 Oct 2026 10:00:00 GMT</pubDate><source url="https://x.com">Crunchyroll</source></item><item><title>Sin link</title></item></channel></rss>`;

test("parsea items válidos y descarta los incompletos", () => {
  const items = parseNewsRss(xml, 5);
  expect(items).toHaveLength(1);
  expect(items[0]).toMatchObject({ title: "Nuevo anime & más", source: "Crunchyroll" });
});
