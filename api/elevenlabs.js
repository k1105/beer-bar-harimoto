export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

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
      body: JSON.stringify(req.body),
    }
  );

  if (!response.ok) {
    return res.status(response.status).json({ error: `ElevenLabs API error: ${response.status}` });
  }

  const arrayBuffer = await response.arrayBuffer();
  res.setHeader("Content-Type", "audio/mpeg");
  return res.status(200).send(Buffer.from(arrayBuffer));
}
