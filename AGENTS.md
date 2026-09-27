<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## AniChat project guidance

- Use Bun for dependencies and scripts. Keep the existing Next.js App Router and feature-based structure: `app/` for routes, `features/chat/` for chat, `features/anime/` for AniList, and `lib/` for shared clients.
- Follow nearby patterns before adding abstractions. Keep Gemini credentials and model calls on the server; never expose API keys to client components or commit secrets. `.env.example` lists the required variable.
- Preserve the `/api/chat` request validation, payload/history limits, and AI SDK streaming contract. If AniList fails, the chat should continue without cards; do not present generated text as verified AniList data.
- Validate AniList responses with the existing Zod schemas before use or caching. The conversation history lives in browser `localStorage`, not a server database.
- Add or update focused tests when changing schemas, AniList queries, or chat routing. Before finishing code changes, run `bun test`, `bun run lint`, and `bunx tsc --noEmit --incremental false`; run `bun run build` for Next.js or integration changes.
- `README.md` describes the current product. Files in `.devin/workflows/` are plans, not proof that work is complete; in particular, the Vercel Firewall rate limit is not active yet. Preserve unrelated local changes.
