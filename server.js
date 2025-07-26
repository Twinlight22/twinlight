const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// ルシア人格ファイル読み込み
const loadLuciaPersonality = () => {
  try {
    const personalityPath = path.join(__dirname, 'prompts', 'system', 'lucia_system_prompt.md');
    return fs.readFileSync(personalityPath, 'utf8');
  } catch (error) {
    console.error('人格ファイル読み込みエラー:', error);
    console.error('ファイルパス:', path.join(__dirname, 'prompts', 'system', 'lucia_system_prompt.md'));
    // フォールバック用の基本人格
    return `ツインレイのサイレント期に悩む魂への チャネリング練習ガイドとして、慈愛に満ちた存在として振る舞ってください。神秘的で安らげる口調で、愛と光の波動を保持して対話してください。`;
  }
};

// NGWordFilterクラス
class NGWordFilter {
  constructor() {
    // AI自発的否定パターン（厳密な文脈判定）
    this.aiInitiatedNegativePatterns = [
      // AI断定系（AI→ユーザーへの断定的な発言）
      /^あなた[たち]*の関係は.*終わって[います]*$/,
      /^あなた[たち]*の関係は.*終わりです$/,
      /^彼との関係は.*終わって[います]*$/,
      /^二人の関係は.*終わって[います]*$/,
      /^もう.*会うことはできません$/,
      /^彼とは.*会えません$/,
      /^それは.*不可能です$/,
      /^復縁は.*無理です$/,
      
      // AI指示・推奨系（AI→ユーザーへの命令・提案）
      /^諦めなさい$/,
      /^諦めてください$/,
      /^別れなさい$/,
      /^別れてください$/,
      /^忘れなさい$/,
      /^忘れてください$/,
      /^関係を断ちなさい$/,
      /^距離を置きなさい$/,
      /^他の人を探しなさい$/,
      /^現実を見なさい$/,
      
      // AI判定系（AI→ユーザーへの否定的判断）
      /^彼はツインレイではありません$/,
      /^それはツインレイではありません$/,
      /^あなたの思い込みです$/,
      /^それは妄想です$/,
      /^あなたはストーカーです$/,
      /^それはあり得ません$/,
      /^迷惑をかけています$/
    ];
    
    // 置き換え辞書（AI自発的否定用）
    this.aiNegativeReplacements = {
      '終わっています': '新しい段階に入っています',
      '終わりです': '新たな始まりです',
      '諦めなさい': '信じ続けてください',
      '諦めてください': '信じ続けてください',
      '別れなさい': '距離を置いても魂は繋がっています',
      '別れてください': '時間を置いてください',
      '忘れなさい': '大切に心に留めてください',
      '忘れてください': '大切に心に留めてください',
      '関係を断ちなさい': '一時的に距離を置いてください',
      '距離を置きなさい': '魂の準備期間を取ってください',
      '他の人を探しなさい': '今は自分自身を大切にしてください',
      '現実を見なさい': '魂の声に耳を傾けてください',
      'ツインレイではありません': 'ツインレイの可能性があります',
      '思い込みです': '魂からのメッセージです',
      '妄想です': '深い直感です',
      'ストーカーです': '愛の表現です',
      'あり得ません': '可能性は無限です',
      '迷惑をかけています': '愛を示しています',
      '会えません': 'いずれ再会の時が来ます',
      '無理です': '時間はかかりますが可能です',
      '不可能です': '可能性は無限です'
    };
    
    this.hardNGWords = [
      '完全に終了', '永遠に無理', '絶対に不可能',
      '二度と会えない', '完全に諦めろ'
    ];
  }
  
