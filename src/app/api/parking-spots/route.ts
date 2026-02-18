export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const floor_id = searchParams.get('floor_id');

  try {
    // ใช้ API_URL สำหรับ server-side (ไม่ใช่ NEXT_PUBLIC_)
    const apiUrl = process.env.API_URL || 'http://localhost:8000';
    let url = `${apiUrl}/parking-spots`;
    
    console.log('Backend API URL:', url);

    if (floor_id) {
      url += `?floor_id=${encodeURIComponent(floor_id)}`;
    }
    
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Error fetching parking spots from backend:', error);
    return Response.json({ error: 'Failed to fetch parking spots' }, { status: 500 });
  }
}
