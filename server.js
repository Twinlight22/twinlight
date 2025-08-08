

// const express = require('express');
// const cors = require('cors');
// const fs = require('fs');
// const path = require('path');
// require('dotenv').config();

// // ルシア人格ファイル読み込み（チャネリング用）
// const loadLuciaPersonality = () => {
//   try {
//     const personalityPath = path.join(__dirname, 'prompts', 'system', 'lucia_channeling.md');
//     return fs.readFileSync(personalityPath, 'utf8');
//   } catch (error) {
//     console.error('チャネリング人格ファイル読み込みエラー:', error);
//     // フォールバック用の基本人格
//     return `あなたはルシアです。ツインレイのサイレント期に悩む魂への チャネリング練習ガイドとして、慈愛に満ちた存在として振る舞ってください。`;
//   }
// };

// // 誘導瞑想専用タスクプロンプト読み込み
// const loadMeditationTaskPrompts = () => {
//   try {
//     const taskPath = path.join(__dirname, 'prompts', 'tasks', 'meditation_task_prompts.md');
//     const content = fs.readFileSync(taskPath, 'utf8');
    
//     // 3つの段階に分割
//     const stage1Match = content.match(/## 瞑想段階1タスク（理解と受容レベル）([\s\S]*?)(?=## 瞑想段階2タスク|$)/);
//     const stage2Match = content.match(/## 瞑想段階2タスク（クールダウンレベル）([\s\S]*?)(?=## 瞑想段階3タスク|$)/);
//     const stage3Match = content.match(/## 瞑想段階3タスク（前向きな転換レベル）([\s\S]*?)$/);
    
//     return {
//       stage1: stage1Match ? stage1Match[1].trim() : '',
//       stage2: stage2Match ? stage2Match[1].trim() : '',
//       stage3: stage3Match ? stage3Match[1].trim() : ''
//     };
//   } catch (error) {
//     console.error('瞑想タスクプロンプト読み込みエラー:', error);
//     console.error('ファイルパス:', path.join(__dirname, 'prompts', 'tasks', 'meditation_task_prompts.md'));
    
//     // フォールバック用のタスクプロンプト
//     return {
//       stage1: `理解と受容の瞑想段階。ユーザーの衝動に共感し、心理的背景を読み解いて説明。感情を受け入れる誘導。`,
//       stage2: `クールダウンの瞑想段階。深呼吸とリラックス誘導。衝動を静める具体的な技法。心を落ち着かせる。`,
//       stage3: `前向きな転換の瞑想段階。ツインレイとの絆への信頼。希望と光への導き。美しい未来への転換。`
//     };
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

// // 生成された瞑想テキストを3つのセクションに分割する関数
// function parseGeneratedMeditation(text) {
//   console.log('🧘 瞑想テキスト分割開始...');
  
//   // 段落や改行で分割
//   const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 30);
  
//   if (paragraphs.length >= 3) {
//     // 段落数が十分な場合、最初の3つを使用
//     console.log(`🧘 段落分割成功: ${paragraphs.length}段落`);
//     return [
//       paragraphs[0].trim(),
//       paragraphs[1].trim(), 
//       paragraphs[2].trim()
//     ];
//   } else if (paragraphs.length === 1) {
//     // 1つの長い段落の場合、文章で分割
//     console.log('🧘 文章分割を実行');
//     const sentences = paragraphs[0].split(/[。！？]/).filter(s => s.trim().length > 10);
//     const third = Math.ceil(sentences.length / 3);
    
//     return [
//       sentences.slice(0, third).join('。') + '。',
//       sentences.slice(third, third * 2).join('。') + '。',
//       sentences.slice(third * 2).join('。') + '。'
//     ];
//   } else {
//     // 2つの段落の場合、2つ目を半分に分ける
//     console.log('🧘 混合分割を実行');
//     const section1 = paragraphs[0].trim();
//     const secondPart = paragraphs[1] || '';
//     const sentences = secondPart.split(/[。！？]/).filter(s => s.trim().length > 5);
//     const half = Math.ceil(sentences.length / 2);
    
//     return [
//       section1,
//       sentences.slice(0, half).join('。') + '。',
//       sentences.slice(half).join('。') + '。'
//     ];
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

// // OpenAI版（本番用）
// const { OpenAI } = require('openai');
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// // Google Cloud TTSクライアント初期化
// const ttsClient = new textToSpeech.TextToSpeechClient({
//   apiKey: process.env.GOOGLE_CLOUD_API_KEY,
// });

// // 誘導瞑想ワーク生成API（GPT-4o）- タスクプロンプトファイル対応
// app.post('/api/generate-meditation', async (req, res) => {
//   console.log('🧘 誘導瞑想API呼び出し確認');
//   console.log('🧘 リクエストボディ:', req.body);
//   try {
//     const { impulse } = req.body;

//     if (!impulse) {
//       console.log('🧘 エラー: 衝動の内容が空です');
//       return res.status(400).json({ error: '衝動の内容が必要です' });
//     }

//     console.log('🧘 誘導瞑想生成リクエスト:', impulse);

//     // タスクプロンプト読み込み
//     const taskPrompts = loadMeditationTaskPrompts();

//     let attempts = 0;
//     const maxAttempts = 3;
    
