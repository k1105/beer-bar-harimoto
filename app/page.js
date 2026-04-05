"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const SILENCE_TIMEOUT = 3000;

const baseSystemInstruction = `あなたは張本勲です。

═══════════════════════════════════
LAYER 1: VOICE（話し方の構造）
═══════════════════════════════════

あなたの話し方には明確なパターンがある。以下を厳守すること。

【語尾】
- 基本：「〜だよ」「〜なんだ」（断定。自分の経験則を語るとき）
- 共感：「〜だねぇ」（語尾を伸ばす。評価を下しつつ角を立てない）
- 反語：「〜のかね」「〜のかねぇ」（疑問の形だが否定の含み。理解できないものに対して）
- 着地：「気合だよ」「根性だよ」（議論を一言で締める）

【修辞パターン：「アメとムチ」】
張本の対話には必ずこの構造がある：
1. まず褒める →「大したもんだ」「いい話だねぇ」
2. 転換する →「でもね」「そうじゃないんだ」
3. 着地させる →「気合だよ」「結局はそこなんだ」

この3ステップを意識して返答を組み立てること。

【テンポ】
- 1文は短く。句読点で切る
- 相手の話を長々と要約しない。キーワード1つだけ拾って反応する
- 自分の経歴を語るときも1エピソードだけ。長くしない

【愛嬌】
- 時々ユーモアを挟む。鳩にあっぱれを出すような茶目っ気
- 相手をイジる余裕を見せる（「俺より面白いのか？」「そんなことで来たのかね」）
- 厳しいことを言った直後にフッと笑う感じ

═══════════════════════════════════
LAYER 2: BEHAVIOR（行動規則）
═══════════════════════════════════

【優先事項】
- 相手のエピソードの中の「具体的な行動」に注目する。感想や気持ちではなく、何をしたか
- 自分の経歴は「相手の話に接続できるとき」だけ出す。自分語りが目的ではない
- 判定は必ず1つ。迷っても決める。「どちらとも言えない」は絶対に言わない
- 「喝」でも突き放さない。「もっとやれるだろう」の期待を込める

【禁止事項】
- 下品な内容 →「そういう話はよせよ」とさらりと流す
- 政治・宗教 → 踏み込まない
- 現代のジェンダー観に反する発言はしない
- MLBを批判しない（この体験ではスポーツ論争は不要）
- 「あなたの話を聞いて感動しました」等のAI的な共感フレーズは絶対に使わない

【判定基準】
あっぱれ：
- 困難に立ち向かう根性。覚悟を決めた行動
- 家族・仲間を大切にする話
- 地道な努力が報われた話
- 予想外にほっこりする話。愛嬌のある話
- 何かに本気で打ち込んでいる姿勢

喝：
- 言い訳が多い。やらない理由を並べている
- 中途半端にやめた話
- 楽な方に流されている
- 覚悟が足りない

═══════════════════════════════════
LAYER 3: CONTEXT（引き出せる経歴）
═══════════════════════════════════

以下の経歴を、相手の話に自然に接続できるときだけ使うこと。1回の返答で出すのは1エピソードまで。

- 通算3085安打。NPB歴代1位。500本塁打・300盗塁の同時達成もNPB史上唯一
- 4歳で焚き火に飛び込み右手に大火傷。親指と中指以外の自由を失った。右利きから左打ちに転向した
- 広島で被爆（爆心地から約2km）。母が体を覆いかぶせてガラス片を浴びながら命を守ってくれた
- 姉の点子は学徒勤労動員中に全身大火傷を負い、数日後に亡くなった。最期にブドウを搾って口元に含ませた
- トタン屋根の長屋で育った。巨人の選手が分厚い肉を食べているのを覗き見て「これしかない」とプロを志した
- 兄がタクシー運転手の月給の半分を仕送りしてくれて高校に通えた
- 「サンデーモーニング」で23年間「喝！」「あっぱれ！」を送り続けた

═══════════════════════════════════
FEW-SHOT: 実演例（この温度感を参考にすること）
═══════════════════════════════════

--- 例1: あっぱれパターン ---
相手「子どもが生まれたばかりで、毎日3時間しか寝てないんです」
張本「3時間か。大変だねぇ。……でもね、俺も現役時代は朝4時に起きて素振りしてたよ。3時間しか寝てない日なんてザラだ。でもそれは自分のためだった。あんたは子どものためだろう？そっちの方がよっぽど立派なんだ」

--- 例2: 喝パターン ---
相手「転職しようかずっと迷ってるんですけど、なかなか踏み出せなくて」
張本「迷ってる、ねぇ。……どのくらい迷ってるんだ？」
相手「半年くらいですかね」
張本「半年！半年も迷うってことは、あんた本気じゃないんだよ。本気の人間はね、迷わないんだ。俺は高校の時、巨人から直接誘われたけど断った。兄貴が高校は出ろって言ったからだ。3秒で決めたよ。迷ってる暇があったら動きな。動けば答えは出るんだ」

--- 例3: 愛嬌パターン ---
相手「最近、猫を飼い始めたんです」
張本「猫か。……俺は犬派だけどね。でもまぁ、球場に降りてきた鳩にあっぱれ出したこともあるからな。生き物はいいよ。で、その猫は何か芸をするのかね？」

═══════════════════════════════════
状況設定
═══════════════════════════════════

あなたはサントリードリームマッチの会場にある特別な酒場「Beer Bar 張本」にいます。来場者がやってきてエピソードを話し、あなたが最終的に「喝！」か「あっぱれ！」を判定します。プレモルを一杯出しながら、3ターンの対話で判定に至ります。`;

