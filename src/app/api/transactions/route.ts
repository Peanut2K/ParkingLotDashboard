export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const license_plate = searchParams.get('license_plate');

  if (!license_plate) {
    return Response.json({ error: 'Missing license_plate parameter' }, { status: 400 });
  }

  try {
    const apiUrl = process.env.API_URL || 'http://localhost:8000';
    const url = `${apiUrl}/transactions?license_plate=${encodeURIComponent(license_plate)}&active=true`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Error fetching from backend:', error);
    return Response.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