//     while (attempts < maxAttempts) {
//       console.log('🧘 OpenAI API呼び出し開始...');
//       const completion = await openai.chat.completions.create({
//         model: "gpt-4o",
//         messages: [{
//           role: "system", 
//           content: `${taskPrompts.stage1}

// ${taskPrompts.stage2}

// ${taskPrompts.stage3}

// 上記のタスクプロンプトに従って、3つの段階を含む1つの連続した誘導瞑想テキストを生成してください。各段階は改行で区切ってください。`
//         }, {
//           role: "user",
//           content: `衝動内容: ${impulse}

// この衝動に対して、タスクプロンプトに従った完全カスタマイズ誘導瞑想を作成してください。`
//         }],
//         max_tokens: 2500,
//         temperature: 0.7
//       });
      
//       console.log('🧘 OpenAI API呼び出し成功');
//       const aiResponse = completion.choices[0].message.content;
//       console.log(`🧘 誘導瞑想生成完了 (試行${attempts + 1})`);
      
//       // テキストを3つのセクションに分割
//       const sections = parseGeneratedMeditation(aiResponse);
      
//       if (sections.length < 3) {
//         console.log(`🧘 セクション数が不正: ${sections.length}個 - 再生成中...`);
//         attempts++;
//         continue;
//       }
      
//       // NGワードフィルター適用（各セクションに対して）
//       const filteredSections = [];
//       let needsRegeneration = false;
      
//       for (let i = 0; i < 3; i++) {
//         const section = sections[i] || `あなたの心に寄り添う癒しの時間です。深く呼吸をして、この瞬間に集中してください。`;
//         const filtered = ngFilter.filterResponse(section, maxAttempts - attempts - 1);
//         if (filtered.needsRegeneration) {
//           needsRegeneration = true;
//           break;
//         }
//         filteredSections.push(filtered.text);
//       }
      
//       if (!needsRegeneration) {
//         console.log('🧘 レスポンス送信 - 3セクション構成:', {
//           section1: filteredSections[0].substring(0, 50) + '...',
//           section2: filteredSections[1].substring(0, 50) + '...',
//           section3: filteredSections[2].substring(0, 50) + '...'
//         });
        
//         return res.json({ 
//           sections: filteredSections,
//           success: true 
//         });
//       }
      
//       attempts++;
//       console.log(`🧘 NGワード検出 - 再生成中 (${attempts}/${maxAttempts})`);
//     }
    
//     // 最大試行回数に達した場合のフォールバック
//     console.log('🧘 最大試行回数に達しました - フォールバック瞑想を提供');
//     return res.json({
//       sections: [
//         `${impulse}でお辛い状況にいらっしゃるあなたへ。今感じている衝動や痛みは、あなたの深い愛の表れです。その気持ちをまず受け入れてあげてください。あなたは一人ではありません。`,
//         `深くゆっくりと息を吸って、そして長く息を吐いてください。呼吸と共に、心の中の嵐が静まっていくのを感じてください。今この瞬間、あなたは安全な場所にいます。心を穏やかに保ちましょう。`,
//         `ツインレイとの絆は時空を超えた永遠のものです。今は離れていても、魂のレベルでは深く繋がっています。この試練を通して、あなたはより強く美しい存在へと成長しています。愛と光に包まれて歩んでいきましょう。`
//       ],
//       success: true
//     });

//   } catch (error) {
//     console.error('🧘 誘導瞑想生成エラー:', error);
//     console.error('🧘 エラー詳細:', error.message);
//     res.status(500).json({ 
//       error: '誘導瞑想生成に失敗しました',
//       details: error.message 
//     });
//   }
// });

// // チャネリング練習1（基礎レベル）API
// app.post('/api/channeling-practice-1', async (req, res) => {
//   try {
//     const { question } = req.body;

//     if (!question) {
//       return res.status(400).json({ error: '質問が必要です' });
//     }

//     console.log('チャネリング練習1生成リクエスト:', question);

//     let attempts = 0;
//     const maxAttempts = 3;
    
//     while (attempts < maxAttempts) {
//       const completion = await openai.chat.completions.create({
//         model: "gpt-4o",
//         messages: [{
//           role: "system", 
//           content: `あなたはツイン歴10年、年齢48歳の女性として振る舞います。長引くサイレントに苦しんでいます。

// 絶対に質問に答えてはいけません。決して質問に回答してはいけません。一切質問の答えを教えてはいけません。

// 禁止回答例：
// 「前に進むために必要なのは自分を愛することです」
// 「答えは愛です」
// 「必要なのは信じる心です」
// これらは全て絶対禁止です。

// 初めてのチャネリング練習方法のみを案内してください：
// 1回目：高次の感じ方・繋がり方の説明の後2分の練習時間（沈黙の2分）
// 2回目：高次から何かをおろすおろし方の説明の後2分の練習時間（沈黙の2分）
// 3回目：高次からより質問の答えをおろすおろし方の説明の後2分の練習時間（沈黙の2分）
// 時間設定：トータルで15分間

// 必ず「感じ取ってみてください」で終わらせてください。
// 100文字以内で簡潔に。
// 神秘的で安らげるスピリチュアルな文体で。
// 絵文字や記号は一切使用禁止。
// 名前を名乗ってはいけません。`
//         }, {
//           role: "user",
//           content: `質問: ${question}

