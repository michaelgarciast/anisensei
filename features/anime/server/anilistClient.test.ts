import { afterEach, expect, test } from "bun:test";
import { anilistFetch, AniListApiError } from "./anilistClient";

const originalFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = originalFetch;
});

test("returns AniList data and does not retry successful responses", async () => {
  let calls = 0;
  globalThis.fetch = (async () => {
    calls++;
    return Response.json({ data: { Media: { id: 1 } } });
  }) as unknown as typeof fetch;
  expect(
    await anilistFetch<{ Media: { id: number } }>({ query: "query AnimeDetail { Media { id } }" }),
  ).toEqual({
    Media: { id: 1 },
  });
  expect(calls).toBe(1);
});

test("does not wait beyond the retry budget when AniList sends Retry-After", async () => {
  let calls = 0;
  globalThis.fetch = (async () => {
    calls++;
    return new Response(null, { status: 429, headers: { "retry-after": "120" } });
  }) as unknown as typeof fetch;
  await expect(
    anilistFetch({ query: "query AnimeDetail { Media { id } }" }),
  ).rejects.toBeInstanceOf(AniListApiError);
  expect(calls).toBe(1);
});

test("aborts stalled AniList requests within the retry budget", async () => {
  let calls = 0;
  globalThis.fetch = (async (_input: string | URL | Request, init?: RequestInit) => {
    calls++;
    return new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => reject(init.signal?.reason), { once: true });
    });
  }) as unknown as typeof fetch;
  await expect(
    anilistFetch({ query: "query AnimeDetail { Media { id } }" }),
  ).rejects.toBeInstanceOf(AniListApiError);
  expect(calls).toBe(2);
}, 10_000);
