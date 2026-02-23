export async function GET() {
  try {
    const apiUrl = process.env.API_URL || 'http://localhost:8000';
    const response = await fetch(`${apiUrl}/health`, {
      cache: 'no-store',
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return Response.json({ error: `API error: ${response.status}` }, { status: response.status });
    }

    return Response.json(data);
  } catch (error) {
    console.error('Error calling health API:', error);
    return Response.json({ error: 'Failed to fetch health status' }, { status: 500 });
  }
}