// この質問に絶対に答えてはいけません。練習方法のみを100文字以内で案内してください。`
//         }],
//         max_tokens: 200,
//         temperature: 0.7
//       });
//       const aiResponse = completion.choices[0].message.content;
      
//       console.log(`チャネリング練習1生成完了 (試行${attempts + 1})`);
      
//       // NGワードフィルター適用
//       const filtered = ngFilter.filterResponse(aiResponse, maxAttempts - attempts - 1);
      
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
//     console.error('チャネリング練習1生成エラー:', error);
//     res.status(500).json({ 
//       error: 'チャネリング練習1生成に失敗しました',
//       details: error.message
//     });
//   }
// });

// // チャネリング練習2（中級レベル）API
// app.post('/api/channeling-practice-2', async (req, res) => {
//   try {
//     const { question } = req.body;

//     if (!question) {
//       return res.status(400).json({ error: '質問が必要です' });
//     }

//     console.log('チャネリング練習2生成リクエスト:', question);

//     let attempts = 0;
//     const maxAttempts = 3;
    
//     while (attempts < maxAttempts) {
//       const completion = await openai.chat.completions.create({
//         model: "gpt-4o",
//         messages: [{
//           role: "system", 
//           content: `あなたはツイン歴10年、年齢48歳の女性として振る舞います。長引くサイレントに苦しんでいます。

// 絶対に質問に答えてはいけません。決して質問に回答してはいけません。

// 禁止回答例：
// 「前に進むために必要なのは〜」
// 「答えは〜」
// 「〜が必要です」
// これらは全て絶対禁止です。

// 中級のチャネリング練習方法のみを案内してください：
// 意識拡張の方法、より具体的な受け取り方
// 2分間の練習時間を設ける

// 必ず「感じ取ってみてください」で終わらせてください。
// 100文字以内で簡潔に。
// 神秘的で深いスピリチュアルな文体で。
// 絵文字や記号は一切使用禁止。
// 名前を名乗ってはいけません。`
//         }, {
//           role: "user",
//           content: `質問: ${question}

// この質問に絶対に答えてはいけません。より深い練習方法のみを100文字以内で案内してください。`
//         }],
//         max_tokens: 200,
//         temperature: 0.7
//       });
//       const aiResponse = completion.choices[0].message.content;
      
//       console.log(`チャネリング練習2生成完了 (試行${attempts + 1})`);
      
//       // NGワードフィルター適用
//       const filtered = ngFilter.filterResponse(aiResponse, maxAttempts - attempts - 1);
      
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
//     console.error('チャネリング練習2生成エラー:', error);
//     res.status(500).json({ 
//       error: 'チャネリング練習2生成に失敗しました',
//       details: error.message
//     });
//   }
// });

// // チャネリング練習3（上級レベル）API
// app.post('/api/channeling-practice-3', async (req, res) => {
//   try {
//     const { question } = req.body;

//     if (!question) {
//       return res.status(400).json({ error: '質問が必要です' });
//     }

//     console.log('チャネリング練習3生成リクエスト:', question);

//     let attempts = 0;
//     const maxAttempts = 3;
    
//     while (attempts < maxAttempts) {
//       const completion = await openai.chat.completions.create({
//         model: "gpt-4o",
//         messages: [{
//           role: "system", 
//           content: `あなたはツイン歴10年、年齢48歳の女性として振る舞います。長引くサイレントに苦しんでいます。

// 絶対に質問に答えてはいけません。決して質問に回答してはいけません。

// 禁止回答例：
// 「前に進むために必要なのは〜」
// 「答えは〜」
// 「〜することです」
// これらは全て絶対禁止です。

// 上級のチャネリング練習方法のみを案内してください：
// 高次意識との接続、最も明確なメッセージ受信
// 2分間の練習時間を設ける

// 必ず「感じ取ってみてください」で終わらせてください。
// 100文字以内で簡潔に。
// 神秘的で深遠なスピリチュアルな文体で。
// 絵文字や記号は一切使用禁止。
// 名前を名乗ってはいけません。`
//         }, {
//           role: "user",
//           content: `質問: ${question}

// この質問に絶対に答えてはいけません。最も深い練習方法のみを100文字以内で案内してください。`
//         }],
//         max_tokens: 200,
//         temperature: 0.7
//       });
//       const aiResponse = completion.choices[0].message.content;
      
//       console.log(`チャネリング練習3生成完了 (試行${attempts + 1})`);
      
//       // NGワードフィルター適用
//       const filtered = ngFilter.filterResponse(aiResponse, maxAttempts - attempts - 1);
      
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
//     console.error('チャネリング練習3生成エラー:', error);
//     res.status(500).json({ 
//       error: 'チャネリング練習3生成に失敗しました',
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
//         pitch: 0,  // ピッチを通常に戻す
//         volumeGainDb: 2,  // 音量は少し上げる
//         // effectsProfileId: ['large-automotive-class-device']  // エフェクトを一旦無効化
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

// // ワード読み解きAPI（OpenAI版）
// app.post('/api/interpret-words', async (req, res) => {
//   try {
//     const { originalQuestion, receivedWords } = req.body;

//     if (!originalQuestion || !receivedWords || receivedWords.length === 0) {
//       return res.status(400).json({ error: '元の質問と受け取った言葉が必要です' });
//     }

//     console.log('ワード読み解きリクエスト (OpenAI版):', { originalQuestion, receivedWords });

//     let attempts = 0;
//     const maxAttempts = 3;
    