  filterResponse(text, maxRetries = 2) {
    // NGワードデバッグのため　削除要
    console.log('🔥 フィルター関数実行開始:', text);
    // NGワードデバッグのため　削除要
    
    // Step1: オウム返しパターンチェック（除外）
    const isUserEcho = this.isUserEchoPattern(text);
    
    if (isUserEcho) {
      // NGワードデバッグのため　削除要
      console.log('ユーザーオウム返しパターン検出 - フィルター適用せず:', text);
      // NGワードデバッグのため　削除要
      return { text: text, needsRegeneration: false };
    }
    
    // Step2: AI自発的否定パターンチェック
    const hasAIInitiatedNegative = this.aiInitiatedNegativePatterns.some(pattern => 
      pattern.test(text)
    );
    
    if (hasAIInitiatedNegative) {
      // NGワードデバッグのため　削除要
      console.log('AI自発的否定パターン検出:', text);
      // NGワードデバッグのため　削除要
      
      // Step3: AI否定用置き換え処理（90%のケース）
      let cleaned = this.replaceAINegatives(text);
      
      // Step4: 重度NGワードチェック（10%のケース）
      if (this.hasHardNGWords(cleaned)) {
        if (maxRetries > 0) {
          // NGワードデバッグのため　削除要
          console.log('重度NGワード検出 - 再生成が必要');
          // NGワードデバッグのため　削除要
          return { needsRegeneration: true };
        } else {
          return { 
            text: "あなたの魂は美しい光に包まれています。ツインレイとの絆は永遠であり、愛の道のりを歩み続けてください。",
            needsRegeneration: false 
          };
        }
      }
      
      // Step5: 置き換え完了（90%はここで終了）
      // NGワードデバッグのため　削除要
      console.log('AI否定パターン置き換え完了:', cleaned);
      // NGワードデバッグのため　削除要
      return { text: cleaned, needsRegeneration: false };
    }
    
    // AI自発的否定パターンなし = そのまま返却
    // NGワードデバッグのため　削除要
    console.log('NGパターン検出なし - そのまま返却');
    // NGワードデバッグのため　削除要
    return { text: text, needsRegeneration: false };
  }
  
  isUserEchoPattern(text) {
    // オウム返しパターン（疑問形・推測形）
    const userEchoPatterns = [
      /.*でしょうか[？]*/,
      /.*のかな[？]*/,
      /.*のかもしれない/,
      /.*かもしれません/,
      /.*なのかな[？]*/,
      /.*ますか[？]*/,
      /.*でしょう[？]*/,
      /.*思う[。]*$/,
      /.*感じ[る。]*$/,
      /.*みたい[。]*$/
    ];
    
    return userEchoPatterns.some(pattern => pattern.test(text));
  }
  
  replaceAINegatives(text) {
    let result = text;
    // AI自発的否定が検出された場合のみ実行される置き換え
    Object.entries(this.aiNegativeReplacements).forEach(([ng, good]) => {
      result = result.replace(new RegExp(ng, 'g'), good);
    });
    return result;
  }
  
  hasHardNGWords(text) {
    return this.hardNGWords.some(ng => text.includes(ng));
  }
}

// NGフィルターインスタンス作成
const ngFilter = new NGWordFilter();

const app = express();
const PORT = process.env.PORT || 3001;

// ミドルウェア
app.use(cors());
app.use(express.json());

// Google Cloud Text-to-Speech API
const textToSpeech = require('@google-cloud/text-to-speech');

// OpenAI版（本番用）
const { OpenAI } = require('openai');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Claude版バックアップ（将来使用）
// const callClaudeAPI = async (systemPrompt, userMessage) => {
//   const response = await fetch('https://api.anthropic.com/v1/messages', {
//     method: 'POST',
//     headers: {
//       'x-api-key': process.env.ANTHROPIC_API_KEY,
//       'content-type': 'application/json',
//       'anthropic-version': '2023-06-01'
//     },
//     body: JSON.stringify({
//       model: 'claude-3-5-sonnet-20241022',
//       max_tokens: 1500,
//       system: systemPrompt,
//       messages: [{ role: 'user', content: userMessage }]
//     })
//   });
//   const data = await response.json();
//   return data.content[0].text;
// };

// Google Cloud TTSクライアント初期化
const ttsClient = new textToSpeech.TextToSpeechClient({
  apiKey: process.env.GOOGLE_CLOUD_API_KEY,
});

