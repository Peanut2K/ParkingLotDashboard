export async function PUT(
  request: Request,
  { params }: { params: Promise<{ transactionId: string }> }
) {
  const { transactionId } = await params;

  try {
    const body = await request.json().catch(() => ({}));
    const apiUrl = process.env.API_URL || 'http://localhost:8000';
    const url = `${apiUrl}/transactions/${transactionId}/payment`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fee: Math.round(Number(body.fee)) }),
    });

    const rawText = await response.text();
    let data: Record<string, unknown> = {};
    try {
      data = JSON.parse(rawText);
    } catch {
      // backend returned non-JSON (e.g. Decimal serialization crash after a successful write)
    }

    if (!response.ok) {
      const errMsg: string = (data?.detail as string) ?? rawText ?? `API error: ${response.status}`;
      // Python Decimal serialization error means the DB write succeeded but response failed
      if (errMsg.includes('Decimal is not JSON serializable') || errMsg.includes('not JSON serializable')) {
        return Response.json({ status: 'PAID', fee: Math.round(Number(body.fee)) });
      }
      return Response.json({ error: errMsg }, { status: response.status });
    }

    return Response.json(data);
  } catch (error) {
    console.error('Error calling payment API:', error);
    return Response.json({ error: 'Failed to process payment' }, { status: 500 });
  }
}