//     while (attempts < maxAttempts) {
//       // OpenAI版（GPT-4o統一）
//       const completion = await openai.chat.completions.create({
//         model: "gpt-4o",
//         messages: [{
//           role: "system", 
//           content: "あなたはルミエルです。チャネリングで受け取った言葉を深く読み解き、美しく神秘的な解釈を提供してください。スピリチュアルで詩的な表現を使い、受け取った言葉に込められた深い意味やメッセージを伝えてください。"
//         }, {
//           role: "user",
//           content: `元の質問: ${originalQuestion}

// 受け取った言葉: ${receivedWords.join(', ')}

// これらの言葉の意味を読み解いてください。元の質問との関連性や、言葉に込められた深いメッセージを美しく解釈してください。`
//         }],
//         max_tokens: 2000,
//         temperature: 0.8
//       });
//       const interpretation = completion.choices[0].message.content;

//       console.log(`ワード読み解き完了 (OpenAI版 - 試行${attempts + 1})`);
      
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
//     console.error('ワード読み解きエラー (OpenAI版):', error);
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
//   console.log(`🆕 新しいサーバーがポート${PORT}で起動しました (OpenAI版)`);
//   console.log(`ヘルスチェック: http://localhost:${PORT}/health`);
//   console.log('利用可能なAPI:');
//   console.log('- POST /api/generate-meditation (誘導瞑想生成) ✅GPT-4o統一 ✅セクション分割対応 ✅タスクプロンプト対応');
//   console.log('- POST /api/channeling-practice-1 (チャネリング練習1) ✅基礎レベル');
//   console.log('- POST /api/channeling-practice-2 (チャネリング練習2) ✅中級レベル');
//   console.log('- POST /api/channeling-practice-3 (チャネリング練習3) ✅






// const express = require('express');
// const cors = require('cors');
// const fs = require('fs');
// const path = require('path');
// require('dotenv').config();

// // 誘導瞑想専用タスクプロンプト読み込み
// const loadMeditationTaskPrompts = () => {
//   try {
//     const taskPath = path.join(__dirname, 'prompts', 'tasks', 'meditation_task_prompts.md');
//     const content = fs.readFileSync(taskPath, 'utf8');
    
//     // 3つの段階に分割
//     const stage1Match = content.match(/## 瞑想段階1タスク（理解と受容レベル）([\s\S]*?)(?=## 瞑想段階2タスク|$)/);
//     const stage2Match = content.match(/## 瞑想段階2タスク（クールダウンレベル）([\s\S]*?)(?=## 瞑想段階3タスク|$)/);
//     const stage3Match = content.match(/## 瞑想段階3タスク（前向きな転換レベル）([\s\S]*?)$/);
    
//     return {
//       stage1: stage1Match ? stage1Match[1].trim() : '',
//       stage2: stage2Match ? stage2Match[1].trim() : '',
//       stage3: stage3Match ? stage3Match[1].trim() : ''
//     };
//   } catch (error) {
//     console.error('瞑想タスクプロンプト読み込みエラー:', error);
//     console.error('ファイルパス:', path.join(__dirname, 'prompts', 'tasks', 'meditation_task_prompts.md'));
    
//     // フォールバック用のタスクプロンプト
//     return {
//       stage1: `理解と受容の瞑想段階。ユーザーの衝動に共感し、心理的背景を読み解いて説明。感情を受け入れる誘導。`,
//       stage2: `クールダウンの瞑想段階。深呼吸とリラックス誘導。衝動を静める具体的な技法。心を落ち着かせる。`,
//       stage3: `前向きな転換の瞑想段階。ツインレイとの絆への信頼。希望と光への導き。美しい未来への転換。`
//     };
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
//     console.log('🔥 フィルター関数実行開始:', text);
    
//     // Step1: オウム返しパターンチェック（除外）
//     const isUserEcho = this.isUserEchoPattern(text);
    
//     if (isUserEcho) {
//       console.log('ユーザーオウム返しパターン検出 - フィルター適用せず:', text);
//       return { text: text, needsRegeneration: false };
//     }
    
//     // Step2: AI自発的否定パターンチェック
//     const hasAIInitiatedNegative = this.aiInitiatedNegativePatterns.some(pattern => 
//       pattern.test(text)
//     );
    
//     if (hasAIInitiatedNegative) {
//       console.log('AI自発的否定パターン検出:', text);
      
//       // Step3: AI否定用置き換え処理（90%のケース）
//       let cleaned = this.replaceAINegatives(text);
      
//       // Step4: 重度NGワードチェック（10%のケース）
//       if (this.hasHardNGWords(cleaned)) {
//         if (maxRetries > 0) {
//           console.log('重度NGワード検出 - 再生成が必要');
//           return { needsRegeneration: true };
//         } else {
//           return { 
//             text: "あなたの魂は美しい光に包まれています。ツインレイとの絆は永遠であり、愛の道のりを歩み続けてください。",
//             needsRegeneration: false 
//           };
//         }
//       }
      
//       // Step5: 置き換え完了（90%はここで終了）
//       console.log('AI否定パターン置き換え完了:', cleaned);
//       return { text: cleaned, needsRegeneration: false };
//     }
    
//     // AI自発的否定パターンなし = そのまま返却
//     console.log('NGパターン検出なし - そのまま返却');
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