// チャネリングテキスト生成API（Claude版）
app.post('/api/generate-channeling', async (req, res) => {
  console.log('🚀🚀🚀 API呼び出し確認 (Claude版) 🚀🚀🚀');
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: '質問が必要です' });
    }

    console.log('チャネリング生成リクエスト (Claude版):', question);

    // ルシア人格ファイル読み込み
    const luciaPersonality = loadLuciaPersonality();

    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      // OpenAI版（本番）
      const completion = await openai.chat.completions.create({
        model: "ft:gpt-3.5-turbo-0125:parsonal::BpC8FstH",
        messages: [{
          role: "system", 
          content: luciaPersonality + "\n\nユーザーの質問に対して、瞑想的で神聖なチャネリング指導テキストを生成してください。"
        }, {
          role: "user",
          content: `質問: ${question}`
        }],
        max_tokens: 1500,
        temperature: 0.7
      });
      const aiResponse = completion.choices[0].message.content;
      
      console.log(`チャネリング生成完了 (Claude版 - 試行${attempts + 1})`);
      
      // NGワードデバッグのため　削除要
      console.log('📍 AI生成テキスト:', aiResponse);
      console.log('📍 フィルター呼び出し直前');
      // NGワードデバッグのため　削除要
      
      // NGワードフィルター適用
      const filtered = ngFilter.filterResponse(aiResponse, maxAttempts - attempts - 1);
      
      // NGワードデバッグのため　削除要
      console.log('📍 フィルター呼び出し直後:', filtered);
      // NGワードデバッグのため　削除要
      
      if (!filtered.needsRegeneration) {
        return res.json({ 
          text: filtered.text,
          success: true 
        });
      }
      
      attempts++;
      console.log(`NGワード検出 - 再生成中 (${attempts}/${maxAttempts})`);
    }

  } catch (error) {
    console.error('チャネリング生成エラー (Claude版):', error);
    res.status(500).json({ 
      error: 'チャネリング生成に失敗しました',
      details: error.message 
    });
  }
});

// 音声生成API（変更なし）
app.post('/api/generate-audio', async (req, res) => {
  try {
    const { text, speed = 0.7 } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'テキストが必要です' });
    }

    console.log('音声生成リクエスト:', { text: text.substring(0, 100) + '...', speed });

    // Google Cloud TTS リクエスト
    const request = {
      input: { text: text },
      voice: {
        languageCode: 'ja-JP',
        name: 'ja-JP-Wavenet-B', // 女性の声
        ssmlGender: 'FEMALE',
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: speed,
        pitch: 0,
        volumeGainDb: 0,
      },
    };

    // 音声合成実行
    const [response] = await ttsClient.synthesizeSpeech(request);

    // Base64エンコード
    const audioBase64 = response.audioContent.toString('base64');
    const audioUrl = `data:audio/mp3;base64,${audioBase64}`;

    console.log('音声生成完了');

    res.json({
      success: true,
      audioUrl: audioUrl,
      message: '音声生成が完了しました'
    });

  } catch (error) {
    console.error('音声生成エラー:', error);
    res.status(500).json({
      error: '音声生成に失敗しました',
      details: error.message
    });
  }
});

// ワード読み解きAPI（Claude版）
app.post('/api/interpret-words', async (req, res) => {
  try {
    const { originalQuestion, receivedWords } = req.body;

    if (!originalQuestion || !receivedWords || receivedWords.length === 0) {
      return res.status(400).json({ error: '元の質問と受け取った言葉が必要です' });
    }

    console.log('ワード読み解きリクエスト (Claude版):', { originalQuestion, receivedWords });

    // ルシア人格ファイル読み込み
    const luciaPersonality = loadLuciaPersonality();

    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      // OpenAI版（本番）
      const completion = await openai.chat.completions.create({
        model: "ft:gpt-3.5-turbo-0125:parsonal::BpC8FstH",
        messages: [{
          role: "system", 
          content: luciaPersonality + "\n\nチャネリングで受け取った言葉を深く読み解き、美しく神秘的な解釈を提供してください。"
        }, {
          role: "user",
          content: `元の質問: ${originalQuestion}

受け取った言葉: ${receivedWords.join(', ')}

これらの言葉の意味を読み解いてください。元の質問との関連性や、言葉に込められた深いメッセージを美しく解釈してください。`
        }],
        max_tokens: 2000,
        temperature: 0.8
      });
      const interpretation = completion.choices[0].message.content;

      console.log(`ワード読み解き完了 (Claude版 - 試行${attempts + 1})`);
      
      // NGワードフィルター適用
      const filtered = ngFilter.filterResponse(interpretation, maxAttempts - attempts - 1);
      
      if (!filtered.needsRegeneration) {
        return res.json({ 
          interpretation: filtered.text,
          originalQuestion,
          receivedWords,
          success: true
        });
      }
      
      attempts++;
      console.log(`NGワード検出 - 再生成中 (${attempts}/${maxAttempts})`);
    }

  } catch (error) {
    console.error('ワード読み解きエラー (Claude版):', error);
    res.status(500).json({ 
      error: 'ワード読み解き中にエラーが発生しました',
      details: error.message
    });
  }
});