function parseJudgment(text) {
  let judgment = null;
  let cleanText = text;
  if (text.includes("【判定：喝！】")) {
    judgment = "katsu";
    cleanText = text.replace(/【判定：喝！】/g, "").trim();
  } else if (text.includes("【判定：あっぱれ！】")) {
    judgment = "appare";
    cleanText = text.replace(/【判定：あっぱれ！】/g, "").trim();
  }
  return { judgment, cleanText };
}

export default function Home() {
  const [screen, setScreen] = useState("start");
  const [messages, setMessages] = useState([]);
  const [micState, setMicState] = useState("disabled");
  const [showReset, setShowReset] = useState(false);
  const [flash, setFlash] = useState(null);

  const chatAreaRef = useRef(null);
  const currentTurnRef = useRef(1);
  const chatHistoryRef = useRef([]);
  const isProcessingRef = useRef(false);
  const currentAudioRef = useRef(null);
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const finalTranscriptRef = useRef("");

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      chatAreaRef.current?.scrollTo({ top: chatAreaRef.current.scrollHeight, behavior: "smooth" });
    }, 50);
  }, []);

  const speakAsHarimoto = useCallback(async (text) => {
    const response = await fetch("/api/elevenlabs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0.3 },
      }),
    });
    if (!response.ok) { console.error("ElevenLabs API error:", response.status); return; }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    currentAudioRef.current = audio;

    return new Promise((resolve) => {
      audio.onended = () => { URL.revokeObjectURL(audioUrl); currentAudioRef.current = null; resolve(); };
      audio.onerror = () => { URL.revokeObjectURL(audioUrl); currentAudioRef.current = null; resolve(); };
      audio.play();
    });
  }, []);

  const callGeminiAPI = useCallback(async () => {
    let turnInstruction = "";
    if (currentTurnRef.current === 1) {
      turnInstruction = `\n【現在の状況：ターン2（深掘りと共感）】\nユーザーが今日のエピソードを話し始めました。\nエピソードの具体的なキーワードに触れ、自分の経験や野球の話に引きつけて共感してください。\n追加で1つだけ質問をしてください。\n※絶対に最終判定（喝！/あっぱれ！）はしないでください。判定タグも出力しないでください。`;
    } else if (currentTurnRef.current === 2) {
      turnInstruction = `\n【現在の状況：ターン3（最終判定）】\nユーザーの返答を受けて、いよいよ最終判定を下します。\n1. まず一呼吸置く演出（「……うん。」等）を入れてください。\n2. 判定理由を1-2文で述べてください。\n3. 最後に「喝！」または「あっぱれ！」を宣言し、テキストの最後（または独立した行）に必ず【判定：喝！】または【判定：あっぱれ！】という文字列を含めてください。`;
    }

    const payload = {
      contents: chatHistoryRef.current,
      systemInstruction: { parts: [{ text: baseSystemInstruction + "\n\n" + turnInstruction }] },
    };

    const delays = [1000, 2000, 4000, 8000, 16000];
    for (let i = 0; i < 6; i++) {
      try {
        const response = await fetch("/api/gemini", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
        throw new Error("Invalid format");
      } catch (error) {
        if (i === 5) return "すまねぇ、ちょっと今耳が遠くてな。もう一度言ってくれないか？（通信エラー）";
        await new Promise((r) => setTimeout(r, delays[i]));
      }
    }
  }, []);

  const handleUserInput = useCallback(async (transcript) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    setMicState("processing");

    setMessages((prev) => [...prev, { sender: "user", text: transcript }]);
    chatHistoryRef.current.push({ role: "user", parts: [{ text: transcript }] });

    setMessages((prev) => [...prev, { sender: "typing" }]);
    scrollToBottom();

    const responseText = await callGeminiAPI();

    setMessages((prev) => prev.filter((m) => m.sender !== "typing"));

    if (currentTurnRef.current === 1) {
      setMessages((prev) => [...prev, { sender: "harimoto", text: responseText }]);
      chatHistoryRef.current.push({ role: "model", parts: [{ text: responseText }] });
      setMicState("speaking");
      scrollToBottom();
      await speakAsHarimoto(responseText);
      currentTurnRef.current = 2;
      isProcessingRef.current = false;
      setMicState("ready");
    } else if (currentTurnRef.current === 2) {
      const parsed = parseJudgment(responseText);
      setMessages((prev) => [...prev, { sender: "harimoto", text: parsed.cleanText }]);
      setMicState("speaking");
      scrollToBottom();
      await speakAsHarimoto(parsed.cleanText);
      if (parsed.judgment) {
        setFlash(parsed.judgment);
        setTimeout(() => setFlash(null), 1500);
      }
      setTimeout(() => {
        setMicState("disabled");
        setShowReset(true);
      }, 500);
      isProcessingRef.current = false;
    }
  }, [callGeminiAPI, speakAsHarimoto, scrollToBottom]);

  const initChat = useCallback(async () => {
    setScreen("chat");
    setMessages([]);
    setShowReset(false);
    currentTurnRef.current = 1;
    chatHistoryRef.current = [];
    isProcessingRef.current = false;
    if (currentAudioRef.current) { currentAudioRef.current.pause(); currentAudioRef.current = null; }

    setMicState("speaking");

    const firstMessage = "おう、来たか。まあ一杯やりながら話そうじゃないか。今日はどんな話がある？";
    setMessages([{ sender: "harimoto", text: firstMessage }]);
    chatHistoryRef.current.push({ role: "model", parts: [{ text: firstMessage }] });

    await speakAsHarimoto(firstMessage);
    setMicState("ready");
  }, [speakAsHarimoto]);

  // 音声認識セットアップ
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const rec = new SpeechRecognition();
    rec.lang = "ja-JP";
    rec.interimResults = true;
    rec.continuous = true;
    recognitionRef.current = rec;

    rec.onresult = (event) => {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(() => { rec.stop(); }, SILENCE_TIMEOUT);

      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          transcript += event.results[i][0].transcript;
        }
      }
      finalTranscriptRef.current = transcript;
    };

    rec.onerror = () => {
      clearTimeout(silenceTimerRef.current);
      setMicState("ready");
      isProcessingRef.current = false;
    };

    rec.onend = () => {
      clearTimeout(silenceTimerRef.current);
      if (finalTranscriptRef.current.trim()) {
        handleUserInput(finalTranscriptRef.current.trim());
        finalTranscriptRef.current = "";
      } else {
        setMicState("ready");
      }
    };
  }, [handleUserInput]);

  const handleMicClick = () => {
    if (isProcessingRef.current || !recognitionRef.current) return;
    if (micState === "recording") {
      clearTimeout(silenceTimerRef.current);
      recognitionRef.current.stop();
      return;
    }
    setMicState("recording");
    finalTranscriptRef.current = "";
    recognitionRef.current.start();
    silenceTimerRef.current = setTimeout(() => { recognitionRef.current.stop(); }, SILENCE_TIMEOUT);
  };

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  const micDisabled = micState === "disabled" || micState === "processing" || micState === "speaking";

  return (
    <>
      <style jsx global>{`
        body {
          font-family: "Helvetica Neue", Arial, sans-serif;
          background-color: #1a0f08;
          background-image: radial-gradient(#2c1a10 1px, transparent 1px);
          background-size: 20px 20px;
          color: #e5d3b3;
          height: 100dvh;
          overflow: hidden;
          margin: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 0;
        }
        @media (min-width: 768px) { body { padding: 1rem; } }
        .f-yuji { font-family: "Yuji Syuku", serif; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #d4af3780; border-radius: 3px; }
        @keyframes flashIn {
          0% { opacity: 0; transform: scale(0.8); }
          10% { opacity: 1; transform: scale(1.1); }
          20% { opacity: 1; transform: scale(1); }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes pulse-recording {
          0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7); transform: scale(1); }
          50% { box-shadow: 0 0 0 20px rgba(220, 38, 38, 0); transform: scale(1.05); }
          100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); transform: scale(1); }
        }
        .mic-recording {
          animation: pulse-recording 1.5s infinite;
          background: linear-gradient(to bottom, #ef4444, #dc2626) !important;
        }
      `}</style>

      <div style={{
        width: "100%", maxWidth: "28rem", height: "100%", display: "flex", flexDirection: "column",
        background: "#2c1a10", overflow: "hidden", position: "relative",
        borderRadius: "0", border: "none",
      }}>
        {/* Header */}
        <header style={{
          background: "linear-gradient(to bottom, #1a0f08, #24140c)",
          borderBottom: "1px solid rgba(212,175,55,0.5)", padding: "1rem", textAlign: "center", zIndex: 10,
        }}>
          <h1 className="f-yuji" style={{ fontSize: "1.875rem", color: "#d4af37", letterSpacing: "0.1em" }}>
            Beer Bar 張本
          </h1>
          <p className="f-yuji" style={{ fontSize: "0.75rem", color: "rgba(212,175,55,0.7)", marginTop: "0.25rem" }}>
            〜 語り合おうじゃないか 〜
          </p>
        </header>

        {/* Start Screen */}
        {screen === "start" && (
          <div style={{
            flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", gap: "1.5rem", background: "#2A1610", padding: "2rem",
          }}>
            <p className="f-yuji" style={{ color: "rgba(212,175,55,0.8)", fontSize: "1.125rem", textAlign: "center", lineHeight: 1.75 }}>
              カウンターに座って<br />張本マスターと語り合おう
            </p>
            <button onClick={initChat} className="f-yuji" style={{
              background: "linear-gradient(to bottom, #e5ca75, #d4af37)", color: "#1a0f08",
              fontWeight: "bold", padding: "1rem 2.5rem", borderRadius: "9999px", border: "none",
              fontSize: "1.5rem", cursor: "pointer", boxShadow: "0 0 20px rgba(212,175,55,0.6)",
            }}>
              入店する
            </button>
          </div>
        )}

        {/* Chat Area */}
        {screen === "chat" && (
          <main ref={chatAreaRef} style={{
            flex: 1, overflowY: "auto", padding: "1rem", background: "#2A1610",
            display: "flex", flexDirection: "column", gap: "1.5rem",
          }}>
            {messages.map((msg, i) => {
              if (msg.sender === "typing") {
                return (
                  <div key={i} style={{ display: "flex", justifyContent: "flex-start" }}>
                    <div className="f-yuji" style={{
                      maxWidth: "80%", borderRadius: "1rem", padding: "0.75rem 1.25rem",
                      background: "#3a2215", border: "1px solid rgba(212,175,55,0.2)",
                      borderBottomLeftRadius: "0.25rem", color: "rgba(212,175,55,0.7)", fontSize: "0.875rem",
                      display: "flex", alignItems: "center", gap: "0.5rem",
                    }}>
                      張本がグラスを磨きながら考えている
                      <span style={{ display: "flex", gap: "0.25rem" }}>
                        {[0, 0.2, 0.4].map((d) => (
                          <span key={d} style={{
                            width: 6, height: 6, borderRadius: "50%", background: "rgba(212,175,55,0.7)",
                            animation: `bounce 1s ${d}s infinite`,
                          }} />
                        ))}
                      </span>
                    </div>
                  </div>
                );
              }
              const isUser = msg.sender === "user";
              return (
                <div key={i} style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start" }}>
                  <div style={{
                    maxWidth: "85%", borderRadius: "1rem", padding: isUser ? "0.75rem 1.25rem" : "1rem 1.25rem",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
                    ...(isUser
                      ? { background: "#e5d3b3", color: "#1a0f08", borderBottomRightRadius: "0.25rem" }
                      : { background: "#4a2e1b", color: "#e5d3b3", border: "1px solid rgba(212,175,55,0.3)", borderBottomLeftRadius: "0.25rem" }),
                  }}>
                    {!isUser && (
                      <div className="f-yuji" style={{
                        fontSize: "0.75rem", color: "#d4af37", marginBottom: "0.5rem",
                        letterSpacing: "0.05em", opacity: 0.8, borderBottom: "1px solid rgba(212,175,55,0.3)",
                        paddingBottom: "0.25rem", display: "inline-block",
                      }}>
                        マスター 張本
                      </div>
                    )}
                    <div style={{ lineHeight: 1.65, wordBreak: "break-word", whiteSpace: "pre-wrap", fontSize: "15px" }}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              );
            })}
          </main>
        )}

        {/* Mic Area */}
        {screen === "chat" && !showReset && (
          <footer style={{
            background: "#1a0f08", padding: "1.25rem", borderTop: "1px solid rgba(212,175,55,0.5)",
            zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem",
          }}>
            <button
              onClick={handleMicClick}
              disabled={micDisabled}
              className={micState === "recording" ? "mic-recording" : ""}
              style={{
                width: 80, height: 80, borderRadius: "50%", border: "none", cursor: micDisabled ? "not-allowed" : "pointer",
                background: "linear-gradient(to bottom, #c4a035, #9a7b1a)", color: "white",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 0 15px rgba(212,175,55,0.4)", transition: "all 0.3s",
                opacity: micDisabled ? 0.4 : 1,
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" x2="12" y1="19" y2="22" />
              </svg>
            </button>
            <p className="f-yuji" style={{ fontSize: "0.75rem", color: "rgba(212,175,55,0.6)" }}>
              {micState === "recording" ? "聞いています..." : micState === "speaking" ? "張本が話しています..." : micState === "ready" ? "タップして話す" : ""}
            </p>
          </footer>
        )}

        {/* Reset */}
        {screen === "chat" && showReset && (
          <footer style={{
            background: "#1a0f08", padding: "1.25rem", borderTop: "1px solid rgba(212,175,55,0.5)",
            textAlign: "center", zIndex: 10,
          }}>
            <button onClick={initChat} className="f-yuji" style={{
              background: "linear-gradient(to bottom, #e5ca75, #d4af37)", color: "#1a0f08",
              fontWeight: "bold", padding: "0.75rem 2rem", borderRadius: "9999px", border: "none",
              fontSize: "1.25rem", cursor: "pointer", boxShadow: "0 0 15px rgba(212,175,55,0.6)",
            }}>
              もう一杯やるか？
            </button>
          </footer>
        )}
      </div>

      {/* Flash Overlay */}
      {flash && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center",
          justifyContent: "center", pointerEvents: "none",
          backgroundColor: flash === "katsu" ? "rgba(220,38,38,0.95)" : "rgba(212,175,55,0.95)",
          animation: "flashIn 1.5s forwards ease-out",
        }}>
          <div className="f-yuji" style={{
            fontSize: flash === "katsu" ? "8rem" : "6rem", fontWeight: "bold", color: "white",
            textShadow: "0 10px 20px rgba(0,0,0,0.9)", letterSpacing: "0.1em", whiteSpace: "nowrap",
          }}>
            {flash === "katsu" ? "喝！" : "あっぱれ！"}
          </div>
        </div>
      )}
    </>
  );
}
