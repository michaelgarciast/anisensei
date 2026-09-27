# AniChat

**Descubre anime conversando.** AniChat es una aplicación full-stack de recomendaciones de anime en español. Combina una interfaz de chat con respuestas en streaming, información de AniList y un asistente basado en Gemini. El usuario puede explorar series por género o año, consultar la temporada actual y abrir fichas detalladas sin salir de la experiencia.

## Qué ofrece

- **Conversación en tiempo real:** respuestas transmitidas progresivamente con tarjetas de anime integradas en el chat.
- **Datos de AniList:** puntuaciones, géneros y portadas en los resultados; sinopsis, personajes, estudios, recomendaciones y tráileres en las fichas cuando están disponibles.
- **Historial local:** conversaciones conservadas en el navegador mediante `localStorage`, con opción de borrarlas.
- **Interfaz adaptable:** diseño para móvil y escritorio, con temas claro y oscuro.

## Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS y Framer Motion.
- **Backend:** Route Handlers de Next.js, validación con Zod y consultas GraphQL a AniList.
- **IA:** Vercel AI SDK 7 y Gemini (`@ai-sdk/google`) para interpretar la consulta y generar la respuesta.
- **Herramientas:** Bun, ESLint y Prettier.

No utiliza una base de datos propia: las conversaciones se guardan en el dispositivo y los datos de anime se obtienen de AniList.

## Cómo funciona

```text
Navegador (useChat)
       │ mensaje
       ▼
POST /api/chat ──► validación ──► interpretación de intención (Gemini)
                                           │
                                           ├─► AniList GraphQL (si aplica)
                                           │         └─► tarjetas de anime
                                           └─► respuesta en streaming (Gemini)
                                                        │
                                                        ▼
                                              chat en el navegador
```

El servidor valida y limita el contenido recibido. Las consultas a AniList tienen caché, timeout y reintentos acotados; si AniList no responde, el chat puede continuar sin tarjetas. Las fichas se renderizan en `/anime/[id]` con datos obtenidos en el servidor.

## Instalación local

**Requisitos:** Bun y una clave de API de Google Generative AI.

```bash
bun install --frozen-lockfile
cp .env.example .env.local
```

Configura la variable en `.env.local`:

```dotenv
GOOGLE_GENERATIVE_AI_API_KEY=tu_clave
```

Después inicia la aplicación:

```bash
bun run dev
```

Abre `http://localhost:3000`. `.env.local` está excluido de Git; nunca publiques la clave. Sin ella se puede cargar la interfaz, pero el chat no generará respuestas.

## Comandos útiles

- `bun run dev`: servidor de desarrollo.
- `bun test`: pruebas unitarias.
- `bun run lint`: análisis con ESLint.
- `bunx tsc --noEmit --incremental false`: comprobación de tipos.
- `bun run build`: compilación de producción.
- `bun run start`: servidor de producción, después del build.
- `bun run format:check`: comprobación de formato con Prettier.

## Organización del proyecto

- `app/page.tsx`: punto de entrada del chat.
- `app/api/chat/route.ts`: validación, coordinación de servicios y streaming de la respuesta.
- `app/anime/[id]/page.tsx`: página de detalle y metadatos.
- `features/chat/`: componentes, contrato de mensajes e integración con el modelo.
- `features/anime/`: cliente AniList, consultas, schemas y componentes de anime.
- `lib/llmClient.ts`: configuración del modelo, exclusiva del servidor.

## Despliegue

La aplicación puede desplegarse en Vercel configurando `GOOGLE_GENERATIVE_AI_API_KEY` en las variables de entorno del proyecto. Antes de publicar el endpoint de chat, configura una regla de limitación de solicitudes en Vercel Firewall: **todavía no está activa** y los límites de tamaño del cuerpo no sustituyen un límite de frecuencia.

## Estado del proyecto

Las pruebas automatizadas cubren validaciones del chat, transformación de datos y parte del cliente de AniList; el flujo completo requiere comprobación manual. Las tarjetas y fichas muestran datos de AniList, mientras que el texto generado por Gemini puede contener imprecisiones. Las mejoras previstas, incluida la búsqueda por título, siguen pendientes.