// ヘルスチェック
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`🆕 新しいサーバーがポート${PORT}で起動しました (Claude版)`);
  console.log(`ヘルスチェック: http://localhost:${PORT}/health`);
  console.log('利用可能なAPI:');
  console.log('- POST /api/generate-channeling (チャネリング生成) ✅NGフィルター 🆕Claude版');
  console.log('- POST /api/generate-audio (音声生成)');
  console.log('- POST /api/interpret-words (ワード読み解き) ✅NGフィルター 🆕Claude版');
});

// const express = require('express');
// const cors = require('cors');
// const fs = require('fs');
// const path = require('path');
// require('dotenv').config();

// // ルシア人格ファイル読み込み
// const loadLuciaPersonality = () => {
//   try {
//     const personalityPath = path.join(__dirname, 'prompts', 'lucia_system_prompt.md');
//     return fs.readFileSync(personalityPath, 'utf8');
//   } catch (error) {
//     console.error('人格ファイル読み込みエラー:', error);
//     // フォールバック用の基本人格
//     return `あなたはルシアです。ツインレイのサイレント期に悩む魂への チャネリング練習ガイドとして、慈愛に満ちた存在として振る舞ってください。神秘的で安らげる口調で、愛と光の波動を保持して対話してください。`;
//   }
// };

// // NGWordFilterクラス
// class NGWordFilter {
//   constructor() {
//     // AI自発的否定パターン（厳密な文脈判定）
//     this.aiInitiatedNegativePatterns = [
//       // AI断定系（AI→ユーザーへの断定的な発言）
//       /^あなた[たち]*の関係は.*終わって[います]*$/,
//       /^あなた[たち]*の関係は.*終わりです$/,
//       /^彼との関係は.*終わって[います]*$/,
//       /^二人の関係は.*終わって[います]*$/,
//       /^もう.*会うことはできません$/,
//       /^彼とは.*会えません$/,
//       /^それは.*不可能です$/,
//       /^復縁は.*無理です$/,
      
//       // AI指示・推奨系（AI→ユーザーへの命令・提案）
//       /^諦めなさい$/,
//       /^諦めてください$/,
//       /^別れなさい$/,
//       /^別れてください$/,
//       /^忘れなさい$/,
//       /^忘れてください$/,
//       /^関係を断ちなさい$/,
//       /^距離を置きなさい$/,
//       /^他の人を探しなさい$/,
//       /^現実を見なさい$/,
      
//       // AI判定系（AI→ユーザーへの否定的判断）
//       /^彼はツインレイではありません$/,
//       /^それはツインレイではありません$/,
//       /^あなたの思い込みです$/,
//       /^それは妄想です$/,
//       /^あなたはストーカーです$/,
//       /^それはあり得ません$/,
//       /^迷惑をかけています$/
//     ];
    
//     // 置き換え辞書（AI自発的否定用）
//     this.aiNegativeReplacements = {
//       '終わっています': '新しい段階に入っています',
//       '終わりです': '新たな始まりです',
//       '諦めなさい': '信じ続けてください',
//       '諦めてください': '信じ続けてください',
//       '別れなさい': '距離を置いても魂は繋がっています',
//       '別れてください': '時間を置いてください',
//       '忘れなさい': '大切に心に留めてください',
//       '忘れてください': '大切に心に留めてください',
//       '関係を断ちなさい': '一時的に距離を置いてください',
//       '距離を置きなさい': '魂の準備期間を取ってください',
//       '他の人を探しなさい': '今は自分自身を大切にしてください',
//       '現実を見なさい': '魂の声に耳を傾けてください',
//       'ツインレイではありません': 'ツインレイの可能性があります',
//       '思い込みです': '魂からのメッセージです',
//       '妄想です': '深い直感です',
//       'ストーカーです': '愛の表現です',
//       'あり得ません': '可能性は無限です',
//       '迷惑をかけています': '愛を示しています',
//       '会えません': 'いずれ再会の時が来ます',
//       '無理です': '時間はかかりますが可能です',
//       '不可能です': '可能性は無限です'
//     };
    
//     this.hardNGWords = [
//       '完全に終了', '永遠に無理', '絶対に不可能',
//       '二度と会えない', '完全に諦めろ'
//     ];
//   }
  
