import kuromoji from "kuromoji";
import path from "path";

let tokenizerPromise = null;

function getTokenizer() {
  if (!tokenizerPromise) {
    tokenizerPromise = new Promise((resolve, reject) => {
      const dicPath = path.join(
        process.cwd(),
        "node_modules/kuromoji/dict"
      );
      kuromoji.builder({ dicPath }).build((err, tokenizer) => {
        if (err) reject(err);
        else resolve(tokenizer);
      });
    });
  }
  return tokenizerPromise;
}

function katakanaToHiragana(str) {
  return str.replace(/[\u30A1-\u30F6]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60)
  );
}

// 固有名詞・未知語だけひらがなに置換
// 一般的な漢字はそのまま残して抑揚を保つ
async function fixMisreadings(text) {
  const tokenizer = await getTokenizer();
  const tokens = tokenizer.tokenize(text);

  return tokens
    .map((token) => {
      const surface = token.surface_form;
      const reading = token.reading;

      if (!reading || reading === "*") return surface;

      // ひらがな・カタカナのみはそのまま
      if (/^[\u3040-\u309F\u30A0-\u30FF\uFF65-\uFF9Fー]+$/.test(surface)) return surface;

      const pos = token.pos;
      const posDetail = token.pos_detail_1;

      // 固有名詞（人名・地名の読み間違い防止）
      if (pos === "名詞" && posDetail === "固有名詞") {
        return katakanaToHiragana(reading);
      }

      // 辞書にない未知語
      if (token.word_type === "UNKNOWN") {
        return katakanaToHiragana(reading);
      }

      return surface;
    })
    .join("");
}

export async function POST(request) {
  const body = await request.json();
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID;

  const originalText = body.text || "";
  const convertedText = await fixMisreadings(originalText);

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...body,
        text: convertedText,
      }),
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
