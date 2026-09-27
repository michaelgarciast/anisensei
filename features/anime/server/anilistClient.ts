const ANILIST_API_URL = "https://graphql.anilist.co";

// AniList permite ~90 req/min; con margen, no superar ~1 req cada 700ms.
const MIN_REQUEST_INTERVAL_MS = 700;
const MAX_RETRIES = 1;
const REQUEST_TIMEOUT_MS = 2_500;
const MAX_QUEUED_REQUESTS = 3;

export class AniListApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "AniListApiError";
  }
}

// Cola simple para serializar las llamadas y respetar el rate limit de AniList.
let requestQueue: Promise<void> = Promise.resolve();
let lastRequestAt = 0;
let queuedRequests = 0;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForTurn(): Promise<void> {
  if (queuedRequests >= MAX_QUEUED_REQUESTS) {
    throw new AniListApiError("Cola de AniList saturada", 429);
  }
  queuedRequests++;
  const turn = requestQueue.then(async () => {
    const wait = Math.max(0, lastRequestAt + MIN_REQUEST_INTERVAL_MS - Date.now());
    if (wait > 0) await sleep(wait);
    lastRequestAt = Date.now();
  });
  requestQueue = turn;
  try {
    await turn;
  } finally {
    queuedRequests--;
  }
}

export interface GraphQLRequest<
  TVariables extends Record<string, unknown> = Record<string, unknown>,
> {
  query: string;
  variables?: TVariables;
}

interface GraphQLResponse<TData> {
  data?: TData;
  errors?: { message: string; status?: number }[];
}

/**
 * Ejecuta una query de GraphQL contra AniList.
 * Reintenta con backoff ante 429/5xx (usando Retry-After si viene) y lanza
 * `AniListApiError` cuando se agotan los reintentos o hay error de GraphQL.
 */

type AttemptResult<TData> =
  { kind: "ok"; data: TData } | { kind: "retry"; error: AniListApiError; waitMs?: number };

async function attemptFetch<TData>(
  request: GraphQLRequest,
  operation: string,
): Promise<AttemptResult<TData>> {
  let response: Response;
  try {
    response = await fetch(ANILIST_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch {
    return {
      kind: "retry",
      error: new AniListApiError(`No se pudo conectar con AniList (${operation})`),
    };
  }

  if (response.status === 429 || response.status >= 500) {
    const retryAfter = Number(response.headers.get("retry-after"));
    return {
      kind: "retry",
      error: new AniListApiError(
        `AniList respondió ${response.status} para ${operation}`,
        response.status,
      ),
      waitMs: Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : undefined,
    };
  }

  if (!response.ok) {
    throw new AniListApiError(
      `AniList respondió ${response.status} para ${operation}`,
      response.status,
    );
  }

  let body: GraphQLResponse<TData>;
  try {
    body = (await response.json()) as GraphQLResponse<TData>;
  } catch {
    return {
      kind: "retry",
      error: new AniListApiError(`AniList devolvió JSON inválido para ${operation}`),
    };
  }

  if (body.errors?.length) {
    const messages = body.errors.map((e) => e.message).join("; ");
    const status = body.errors.find((e) => typeof e.status === "number")?.status;
    throw new AniListApiError(`Errores de GraphQL en ${operation}: ${messages}`, status);
  }

  if (!body.data) {
    throw new AniListApiError(`AniList devolvió una respuesta vacía para ${operation}`);
  }

  return { kind: "ok", data: body.data };
}

export async function anilistFetch<TData>({ query, variables }: GraphQLRequest): Promise<TData> {
  const operation = /query\s+(\w+)/.exec(query)?.[1] ?? "GraphQL";
  let lastError = new AniListApiError(`Fallo al consultar AniList: ${operation}`);

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    await waitForTurn();
    const result = await attemptFetch<TData>({ query, variables }, operation);
    if (result.kind === "ok") return result.data;
    lastError = result.error;
    if (attempt === MAX_RETRIES || (result.waitMs && result.waitMs > 1_000)) break;
    await sleep(result.waitMs ?? 500 * 2 ** attempt);
  }

  throw lastError;
}
