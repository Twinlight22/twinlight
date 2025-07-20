// Next.js API Routes の場合: pages/api/generate-audio.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, voice = 'ja-JP-Standard-A', speed = 0.8 } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'テキストが入力されていません' });
    }

    // Google Cloud TTS REST API 呼び出し
    const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GOOGLE_CLOUD_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: { text: text.trim() },
        voice: {
          languageCode: 'ja-JP',
          name: voice, // 日本語音声（女性：ja-JP-Standard-A, 男性：ja-JP-Standard-C）
          ssmlGender: 'FEMALE' // または 'MALE'
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: speed, // 話速（0.25-4.0, デフォルト1.0）
          pitch: 0, // ピッチ（-20.0-20.0, デフォルト0）
          volumeGainDb: 0 // 音量（-96.0-16.0, デフォルト0）
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Google Cloud TTS API呼び出しに失敗しました');
    }

    const data = await response.json();
    
    // Base64エンコードされた音声データをData URIに変換
    const audioDataUri = `data:audio/mp3;base64,${data.audioContent}`;

    res.status(200).json({
      audioUrl: audioDataUri,
      duration: estimateAudioDuration(text.trim()) // 概算時間
    });

  } catch (error) {
    console.error('Google Cloud TTS Error:', error);
    res.status(500).json({
      error: '音声生成中にエラーが発生しました',
      details: error.message
    });
  }
}

// 音声の概算時間計算（文字数ベース）
function estimateAudioDuration(text) {
  // 日本語の平均読み上げ速度: 約300文字/分（ゆっくり目）
  const charactersPerMinute = 250; // チャネリング用にさらにゆっくり
  const minutes = text.length / charactersPerMinute;
  return Math.ceil(minutes * 60); // 秒単位で返す
}

// 音声の概算時間計算（文字数ベース）
function estimateAudioDuration(text) {
  // 日本語の平均読み上げ速度: 約300文字/分
  const charactersPerMinute = 300;
  const minutes = text.length / charactersPerMinute;
  return Math.ceil(minutes * 60); // 秒単位で返す
}