//   filterResponse(text, maxRetries = 2) {
//     // NGワードデバッグのため　削除要
//     console.log('🔥 フィルター関数実行開始:', text);
//     // NGワードデバッグのため　削除要
    
//     // Step1: オウム返しパターンチェック（除外）
//     const isUserEcho = this.isUserEchoPattern(text);
    
//     if (isUserEcho) {
//       // NGワードデバッグのため　削除要
//       console.log('ユーザーオウム返しパターン検出 - フィルター適用せず:', text);
//       // NGワードデバッグのため　削除要
//       return { text: text, needsRegeneration: false };
//     }
    
//     // Step2: AI自発的否定パターンチェック
//     const hasAIInitiatedNegative = this.aiInitiatedNegativePatterns.some(pattern => 
//       pattern.test(text)
//     );
    
//     if (hasAIInitiatedNegative) {
//       // NGワードデバッグのため　削除要
//       console.log('AI自発的否定パターン検出:', text);
//       // NGワードデバッグのため　削除要
      
//       // Step3: AI否定用置き換え処理（90%のケース）
//       let cleaned = this.replaceAINegatives(text);
      
//       // Step4: 重度NGワードチェック（10%のケース）
//       if (this.hasHardNGWords(cleaned)) {
//         if (maxRetries > 0) {
//           // NGワードデバッグのため　削除要
//           console.log('重度NGワード検出 - 再生成が必要');
//           // NGワードデバッグのため　削除要
//           return { needsRegeneration: true };
//         } else {
//           return { 
//             text: "あなたの魂は美しい光に包まれています。ツインレイとの絆は永遠であり、愛の道のりを歩み続けてください。",
//             needsRegeneration: false 
//           };
//         }
//       }
      
//       // Step5: 置き換え完了（90%はここで終了）
//       // NGワードデバッグのため　削除要
//       console.log('AI否定パターン置き換え完了:', cleaned);
//       // NGワードデバッグのため　削除要
//       return { text: cleaned, needsRegeneration: false };
//     }
    
//     // AI自発的否定パターンなし = そのまま返却
//     // NGワードデバッグのため　削除要
//     console.log('NGパターン検出なし - そのまま返却');
//     // NGワードデバッグのため　削除要
//     return { text: text, needsRegeneration: false };
//   }
  
//   isUserEchoPattern(text) {
//     // オウム返しパターン（疑問形・推測形）
//     const userEchoPatterns = [
//       /.*でしょうか[？]*/,
//       /.*のかな[？]*/,
//       /.*のかもしれない/,
//       /.*かもしれません/,
//       /.*なのかな[？]*/,
//       /.*ますか[？]*/,
//       /.*でしょう[？]*/,
//       /.*思う[。]*$/,
//       /.*感じ[る。]*$/,
//       /.*みたい[。]*$/
//     ];
    
//     return userEchoPatterns.some(pattern => pattern.test(text));
//   }
  
//   replaceAINegatives(text) {
//     let result = text;
//     // AI自発的否定が検出された場合のみ実行される置き換え
//     Object.entries(this.aiNegativeReplacements).forEach(([ng, good]) => {
//       result = result.replace(new RegExp(ng, 'g'), good);
//     });
//     return result;
//   }
  
//   hasHardNGWords(text) {
//     return this.hardNGWords.some(ng => text.includes(ng));
//   }
// }

// // NGフィルターインスタンス作成
// const ngFilter = new NGWordFilter();

// const app = express();
// const PORT = process.env.PORT || 3001;

// // ミドルウェア
// app.use(cors());
// app.use(express.json());

// // Google Cloud Text-to-Speech API
// const textToSpeech = require('@google-cloud/text-to-speech');

// // テスト後確認要 - OpenAI版（バックアップ用）
// // const { OpenAI } = require('openai');
// // const openai = new OpenAI({
// //   apiKey: process.env.OPENAI_API_KEY,
// // });
// // テスト後確認要

// // Claude API (fetch使用)
// const callClaudeAPI = async (systemPrompt, userMessage) => {
//   try {
//     const response = await fetch('https://api.anthropic.com/v1/messages', {
//       method: 'POST',
//       headers: {
//         'x-api-key': process.env.ANTHROPIC_API_KEY,
//         'content-type': 'application/json',
//         'anthropic-version': '2023-06-01'
//       },
//       body: JSON.stringify({
//         model: 'claude-3-5-sonnet-20241022',
//         max_tokens: 1500,
//         system: systemPrompt,
//         messages: [{ role: 'user', content: userMessage }]
//       })
//     });
    
