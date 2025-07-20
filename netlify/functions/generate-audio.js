// netlify/functions/generate-audio.js

export const handler = async (event, context) => {
  // CORS設定
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // OPTIONSリクエスト（プリフライト）への対応
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { text, voice = 'ja-JP-Standard-A', speed = 0.8, pitch = 0 } = JSON.parse(event.body);

    if (!text || !text.trim()) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'テキストが入力されていません' })
      };
    }

    console.log('TTS生成開始:', text.slice(0, 50) + '...');

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
          name: voice,
          ssmlGender: voice.includes('Standard-A') || voice.includes('Standard-B') ? 'FEMALE' : 'MALE'
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: speed, // 0.8でゆっくり目
          pitch: pitch, // -2〜2くらいで調整可能
          volumeGainDb: 2 // 少し音量上げる
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Google Cloud TTS Error:', errorData);
      throw new Error(errorData.error?.message || 'TTS API呼び出し失敗');
    }

    const data = await response.json();
    
    // Base64エンコードされた音声データをData URIに変換
    const audioDataUri = `data:audio/mp3;base64,${data.audioContent}`;

    // 音声の概算時間計算
    function estimateAudioDuration(text) {
      const charactersPerMinute = 250; // チャネリング用にゆっくり目
      const minutes = text.length / charactersPerMinute;
      return Math.ceil(minutes * 60);
    }

    console.log('TTS生成完了');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        audioUrl: audioDataUri,
        duration: estimateAudioDuration(text.trim()),
        voice: voice,
        speed: speed
      })
    };

  } catch (error) {
    console.error('TTS Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: '音声生成エラー',
        details: error.message
      })
    };
  }
};