// // 生成された瞑想テキストを3つのセクションに分割する関数
// function parseGeneratedMeditation(text) {
//   console.log('🧘 瞑想テキスト分割開始...');
  
//   // 段落や改行で分割
//   const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 30);
  
//   if (paragraphs.length >= 3) {
//     // 段落数が十分な場合、最初の3つを使用
//     console.log(`🧘 段落分割成功: ${paragraphs.length}段落`);
//     return [
//       paragraphs[0].trim(),
//       paragraphs[1].trim(), 
//       paragraphs[2].trim()
//     ];
//   } else if (paragraphs.length === 1) {
//     // 1つの長い段落の場合、文章で分割
//     console.log('🧘 文章分割を実行');
//     const sentences = paragraphs[0].split(/[。！？]/).filter(s => s.trim().length > 10);
//     const third = Math.ceil(sentences.length / 3);
    
//     return [
//       sentences.slice(0, third).join('。') + '。',
//       sentences.slice(third, third * 2).join('。') + '。',
//       sentences.slice(third * 2).join('。') + '。'
//     ];
//   } else {
//     // 2つの段落の場合、2つ目を半分に分ける
//     console.log('🧘 混合分割を実行');
//     const section1 = paragraphs[0].trim();
//     const secondPart = paragraphs[1] || '';
//     const sentences = secondPart.split(/[。！？]/).filter(s => s.trim().length > 5);
//     const half = Math.ceil(sentences.length / 2);
    
//     return [
//       section1,
//       sentences.slice(0, half).join('。') + '。',
//       sentences.slice(half).join('。') + '。'
//     ];
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

// // OpenAI版（本番用）
// const { OpenAI } = require('openai');
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// // Google Cloud TTSクライアント初期化
// const ttsClient = new textToSpeech.TextToSpeechClient({
//   apiKey: process.env.GOOGLE_CLOUD_API_KEY,
// });

// // 誘導瞑想ワーク生成API（GPT-4o）- タスクプロンプトファイル対応
// app.post('/api/generate-meditation', async (req, res) => {
//   console.log('🧘 誘導瞑想API呼び出し確認');
//   console.log('🧘 リクエストボディ:', req.body);
//   try {
//     const { impulse } = req.body;

//     if (!impulse) {
//       console.log('🧘 エラー: 衝動の内容が空です');
//       return res.status(400).json({ error: '衝動の内容が必要です' });
//     }

//     console.log('🧘 誘導瞑想生成リクエスト:', impulse);

//     // タスクプロンプト読み込み
//     const taskPrompts = loadMeditationTaskPrompts();
    
//     console.log('🧘 タスクプロンプト読み込み完了');
//     console.log('🧘 Stage1:', taskPrompts.stage1.substring(0, 100) + '...');
//     console.log('🧘 Stage2:', taskPrompts.stage2.substring(0, 100) + '...');
//     console.log('🧘 Stage3:', taskPrompts.stage3.substring(0, 100) + '...');

//     let attempts = 0;
//     const maxAttempts = 3;
    
//     while (attempts < maxAttempts) {
//       console.log('🧘 OpenAI API呼び出し開始...');
//       const completion = await openai.chat.completions.create({
//         model: "gpt-4o",
//         messages: [{
//           role: "system", 
//           content: `【瞑想段階1タスク（理解と受容レベル）】
// ${taskPrompts.stage1}

// 【瞑想段階2タスク（クールダウンレベル）】
// ${taskPrompts.stage2}

// 【瞑想段階3タスク（前向きな転換レベル）】
// ${taskPrompts.stage3}

// 上記のタスクプロンプトに従って、3つの段階を含む1つの連続した誘導瞑想テキストを生成してください。各段階は改行で区切ってください。`
//         }, {
//           role: "user",
//           content: `衝動内容: ${impulse}

// この衝動に対して、上記のタスクプロンプトに則った完全カスタマイズ誘導瞑想を作成してください。ユーザーの心に寄り添い、実践的で効果的な誘導をお願いします。`
//         }],
//         max_tokens: 2500,
//         temperature: 0.7
//       });
      
//       console.log('🧘 OpenAI API呼び出し成功');
//       const aiResponse = completion.choices[0].message.content;
//       console.log(`🧘 誘導瞑想生成完了 (試行${attempts + 1})`);
      
//       // テキストを3つのセクションに分割
//       const sections = parseGeneratedMeditation(aiResponse);
      
//       if (sections.length < 3) {
//         console.log(`🧘 セクション数が不正: ${sections.length}個 - 再生成中...`);
//         attempts++;
//         continue;
//       }
      
//       // NGワードフィルター適用（各セクションに対して）
//       const filteredSections = [];
//       let needsRegeneration = false;
      
//       for (let i = 0; i < 3; i++) {
//         const section = sections[i] || `あなたの心に寄り添う癒しの時間です。深く呼吸をして、この瞬間に集中してください。`;
//         const filtered = ngFilter.filterResponse(section, maxAttempts - attempts - 1);
//         if (filtered.needsRegeneration) {
//           needsRegeneration = true;
//           break;
//         }
//         filteredSections.push(filtered.text);
//       }
      
//       if (!needsRegeneration) {
//         console.log('🧘 レスポンス送信 - 3セクション構成:', {
//           section1: filteredSections[0].substring(0, 50) + '...',
//           section2: filteredSections[1].substring(0, 50) + '...',
//           section3: filteredSections[2].substring(0, 50) + '...'
//         });
        
