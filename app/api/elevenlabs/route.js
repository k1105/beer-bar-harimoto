export async function POST(request) {
  const body = await request.json();
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID;

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    return Response.json(
      { error: `ElevenLabs API error: ${response.status}` },
      { status: response.status }
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  return new Response(arrayBuffer, {
    headers: { "Content-Type": "audio/mpeg" },
  });
}