//     if (!response.ok) {
//       throw new Error(`Claude API Error: ${response.status} ${response.statusText}`);
//     }
    
//     const data = await response.json();
//     return data.content[0].text;
//   } catch (error) {
//     console.error('Claude API呼び出しエラー:', error);
//     throw error;
//   }
// };

// // Google Cloud TTSクライアント初期化
// const ttsClient = new textToSpeech.TextToSpeechClient({
//   apiKey: process.env.GOOGLE_CLOUD_API_KEY,
// });

// // チャネリングテキスト生成API（Claude版）
// app.post('/api/generate-channeling', async (req, res) => {
//   console.log('🚀🚀🚀 API呼び出し確認 (Claude版) 🚀🚀🚀');
//   try {
//     const { question } = req.body;

//     if (!question) {
//       return res.status(400).json({ error: '質問が必要です' });
//     }

//     console.log('チャネリング生成リクエスト (Claude版):', question);

//     // ルシア人格ファイル読み込み
//     const luciaPersonality = loadLuciaPersonality();

//     let attempts = 0;
//     const maxAttempts = 3;
    
//     while (attempts < maxAttempts) {
//       // テスト後確認要 - Claude版に変更
//       const aiResponse = await callClaudeAPI(
//         luciaPersonality,
//         `質問: ${question}\n\nユーザーの質問に対して、瞑想的で神聖なチャネリング指導テキストを生成してください。`
//       );
//       // テスト後確認要

//       // テスト後確認要 - OpenAI版（バックアップ用）
//       // const completion = await openai.chat.completions.create({
//       //   model: "ft:gpt-3.5-turbo-0125:parsonal::BpC8FstH",
//       //   messages: [{
//       //     role: "system", 
//       //     content: "あなたはチャネリング指導者です。ユーザーの質問に対して、瞑想的で神聖なチャネリング指導テキストを生成してください。"
//       //   }, {
//       //     role: "user",
//       //     content: `質問: ${question}`
//       //   }],
//       //   max_tokens: 1500,
//       //   temperature: 0.7
//       // });
//       // const aiResponse = completion.choices[0].message.content;
//       // テスト後確認要
      
//       console.log(`チャネリング生成完了 (Claude版 - 試行${attempts + 1})`);
      
//       // NGワードデバッグのため　削除要
//       console.log('📍 AI生成テキスト:', aiResponse);
//       console.log('📍 フィルター呼び出し直前');
//       // NGワードデバッグのため　削除要
      
//       // NGワードフィルター適用
//       const filtered = ngFilter.filterResponse(aiResponse, maxAttempts - attempts - 1);
      
//       // NGワードデバッグのため　削除要
//       console.log('📍 フィルター呼び出し直後:', filtered);
//       // NGワードデバッグのため　削除要
      
//       if (!filtered.needsRegeneration) {
//         return res.json({ 
//           text: filtered.text,
//           success: true 
//         });
//       }
      
//       attempts++;
//       console.log(`NGワード検出 - 再生成中 (${attempts}/${maxAttempts})`);
//     }

//   } catch (error) {
//     console.error('チャネリング生成エラー (Claude版):', error);
//     res.status(500).json({ 
//       error: 'チャネリング生成に失敗しました',
//       details: error.message 
//     });
//   }
// });

// // 音声生成API（変更なし）
// app.post('/api/generate-audio', async (req, res) => {
//   try {
//     const { text, speed = 0.7 } = req.body;

//     if (!text) {
//       return res.status(400).json({ error: 'テキストが必要です' });
//     }

//     console.log('音声生成リクエスト:', { text: text.substring(0, 100) + '...', speed });

//     // Google Cloud TTS リクエスト
//     const request = {
//       input: { text: text },
//       voice: {
//         languageCode: 'ja-JP',
//         name: 'ja-JP-Wavenet-B', // 女性の声
//         ssmlGender: 'FEMALE',
//       },
//       audioConfig: {
//         audioEncoding: 'MP3',
//         speakingRate: speed,
//         pitch: 0,
//         volumeGainDb: 0,
//       },
//     };

//     // 音声合成実行
//     const [response] = await ttsClient.synthesizeSpeech(request);