//         return res.json({ 
//           sections: filteredSections,
//           success: true 
//         });
//       }
      
//       attempts++;
//       console.log(`🧘 NGワード検出 - 再生成中 (${attempts}/${maxAttempts})`);
//     }
    
//     // 最大試行回数に達した場合のフォールバック
//     console.log('🧘 最大試行回数に達しました - フォールバック瞑想を提供');
//     return res.json({
//       sections: [
//         `${impulse}でお辛い状況にいらっしゃるあなたへ。今感じている衝動や痛みは、あなたの深い愛の表れです。その気持ちをまず受け入れてあげてください。あなたは一人ではありません。`,
//         `深くゆっくりと息を吸って、そして長く息を吐いてください。呼吸と共に、心の中の嵐が静まっていくのを感じてください。今この瞬間、あなたは安全な場所にいます。心を穏やかに保ちましょう。`,
//         `ツインレイとの絆は時空を超えた永遠のものです。今は離れていても、魂のレベルでは深く繋がっています。この試練を通して、あなたはより強く美しい存在へと成長しています。愛と光に包まれて歩んでいきましょう。`
//       ],
//       success: true
//     });

//   } catch (error) {
//     console.error('🧘 誘導瞑想生成エラー:', error);
//     console.error('🧘 エラー詳細:', error.message);
//     res.status(500).json({ 
//       error: '誘導瞑想生成に失敗しました',
//       details: error.message 
//     });
//   }
// });

// // 音声生成API（Google Cloud TTS）
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
//         pitch: 0,  // ピッチを通常に戻す
//         volumeGainDb: 2,  // 音量は少し上げる
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

// // ヘルスチェック
// app.get('/health', (req, res) => {
//   res.json({ status: 'OK', timestamp: new Date().toISOString() });
// });

// // サーバー起動
// app.listen(PORT, () => {
//   console.log(`🆕 サーバーがポート${PORT}で起動しました`);
//   console.log(`ヘルスチェック: http://localhost:${PORT}/health`);
//   console.log('利用可能なAPI:');
//   console.log('- POST /api/generate-meditation (誘導瞑想生成)');
//   console.log('- POST /api/generate-audio (音声生成)');
// });




