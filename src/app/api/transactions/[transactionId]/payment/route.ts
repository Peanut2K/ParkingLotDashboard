export async function PUT(
  _request: Request,
  { params }: { params: Promise<{ transactionId: string }> }
) {
  const { transactionId } = await params;

  try {
    const apiUrl = process.env.API_URL || 'http://localhost:8000';
    const url = `${apiUrl}/transactions/${transactionId}/payment`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return Response.json(
        { error: data?.detail ?? `API error: ${response.status}` },
        { status: response.status }
      );
    }

    return Response.json(data);
  } catch (error) {
    console.error('Error calling payment API:', error);
    return Response.json({ error: 'Failed to process payment' }, { status: 500 });
  }
}
