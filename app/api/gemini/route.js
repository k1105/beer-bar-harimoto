export async function POST(request) {
  const body = await request.json();
  const apiKey = process.env.GEMINI_API_KEY;
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    return Response.json(
      { error: `Gemini API error: ${response.status}` },
      { status: response.status }
    );
  }

  const data = await response.json();
  return Response.json(data);
}
