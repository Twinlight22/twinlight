// test-google-tts.cjs
// Google Cloud Text-to-Speech テスト

const fs = require('fs');
const path = require('path');

// .envファイルを手動で読み込む関数
function loadEnv() {
  try {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      const envFile = fs.readFileSync(envPath, 'utf8');
      const lines = envFile.split('\n');
      
      for (const line of lines) {
        const [key, value] = line.split('=');
        if (key && value) {
          process.env[key.trim()] = value.trim();
        }
      }
    }
  } catch (error) {
    console.log('💡 .envファイルが見つからないか読み込めません');
  }
}

loadEnv();

async function testGoogleTTS() {
  console.log('🗣️ Google Cloud Text-to-Speech テスト開始...');
  
  const API_KEY = process.env.GOOGLE_CLOUD_API_KEY;
  
  if (!API_KEY) {
    console.error('❌ GOOGLE_CLOUD_API_KEY が設定されていません');
    console.log('💡 .envファイルに GOOGLE_CLOUD_API_KEY=your_key を追加してください');
    return;
  }
  
  console.log('✅ API_KEY:', API_KEY.substring(0, 10) + '...');
  
  // 元の漢字分量に戻したテキスト
  const testText = `いまから、あなたの魂の声と静かにつながる時間をひらきます。

言葉を超えたところに、光のようにそっと降りてくる感覚を、ただ、まっすぐに受け取ってください。

これは答えを探すための時間ではなく、あなた自身の内なる宇宙に、耳をすますための練習です。

目を閉じて、呼吸を深くしていきましょう。`;

  const requestBody = {
    input: { text: testText },
    voice: {
      languageCode: 'ja-JP',
      name: 'ja-JP-Neural2-B', // 女性の声、自然な音質
      ssmlGender: 'FEMALE'
    },
    audioConfig: {
      audioEncoding: 'MP3',
      speakingRate: 0.7,      // さらにゆっくり（0.8 → 0.7）
      pitch: -1.0,            // 少し低めのピッチで落ち着いた感じ
      volumeGainDb: 2.0,      // 音量を少し上げる
      effectsProfileId: ['large-home-entertainment-class-device'], // エコー効果のあるプロファイル
      sampleRateHertz: 24000  // 高音質
    }
  };

  try {
    console.log('📡 Google Cloud APIにリクエスト送信中...');
    
    const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📨 レスポンス状態:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ APIエラー:', errorText);
      return;
    }

    const result = await response.json();
    
    if (!result.audioContent) {
      console.error('❌ 音声データが返されませんでした');
      return;
    }

    // Base64デコードして音声ファイル保存
    const audioBuffer = Buffer.from(result.audioContent, 'base64');
    console.log('🎵 音声データサイズ:', audioBuffer.length, 'bytes');

    // テスト用ディレクトリ作成
    const testDir = './test-audio';
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }

    // ファイル保存
    const filename = `google_tts_${Date.now()}.mp3`;
    const filepath = path.join(testDir, filename);
    fs.writeFileSync(filepath, audioBuffer);

    console.log('✅ Google TTS音声ファイル保存完了:', filepath);
    console.log('🎉 テスト成功！音声ファイルを再生して品質を確認してください。');
    console.log('🆚 ElevenLabsと比較してみてください！');

  } catch (error) {
    console.error('❌ テスト失敗:', error.message);
  }
}

// 利用可能な日本語音声一覧を取得
async function listJapaneseVoices() {
  console.log('🎤 日本語音声一覧を取得中...');
  
  const API_KEY = process.env.GOOGLE_CLOUD_API_KEY;
  
  if (!API_KEY) {
    console.error('❌ GOOGLE_CLOUD_API_KEY が設定されていません');
    return;
  }

  try {
    const response = await fetch(`https://texttospeech.googleapis.com/v1/voices?key=${API_KEY}`, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      console.error('❌ 音声一覧取得エラー:', response.status);
      return;
    }

    const data = await response.json();
    const japaneseVoices = data.voices.filter(voice => 
      voice.languageCodes.includes('ja-JP')
    );

    console.log('\n📋 利用可能な日本語音声:');
    japaneseVoices.forEach((voice, index) => {
      console.log(`${index + 1}. 名前: ${voice.name}`);
      console.log(`   性別: ${voice.ssmlGender}`);
      console.log(`   タイプ: ${voice.name.includes('Neural') ? 'Neural (高品質)' : 'Standard'}`);
      console.log('   ---');
    });

  } catch (error) {
    console.error('❌ 音声一覧取得エラー:', error.message);
  }
}

// コマンドライン引数に応じて実行
const args = process.argv.slice(2);

if (args.includes('--voices')) {
  listJapaneseVoices();
} else {
  testGoogleTTS();
}

console.log('\n💡 使用方法:');
console.log('node test-google-tts.cjs          # Google TTS テスト');
console.log('node test-google-tts.cjs --voices # 日本語音声一覧表示');