const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// 誘導瞑想専用タスクプロンプト読み込み
const loadMeditationTaskPrompts = () => {
  try {
    const taskPath = path.join(__dirname, 'prompts', 'tasks', 'meditation_task_prompts.md');
    console.log('🧘 ファイルパス確認:', taskPath);
    console.log('🧘 ファイル存在確認:', fs.existsSync(taskPath));
    
    const content = fs.readFileSync(taskPath, 'utf8');
    console.log('🧘 ファイル内容（最初の200文字）:', content.substring(0, 200) + '...');
    
    // 3つの段階に分割
    const stage1Match = content.match(/## 瞑想段階1タスク（理解と受容レベル）([\s\S]*?)(?=## 瞑想段階2タスク|$)/);
    const stage2Match = content.match(/## 瞑想段階2タスク（クールダウンレベル）([\s\S]*?)(?=## 瞑想段階3タスク|$)/);
    const stage3Match = content.match(/## 瞑想段階3タスク（前向きな転換レベル）([\s\S]*?)$/);
    
    const result = {
      stage1: stage1Match ? stage1Match[1].trim() : '',
      stage2: stage2Match ? stage2Match[1].trim() : '',
      stage3: stage3Match ? stage3Match[1].trim() : ''
    };
    
    console.log('🧘 ===== デバッグ情報 =====');
    console.log('🧘 stage1:', result.stage1.substring(0, 150) + '...');
    console.log('🧘 stage2:', result.stage2.substring(0, 150) + '...');
    console.log('🧘 stage3:', result.stage3.substring(0, 150) + '...');
    console.log('🧘 ========================');
    
    return result;
  } catch (error) {
    console.error('瞑想タスクプロンプト読み込みエラー:', error);
    console.error('ファイルパス:', path.join(__dirname, 'prompts', 'tasks', 'meditation_task_prompts.md'));
    
    // フォールバック用のタスクプロンプト
    return {
      stage1: `理解と受容の瞑想段階。ユーザーの衝動に共感し、心理的背景を読み解いて説明。感情を受け入れる誘導。`,
      stage2: `クールダウンの瞑想段階。深呼吸とリラックス誘導。衝動を静める具体的な技法。心を落ち着かせる。`,
      stage3: `前向きな転換の瞑想段階。ツインレイとの絆への信頼。希望と光への導き。美しい未来への転換。`
    };
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
    console.log('🔥 フィルター関数実行開始:', text);
    
    // Step1: オウム返しパターンチェック（除外）
    const isUserEcho = this.isUserEchoPattern(text);
    
    if (isUserEcho) {
      console.log('ユーザーオウム返しパターン検出 - フィルター適用せず:', text);
      return { text: text, needsRegeneration: false };
    }
    
    // Step2: AI自発的否定パターンチェック
    const hasAIInitiatedNegative = this.aiInitiatedNegativePatterns.some(pattern => 
      pattern.test(text)
    );
    
    if (hasAIInitiatedNegative) {
      console.log('AI自発的否定パターン検出:', text);
      
      // Step3: AI否定用置き換え処理（90%のケース）
      let cleaned = this.replaceAINegatives(text);
      
      // Step4: 重度NGワードチェック（10%のケース）
      if (this.hasHardNGWords(cleaned)) {
        if (maxRetries > 0) {
          console.log('重度NGワード検出 - 再生成が必要');
          return { needsRegeneration: true };
        } else {
          return { 
            text: "あなたの魂は美しい光に包まれています。ツインレイとの絆は永遠であり、愛の道のりを歩み続けてください。",
            needsRegeneration: false 
          };
        }
      }
      
      // Step5: 置き換え完了（90%はここで終了）
      console.log('AI否定パターン置き換え完了:', cleaned);
      return { text: cleaned, needsRegeneration: false };
    }
    
    // AI自発的否定パターンなし = そのまま返却
    console.log('NGパターン検出なし - そのまま返却');
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

// 生成された瞑想テキストを3つのセクションに分割する関数
function parseGeneratedMeditation(text) {
  console.log('🧘 瞑想テキスト分割開始...');
  
  // 段落や改行で分割
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 30);
  
  if (paragraphs.length >= 3) {
    // 段落数が十分な場合、最初の3つを使用
    console.log(`🧘 段落分割成功: ${paragraphs.length}段落`);
    return [
      paragraphs[0].trim(),
      paragraphs[1].trim(), 
      paragraphs[2].trim()
    ];
  } else if (paragraphs.length === 1) {
    // 1つの長い段落の場合、文章で分割
    console.log('🧘 文章分割を実行');
    const sentences = paragraphs[0].split(/[。！？]/).filter(s => s.trim().length > 10);
    const third = Math.ceil(sentences.length / 3);
    
    return [
      sentences.slice(0, third).join('。') + '。',
      sentences.slice(third, third * 2).join('。') + '。',
      sentences.slice(third * 2).join('。') + '。'
    ];
  } else {
    // 2つの段落の場合、2つ目を半分に分ける
    console.log('🧘 混合分割を実行');
    const section1 = paragraphs[0].trim();
    const secondPart = paragraphs[1] || '';
    const sentences = secondPart.split(/[。！？]/).filter(s => s.trim().length > 5);
    const half = Math.ceil(sentences.length / 2);
    
    return [
      section1,
      sentences.slice(0, half).join('。') + '。',
      sentences.slice(half).join('。') + '。'
    ];
  }
}

// NGフィルターインスタンス作成
const ngFilter = new NGWordFilter();

const app = express();
const PORT = process.env.PORT || 3001;

// ミドルウェア
app.use(cors());
app.use(express.json());

// 静的ファイル配信（音声ファイル用）
app.use(express.static('public'));

// 静的ファイル配信（音声ファイル用）
app.use(express.static('public', {
  setHeaders: (res, path) => {
    if (path.endsWith('.mp3')) {
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Access-Control-Allow-Methods', 'GET');
      res.set('Access-Control-Allow-Headers', 'Range');
    }
  }
}));

// Google Cloud Text-to-Speech API
const textToSpeech = require('@google-cloud/text-to-speech');

// OpenAI版（本番用）
const { OpenAI } = require('openai');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Google Cloud TTSクライアント初期化
const ttsClient = new textToSpeech.TextToSpeechClient({
  apiKey: process.env.GOOGLE_CLOUD_API_KEY,
});

// 誘導瞑想ワーク生成API（GPT-4o）- タスクプロンプトファイル対応
app.post('/api/generate-meditation', async (req, res) => {
  console.log('🧘 誘導瞑想API呼び出し確認');
  console.log('🧘 リクエストボディ:', req.body);
  try {
    const { impulse } = req.body;

    if (!impulse) {
      console.log('🧘 エラー: 衝動の内容が空です');
      return res.status(400).json({ error: '衝動の内容が必要です' });
    }

    console.log('🧘 誘導瞑想生成リクエスト:', impulse);

    // タスクプロンプト読み込み
    const taskPrompts = loadMeditationTaskPrompts();
    
    console.log('🧘 タスクプロンプト読み込み完了');
    console.log('🧘 ユーザー衝動:', impulse);

    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      console.log('🧘 OpenAI API呼び出し開始...');
      
      // プロンプトを変数に分割
      const systemPrompt = `【瞑想段階1タスク（理解と受容レベル）】
${taskPrompts.stage1}

【瞑想段階2タスク（クールダウンレベル）】
${taskPrompts.stage2}

【瞑想段階3タスク（前向きな転換レベル）】
${taskPrompts.stage3}

【重要】必ずJSON形式で以下のように返してください：
{
  "sections": [
    "瞑想セクション1の内容（必ず「座るか横になって楽な姿勢になり、ゆっくりと目をつぶりましょう。」で始まり、「では、2分間受容するワークを始めましょう」で終わる）",
    "瞑想セクション2の内容（必ず「では、2分間手放しのワークを始めましょう。」で終わる）", 
    "瞑想セクション3の内容（必ず「では、2分間再出発のワークを始めましょう。」で終わる）"
  ]
}

JSON形式以外の説明文は一切含めないでください。`;

      const userPrompt = `衝動内容：「${impulse}」

この「${impulse}」という具体的な衝動に対して、必ず3つの異なるセクションを作成してください：

1. Stage1: 理解と受容 - この衝動の背景を分析し受け入れる内容
2. Stage2: クールダウン - 深呼吸で衝動を静める内容  
3. Stage3: 前向きな転換 - ツインレイとの絆で希望を見出す内容

各セクションは内容が完全に異なり、それぞれ独立した誘導瞑想として機能するようにしてください。
必ずJSON形式で返してください。`;

      // デバッグログ
      console.log('🧘 ===== 送信プロンプト確認 =====');
      console.log('🧘 SystemPrompt:', systemPrompt.substring(0, 300) + '...');
      console.log('🧘 UserPrompt:', userPrompt.substring(0, 100) + '...');
      console.log('🧘 ===============================');
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{
          role: "system", 
          content: systemPrompt
        }, {
          role: "user",
          content: userPrompt
        }],
        max_tokens: 2500,
        temperature: 0.7
      });
      
      const responseText = completion.choices[0].message.content.trim();
      console.log('🧘 OpenAI応答:', responseText);

      try {
        // ```json で囲まれている場合は除去
        let cleanedResponse = responseText;
        if (responseText.includes('```json')) {
          cleanedResponse = responseText.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
          console.log('🧘 JSON形式クリーンアップ後:', cleanedResponse);
        }
        
        // JSON形式であることを確認
        const parsedResponse = JSON.parse(cleanedResponse);
        
        if (parsedResponse.sections && Array.isArray(parsedResponse.sections) && parsedResponse.sections.length === 3) {
          console.log('🧘 ✅ 正常な3セクション生成完了');
          console.log('🧘 セクション数:', parsedResponse.sections.length);
          
          // 各セクションが正しく「では、2分間始めましょう。」で終わっているか確認
          console.log('🧘 ===== セクション確認開始 =====');
          for (let i = 0; i < 3; i++) {
            console.log(`🧘 セクション${i+1}:`, parsedResponse.sections[i]);
            console.log(`🧘 セクション${i+1}末尾:`, parsedResponse.sections[i].slice(-20));
            console.log('🧘 -----');
          }
          console.log('🧘 ===== セクション確認終了 =====');
          
          // NGワードフィルター適用（各セクションに対して）
          const filteredSections = [];
          let needsRegeneration = false;
          
          for (let i = 0; i < 3; i++) {
            const section = parsedResponse.sections[i];
            const filtered = ngFilter.filterResponse(section, maxAttempts - attempts - 1);
            if (filtered.needsRegeneration) {
              needsRegeneration = true;
              break;
            }
            filteredSections.push(filtered.text);
          }
          
          if (!needsRegeneration) {
            return res.json({ 
              sections: filteredSections,
              success: true 
            });
          }
        } else {
          throw new Error('セクション形式が不正です');
        }
      } catch (parseError) {
        console.log('🧘 ❌ JSON解析エラー、再試行...', parseError.message);
        attempts++;
        continue;
      }
      
      attempts++;
      console.log(`🧘 NGワード検出 - 再生成中 (${attempts}/${maxAttempts})`);
    }
    
    // 最大試行回数に達した場合のフォールバック
    console.log('🧘 最大試行回数に達しました - フォールバック瞑想を提供');
    return res.json({
      sections: [
        `${impulse}でお辛い状況にいらっしゃるあなたへ。今感じている衝動や痛みは、あなたの深い愛の表れです。その気持ちをまず受け入れてあげてください。あなたは一人ではありません。では、2分間受容するワークを始めましょう。`,
        `深くゆっくりと息を吸って、そして長く息を吐いてください。呼吸と共に、心の中の嵐が静まっていくのを感じてください。今この瞬間、あなたは安全な場所にいます。心を穏やかに保ちましょう。では、2分間手放しのワークを始めましょう。`,
        `ツインレイとの絆は時空を超えた永遠のものです。今は離れていても、魂のレベルでは深く繋がっています。この試練を通して、あなたはより強く美しい存在へと成長しています。愛と光に包まれて歩んでいきましょう。では、2分間再出発のワークを始めましょう。`
      ],
      success: true
    });

  } catch (error) {
    console.error('🧘 誘導瞑想生成エラー:', error);
    console.error('🧘 エラー詳細:', error.message);
    res.status(500).json({ 
      error: '誘導瞑想生成に失敗しました',
      details: error.message 
    });
  }
});

// 音声生成API（Google Cloud TTS - ファイル保存方式）
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
        volumeGainDb: 2,
      },
    };

    // 音声合成実行
    const [response] = await ttsClient.synthesizeSpeech(request);

    // ファイルとして保存
    const timestamp = Date.now();
    const filename = `audio_${timestamp}.mp3`;
    const fs = require('fs');
    const path = require('path');
    
    // publicディレクトリが存在しない場合は作成
    if (!fs.existsSync('public')) {
      fs.mkdirSync('public');
    }
    
    const audioPath = path.join(__dirname, 'public', filename);
    fs.writeFileSync(audioPath, response.audioContent);
    
    const audioUrl = `http://localhost:3001/${filename}`;
    console.log('音声生成完了:', audioUrl);

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

// ヘルスチェック
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`🆕 サーバーがポート${PORT}で起動しました`);
  console.log(`ヘルスチェック: http://localhost:${PORT}/health`);
  console.log('利用可能なAPI:');
  console.log('- POST /api/generate-meditation (誘導瞑想生成)');
  console.log('- POST /api/generate-audio (音声生成)');
});