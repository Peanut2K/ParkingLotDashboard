export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const floor_id = searchParams.get('floor_id');

  const apiUrl = process.env.API_URL || 'http://localhost:8000';
  let backendUrl = `${apiUrl}/parking-spots/stream`;

  if (floor_id) {
    backendUrl += `?floor_id=${encodeURIComponent(floor_id)}`;
  }

  try {
    const backendResponse = await fetch(backendUrl, {
      headers: { Accept: 'text/event-stream' },
    });

    // Pipe stream จาก backend ส่งต่อไปยัง client
    return new Response(backendResponse.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error) {
    console.error('SSE proxy error:', error);
    return new Response('data: {"error": "Failed to connect to backend"}\n\n', {
      status: 500,
      headers: { 'Content-Type': 'text/event-stream' },
    });
  }
}
