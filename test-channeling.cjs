// テスト用スクリプト: test-audio-generation.js
// Node.jsで実行してElevenLabs APIをテスト

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
    console.log('💡 環境変数を直接設定してください');
  }
}

// 環境変数を読み込み
loadEnv();

async function testAudioGeneration() {
  console.log('🎙️ ElevenLabs音声生成テスト開始...');
  
  // 環境変数チェック
  const API_KEY = process.env.ELEVENLABS_API_KEY;
  const VOICE_ID = process.env.ELEVENLABS_VOICE_ID;
  
  if (!API_KEY) {
    console.error('❌ ELEVENLABS_API_KEY が設定されていません');
    return;
  }
  
  if (!VOICE_ID) {
    console.error('❌ ELEVENLABS_VOICE_ID が設定されていません');
    return;
  }
  
  console.log('✅ API_KEY:', API_KEY.substring(0, 10) + '...');
  console.log('✅ VOICE_ID:', VOICE_ID);
  
  // テスト用テキスト（日本語での話し方指示付き）
  const testText = `いまから、あなたのたましいの声と しずかに つながる じかんを ひらきます。

ことばを こえた ところに、ひかりのように そっと おりてくる かんかくを、ただ、まっすぐに うけとって ください。

これは こたえを さがすための じかんでは なく、あなた じしんの うちなる うちゅうに、みみを すますための れんしゅうです。

めを とじて、こきゅうを ふかく していきましょう。`;
  
  const headers = {
    'Accept': 'audio/mpeg',
    'Content-Type': 'application/json',
    'xi-api-key': API_KEY,
  };
  
  const data = {
    text: testText,
    model_id: 'eleven_multilingual_v2',
    voice_settings: {
      stability: 0.9,           // 最大安定性（訛り軽減）
      similarity_boost: 0.95,   // 最大類似性（標準語維持）
      style: 0.0,              // スタイル無し（自然な発音）
      use_speaker_boost: true
    },
    // 標準語・ゆっくりペース指定
    voice_guidance: "Speak in standard Tokyo Japanese with slow, meditative pace, perfect pronunciation, no regional accent or dialect. Create mystical spiritual atmosphere with natural pauses between phrases.",
    output_format: 'mp3_44100_128'
  };
  
  try {
    console.log('📡 ElevenLabs APIにリクエスト送信中...');
    
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    
    console.log('📨 レスポンス状態:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ APIエラー:', errorText);
      return;
    }
    
    // 音声データを取得
    const audioBuffer = await response.arrayBuffer();
    console.log('🎵 音声データサイズ:', audioBuffer.byteLength, 'bytes');
    
    // テスト用ディレクトリ作成
    const testDir = './test-audio';
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    
    // ファイル保存
    const filename = `test_${Date.now()}.mp3`;
    const filepath = path.join(testDir, filename);
    fs.writeFileSync(filepath, Buffer.from(audioBuffer));
    
    console.log('✅ 音声ファイル保存完了:', filepath);
    console.log('🎉 テスト成功！音声ファイルを再生して確認してください。');
    
  } catch (error) {
    console.error('❌ テスト失敗:', error.message);
  }
}

// 利用可能なボイス一覧を取得する関数
async function listAvailableVoices() {
  console.log('🎤 利用可能なボイス一覧を取得中...');
  
  const API_KEY = process.env.ELEVENLABS_API_KEY;
  
  if (!API_KEY) {
    console.error('❌ ELEVENLABS_API_KEY が設定されていません');
    return;
  }
  
  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'Accept': 'application/json',
        'xi-api-key': API_KEY,
      }
    });
    
    if (!response.ok) {
      console.error('❌ ボイス一覧取得エラー:', response.status);
      return;
    }
    
    const data = await response.json();
    console.log('\n📋 利用可能なボイス:');
    data.voices.forEach((voice, index) => {
      console.log(`${index + 1}. 名前: ${voice.name}`);
      console.log(`   ID: ${voice.voice_id}`);
      console.log(`   カテゴリ: ${voice.category || 'N/A'}`);
      console.log('   ---');
    });
    
  } catch (error) {
    console.error('❌ ボイス一覧取得エラー:', error.message);
  }
}

// コマンドライン引数に応じて実行
const args = process.argv.slice(2);

if (args.includes('--voices')) {
  listAvailableVoices();
} else {
  testAudioGeneration();
}

console.log('\n💡 使用方法:');
console.log('node test-audio-generation.js          # 音声生成テスト');
console.log('node test-audio-generation.js --voices # ボイス一覧表示');