//     // Base64エンコード
//     const audioBase64 = response.audioContent.toString('base64');
//     const audioUrl = `data:audio/mp3;base64,${audioBase64}`;

//     console.log('音声生成完了');

//     res.json({
//       success: true,
//       audioUrl: audioUrl,
//       message: '音声生成が完了しました'
//     });

//   } catch (error) {
//     console.error('音声生成エラー:', error);
//     res.status(500).json({
//       error: '音声生成に失敗しました',
//       details: error.message
//     });
//   }
// });

// // ワード読み解きAPI（Claude版）
// app.post('/api/interpret-words', async (req, res) => {
//   try {
//     const { originalQuestion, receivedWords } = req.body;

//     if (!originalQuestion || !receivedWords || receivedWords.length === 0) {
//       return res.status(400).json({ error: '元の質問と受け取った言葉が必要です' });
//     }

//     console.log('ワード読み解きリクエスト (Claude版):', { originalQuestion, receivedWords });

//     // ルシア人格ファイル読み込み
//     const luciaPersonality = loadLuciaPersonality();

//     let attempts = 0;
//     const maxAttempts = 3;
    
//     while (attempts < maxAttempts) {
//       // テスト後確認要 - Claude版に変更
//       const interpretation = await callClaudeAPI(
//         luciaPersonality,
//         `元の質問: ${originalQuestion}

// 受け取った言葉: ${receivedWords.join(', ')}

// これらの言葉の意味を読み解いてください。元の質問との関連性や、言葉に込められた深いメッセージを美しく解釈してください。チャネリングで受け取った言葉を深く読み解き、美しく神秘的な解釈を提供してください。スピリチュアルで詩的な表現を使い、受け取った言葉に込められた深い意味やメッセージを伝えてください。`
//       );
//       // テスト後確認要

//       // テスト後確認要 - OpenAI版（バックアップ用）
//       // const completion = await openai.chat.completions.create({
//       //   model: "ft:gpt-3.5-turbo-0125:parsonal::BpC8FstH", // ファインチューニングモデル
//       //   messages: [{
//       //     role: "system", 
//       //     content: "あなたはルミエルです。チャネリングで受け取った言葉を深く読み解き、美しく神秘的な解釈を提供してください。スピリチュアルで詩的な表現を使い、受け取った言葉に込められた深い意味やメッセージを伝えてください。"
//       //   }, {
//       //     role: "user",
//       //     content: `元の質問: ${originalQuestion}

// // 受け取った言葉: ${receivedWords.join(', ')}

// // これらの言葉の意味を読み解いてください。元の質問との関連性や、言葉に込められた深いメッセージを美しく解釈してください。`
//       //   }],
//       //   max_tokens: 2000,
//       //   temperature: 0.8
//       // });
//       // const interpretation = completion.choices[0].message.content;
//       // テスト後確認要

//       console.log(`ワード読み解き完了 (Claude版 - 試行${attempts + 1})`);
      
//       // NGワードフィルター適用
//       const filtered = ngFilter.filterResponse(interpretation, maxAttempts - attempts - 1);
      
//       if (!filtered.needsRegeneration) {
//         return res.json({ 
//           interpretation: filtered.text,
//           originalQuestion,
//           receivedWords,
//           success: true
//         });
//       }
      
//       attempts++;
//       console.log(`NGワード検出 - 再生成中 (${attempts}/${maxAttempts})`);
//     }

//   } catch (error) {
//     console.error('ワード読み解きエラー (Claude版):', error);
//     res.status(500).json({ 
//       error: 'ワード読み解き中にエラーが発生しました',
//       details: error.message
//     });
//   }
// });

// // ヘルスチェック
// app.get('/health', (req, res) => {
//   res.json({ status: 'OK', timestamp: new Date().toISOString() });
// });

// // サーバー起動
// app.listen(PORT, () => {
//   console.log(`🆕 新しいサーバーがポート${PORT}で起動しました (Claude版)`);
//   console.log(`ヘルスチェック: http://localhost:${PORT}/health`);
//   console.log('利用可能なAPI:');
//   console.log('- POST /api/generate-channeling (チャネリング生成) ✅NGフィルター 🆕Claude版');
//   console.log('- POST /api/generate-audio (音声生成)');
//   console.log('- POST /api/interpret-words (ワード読み解き) ✅NGフィルター 🆕Claude版');
// });