import { getBackendUrl } from '@/utils/backendUrl';

export const dynamic = 'force-dynamic';

/** Verify Vercel → Render backend connectivity using NEXT_PUBLIC_BACKEND_URL */
export async function GET() {
  const backend = getBackendUrl();

  if (!process.env.NEXT_PUBLIC_BACKEND_URL && !process.env.NEXT_PUBLIC_SOCKET_URL) {
    return Response.json(
      {
        ok: false,
        configured: false,
        error: 'Set NEXT_PUBLIC_BACKEND_URL (or NEXT_PUBLIC_SOCKET_URL) in Vercel env vars',
      },
      { status: 503 }
    );
  }

  try {
    const res = await fetch(`${backend}/api/health`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    });
    const data = await res.json().catch(() => ({}));

    return Response.json({
      ok: res.ok,
      configured: true,
      backend,
      status: res.status,
      health: data,
    });
  } catch (err) {
    return Response.json(
      {
        ok: false,
        configured: true,
        backend,
        error: err instanceof Error ? err.message : 'Backend unreachable',
      },
      { status: 502 }
    );
  }
}
