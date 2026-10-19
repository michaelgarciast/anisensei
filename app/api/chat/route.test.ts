import { afterAll, beforeAll, beforeEach, describe, expect, mock, test } from "bun:test";

const empty: { data: unknown[]; pagination: object } = {
  data: [],
  pagination: { last_page: 1, has_next_page: false, total: 0, current_page: 1 },
};
const anime = { id: 7, title: { romaji: "Serie", english: null, native: null }, genres: [] };

let intent: Record<string, unknown>;
const searchAnime = mock<(arg: unknown) => Promise<typeof empty>>(async () => ({
  ...empty,
  data: [anime],
}));
const getSeasonalAnime = mock<(arg: unknown) => Promise<typeof empty>>(async () => ({
  ...empty,
  data: [anime],
}));
const getAnimeById = mock<(id: number) => Promise<{ id: number }>>(async () => ({ id: 7 }));
const buildReply = mock<(input: unknown) => { stream: ReadableStream }>(() => ({
  stream: new ReadableStream({ start: (c) => c.close() }),
}));

mock.module("@/features/chat/server/interpretIntent", () => ({
  interpretIntent: async () => intent,
}));
mock.module("@/features/chat/server/buildReply", () => ({ buildReply }));
mock.module("@/features/anime/server/searchAnime", () => ({ searchAnime }));
mock.module("@/features/anime/server/getSeasonalAnime", () => ({ getSeasonalAnime }));
mock.module("@/features/anime/server/getAnimeById", () => ({ getAnimeById }));

const { POST } = await import("./route");

const request = async (text = "hola") => {
  const response = await POST(
    new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", parts: [{ type: "text", text }] }] }),
    }),
  );
  await response.text();
  return response;
};

const lastReplyInput = () =>
  buildReply.mock.calls.at(-1)![0] as { results: { data: unknown[] }; detail: unknown };

const originalFetch = globalThis.fetch;
beforeAll(() => {
  globalThis.fetch = (async () => {
    throw new Error("sin red en tests");
  }) as unknown as typeof fetch;
});
afterAll(() => {
  globalThis.fetch = originalFetch;
});

beforeEach(() => {
  for (const fn of [searchAnime, getSeasonalAnime, getAnimeById, buildReply]) fn.mockClear();
});

describe("POST /api/chat", () => {
  test("rejects invalid content type and malformed bodies", async () => {
    const wrongType = await POST(
      new Request("http://localhost/api/chat", { method: "POST", body: "{}" }),
    );
    expect(wrongType.status).toBe(415);
    const badJson = await POST(
      new Request("http://localhost/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{",
      }),
    );
    expect(badJson.status).toBe(400);
  });

  test("search intent forwards filters to AniList", async () => {
    intent = {
      intent: "search",
      tone: "casual",
      filters: { genre: "Action", tags: ["Time Travel"], sort: "trending", minScore: 75 },
    };
    expect((await request()).status).toBe(200);
    expect(searchAnime.mock.calls[0][0]).toMatchObject({
      genre: "Action",
      tags: ["Time Travel"],
      sort: "trending",
      minScore: 75,
      sortByMatch: false,
      limit: 6,
    });
  });

  test("detail intent matches by title and loads the detail of the first result", async () => {
    intent = { intent: "detail", tone: "casual", filters: { similarTo: "Serie" } };
    await request();
    expect(searchAnime.mock.calls[0][0]).toMatchObject({
      query: "Serie",
      sortByMatch: true,
      limit: 3,
    });
    expect(getAnimeById.mock.calls[0][0]).toBe(7);
    expect(lastReplyInput().detail).toEqual({ id: 7 });
  });

  test("seasonal intent uses the seasonal query", async () => {
    intent = { intent: "seasonal", tone: "hype", filters: {} };
    await request();
    expect(getSeasonalAnime).toHaveBeenCalledTimes(1);
    expect(searchAnime).not.toHaveBeenCalled();
  });

  test("smalltalk skips AniList entirely", async () => {
    intent = { intent: "smalltalk", tone: "casual", filters: {} };
    await request();
    expect(searchAnime).not.toHaveBeenCalled();
    expect(getSeasonalAnime).not.toHaveBeenCalled();
  });

  test("keeps chatting without cards when AniList fails", async () => {
    intent = { intent: "search", tone: "casual", filters: {} };
    searchAnime.mockRejectedValueOnce(new Error("AniList caído"));
    expect((await request()).status).toBe(200);
    expect(lastReplyInput().results.data).toEqual([]);
  });
});
