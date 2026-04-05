# Beer Bar 張本 音声版 — 実装手順書

_スマホのブラウザ1台で完結する音声対話バットのプロトタイプ_

## 前提（完了済み）

- [x] ElevenLabsアカウント作成
- [x] 張本さんの音声を収集・切り出し（対談動画からBGM除去→手動トリミング）
- [x] ElevenLabsにInstant Voice Cloneとしてアップロード済み
- [x] ElevenLabs APIキー取得済み（権限: テキスト読み上げ + ボイス読み取り）
- [x] Voice ID取得済み
- [x] Gemini APIキーは既存プロトと同じものを使用

**APIキーは `.env` ファイルで管理する前提：**

```
GEMINI_API_KEY=xxxxx
ELEVENLABS_API_KEY=xxxxx
ELEVENLABS_VOICE_ID=xxxxx
```

## システム構成

```
[スマホ（ブラウザ）]
  │
  ├── 入力: マイク → Web Speech API (STT)
  │         テキスト化された発話
  │              ↓
  ├── 処理: Gemini API (張本AIの応答生成)
  │         応答テキスト
  │              ↓
  ├── 出力: ElevenLabs API (TTS、張本の声)
  │         生成された音声
  │              ↓
  ├── 再生: スピーカーから張本の声で再生
  │
  └── 演出: 判定時にスマホ画面全体をフラッシュ
            喝 → 赤  /  あっぱれ → 金
```

全てブラウザ上のJavaScriptで完結。サーバーサイド不要（APIキーの読み込み方式のみ要検討。デモ用なら直埋め込みでOK）。

## 技術スタック

| 機能 | 技術 | 備考 |
|---|---|---|
| 音声認識(STT) | Web Speech API (`SpeechRecognition`) | Chrome/Safari対応。無料。日本語対応 |
| AI応答 | Gemini 2.5 Flash (REST API) | 既存プロトと同じ |
| 音声合成(TTS) | ElevenLabs API (Instant Voice Clone) | 張本の声クローン済み |
| UI/演出 | HTML/CSS/JS | 既存プロトのCSS演出を流用 |
| ホスティング | GitHub Pages or Vercel or localhost | 静的HTMLのみ |

## 実装手順

### Step 1: 既存プロトを音声版にリファクタ

既存の `index.html`（Beer Bar張本テキスト版）をベースに改修する。テキスト版のシステムプロンプト、ターン制御、判定パース、フラッシュ演出はそのまま流用する。

**変更箇所：**

#### 1-1. APIキーを.envから読み込む

`.env` から `GEMINI_API_KEY`, `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID` を読み込む。
静的HTMLの場合は Vite 等のビルドツールを使うか、デモ用ならJSに直接埋め込みでもOK。

#### 1-2. テキスト入力 → 音声入力に置き換え

```javascript
// Web Speech API の初期化
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'ja-JP';
recognition.interimResults = false;  // 確定結果のみ
recognition.continuous = false;      // 1発話で停止

// マイクボタンタップで録音開始、認識完了で自動停止
recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    handleUserInput(transcript);
};

recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    // "no-speech" の場合は「おい、黙ってないで話しな」的な張本の返しを入れてもいい
};
```

#### 1-3. テキスト表示 → 音声再生に置き換え

```javascript
// ElevenLabs TTS
async function speakAsHarimoto(text) {
    const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
        {
            method: 'POST',
            headers: {
                'xi-api-key': ELEVENLABS_API_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: text,
                model_id: 'eleven_multilingual_v2',
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.8,
                    style: 0.3,
                }
            })
        }
    );

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    
    return new Promise((resolve) => {
        audio.onended = resolve;
        audio.play();
    });
}
```

#### 1-4. UI変更

- テキスト入力フォーム（`<footer id="inputArea">`）を削除
- 代わりに中央に大きな丸い「マイクボタン」を配置
  - デフォルト: 暗めの金色
  - 録音中: 赤く脈動するアニメーション
  - 処理中（Gemini/ElevenLabs待ち）: 既存の「グラスを磨きながら考えている」演出を流用
- チャットバブルは字幕として残す（聴覚だけだと聞き取れない場合がある）
- 判定フラッシュ演出（`showFlash()`）は既存のまま流用
- 張本の発話中はマイクボタンを無効化（多重録音防止）

#### 1-5. フロー制御

```
[起動] 
  → 張本「おう、来たか。まあ一杯やりながら話そうじゃないか。今日はどんな話がある？」
  → speakAsHarimoto() でTTS再生
  → 再生完了後、マイクボタン有効化

[ターン1: ユーザー発話]
  → マイクボタンタップ → recognition.start() → 録音
  → STT完了 → テキスト化 → チャットバブルに表示
  → Gemini API（深掘りターン。既存のturnInstruction使用）
  → 応答テキスト → チャットバブルに表示 + speakAsHarimoto()で再生
  → 再生完了後、マイクボタン再有効化

[ターン2: ユーザー返答]
  → マイクボタンタップ → 録音 → STT → テキスト化
  → Gemini API（判定ターン。既存のturnInstruction使用）
  → 応答テキスト → parseJudgment()で判定検出
  → チャットバブルに表示 + speakAsHarimoto()で再生
  → 再生完了後、判定フラッシュ演出（画面全体 赤 or 金）
  → 「もう一杯やるか？」ボタン表示
```

### Step 2: テスト/調整

- [ ] Web Speech APIの日本語認識精度を確認（雑音環境でのテスト）
- [ ] ElevenLabsの張本声の品質確認（口調・速度の調整）
  - `stability`, `similarity_boost`, `style` のパラメータをチューニング
  - stability低め(0.3-0.5)だと感情表現が豊かになるが不安定に
  - similarity_boost高め(0.7-0.9)だと本人らしさが増す
- [ ] Gemini APIのレスポンス速度確認（体感の待ち時間）
- [ ] スマホスピーカーの音量確認
- [ ] HTTPS環境での動作確認（Web Speech APIはHTTPS必須）

### Step 3: バット統合（物理デモ用）

- おもちゃのプラスチックバットを購入（ドンキ等で径の大きいもの）
- スマホをバットの内部または外側に固定
- スピーカーがバットの外に向くように配置
- マイクは先端側（話しかける方向）に向ける
- 判定時にスマホ画面のフラッシュがバットを内側から光らせる

## ファイル構成

```
beer-bar-voice/
├── index.html      # メインアプリ（単一ファイルで完結可）
├── .env            # APIキー（GEMINI_API_KEY, ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID）
└── README.md       # セットアップ手順
```

## 既存プロトから流用するもの

- システムプロンプト（`baseSystemInstruction`）: 張本のキャラクター設定、3レイヤー構造、Few-Shot例
- ターン制御（`currentTurn`, `turnInstruction`）: 深掘り→判定の2ターン構造
- 判定パース（`parseJudgment()`）: 【判定：喝！】/【判定：あっぱれ！】タグ検出
- フラッシュ演出（`showFlash()`）: 赤/金のフルスクリーンフラッシュ
- UIテーマ: バーの雰囲気（背景色、フォント、ゴールドアクセント）
- Gemini APIのリトライロジック（`callGeminiAPI()`のexponential backoff）

## 注意事項

- Web Speech APIはHTTPS必須（localhost or GitHub Pages）
- iOS Safariでは Web Speech API の挙動が異なる場合あり。Chromeで動作確認推奨
- ElevenLabsの無料プランは月10,000文字まで。デモ用途なら十分
- 張本の声のクローンは本人確認済みの前提（山岸さんが確認担当）
