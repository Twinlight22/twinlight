// import { useState, useEffect } from 'react';

// export default function ChannelingPage() {
//   const [question, setQuestion] = useState('');
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [showPlayer, setShowPlayer] = useState(false);
//   const [showWordInput, setShowWordInput] = useState(false);
//   const [showResult, setShowResult] = useState(false);
//   const [interpretationResult, setInterpretationResult] = useState<string>('');
//   const [generatedTexts, setGeneratedTexts] = useState<string[]>([]);
//   const [audioUrls, setAudioUrls] = useState<string[]>([]);
//   const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
//   const [audioSources, setAudioSources] = useState<AudioBufferSourceNode[]>([]);
//   const [receivedWords, setReceivedWords] = useState(Array(10).fill(''));
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [isPaused, setIsPaused] = useState(false);
//   const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
//   const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

//   useEffect(() => {
//     document.title = 'チャネリング誘導音声ワーク';
//   }, []);

//   // 固定テキスト（テスト用短縮版）
//   const openingText = `
// いまから、あなたの魂の声と静かにつながる時間をひらきます。

// 目を閉じて、呼吸を深くしていきましょう。
//   `.trim();

//   const practice1Text = `
// 言葉を超えたところに、
// 光のようにそっと降りてくる感覚を、
// ただ、まっすぐに受け取ってください。
// これは答えを探すための時間ではなく、
// あなた自身の内なる宇宙に、耳をすますための練習です。
// 目を閉じて、呼吸を深くしていきましょう。
//   `.trim();

//   const practice2Text = `
// あなたの内側に、小さな種が降りてくるのを感じてください。
// 意味や形を求めなくても構いません。
// ただ、その響きがどこから来たのかを信じて、
// 指先に、心に、そっと迎え入れてください。
// これは、あなたの魂と言葉が初めて出会う、神聖な儀式です。
//   `.trim();

//   const practice3Text = `
// いま、あなたの問いかけに応える声が、
// はっきりとしたかたちで届こうとしています。
// 思考ではなく、感じたままに受け取ってみてください。
// 浮かんできた言葉があれば、それを書き留めましょう。
// これは、あなた自身の深い領域と、
// "つながる"という行為を完成させる練習です。
//   `.trim();

//   const closingText = `
// 宇宙からの贈り物を受け取りました。
// 今日感じたすべては、あなたの魂に深く刻まれています。
// 受け取ったメッセージや感覚を、
// 感じたままに、まずは手元のメモに書き留めてください。
// それはあなたの内なる宇宙からの光の断片。
// まだ意味がわからなくても、思考をはさまず、ただ静かに写し取って。

// その言葉を、どうぞフォームに入力してください。
// 差し出されたひとつひとつの言葉を、静かに読み解いてまいります。
// これはあなたの魂の声を、この世界にあらわす神聖な通路です。
// この体験を胸に、日常という舞台で
// どうか光として在りつづけてください。
// お疲れさまでした。
// 愛と光に包まれて。
//   `.trim();

//   const handleSubmit = async () => {
//     if (!question.trim()) return;
    
//     setIsGenerating(true);
    
//     try {
//       // 1. チャネリングテキストを3回生成
//       const generatedTexts = [];
      
//       for (let i = 1; i <= 3; i++) {
//         const textResponse = await fetch('http://localhost:3001/api/generate-channeling', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ question })
//         });

//         if (!textResponse.ok) {
//           throw new Error(`チャネリングテキスト${i}の生成に失敗しました`);
//         }

//         const textData = await textResponse.json();
//         generatedTexts.push(textData.text);
//       }
      
//       setGeneratedTexts(generatedTexts);

//       // 2. 各セクションの音声を個別生成
//       const sections = [
//         openingText,
//         generatedTexts[0], 
//         practice1Text,
//         generatedTexts[1],
//         practice2Text, 
//         generatedTexts[2],
//         practice3Text,
//         closingText
//       ];

//       const audioUrls = [];
      
//       for (let i = 0; i < sections.length; i++) {
//         console.log(`🎵 セクション${i + 1}音声生成中...`);
        
//         const audioResponse = await fetch('http://localhost:3001/api/generate-audio', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ 
//             text: sections[i],
//             speed: 0.7
//           })
//         });

//         if (!audioResponse.ok) {
//           throw new Error(`セクション${i + 1}の音声生成に失敗しました`);
//         }

//         const audioData = await audioResponse.json();
//         audioUrls.push(audioData.audioUrl);
//       }

//       setAudioUrls(audioUrls);

//       setIsGenerating(false);
//       setShowPlayer(true);
      
//     } catch (error) {
//       console.error('チャネリング処理エラー:', error);
//       setIsGenerating(false);
//       alert('チャネリング処理中にエラーが発生しました: ' + error.message);
//     }
//   };

//   const createReverbImpulse = (audioContext: AudioContext, duration = 2, decay = 2) => {
//     const sampleRate = audioContext.sampleRate;
//     const length = sampleRate * duration;
//     const impulse = audioContext.createBuffer(2, length, sampleRate);
    
//     for (let channel = 0; channel < 2; channel++) {
//       const channelData = impulse.getChannelData(channel);
//       for (let i = 0; i < length; i++) {
//         // 美しいリバーブを作る式
//         const n = length - i;
//         channelData[i] = (Math.random() * 2 - 1) * Math.pow(n / length, decay);
//       }
//     }
//     return impulse;
//   };

//   const playSection = async (sectionIndex: number) => {
//     console.log('🎵 playSection開始:', { sectionIndex, audioUrls: audioUrls.length, isPlaying });
    
//     if (!audioUrls[sectionIndex]) {
//       console.error('❌ audioUrls[sectionIndex]が存在しない:', sectionIndex, audioUrls);
//       return;
//     }
    
//     if (isPlaying) {
//       console.log('⏸ 既に再生中なのでスキップ');
//       return;
//     }

//     try {
//       console.log('🎵 Audio作成開始:', audioUrls[sectionIndex]);
      
//       // HTMLAudioElementでセクション再生（シンプル版）
//       const audio = new Audio(audioUrls[sectionIndex]);
//       console.log('✅ Audio作成完了');
      
//       setCurrentAudio(audio);
//       console.log('✅ setCurrentAudio完了');

//       // 再生終了時の処理
//       audio.onended = () => {
//         console.log(`✅ セクション${sectionIndex + 1}再生終了`);
//         setIsPlaying(false);
        
//         // 次のセクションがあれば自動再生
//         if (sectionIndex < audioUrls.length - 1) {
//           setTimeout(() => {
//             setCurrentSectionIndex(sectionIndex + 1);
//             playSection(sectionIndex + 1);
//           }, 500);
//         } else {
//           // 全セクション終了
//           setIsPaused(false);
//           setCurrentSectionIndex(0);
//           setTimeout(() => {
//             setShowPlayer(false);
//             setShowWordInput(true);
//           }, 1000);
//         }
//       };

//       audio.onerror = (error) => {
//         console.error(`❌ セクション${sectionIndex + 1}audio.onerror:`, error);
//         alert('音声の再生中にエラーが発生しました');
//         setIsPlaying(false);
//         setIsPaused(false);
//       };

//       console.log('🎵 再生開始前...');
      
//       // 再生開始
//       await audio.play();
//       console.log('✅ audio.play()成功');
      
//       setIsPlaying(true);
//       setIsPaused(false);
//       setCurrentSectionIndex(sectionIndex);
      
//       console.log(`✅ セクション${sectionIndex + 1}再生開始完了`);

//     } catch (error) {
//       console.error(`❌ セクション${sectionIndex + 1}再生エラー:`, error);
//       console.error('❌ エラータイプ:', typeof error);
//       console.error('❌ エラー内容:', error.toString());
//       if (error instanceof Error) {
//         console.error('❌ エラーメッセージ:', error.message);
//         console.error('❌ エラースタック:', error.stack);
//       }
//       alert(`音声の再生中にエラーが発生しました: ${error}`);
//       setIsPlaying(false);
//       setIsPaused(false);
//     }
//   };

//   const playAudio = async () => {
//     if (!audioUrls.length || isPlaying) return;
//     playSection(0); // 最初のセクションから開始
//   };

//   const pauseAudio = () => {
//     if (currentAudio && isPlaying) {
//       currentAudio.pause();
//       setIsPlaying(false);
//       setIsPaused(true);
//     }
//   };

//   const resumeAudio = () => {
//     if (currentAudio && isPaused) {
//       currentAudio.play().then(() => {
//         setIsPlaying(true);
//         setIsPaused(false);
//       }).catch(error => {
//         console.error('音声再開エラー:', error);
//         alert('音声の再開に失敗しました');
//       });
//     }
//   };

//   const handleWordSubmit = async () => {
//     const filledWords = receivedWords.filter(word => word.trim());
    
//     if (filledWords.length === 0) {
//       alert('少なくとも1つの言葉を入力してください。');
//       return;
//     }
    
//     try {
//       console.log('📝 ワード読み解き開始:', { question, filledWords });
      
//       // 受け取った言葉を送信
//       const response = await fetch('http://localhost:3001/api/interpret-words', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ 
//           originalQuestion: question,
//           receivedWords: filledWords 
//         })
//       });
      
//       if (!response.ok) {
//         throw new Error('読み解きAPIエラー');
//       }
      
//       const result = await response.json();
//       console.log('✅ ワード読み解き完了:', result);
      
//       setInterpretationResult(result.interpretation);
//       setShowWordInput(false);
//       setShowResult(true);
      
//     } catch (error) {
//       console.error('❌ ワード読み解きエラー:', error);
//       alert('読み解き処理中にエラーが発生しました。再度お試しください。');
//     }
//   };

//   return (
//     <div>
//       {/* 入力フォーム画面 */}
//       {!showPlayer && !isGenerating && !showWordInput && !showResult && (
//         <div style={{
//           minHeight: '100vh',
//           backgroundColor: '#000099',
//           color: '#ffffdd',
//           fontFamily: "'Klee One', serif",
//           display: 'flex',
//           flexDirection: 'column' as const,
//           alignItems: 'center',
//           justifyContent: 'center',
//           padding: '7px 2.5px 60px 2.5px',
//           position: 'relative' as const
//         }}>
//           {/* 背景の光の効果 */}
//           <div style={{
//             position: 'absolute' as const,
//             top: '10%',
//             left: '20%',
//             width: '3px',
//             height: '3px',
//             backgroundColor: '#ffffdd',
//             borderRadius: '50%',
//             opacity: 0.6,
//             boxShadow: '0 0 20px #ffffdd, 0 0 40px #ffffdd'
//           }}></div>
//           <div style={{
//             position: 'absolute' as const,
//             top: '30%',
//             right: '15%',
//             width: '2px',
//             height: '2px',
//             backgroundColor: '#ffffdd',
//             borderRadius: '50%',
//             opacity: 0.4,
//             boxShadow: '0 0 15px #ffffdd'
//           }}></div>
//           <div style={{
//             position: 'absolute' as const,
//             bottom: '20%',
//             left: '10%',
//             width: '2px',
//             height: '2px',
//             backgroundColor: '#ffffdd',
//             borderRadius: '50%',
//             opacity: 0.5,
//             boxShadow: '0 0 18px #ffffdd'
//           }}></div>

//           <div style={{
//             maxWidth: '600px',
//             width: '100%',
//             textAlign: 'center' as const,
//             position: 'relative' as const,
//             zIndex: 10
//           }}>
            
//             {/* タイトル */}
//             <h1 style={{
//               fontSize: '36px',
//               fontWeight: 'normal' as const,
//               marginBottom: '20px',
//               letterSpacing: '3px',
//               lineHeight: '1.4',
//               textShadow: '0 0 20px rgba(255, 255, 221, 0.3)',
//               fontFamily: "'Klee One', serif"
//             }}>
//               チャネリング<br />誘導音声ワーク
//             </h1>

//             {/* サブタイトル */}
//             <h1 style={{
//               fontSize: '16px',
//               lineHeight: '1.8',
//               marginBottom: '35px',
//               opacity: 0.9,
//               letterSpacing: '1px',
//               fontFamily: "'Klee One', serif",
//               fontWeight: 'normal' as const,
//               textAlign: 'left' as const
//             }}>
//               聞きたいことをチャネリングで受け取り、内なる感覚を育てる練習ができるワークです。練習のあとには、受け取った言葉をもとに読み解きのメッセージを受け取ることもできます。
//             </h1>

//             {/* 説明 */}
//             <div style={{
//               fontSize: '12px',
//               marginBottom: '15px',
//               letterSpacing: '0.5px',
//               fontFamily: "'Klee One', serif",
//               opacity: 0.8,
//               textAlign: 'left' as const
//             }}>
//               チャネリングで受け取りたい "問い" を入力してください。
//             </div>

//             {/* フォーム */}
//             <div style={{
//               marginBottom: '40px',
//               position: 'relative' as const
//             }}>
//               <textarea
//                 value={question}
//                 onChange={(e) => setQuestion(e.target.value)}
//                 placeholder="例）今の私が前に進むために必要なことは？"
//                 style={{
//                   width: '100%',
//                   height: '120px',
//                   padding: '15px',
//                   border: 'none',
//                   backgroundColor: '#ffffff',
//                   color: '#000099',
//                   fontSize: '16px',
//                   lineHeight: '1.6',
//                   resize: 'none' as const,
//                   outline: 'none',
//                   fontFamily: "'Klee One', serif",
//                   letterSpacing: '0.5px',
//                   boxSizing: 'border-box' as const,
//                   boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 2px rgba(0, 0, 0, 0.05)'
//                 }}
//                 onFocus={(e) => {
//                   (e.target as HTMLTextAreaElement).style.backgroundColor = '#ffffff';
//                   (e.target as HTMLTextAreaElement).style.boxShadow = 'inset 0 3px 6px rgba(0, 0, 0, 0.15), inset 0 1px 3px rgba(0, 0, 0, 0.1)';
//                 }}
//                 onBlur={(e) => {
//                   (e.target as HTMLTextAreaElement).style.backgroundColor = '#ffffff';
//                   (e.target as HTMLTextAreaElement).style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 2px rgba(0, 0, 0, 0.05)';
//                 }}
//                 maxLength={100}
//               />

//               <button
//                 onClick={handleSubmit}
//                 disabled={!question.trim() || isGenerating}
//                 style={{
//                   width: '100%',
//                   padding: '18px 25px',
//                   border: 'none',
//                   backgroundColor: question.trim() && !isGenerating ? '#ffffdd' : 'rgba(255, 255, 221, 0.5)',
//                   color: question.trim() && !isGenerating ? '#000099' : 'rgba(0, 0, 153, 0.5)',
//                   fontSize: '16px',
//                   fontFamily: "'Klee One', serif",
//                   letterSpacing: '1px',
//                   cursor: question.trim() && !isGenerating ? 'pointer' : 'not-allowed',
//                   transition: 'all 0.3s ease',
//                   fontWeight: 'bold' as const,
//                   boxShadow: question.trim() && !isGenerating 
//                     ? '0 3px 6px rgba(0, 0, 0, 0.2), 0 1px 3px rgba(0, 0, 0, 0.3)' 
//                     : '0 1px 2px rgba(0, 0, 0, 0.1)',
//                   transform: 'translateY(0)'
//                 }}
//                 onMouseEnter={(e) => {
//                   if (question.trim() && !isGenerating) {
//                     (e.target as HTMLButtonElement).style.backgroundColor = '#ffffff';
//                     (e.target as HTMLButtonElement).style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 255, 255, 0.5), 0 0 40px rgba(255, 255, 255, 0.3)';
//                     (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)';
//                   }
//                 }}
//                 onMouseLeave={(e) => {
//                   if (question.trim() && !isGenerating) {
//                     (e.target as HTMLButtonElement).style.backgroundColor = '#ffffdd';
//                     (e.target as HTMLButtonElement).style.boxShadow = '0 3px 6px rgba(0, 0, 0, 0.2), 0 1px 3px rgba(0, 0, 0, 0.3)';
//                     (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
//                   }
//                 }}
//               >
//                 {isGenerating ? (
//                   <div style={{
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     gap: '10px'
//                   }}>
//                     <div style={{
//                       width: '16px',
//                       height: '16px',
//                       border: '2px solid rgba(0, 0, 153, 0.3)',
//                       borderTop: '2px solid #000099',
//                       borderRadius: '50%',
//                       animation: 'spin 1s linear infinite'
//                     }}></div>
//                     <span>チャネリング中...</span>
//                   </div>
//                 ) : (
//                   'チャネリングワークを開始'
//                 )}
//               </button>
//             </div>
            
//           </div>
//         </div>
//       )}

//       {/* 生成中画面 */}
//       {isGenerating && (
//         <div style={{
//           position: 'fixed' as const,
//           top: 0,
//           left: 0,
//           width: '100%',
//           height: '100%',
//           backgroundColor: 'rgba(0, 0, 153, 0.95)',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           zIndex: 9999,
//           fontFamily: "'Klee One', serif",
//           color: '#ffffdd'
//         }}>
//           <p style={{
//             fontSize: '18px',
//             textAlign: 'center' as const
//           }}>
//             あなたのための言葉を、<br />今 丁寧に編んでいます…
//           </p>
//         </div>
//       )}

//       {/* 音声プレーヤー画面 */}
//       {showPlayer && (
//         <div style={{
//           minHeight: '100vh',
//           backgroundColor: '#000099',
//           color: '#ffffdd',
//           fontFamily: "'Klee One', serif",
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           padding: '20px'
//         }}>
//           <div style={{
//             maxWidth: '500px',
//             width: '100%',
//             textAlign: 'center' as const
//           }}>
//             <p style={{
//               fontSize: '18px',
//               lineHeight: '1.8',
//               marginBottom: '40px'
//             }}>
//               いま、あなたのための言葉が<br />紡がれました。<br />
//               その響きに、心をゆだねてみてください。
//             </p>

//             <div style={{
//               background: 'rgba(255, 255, 221, 0.1)',
//               border: '1px solid rgba(255, 255, 221, 0.3)',
//               borderRadius: '8px',
//               padding: '40px 30px'
//             }}>
//               <button 
//                 onClick={() => {
//                   if (!isPlaying && !isPaused) {
//                     playAudio();
//                   } else if (isPlaying) {
//                     pauseAudio();
//                   } else if (isPaused) {
//                     resumeAudio();
//                   }
//                 }}
//                 style={{
//                   width: '60px',
//                   height: '60px',
//                   borderRadius: '50%',
//                   border: '2px solid #ffffdd',
//                   backgroundColor: 'rgba(255, 255, 221, 0.1)',
//                   color: '#ffffdd',
//                   cursor: 'pointer',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   fontSize: '20px',
//                   margin: '0 auto 20px'
//                 }}
//               >
//                 {isPlaying ? '⏸' : '▶'}
//               </button>

//               <div style={{
//                 fontSize: '14px',
//                 opacity: 0.7,
//                 marginBottom: '15px'
//               }}>
//                 {isPlaying ? 
//                   `セクション${currentSectionIndex + 1}/8 再生中...` : 
//                   isPaused ? '一時停止中' : '練習セッション準備完了'
//                 }
//               </div>

//               <div style={{
//                 fontSize: '12px',
//                 opacity: 0.6,
//                 marginBottom: '10px'
//               }}>
//                 {['導入', 'チャネリング①', '練習①', 'チャネリング②', '練習②', 'チャネリング③', '練習③', '終了'][currentSectionIndex] || '準備中'}
//               </div>

//               {/* デバッグ用：音声飛ばしてワード入力へ */}
//               <button
//                 onClick={() => {
//                   // 音声停止
//                   if (currentAudio) {
//                     currentAudio.pause();
//                   }
//                   setIsPlaying(false);
//                   setIsPaused(false);
//                   // ワード入力画面へ
//                   setShowPlayer(false);
//                   setShowWordInput(true);
//                 }}
//                 style={{
//                   padding: '6px 12px',
//                   border: 'none',
//                   backgroundColor: 'rgba(255, 102, 0, 0.3)',
//                   color: '#ff6600',
//                   fontSize: '11px',
//                   fontFamily: "'Klee One', serif",
//                   cursor: 'pointer',
//                   transition: 'all 0.3s ease',
//                   marginTop: '10px',
//                   borderRadius: '4px'
//                 }}
//                 onMouseEnter={(e) => {
//                   (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(255, 102, 0, 0.5)';
//                 }}
//                 onMouseLeave={(e) => {
//                   (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(255, 102, 0, 0.3)';
//                 }}
//               >
//                 音声スキップ→ワード入力
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ワード入力画面 */}
//       {showWordInput && (
//         <div style={{
//           minHeight: '100vh',
//           backgroundColor: '#000099',
//           color: '#ffffdd',
//           fontFamily: "'Klee One', serif",
//           display: 'flex',
//           flexDirection: 'column' as const,
//           alignItems: 'center',
//           justifyContent: 'center',
//           padding: '7px 20px 60px 20px',
//           position: 'relative' as const
//         }}>
//           {/* 背景の光の効果 */}
//           <div style={{
//             position: 'absolute' as const,
//             top: '10%',
//             left: '20%',
//             width: '3px',
//             height: '3px',
//             backgroundColor: '#ffffdd',
//             borderRadius: '50%',
//             opacity: 0.6,
//             boxShadow: '0 0 20px #ffffdd, 0 0 40px #ffffdd'
//           }}></div>
//           <div style={{
//             position: 'absolute' as const,
//             top: '30%',
//             right: '15%',
//             width: '2px',
//             height: '2px',
//             backgroundColor: '#ffffdd',
//             borderRadius: '50%',
//             opacity: 0.4,
//             boxShadow: '0 0 15px #ffffdd'
//           }}></div>
//           <div style={{
//             position: 'absolute' as const,
//             bottom: '20%',
//             left: '10%',
//             width: '2px',
//             height: '2px',
//             backgroundColor: '#ffffdd',
//             borderRadius: '50%',
//             opacity: 0.5,
//             boxShadow: '0 0 18px #ffffdd'
//           }}></div>

//           <div style={{
//             maxWidth: '600px',
//             width: '100%',
//             textAlign: 'center' as const,
//             position: 'relative' as const,
//             zIndex: 10
//           }}>
            
//             {/* タイトル */}
//             <h1 style={{
//               fontSize: '24px',
//               fontWeight: 'bold' as const,
//               marginBottom: '30px',
//               letterSpacing: '2px',
//               lineHeight: '1.4',
//               textShadow: '0 0 25px rgba(255, 255, 221, 0.6), 0 0 50px rgba(255, 255, 221, 0.4)',
//               fontFamily: "'Klee One', serif",
//               color: '#FFD700'
//             }}>
//               感じ取った言葉の読み解き
//             </h1>

//             {/* 説明文 */}
//             <div style={{
//               fontSize: '16px',
//               lineHeight: '1.8',
//               marginBottom: '35px',
//               opacity: 0.9,
//               letterSpacing: '1px',
//               fontFamily: "'Klee One', serif",
//               textAlign: 'left' as const
//             }}>
//               書き留めていた言葉たちを、この場所に映してください。秘められた意味は、このあと静かに開かれていきます。受け取った言葉を入力してください。
//             </div>

//             {/* フォーム */}
//             <div style={{
//               marginBottom: '40px',
//               position: 'relative' as const
//             }}>
//               <div style={{
//                 display: 'grid',
//                 gridTemplateColumns: 'repeat(2, 1fr)',
//                 gap: '10px',
//                 marginBottom: '0'
//               }}>
//                 {[...Array(10)].map((_, i) => (
//                   <input
//                     key={i}
//                     type="text"
//                     value={receivedWords[i]}
//                     onChange={(e) => {
//                       const newWords = [...receivedWords];
//                       newWords[i] = e.target.value;
//                       setReceivedWords(newWords);
//                     }}
//                     placeholder={`言葉${i + 1}`}
//                     style={{
//                       width: '100%',
//                       height: '40px',
//                       padding: '15px',
//                       border: 'none',
//                       backgroundColor: '#ffffff',
//                       color: '#000099',
//                       fontSize: '16px',
//                       outline: 'none',
//                       fontFamily: "'Klee One', serif",
//                       letterSpacing: '0.5px',
//                       boxSizing: 'border-box' as const,
//                       boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 2px rgba(0, 0, 0, 0.05)'
//                     }}
//                     onFocus={(e) => {
//                       (e.target as HTMLInputElement).style.backgroundColor = '#ffffff';
//                       (e.target as HTMLInputElement).style.boxShadow = 'inset 0 3px 6px rgba(0, 0, 0, 0.15), inset 0 1px 3px rgba(0, 0, 0, 0.1)';
//                     }}
//                     onBlur={(e) => {
//                       (e.target as HTMLInputElement).style.backgroundColor = '#ffffff';
//                       (e.target as HTMLInputElement).style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 2px rgba(0, 0, 0, 0.05)';
//                     }}
//                   />
//                 ))}
//               </div>

//               <button
//                 onClick={handleWordSubmit}
//                 disabled={receivedWords.every(word => !word.trim())}
//                 style={{
//                   width: '100%',
//                   padding: '18px 25px',
//                   border: 'none',
//                   backgroundColor: receivedWords.some(word => word.trim()) ? '#ffffdd' : 'rgba(255, 255, 221, 0.5)',
//                   color: receivedWords.some(word => word.trim()) ? '#000099' : 'rgba(0, 0, 153, 0.5)',
//                   fontSize: '16px',
//                   fontFamily: "'Klee One', serif",
//                   letterSpacing: '1px',
//                   cursor: receivedWords.some(word => word.trim()) ? 'pointer' : 'not-allowed',
//                   transition: 'all 0.3s ease',
//                   fontWeight: 'bold' as const,
//                   boxShadow: receivedWords.some(word => word.trim()) 
//                     ? '0 3px 6px rgba(0, 0, 0, 0.2), 0 1px 3px rgba(0, 0, 0, 0.3)' 
//                     : '0 1px 2px rgba(0, 0, 0, 0.1)',
//                   transform: 'translateY(0)',
//                   marginTop: '15px'
//                 }}
//                 onMouseEnter={(e) => {
//                   if (receivedWords.some(word => word.trim())) {
//                     (e.target as HTMLButtonElement).style.backgroundColor = '#ffffff';
//                     (e.target as HTMLButtonElement).style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 255, 255, 0.5), 0 0 40px rgba(255, 255, 255, 0.3)';
//                     (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)';
//                   }
//                 }}
//                 onMouseLeave={(e) => {
//                   if (receivedWords.some(word => word.trim())) {
//                     (e.target as HTMLButtonElement).style.backgroundColor = '#ffffdd';
//                     (e.target as HTMLButtonElement).style.boxShadow = '0 3px 6px rgba(0, 0, 0, 0.2), 0 1px 3px rgba(0, 0, 0, 0.3)';
//                     (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
//                   }
//                 }}
//               >
//                 受け取ったことばを読み解く
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* 解析結果画面 */}
//       {showResult && (
//         <div
//           className="font-klee"
//           style={{
//             backgroundColor: "#000099",
//             color: "#ffffdd",
//             minHeight: "100vh",
//             display: "flex",
//             flexDirection: "column",
//             alignItems: "center",
//             padding: "30px 20px",
//           }}
//         >
//           {/* メインタイトル */}
//           <h1 style={{ fontSize: "1.25rem", marginBottom: "1rem", fontWeight: "normal", color: "#ff4444" }}>
//             チャネリング読み解き結果
//           </h1>

//           {/* 質問内容 */}
//           <h3 style={{ 
//             fontSize: "1.1rem", 
//             marginBottom: "0.5rem", 
//             color: "#FFD700",
//             fontWeight: "bold",
//             textAlign: "center",
//             maxWidth: "600px"
//           }}>
//             あなたの問いかけ
//           </h3>
//           <div style={{
//             maxWidth: "600px",
//             width: "100%",
//             margin: "0 20px",
//             marginBottom: "1rem",
//             padding: "15px",
//             backgroundColor: "rgba(255, 255, 221, 0.03)",
//             border: "1px solid rgba(255, 255, 221, 0.15)",
//             borderRadius: "8px",
//             textAlign: "center",
//           }}>
//             <p style={{ 
//               fontSize: "16px", 
//               lineHeight: "1.6",
//               margin: "0"
//             }}>
//               {question}
//             </p>
//           </div>

//           {/* 受け取った言葉 */}
//           <h3 style={{ 
//             fontSize: "1.1rem", 
//             marginBottom: "0.5rem", 
//             color: "#FFD700",
//             fontWeight: "bold",
//             textAlign: "center",
//             maxWidth: "600px"
//           }}>
//             受け取った言葉
//           </h3>
//           <div style={{
//             maxWidth: "600px",
//             width: "100%",
//             margin: "0 20px",
//             marginBottom: "1rem",
//             padding: "15px",
//             backgroundColor: "rgba(255, 255, 221, 0.03)",
//             border: "1px solid rgba(255, 255, 221, 0.15)",
//             borderRadius: "8px",
//             textAlign: "center",
//           }}>
//             <p style={{ 
//               fontSize: "16px", 
//               lineHeight: "1.6",
//               margin: "0"
//             }}>
//               {receivedWords.filter(word => word.trim()).join('、')}
//             </p>
//           </div>

//           {/* 読み解き結果 */}
//           <h3 style={{ 
//             fontSize: "1.2rem", 
//             marginBottom: "0.5rem", 
//             color: "#FFD700",
//             fontWeight: "bold",
//             textShadow: "0 0 10px rgba(255, 215, 0, 0.5)",
//             textAlign: "center",
//             maxWidth: "600px"
//           }}>
//             魂からのメッセージ
//           </h3>
//           <div style={{
//             maxWidth: "600px",
//             width: "100%",
//             margin: "0 20px",
//             marginBottom: "1rem",
//             padding: "20px",
//             backgroundColor: "rgba(255, 255, 221, 0.04)",
//             border: "1px solid rgba(255, 215, 0, 0.2)",
//             borderRadius: "12px",
//             textAlign: "left",
//             maxHeight: "400px",
//             overflowY: "auto"
//           }}>
//             <div style={{ 
//               fontSize: "16px", 
//               lineHeight: "1.8",
//               whiteSpace: "pre-wrap" as const,
//               color: "#ffffdd"
//             }}>
//               {interpretationResult}
//             </div>
//           </div>

//           {/* メニューへ戻るリンク */}
//           <div style={{ textAlign: "center", marginTop: "20px" }}>
//             <a
//               href="/home"
//               style={{
//                 fontSize: "16px",
//                 color: "rgba(255, 255, 221, 0.7)",
//                 textDecoration: "underline",
//                 fontFamily: "'Klee One', serif",
//                 transition: "all 0.3s ease",
//                 display: "inline-block",
//                 padding: "8px 0"
//               }}
//               onMouseEnter={(e) => {
//                 (e.target as HTMLAnchorElement).style.color = "#ffffdd";
//                 (e.target as HTMLAnchorElement).style.textShadow = "0 0 8px rgba(255, 255, 221, 0.5)";
//               }}
//               onMouseLeave={(e) => {
//                 (e.target as HTMLAnchorElement).style.color = "rgba(255, 255, 221, 0.7)";
//                 (e.target as HTMLAnchorElement).style.textShadow = "none";
//               }}
//             >
//               メニューへ戻る
//             </a>
//           </div>
//         </div>
//       )}

//       <style jsx>{`
//         @keyframes spin {
//           0% { transform: rotate(0deg); }
//           100% { transform: rotate(360deg); }
//         }
//       `}</style>
//     </div>
//   );
// }

// // import { useState, useEffect } from 'react';


// // export default function ChannelingPage() {
// //   const [question, setQuestion] = useState('');
// //   const [isGenerating, setIsGenerating] = useState(false);
// //   const [showPlayer, setShowPlayer] = useState(false);
// //   const [showWordInput, setShowWordInput] = useState(false);
// //   const [showResult, setShowResult] = useState(false);
// //   const [interpretationResult, setInterpretationResult] = useState<string>('');
// //   const [generatedTexts, setGeneratedTexts] = useState<string[]>([]);
// //   const [audioUrls, setAudioUrls] = useState<string[]>([]);
// //   const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
// //   const [audioSources, setAudioSources] = useState<AudioBufferSourceNode[]>([]);
// //   const [receivedWords, setReceivedWords] = useState(Array(10).fill(''));
// //   const [isPlaying, setIsPlaying] = useState(false);
// //   const [isPaused, setIsPaused] = useState(false);
// //   const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
// //   const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

// //   useEffect(() => {
// //     document.title = 'チャネリング誘導音声ワーク';
// //   }, []);

// //   // 固定テキスト（テスト用短縮版）
// //   const openingText = `
// // いまから、あなたの魂の声と静かにつながる時間をひらきます。

// // 目を閉じて、呼吸を深くしていきましょう。
// //   `.trim();

// //   const practice1Text = `
// // 言葉を超えたところに、
// // 光のようにそっと降りてくる感覚を、
// // ただ、まっすぐに受け取ってください。
// // これは答えを探すための時間ではなく、
// // あなた自身の内なる宇宙に、耳をすますための練習です。
// // 目を閉じて、呼吸を深くしていきましょう。
// //   `.trim();

// //   const practice2Text = `
// // あなたの内側に、小さな種が降りてくるのを感じてください。
// // 意味や形を求めなくても構いません。
// // ただ、その響きがどこから来たのかを信じて、
// // 指先に、心に、そっと迎え入れてください。
// // これは、あなたの魂と言葉が初めて出会う、神聖な儀式です。
// //   `.trim();

// //   const practice3Text = `
// // いま、あなたの問いかけに応える声が、
// // はっきりとしたかたちで届こうとしています。
// // 思考ではなく、感じたままに受け取ってみてください。
// // 浮かんできた言葉があれば、それを書き留めましょう。
// // これは、あなた自身の深い領域と、
// // "つながる"という行為を完成させる練習です。
// //   `.trim();

// //   const closingText = `
// // 宇宙からの贈り物を受け取りました。
// // 今日感じたすべては、あなたの魂に深く刻まれています。
// // 受け取ったメッセージや感覚を、
// // 感じたままに、まずは手元のメモに書き留めてください。
// // それはあなたの内なる宇宙からの光の断片。
// // まだ意味がわからなくても、思考をはさまず、ただ静かに写し取って。

// // その言葉を、どうぞフォームに入力してください。
// // 差し出されたひとつひとつの言葉を、静かに読み解いてまいります。
// // これはあなたの魂の声を、この世界にあらわす神聖な通路です。
// // この体験を胸に、日常という舞台で
// // どうか光として在りつづけてください。
// // お疲れさまでした。
// // 愛と光に包まれて。
// //   `.trim();

// //   const handleSubmit = async () => {
// //     if (!question.trim()) return;
    
// //     setIsGenerating(true);
    
// //     try {
// //       // 1. チャネリングテキストを3回生成
// //       const generatedTexts = [];
      
// //       for (let i = 1; i <= 3; i++) {
// //         const textResponse = await fetch('http://localhost:3001/api/generate-channeling', {
// //           method: 'POST',
// //           headers: { 'Content-Type': 'application/json' },
// //           body: JSON.stringify({ question })
// //         });

// //         if (!textResponse.ok) {
// //           throw new Error(`チャネリングテキスト${i}の生成に失敗しました`);
// //         }

// //         const textData = await textResponse.json();
// //         generatedTexts.push(textData.text);
// //       }
      
// //       setGeneratedTexts(generatedTexts);

// //       // 2. 各セクションの音声を個別生成
// //       const sections = [
// //         openingText,
// //         generatedTexts[0], 
// //         practice1Text,
// //         generatedTexts[1],
// //         practice2Text, 
// //         generatedTexts[2],
// //         practice3Text,
// //         closingText
// //       ];

// //       const audioUrls = [];
      
// //       for (let i = 0; i < sections.length; i++) {
// //         console.log(`🎵 セクション${i + 1}音声生成中...`);
        
// //         const audioResponse = await fetch('http://localhost:3001/api/generate-audio', {
// //           method: 'POST',
// //           headers: { 'Content-Type': 'application/json' },
// //           body: JSON.stringify({ 
// //             text: sections[i],
// //             speed: 0.7
// //           })
// //         });

// //         if (!audioResponse.ok) {
// //           throw new Error(`セクション${i + 1}の音声生成に失敗しました`);
// //         }

// //         const audioData = await audioResponse.json();
// //         audioUrls.push(audioData.audioUrl);
// //       }

// //       setAudioUrls(audioUrls);

// //       setIsGenerating(false);
// //       setShowPlayer(true);
      
// //     } catch (error) {
// //       console.error('チャネリング処理エラー:', error);
// //       setIsGenerating(false);
// //       alert('チャネリング処理中にエラーが発生しました: ' + error.message);
// //     }
// //   };

// //   const createReverbImpulse = (audioContext: AudioContext, duration = 2, decay = 2) => {
// //     const sampleRate = audioContext.sampleRate;
// //     const length = sampleRate * duration;
// //     const impulse = audioContext.createBuffer(2, length, sampleRate);
    
// //     for (let channel = 0; channel < 2; channel++) {
// //       const channelData = impulse.getChannelData(channel);
// //       for (let i = 0; i < length; i++) {
// //         // 美しいリバーブを作る式
// //         const n = length - i;
// //         channelData[i] = (Math.random() * 2 - 1) * Math.pow(n / length, decay);
// //       }
// //     }
// //     return impulse;
// //   };

// //   const playSection = async (sectionIndex: number) => {
// //     console.log('🎵 playSection開始:', { sectionIndex, audioUrls: audioUrls.length, isPlaying });
    
// //     if (!audioUrls[sectionIndex]) {
// //       console.error('❌ audioUrls[sectionIndex]が存在しない:', sectionIndex, audioUrls);
// //       return;
// //     }
    
// //     if (isPlaying) {
// //       console.log('⏸ 既に再生中なのでスキップ');
// //       return;
// //     }

// //     try {
// //       console.log('🎵 Audio作成開始:', audioUrls[sectionIndex]);
      
// //       // HTMLAudioElementでセクション再生（シンプル版）
// //       const audio = new Audio(audioUrls[sectionIndex]);
// //       console.log('✅ Audio作成完了');
      
// //       setCurrentAudio(audio);
// //       console.log('✅ setCurrentAudio完了');

// //       // 再生終了時の処理
// //       audio.onended = () => {
// //         console.log(`✅ セクション${sectionIndex + 1}再生終了`);
// //         setIsPlaying(false);
        
// //         // 次のセクションがあれば自動再生
// //         if (sectionIndex < audioUrls.length - 1) {
// //           setTimeout(() => {
// //             setCurrentSectionIndex(sectionIndex + 1);
// //             playSection(sectionIndex + 1);
// //           }, 500);
// //         } else {
// //           // 全セクション終了
// //           setIsPaused(false);
// //           setCurrentSectionIndex(0);
// //           setTimeout(() => {
// //             setShowPlayer(false);
// //             setShowWordInput(true);
// //           }, 1000);
// //         }
// //       };

// //       audio.onerror = (error) => {
// //         console.error(`❌ セクション${sectionIndex + 1}audio.onerror:`, error);
// //         alert('音声の再生中にエラーが発生しました');
// //         setIsPlaying(false);
// //         setIsPaused(false);
// //       };

// //       console.log('🎵 再生開始前...');
      
// //       // 再生開始
// //       await audio.play();
// //       console.log('✅ audio.play()成功');
      
// //       setIsPlaying(true);
// //       setIsPaused(false);
// //       setCurrentSectionIndex(sectionIndex);
      
// //       console.log(`✅ セクション${sectionIndex + 1}再生開始完了`);

// //     } catch (error) {
// //       console.error(`❌ セクション${sectionIndex + 1}再生エラー:`, error);
// //       console.error('❌ エラータイプ:', typeof error);
// //       console.error('❌ エラー内容:', error.toString());
// //       if (error instanceof Error) {
// //         console.error('❌ エラーメッセージ:', error.message);
// //         console.error('❌ エラースタック:', error.stack);
// //       }
// //       alert(`音声の再生中にエラーが発生しました: ${error}`);
// //       setIsPlaying(false);
// //       setIsPaused(false);
// //     }
// //   };

// //   const playAudio = async () => {
// //     if (!audioUrls.length || isPlaying) return;
// //     playSection(0); // 最初のセクションから開始
// //   };

// //   const pauseAudio = () => {
// //     if (currentAudio && isPlaying) {
// //       currentAudio.pause();
// //       setIsPlaying(false);
// //       setIsPaused(true);
// //     }
// //   };

// //   const resumeAudio = () => {
// //     if (currentAudio && isPaused) {
// //       currentAudio.play().then(() => {
// //         setIsPlaying(true);
// //         setIsPaused(false);
// //       }).catch(error => {
// //         console.error('音声再開エラー:', error);
// //         alert('音声の再開に失敗しました');
// //       });
// //     }
// //   };

// //   const handleWordSubmit = async () => {
// //     const filledWords = receivedWords.filter(word => word.trim());
    
// //     if (filledWords.length === 0) {
// //       alert('少なくとも1つの言葉を入力してください。');
// //       return;
// //     }
    
// //     try {
// //       console.log('📝 ワード読み解き開始:', { question, filledWords });
      
// //       // 受け取った言葉を送信
// //       const response = await fetch('http://localhost:3001/api/interpret-words', {
// //         method: 'POST',
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify({ 
// //           originalQuestion: question,
// //           receivedWords: filledWords 
// //         })
// //       });
      
// //       if (!response.ok) {
// //         throw new Error('読み解きAPIエラー');
// //       }
      
// //       const result = await response.json();
// //       console.log('✅ ワード読み解き完了:', result);
      
// //       setInterpretationResult(result.interpretation);
// //       setShowWordInput(false);
// //       setShowResult(true);
      
// //     } catch (error) {
// //       console.error('❌ ワード読み解きエラー:', error);
// //       alert('読み解き処理中にエラーが発生しました。再度お試しください。');
// //     }
// //   };

// //   return (
// //     <div>
// //       {/* 入力フォーム画面 */}
// //       {!showPlayer && !isGenerating && !showWordInput && !showResult && (
// //         <div style={{
// //           minHeight: '100vh',
// //           backgroundColor: '#000099',
// //           color: '#ffffdd',
// //           fontFamily: "'Klee One', serif",
// //           display: 'flex',
// //           flexDirection: 'column' as const,
// //           alignItems: 'center',
// //           justifyContent: 'center',
// //           padding: '7px 2.5px 60px 2.5px',
// //           position: 'relative' as const
// //         }}>
// //           {/* 背景の光の効果 */}
// //           <div style={{
// //             position: 'absolute' as const,
// //             top: '10%',
// //             left: '20%',
// //             width: '3px',
// //             height: '3px',
// //             backgroundColor: '#ffffdd',
// //             borderRadius: '50%',
// //             opacity: 0.6,
// //             boxShadow: '0 0 20px #ffffdd, 0 0 40px #ffffdd'
// //           }}></div>
// //           <div style={{
// //             position: 'absolute' as const,
// //             top: '30%',
// //             right: '15%',
// //             width: '2px',
// //             height: '2px',
// //             backgroundColor: '#ffffdd',
// //             borderRadius: '50%',
// //             opacity: 0.4,
// //             boxShadow: '0 0 15px #ffffdd'
// //           }}></div>
// //           <div style={{
// //             position: 'absolute' as const,
// //             bottom: '20%',
// //             left: '10%',
// //             width: '2px',
// //             height: '2px',
// //             backgroundColor: '#ffffdd',
// //             borderRadius: '50%',
// //             opacity: 0.5,
// //             boxShadow: '0 0 18px #ffffdd'
// //           }}></div>

// //           <div style={{
// //             maxWidth: '600px',
// //             width: '100%',
// //             textAlign: 'center' as const,
// //             position: 'relative' as const,
// //             zIndex: 10
// //           }}>
            
// //             {/* タイトル */}
// //             <h1 style={{
// //               fontSize: '36px',
// //               fontWeight: 'normal' as const,
// //               marginBottom: '20px',
// //               letterSpacing: '3px',
// //               lineHeight: '1.4',
// //               textShadow: '0 0 20px rgba(255, 255, 221, 0.3)',
// //               fontFamily: "'Klee One', serif"
// //             }}>
// //               チャネリング<br />誘導音声ワーク
// //             </h1>

// //             {/* サブタイトル */}
// //             <h1 style={{
// //               fontSize: '16px',
// //               lineHeight: '1.8',
// //               marginBottom: '35px',
// //               opacity: 0.9,
// //               letterSpacing: '1px',
// //               fontFamily: "'Klee One', serif",
// //               fontWeight: 'normal' as const,
// //               textAlign: 'left' as const
// //             }}>
// //               聞きたいことをチャネリングで受け取り、内なる感覚を育てる練習ができるワークです。練習のあとには、受け取った言葉をもとに読み解きのメッセージを受け取ることもできます。
// //             </h1>

// //             {/* 説明 */}
// //             <div style={{
// //               fontSize: '12px',
// //               marginBottom: '15px',
// //               letterSpacing: '0.5px',
// //               fontFamily: "'Klee One', serif",
// //               opacity: 0.8,
// //               textAlign: 'left' as const
// //             }}>
// //               チャネリングで受け取りたい "問い" を入力してください。
// //             </div>

// //             {/* フォーム */}
// //             <div style={{
// //               marginBottom: '40px',
// //               position: 'relative' as const
// //             }}>
// //               <textarea
// //                 value={question}
// //                 onChange={(e) => setQuestion(e.target.value)}
// //                 placeholder="例）彼にはもう会えないのでしょうか？"
// //                 style={{
// //                   width: '100%',
// //                   height: '120px',
// //                   padding: '15px',
// //                   border: 'none',
// //                   backgroundColor: '#ffffff',
// //                   color: '#000099',
// //                   fontSize: '16px',
// //                   lineHeight: '1.6',
// //                   resize: 'none' as const,
// //                   outline: 'none',
// //                   fontFamily: "'Klee One', serif",
// //                   letterSpacing: '0.5px',
// //                   boxSizing: 'border-box' as const,
// //                   boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 2px rgba(0, 0, 0, 0.05)'
// //                 }}
// //                 onFocus={(e) => {
// //                   (e.target as HTMLTextAreaElement).style.backgroundColor = '#ffffff';
// //                   (e.target as HTMLTextAreaElement).style.boxShadow = 'inset 0 3px 6px rgba(0, 0, 0, 0.15), inset 0 1px 3px rgba(0, 0, 0, 0.1)';
// //                 }}
// //                 onBlur={(e) => {
// //                   (e.target as HTMLTextAreaElement).style.backgroundColor = '#ffffff';
// //                   (e.target as HTMLTextAreaElement).style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 2px rgba(0, 0, 0, 0.05)';
// //                 }}
// //                 maxLength={100}
// //               />

// //               <button
// //                 onClick={handleSubmit}
// //                 disabled={!question.trim() || isGenerating}
// //                 style={{
// //                   width: '100%',
// //                   padding: '18px 25px',
// //                   border: 'none',
// //                   backgroundColor: question.trim() && !isGenerating ? '#ffffdd' : 'rgba(255, 255, 221, 0.5)',
// //                   color: question.trim() && !isGenerating ? '#000099' : 'rgba(0, 0, 153, 0.5)',
// //                   fontSize: '16px',
// //                   fontFamily: "'Klee One', serif",
// //                   letterSpacing: '1px',
// //                   cursor: question.trim() && !isGenerating ? 'pointer' : 'not-allowed',
// //                   transition: 'all 0.3s ease',
// //                   fontWeight: 'bold' as const,
// //                   boxShadow: question.trim() && !isGenerating 
// //                     ? '0 3px 6px rgba(0, 0, 0, 0.2), 0 1px 3px rgba(0, 0, 0, 0.3)' 
// //                     : '0 1px 2px rgba(0, 0, 0, 0.1)',
// //                   transform: 'translateY(0)'
// //                 }}
// //                 onMouseEnter={(e) => {
// //                   if (question.trim() && !isGenerating) {
// //                     (e.target as HTMLButtonElement).style.backgroundColor = '#ffffff';
// //                     (e.target as HTMLButtonElement).style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 255, 255, 0.5), 0 0 40px rgba(255, 255, 255, 0.3)';
// //                     (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)';
// //                   }
// //                 }}
// //                 onMouseLeave={(e) => {
// //                   if (question.trim() && !isGenerating) {
// //                     (e.target as HTMLButtonElement).style.backgroundColor = '#ffffdd';
// //                     (e.target as HTMLButtonElement).style.boxShadow = '0 3px 6px rgba(0, 0, 0, 0.2), 0 1px 3px rgba(0, 0, 0, 0.3)';
// //                     (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
// //                   }
// //                 }}
// //               >
// //                 {isGenerating ? (
// //                   <div style={{
// //                     display: 'flex',
// //                     alignItems: 'center',
// //                     justifyContent: 'center',
// //                     gap: '10px'
// //                   }}>
// //                     <div style={{
// //                       width: '16px',
// //                       height: '16px',
// //                       border: '2px solid rgba(0, 0, 153, 0.3)',
// //                       borderTop: '2px solid #000099',
// //                       borderRadius: '50%',
// //                       animation: 'spin 1s linear infinite'
// //                     }}></div>
// //                     <span>チャネリング中...</span>
// //                   </div>
// //                 ) : (
// //                   'チャネリングワークを開始'
// //                 )}
// //               </button>
// //             </div>
            
// //           </div>
// //         </div>
// //       )}

// //       {/* 生成中画面 */}
// //       {isGenerating && (
// //         <div style={{
// //           position: 'fixed' as const,
// //           top: 0,
// //           left: 0,
// //           width: '100%',
// //           height: '100%',
// //           backgroundColor: 'rgba(0, 0, 153, 0.95)',
// //           display: 'flex',
// //           alignItems: 'center',
// //           justifyContent: 'center',
// //           zIndex: 9999,
// //           fontFamily: "'Klee One', serif",
// //           color: '#ffffdd'
// //         }}>
// //           <p style={{
// //             fontSize: '18px',
// //             textAlign: 'center' as const
// //           }}>
// //             あなたのための言葉を、<br />今 丁寧に編んでいます…
// //           </p>
// //         </div>
// //       )}

// //       {/* 音声プレーヤー画面 */}
// //       {showPlayer && (
// //         <div style={{
// //           minHeight: '100vh',
// //           backgroundColor: '#000099',
// //           color: '#ffffdd',
// //           fontFamily: "'Klee One', serif",
// //           display: 'flex',
// //           alignItems: 'center',
// //           justifyContent: 'center',
// //           padding: '20px'
// //         }}>
// //           <div style={{
// //             maxWidth: '500px',
// //             width: '100%',
// //             textAlign: 'center' as const
// //           }}>
// //             <p style={{
// //               fontSize: '18px',
// //               lineHeight: '1.8',
// //               marginBottom: '40px'
// //             }}>
// //               いま、あなたのための言葉が<br />紡がれました。<br />
// //               その響きに、心をゆだねてみてください。
// //             </p>

// //             <div style={{
// //               background: 'rgba(255, 255, 221, 0.1)',
// //               border: '1px solid rgba(255, 255, 221, 0.3)',
// //               borderRadius: '8px',
// //               padding: '40px 30px'
// //             }}>
// //               <button 
// //                 onClick={() => {
// //                   if (!isPlaying && !isPaused) {
// //                     playAudio();
// //                   } else if (isPlaying) {
// //                     pauseAudio();
// //                   } else if (isPaused) {
// //                     resumeAudio();
// //                   }
// //                 }}
// //                 style={{
// //                   width: '60px',
// //                   height: '60px',
// //                   borderRadius: '50%',
// //                   border: '2px solid #ffffdd',
// //                   backgroundColor: 'rgba(255, 255, 221, 0.1)',
// //                   color: '#ffffdd',
// //                   cursor: 'pointer',
// //                   display: 'flex',
// //                   alignItems: 'center',
// //                   justifyContent: 'center',
// //                   fontSize: '20px',
// //                   margin: '0 auto 20px'
// //                 }}
// //               >
// //                 {isPlaying ? '⏸' : '▶'}
// //               </button>

// //               <div style={{
// //                 fontSize: '14px',
// //                 opacity: 0.7,
// //                 marginBottom: '15px'
// //               }}>
// //                 {isPlaying ? 
// //                   `セクション${currentSectionIndex + 1}/8 再生中...` : 
// //                   isPaused ? '一時停止中' : '練習セッション準備完了'
// //                 }
// //               </div>

// //               <div style={{
// //                 fontSize: '12px',
// //                 opacity: 0.6,
// //                 marginBottom: '10px'
// //               }}>
// //                 {['導入', 'チャネリング①', '練習①', 'チャネリング②', '練習②', 'チャネリング③', '練習③', '終了'][currentSectionIndex] || '準備中'}
// //               </div>

// //               {/* デバッグ用：音声飛ばしてワード入力へ */}
// //               <button
// //                 onClick={() => {
// //                   // 音声停止
// //                   if (currentAudio) {
// //                     currentAudio.pause();
// //                   }
// //                   setIsPlaying(false);
// //                   setIsPaused(false);
// //                   // ワード入力画面へ
// //                   setShowPlayer(false);
// //                   setShowWordInput(true);
// //                 }}
// //                 style={{
// //                   padding: '6px 12px',
// //                   border: 'none',
// //                   backgroundColor: 'rgba(255, 102, 0, 0.3)',
// //                   color: '#ff6600',
// //                   fontSize: '11px',
// //                   fontFamily: "'Klee One', serif",
// //                   cursor: 'pointer',
// //                   transition: 'all 0.3s ease',
// //                   marginTop: '10px',
// //                   borderRadius: '4px'
// //                 }}
// //                 onMouseEnter={(e) => {
// //                   (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(255, 102, 0, 0.5)';
// //                 }}
// //                 onMouseLeave={(e) => {
// //                   (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(255, 102, 0, 0.3)';
// //                 }}
// //               >
// //                 音声スキップ→ワード入力
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       )}

// //       {/* ワード入力画面 */}
// //       {showWordInput && (
// //         <div style={{
// //           minHeight: '100vh',
// //           backgroundColor: '#000099',
// //           color: '#ffffdd',
// //           fontFamily: "'Klee One', serif",
// //           display: 'flex',
// //           flexDirection: 'column' as const,
// //           alignItems: 'center',
// //           justifyContent: 'center',
// //           padding: '7px 20px 60px 20px',
// //           position: 'relative' as const
// //         }}>
// //           {/* 背景の光の効果 */}
// //           <div style={{
// //             position: 'absolute' as const,
// //             top: '10%',
// //             left: '20%',
// //             width: '3px',
// //             height: '3px',
// //             backgroundColor: '#ffffdd',
// //             borderRadius: '50%',
// //             opacity: 0.6,
// //             boxShadow: '0 0 20px #ffffdd, 0 0 40px #ffffdd'
// //           }}></div>
// //           <div style={{
// //             position: 'absolute' as const,
// //             top: '30%',
// //             right: '15%',
// //             width: '2px',
// //             height: '2px',
// //             backgroundColor: '#ffffdd',
// //             borderRadius: '50%',
// //             opacity: 0.4,
// //             boxShadow: '0 0 15px #ffffdd'
// //           }}></div>
// //           <div style={{
// //             position: 'absolute' as const,
// //             bottom: '20%',
// //             left: '10%',
// //             width: '2px',
// //             height: '2px',
// //             backgroundColor: '#ffffdd',
// //             borderRadius: '50%',
// //             opacity: 0.5,
// //             boxShadow: '0 0 18px #ffffdd'
// //           }}></div>

// //           <div style={{
// //             maxWidth: '600px',
// //             width: '100%',
// //             textAlign: 'center' as const,
// //             position: 'relative' as const,
// //             zIndex: 10
// //           }}>
            
// //             {/* タイトル */}
// //             <h1 style={{
// //               fontSize: '24px',
// //               fontWeight: 'bold' as const,
// //               marginBottom: '30px',
// //               letterSpacing: '2px',
// //               lineHeight: '1.4',
// //               textShadow: '0 0 25px rgba(255, 255, 221, 0.6), 0 0 50px rgba(255, 255, 221, 0.4)',
// //               fontFamily: "'Klee One', serif",
// //               color: '#FFD700'
// //             }}>
// //               感じ取った言葉の読み解き
// //             </h1>

// //             {/* 説明文 */}
// //             <div style={{
// //               fontSize: '16px',
// //               lineHeight: '1.8',
// //               marginBottom: '35px',
// //               opacity: 0.9,
// //               letterSpacing: '1px',
// //               fontFamily: "'Klee One', serif",
// //               textAlign: 'left' as const
// //             }}>
// //               書き留めていた言葉たちを、この場所に映してください。秘められた意味は、このあと静かに開かれていきます。受け取った言葉を入力してください。
// //             </div>

// //             {/* フォーム */}
// //             <div style={{
// //               marginBottom: '40px',
// //               position: 'relative' as const
// //             }}>
// //               <div style={{
// //                 display: 'grid',
// //                 gridTemplateColumns: 'repeat(2, 1fr)',
// //                 gap: '10px',
// //                 marginBottom: '0'
// //               }}>
// //                 {[...Array(10)].map((_, i) => (
// //                   <input
// //                     key={i}
// //                     type="text"
// //                     value={receivedWords[i]}
// //                     onChange={(e) => {
// //                       const newWords = [...receivedWords];
// //                       newWords[i] = e.target.value;
// //                       setReceivedWords(newWords);
// //                     }}
// //                     placeholder={`言葉${i + 1}`}
// //                     style={{
// //                       width: '100%',
// //                       height: '40px',
// //                       padding: '15px',
// //                       border: 'none',
// //                       backgroundColor: '#ffffff',
// //                       color: '#000099',
// //                       fontSize: '16px',
// //                       outline: 'none',
// //                       fontFamily: "'Klee One', serif",
// //                       letterSpacing: '0.5px',
// //                       boxSizing: 'border-box' as const,
// //                       boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 2px rgba(0, 0, 0, 0.05)'
// //                     }}
// //                     onFocus={(e) => {
// //                       (e.target as HTMLInputElement).style.backgroundColor = '#ffffff';
// //                       (e.target as HTMLInputElement).style.boxShadow = 'inset 0 3px 6px rgba(0, 0, 0, 0.15), inset 0 1px 3px rgba(0, 0, 0, 0.1)';
// //                     }}
// //                     onBlur={(e) => {
// //                       (e.target as HTMLInputElement).style.backgroundColor = '#ffffff';
// //                       (e.target as HTMLInputElement).style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 2px rgba(0, 0, 0, 0.05)';
// //                     }}
// //                   />
// //                 ))}
// //               </div>

// //               <button
// //                 onClick={handleWordSubmit}
// //                 disabled={receivedWords.every(word => !word.trim())}
// //                 style={{
// //                   width: '100%',
// //                   padding: '18px 25px',
// //                   border: 'none',
// //                   backgroundColor: receivedWords.some(word => word.trim()) ? '#ffffdd' : 'rgba(255, 255, 221, 0.5)',
// //                   color: receivedWords.some(word => word.trim()) ? '#000099' : 'rgba(0, 0, 153, 0.5)',
// //                   fontSize: '16px',
// //                   fontFamily: "'Klee One', serif",
// //                   letterSpacing: '1px',
// //                   cursor: receivedWords.some(word => word.trim()) ? 'pointer' : 'not-allowed',
// //                   transition: 'all 0.3s ease',
// //                   fontWeight: 'bold' as const,
// //                   boxShadow: receivedWords.some(word => word.trim()) 
// //                     ? '0 3px 6px rgba(0, 0, 0, 0.2), 0 1px 3px rgba(0, 0, 0, 0.3)' 
// //                     : '0 1px 2px rgba(0, 0, 0, 0.1)',
// //                   transform: 'translateY(0)',
// //                   marginTop: '15px'
// //                 }}
// //                 onMouseEnter={(e) => {
// //                   if (receivedWords.some(word => word.trim())) {
// //                     (e.target as HTMLButtonElement).style.backgroundColor = '#ffffff';
// //                     (e.target as HTMLButtonElement).style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 255, 255, 0.5), 0 0 40px rgba(255, 255, 255, 0.3)';
// //                     (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)';
// //                   }
// //                 }}
// //                 onMouseLeave={(e) => {
// //                   if (receivedWords.some(word => word.trim())) {
// //                     (e.target as HTMLButtonElement).style.backgroundColor = '#ffffdd';
// //                     (e.target as HTMLButtonElement).style.boxShadow = '0 3px 6px rgba(0, 0, 0, 0.2), 0 1px 3px rgba(0, 0, 0, 0.3)';
// //                     (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
// //                   }
// //                 }}
// //               >
// //                 受け取ったことばを読み解く
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       )}

// //       {/* 解析結果画面 */}
// //       {showResult && (
// //         <div
// //           className="font-klee"
// //           style={{
// //             backgroundColor: "#000099",
// //             color: "#ffffdd",
// //             minHeight: "100vh",
// //             display: "flex",
// //             flexDirection: "column",
// //             alignItems: "center",
// //             padding: "30px 20px",
// //           }}
// //         >
// //           {/* メインタイトル */}
// //           <h1 style={{ fontSize: "1.25rem", marginBottom: "1rem", fontWeight: "normal", color: "#ff4444" }}>
// //             チャネリング読み解き結果
// //           </h1>

// //           {/* 質問内容 */}
// //           <h3 style={{ 
// //             fontSize: "1.1rem", 
// //             marginBottom: "0.5rem", 
// //             color: "#FFD700",
// //             fontWeight: "bold",
// //             textAlign: "center",
// //             maxWidth: "600px"
// //           }}>
// //             あなたの問いかけ
// //           </h3>
// //           <div style={{
// //             maxWidth: "600px",
// //             width: "100%",
// //             margin: "0 20px",
// //             marginBottom: "1rem",
// //             padding: "15px",
// //             backgroundColor: "rgba(255, 255, 221, 0.03)",
// //             border: "1px solid rgba(255, 255, 221, 0.15)",
// //             borderRadius: "8px",
// //             textAlign: "center",
// //           }}>
// //             <p style={{ 
// //               fontSize: "16px", 
// //               lineHeight: "1.6",
// //               margin: "0"
// //             }}>
// //               {question}
// //             </p>
// //           </div>

// //           {/* 受け取った言葉 */}
// //           <h3 style={{ 
// //             fontSize: "1.1rem", 
// //             marginBottom: "0.5rem", 
// //             color: "#FFD700",
// //             fontWeight: "bold",
// //             textAlign: "center",
// //             maxWidth: "600px"
// //           }}>
// //             受け取った言葉
// //           </h3>
// //           <div style={{
// //             maxWidth: "600px",
// //             width: "100%",
// //             margin: "0 20px",
// //             marginBottom: "1rem",
// //             padding: "15px",
// //             backgroundColor: "rgba(255, 255, 221, 0.03)",
// //             border: "1px solid rgba(255, 255, 221, 0.15)",
// //             borderRadius: "8px",
// //             textAlign: "center",
// //           }}>
// //             <p style={{ 
// //               fontSize: "16px", 
// //               lineHeight: "1.6",
// //               margin: "0"
// //             }}>
// //               {receivedWords.filter(word => word.trim()).join('、')}
// //             </p>
// //           </div>

// //           {/* 読み解き結果 */}
// //           <h3 style={{ 
// //             fontSize: "1.2rem", 
// //             marginBottom: "0.5rem", 
// //             color: "#FFD700",
// //             fontWeight: "bold",
// //             textShadow: "0 0 10px rgba(255, 215, 0, 0.5)",
// //             textAlign: "center",
// //             maxWidth: "600px"
// //           }}>
// //             魂からのメッセージ
// //           </h3>
// //           <div style={{
// //             maxWidth: "600px",
// //             width: "100%",
// //             margin: "0 20px",
// //             marginBottom: "1rem",
// //             padding: "20px",
// //             backgroundColor: "rgba(255, 255, 221, 0.04)",
// //             border: "1px solid rgba(255, 215, 0, 0.2)",
// //             borderRadius: "12px",
// //             textAlign: "left",
// //             maxHeight: "400px",
// //             overflowY: "auto"
// //           }}>
// //             <div style={{ 
// //               fontSize: "16px", 
// //               lineHeight: "1.8",
// //               whiteSpace: "pre-wrap" as const,
// //               color: "#ffffdd"
// //             }}>
// //               {interpretationResult}
// //             </div>
// //           </div>

// //           {/* メニューへ戻るリンク */}
// //           <div style={{ textAlign: "center", marginTop: "20px" }}>
// //             <a
// //               href="/home"
// //               style={{
// //                 fontSize: "16px",
// //                 color: "rgba(255, 255, 221, 0.7)",
// //                 textDecoration: "underline",
// //                 fontFamily: "'Klee One', serif",
// //                 transition: "all 0.3s ease",
// //                 display: "inline-block",
// //                 padding: "8px 0"
// //               }}
// //               onMouseEnter={(e) => {
// //                 (e.target as HTMLAnchorElement).style.color = "#ffffdd";
// //                 (e.target as HTMLAnchorElement).style.textShadow = "0 0 8px rgba(255, 255, 221, 0.5)";
// //               }}
// //               onMouseLeave={(e) => {
// //                 (e.target as HTMLAnchorElement).style.color = "rgba(255, 255, 221, 0.7)";
// //                 (e.target as HTMLAnchorElement).style.textShadow = "none";
// //               }}
// //             >
// //               メニューへ戻る
// //             </a>
// //           </div>
// //         </div>
// //       )}

// //       <style jsx>{`
// //         @keyframes spin {
// //           0% { transform: rotate(0deg); }
// //           100% { transform: rotate(360deg); }
// //         }
// //       `}</style>
// //     </div>
// //   );
// // }

import { useState, useEffect } from 'react';

export default function ChannelingPage() {
  const [question, setQuestion] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [showWordInput, setShowWordInput] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [interpretationResult, setInterpretationResult] = useState<string>('');
  const [generatedTexts, setGeneratedTexts] = useState<string[]>([]);
  const [audioUrls, setAudioUrls] = useState<string[]>([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [audioSources, setAudioSources] = useState<AudioBufferSourceNode[]>([]);
  const [receivedWords, setReceivedWords] = useState(Array(10).fill(''));
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  useEffect(() => {
    document.title = 'チャネリング誘導音声ワーク';
  }, []);

  // 固定テキスト（テスト用短縮版）
  const openingText = `
いまから、あなたの魂の声と静かにつながる時間をひらきます。

目を閉じて、呼吸を深くしていきましょう。
  `.trim();

  const practice1Text = `
言葉を超えたところに、
光のようにそっと降りてくる感覚を、
ただ、まっすぐに受け取ってください。
これは答えを探すための時間ではなく、
あなた自身の内なる宇宙に、耳をすますための練習です。
目を閉じて、呼吸を深くしていきましょう。
  `.trim();

  const practice2Text = `
あなたの内側に、小さな種が降りてくるのを感じてください。
意味や形を求めなくても構いません。
ただ、その響きがどこから来たのかを信じて、
指先に、心に、そっと迎え入れてください。
これは、あなたの魂と言葉が初めて出会う、神聖な儀式です。
  `.trim();

  const practice3Text = `
いま、あなたの問いかけに応える声が、
はっきりとしたかたちで届こうとしています。
思考ではなく、感じたままに受け取ってみてください。
浮かんできた言葉があれば、それを書き留めましょう。
これは、あなた自身の深い領域と、
"つながる"という行為を完成させる練習です。
  `.trim();

  const closingText = `
宇宙からの贈り物を受け取りました。
今日感じたすべては、あなたの魂に深く刻まれています。
受け取ったメッセージや感覚を、
感じたままに、まずは手元のメモに書き留めてください。
それはあなたの内なる宇宙からの光の断片。
まだ意味がわからなくても、思考をはさまず、ただ静かに写し取って。

その言葉を、どうぞフォームに入力してください。
差し出されたひとつひとつの言葉を、静かに読み解いてまいります。
これはあなたの魂の声を、この世界にあらわす神聖な通路です。
この体験を胸に、日常という舞台で
どうか光として在りつづけてください。
お疲れさまでした。
愛と光に包まれて。
  `.trim();

  const handleSubmit = async () => {
    if (!question.trim()) return;
    
    setIsGenerating(true);
    
    try {
      // 1. チャネリングテキストを3回生成
      const generatedTexts = [];
      
      for (let i = 1; i <= 3; i++) {
        const textResponse = await fetch('http://localhost:3001/api/generate-channeling', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question })
        });

        if (!textResponse.ok) {
          throw new Error(`チャネリングテキスト${i}の生成に失敗しました`);
        }

        const textData = await textResponse.json();
        generatedTexts.push(textData.text);
      }
      
      setGeneratedTexts(generatedTexts);

      // 2. 各セクションの音声を個別生成
      const sections = [
        openingText,
        generatedTexts[0], 
        practice1Text,
        generatedTexts[1],
        practice2Text, 
        generatedTexts[2],
        practice3Text,
        closingText
      ];

      const audioUrls = [];
      
      for (let i = 0; i < sections.length; i++) {
        console.log(`🎵 セクション${i + 1}音声生成中...`);
        console.log(`🎵 セクション${i + 1}のテキスト:`, sections[i].substring(0, 100));
        
        // TTS用にテキストをクリーンアップ
        const cleanText = sections[i]
          .replace(/\*/g, '')  // *記号を削除
          .replace(/✨/g, '')  // ✨絵文字を削除
          .replace(/☆/g, '')  // ☆記号を削除
          .replace(/キラキラ/g, '')  // キラキラテキストを削除
          .trim();
        
        const audioResponse = await fetch('http://localhost:3001/api/generate-audio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            text: cleanText,
            speed: 0.7
          })
        });

        if (!audioResponse.ok) {
          throw new Error(`セクション${i + 1}の音声生成に失敗しました`);
        }

        const audioData = await audioResponse.json();
        audioUrls.push(audioData.audioUrl);
      }

      setAudioUrls(audioUrls);

      setIsGenerating(false);
      setShowPlayer(true);
      
    } catch (error) {
      console.error('チャネリング処理エラー:', error);
      setIsGenerating(false);
      alert('チャネリング処理中にエラーが発生しました: ' + error.message);
    }
  };

  const createReverbImpulse = (audioContext: AudioContext, duration = 2, decay = 2) => {
    const sampleRate = audioContext.sampleRate;
    const length = sampleRate * duration;
    const impulse = audioContext.createBuffer(2, length, sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        // 美しいリバーブを作る式
        const n = length - i;
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(n / length, decay);
      }
    }
    return impulse;
  };

  const playSection = async (sectionIndex: number) => {
    console.log('🎵 playSection開始:', { sectionIndex, audioUrls: audioUrls.length, isPlaying });
    
    if (!audioUrls[sectionIndex]) {
      console.error('❌ audioUrls[sectionIndex]が存在しない:', sectionIndex, audioUrls);
      return;
    }
    
    if (isPlaying) {
      console.log('⏸ 既に再生中なのでスキップ');
      return;
    }

    try {
      console.log('🎵 Audio作成開始:', audioUrls[sectionIndex]);
      
      // HTMLAudioElementでセクション再生（シンプル版）
      const audio = new Audio(audioUrls[sectionIndex]);
      console.log('✅ Audio作成完了');
      
      setCurrentAudio(audio);
      console.log('✅ setCurrentAudio完了');

      // 再生終了時の処理
      audio.onended = () => {
        console.log(`✅ セクション${sectionIndex + 1}再生終了`);
        setIsPlaying(false);
        
        // 次のセクションがあれば自動再生
        if (sectionIndex < audioUrls.length - 1) {
          setTimeout(() => {
            setCurrentSectionIndex(sectionIndex + 1);
            playSection(sectionIndex + 1);
          }, 500);
        } else {
          // 全セクション終了
          setIsPaused(false);
          setCurrentSectionIndex(0);
          setTimeout(() => {
            setShowPlayer(false);
            setShowWordInput(true);
          }, 1000);
        }
      };

      audio.onerror = (error) => {
        console.error(`❌ セクション${sectionIndex + 1}audio.onerror:`, error);
        alert('音声の再生中にエラーが発生しました');
        setIsPlaying(false);
        setIsPaused(false);
      };

      console.log('🎵 再生開始前...');
      
      // 再生開始
      await audio.play();
      console.log('✅ audio.play()成功');
      
      setIsPlaying(true);
      setIsPaused(false);
      setCurrentSectionIndex(sectionIndex);
      
      console.log(`✅ セクション${sectionIndex + 1}再生開始完了`);

    } catch (error) {
      console.error(`❌ セクション${sectionIndex + 1}再生エラー:`, error);
      console.error('❌ エラータイプ:', typeof error);
      console.error('❌ エラー内容:', error.toString());
      if (error instanceof Error) {
        console.error('❌ エラーメッセージ:', error.message);
        console.error('❌ エラースタック:', error.stack);
      }
      alert(`音声の再生中にエラーが発生しました: ${error}`);
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  const playAudio = async () => {
    if (!audioUrls.length || isPlaying) return;
    playSection(0); // 最初のセクションから開始
  };

  const pauseAudio = () => {
    if (currentAudio && isPlaying) {
      currentAudio.pause();
      setIsPlaying(false);
      setIsPaused(true);
    }
  };

  const resumeAudio = () => {
    if (currentAudio && isPaused) {
      currentAudio.play().then(() => {
        setIsPlaying(true);
        setIsPaused(false);
      }).catch(error => {
        console.error('音声再開エラー:', error);
        alert('音声の再開に失敗しました');
      });
    }
  };

  const handleWordSubmit = async () => {
    const filledWords = receivedWords.filter(word => word.trim());
    
    if (filledWords.length === 0) {
      alert('少なくとも1つの言葉を入力してください。');
      return;
    }
    
    try {
      console.log('📝 ワード読み解き開始:', { question, filledWords });
      
      // 受け取った言葉を送信
      const response = await fetch('http://localhost:3001/api/interpret-words', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          originalQuestion: question,
          receivedWords: filledWords 
        })
      });
      
      if (!response.ok) {
        throw new Error('読み解きAPIエラー');
      }
      
      const result = await response.json();
      console.log('✅ ワード読み解き完了:', result);
      
      setInterpretationResult(result.interpretation);
      setShowWordInput(false);
      setShowResult(true);
      
    } catch (error) {
      console.error('❌ ワード読み解きエラー:', error);
      alert('読み解き処理中にエラーが発生しました。再度お試しください。');
    }
  };

  return (
    <div>
      {/* 入力フォーム画面 */}
      {!showPlayer && !isGenerating && !showWordInput && !showResult && (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#000099',
          color: '#ffffdd',
          fontFamily: "'Klee One', serif",
          display: 'flex',
          flexDirection: 'column' as const,
          alignItems: 'center',
          justifyContent: 'center',
          padding: '7px 2.5px 60px 2.5px',
          position: 'relative' as const
        }}>
          {/* 背景の光の効果 */}
          <div style={{
            position: 'absolute' as const,
            top: '10%',
            left: '20%',
            width: '3px',
            height: '3px',
            backgroundColor: '#ffffdd',
            borderRadius: '50%',
            opacity: 0.6,
            boxShadow: '0 0 20px #ffffdd, 0 0 40px #ffffdd'
          }}></div>
          <div style={{
            position: 'absolute' as const,
            top: '30%',
            right: '15%',
            width: '2px',
            height: '2px',
            backgroundColor: '#ffffdd',
            borderRadius: '50%',
            opacity: 0.4,
            boxShadow: '0 0 15px #ffffdd'
          }}></div>
          <div style={{
            position: 'absolute' as const,
            bottom: '20%',
            left: '10%',
            width: '2px',
            height: '2px',
            backgroundColor: '#ffffdd',
            borderRadius: '50%',
            opacity: 0.5,
            boxShadow: '0 0 18px #ffffdd'
          }}></div>

          <div style={{
            maxWidth: '600px',
            width: '100%',
            textAlign: 'center' as const,
            position: 'relative' as const,
            zIndex: 10
          }}>
            
            {/* タイトル */}
            <h1 style={{
              fontSize: '36px',
              fontWeight: 'normal' as const,
              marginBottom: '20px',
              letterSpacing: '3px',
              lineHeight: '1.4',
              textShadow: '0 0 20px rgba(255, 255, 221, 0.3)',
              fontFamily: "'Klee One', serif"
            }}>
              チャネリング<br />誘導音声ワーク
            </h1>

            {/* サブタイトル */}
            <h1 style={{
              fontSize: '16px',
              lineHeight: '1.8',
              marginBottom: '35px',
              opacity: 0.9,
              letterSpacing: '1px',
              fontFamily: "'Klee One', serif",
              fontWeight: 'normal' as const,
              textAlign: 'left' as const
            }}>
              聞きたいことをチャネリングで受け取り、内なる感覚を育てる練習ができるワークです。練習のあとには、受け取った言葉をもとに読み解きのメッセージを受け取ることもできます。
            </h1>

            {/* 説明 */}
            <div style={{
              fontSize: '12px',
              marginBottom: '15px',
              letterSpacing: '0.5px',
              fontFamily: "'Klee One', serif",
              opacity: 0.8,
              textAlign: 'left' as const
            }}>
              チャネリングで受け取りたい "問い" を入力してください。
            </div>

            {/* フォーム */}
            <div style={{
              marginBottom: '40px',
              position: 'relative' as const
            }}>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="例）今の私が前に進むために必要なことは？"
                style={{
                  width: '100%',
                  height: '120px',
                  padding: '15px',
                  border: 'none',
                  backgroundColor: '#ffffff',
                  color: '#000099',
                  fontSize: '16px',
                  lineHeight: '1.6',
                  resize: 'none' as const,
                  outline: 'none',
                  fontFamily: "'Klee One', serif",
                  letterSpacing: '0.5px',
                  boxSizing: 'border-box' as const,
                  boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 2px rgba(0, 0, 0, 0.05)'
                }}
                onFocus={(e) => {
                  (e.target as HTMLTextAreaElement).style.backgroundColor = '#ffffff';
                  (e.target as HTMLTextAreaElement).style.boxShadow = 'inset 0 3px 6px rgba(0, 0, 0, 0.15), inset 0 1px 3px rgba(0, 0, 0, 0.1)';
                }}
                onBlur={(e) => {
                  (e.target as HTMLTextAreaElement).style.backgroundColor = '#ffffff';
                  (e.target as HTMLTextAreaElement).style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 2px rgba(0, 0, 0, 0.05)';
                }}
                maxLength={100}
              />

              <button
                onClick={handleSubmit}
                disabled={!question.trim() || isGenerating}
                style={{
                  width: '100%',
                  padding: '18px 25px',
                  border: 'none',
                  backgroundColor: question.trim() && !isGenerating ? '#ffffdd' : 'rgba(255, 255, 221, 0.5)',
                  color: question.trim() && !isGenerating ? '#000099' : 'rgba(0, 0, 153, 0.5)',
                  fontSize: '16px',
                  fontFamily: "'Klee One', serif",
                  letterSpacing: '1px',
                  cursor: question.trim() && !isGenerating ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s ease',
                  fontWeight: 'bold' as const,
                  boxShadow: question.trim() && !isGenerating 
                    ? '0 3px 6px rgba(0, 0, 0, 0.2), 0 1px 3px rgba(0, 0, 0, 0.3)' 
                    : '0 1px 2px rgba(0, 0, 0, 0.1)',
                  transform: 'translateY(0)'
                }}
                onMouseEnter={(e) => {
                  if (question.trim() && !isGenerating) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#ffffff';
                    (e.target as HTMLButtonElement).style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 255, 255, 0.5), 0 0 40px rgba(255, 255, 255, 0.3)';
                    (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (question.trim() && !isGenerating) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#ffffdd';
                    (e.target as HTMLButtonElement).style.boxShadow = '0 3px 6px rgba(0, 0, 0, 0.2), 0 1px 3px rgba(0, 0, 0, 0.3)';
                    (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
                  }
                }}
              >
                {isGenerating ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px'
                  }}>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(0, 0, 153, 0.3)',
                      borderTop: '2px solid #000099',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    <span>チャネリング中...</span>
                  </div>
                ) : (
                  'チャネリングワークを開始'
                )}
              </button>
            </div>
            
          </div>
        </div>
      )}

      {/* 生成中画面 */}
      {isGenerating && (
        <div style={{
          position: 'fixed' as const,
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 153, 0.95)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          fontFamily: "'Klee One', serif",
          color: '#ffffdd'
        }}>
          <p style={{
            fontSize: '18px',
            textAlign: 'center' as const
          }}>
            あなたのための言葉を、<br />今 丁寧に編んでいます…
          </p>
        </div>
      )}

      {/* 音声プレーヤー画面 */}
      {showPlayer && (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#000099',
          color: '#ffffdd',
          fontFamily: "'Klee One', serif",
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            maxWidth: '500px',
            width: '100%',
            textAlign: 'center' as const
          }}>
            <p style={{
              fontSize: '18px',
              lineHeight: '1.8',
              marginBottom: '40px'
            }}>
              いま、あなたのための言葉が<br />紡がれました。<br />
              その響きに、心をゆだねてみてください。
            </p>

            <div style={{
              background: 'rgba(255, 255, 221, 0.1)',
              border: '1px solid rgba(255, 255, 221, 0.3)',
              borderRadius: '8px',
              padding: '40px 30px'
            }}>
              <button 
                onClick={() => {
                  if (!isPlaying && !isPaused) {
                    playAudio();
                  } else if (isPlaying) {
                    pauseAudio();
                  } else if (isPaused) {
                    resumeAudio();
                  }
                }}
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  border: '2px solid #ffffdd',
                  backgroundColor: 'rgba(255, 255, 221, 0.1)',
                  color: '#ffffdd',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  margin: '0 auto 20px'
                }}
              >
                {isPlaying ? '⏸' : '▶'}
              </button>

              <div style={{
                fontSize: '14px',
                opacity: 0.7,
                marginBottom: '15px'
              }}>
                {isPlaying ? 
                  `セクション${currentSectionIndex + 1}/8 再生中...` : 
                  isPaused ? '一時停止中' : '練習セッション準備完了'
                }
              </div>

              <div style={{
                fontSize: '12px',
                opacity: 0.6,
                marginBottom: '10px'
              }}>
                {['導入', 'チャネリング①', '練習①', 'チャネリング②', '練習②', 'チャネリング③', '練習③', '終了'][currentSectionIndex] || '準備中'}
              </div>

              {/* デバッグ用：音声飛ばしてワード入力へ */}
              <button
                onClick={() => {
                  // 音声停止
                  if (currentAudio) {
                    currentAudio.pause();
                  }
                  setIsPlaying(false);
                  setIsPaused(false);
                  // ワード入力画面へ
                  setShowPlayer(false);
                  setShowWordInput(true);
                }}
                style={{
                  padding: '6px 12px',
                  border: 'none',
                  backgroundColor: 'rgba(255, 102, 0, 0.3)',
                  color: '#ff6600',
                  fontSize: '11px',
                  fontFamily: "'Klee One', serif",
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  marginTop: '10px',
                  borderRadius: '4px'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(255, 102, 0, 0.5)';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(255, 102, 0, 0.3)';
                }}
              >
                音声スキップ→ワード入力
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ワード入力画面 */}
      {showWordInput && (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#000099',
          color: '#ffffdd',
          fontFamily: "'Klee One', serif",
          display: 'flex',
          flexDirection: 'column' as const,
          alignItems: 'center',
          justifyContent: 'center',
          padding: '7px 20px 60px 20px',
          position: 'relative' as const
        }}>
          {/* 背景の光の効果 */}
          <div style={{
            position: 'absolute' as const,
            top: '10%',
            left: '20%',
            width: '3px',
            height: '3px',
            backgroundColor: '#ffffdd',
            borderRadius: '50%',
            opacity: 0.6,
            boxShadow: '0 0 20px #ffffdd, 0 0 40px #ffffdd'
          }}></div>
          <div style={{
            position: 'absolute' as const,
            top: '30%',
            right: '15%',
            width: '2px',
            height: '2px',
            backgroundColor: '#ffffdd',
            borderRadius: '50%',
            opacity: 0.4,
            boxShadow: '0 0 15px #ffffdd'
          }}></div>
          <div style={{
            position: 'absolute' as const,
            bottom: '20%',
            left: '10%',
            width: '2px',
            height: '2px',
            backgroundColor: '#ffffdd',
            borderRadius: '50%',
            opacity: 0.5,
            boxShadow: '0 0 18px #ffffdd'
          }}></div>

          <div style={{
            maxWidth: '600px',
            width: '100%',
            textAlign: 'center' as const,
            position: 'relative' as const,
            zIndex: 10
          }}>
            
            {/* タイトル */}
            <h1 style={{
              fontSize: '24px',
              fontWeight: 'bold' as const,
              marginBottom: '30px',
              letterSpacing: '2px',
              lineHeight: '1.4',
              textShadow: '0 0 25px rgba(255, 255, 221, 0.6), 0 0 50px rgba(255, 255, 221, 0.4)',
              fontFamily: "'Klee One', serif",
              color: '#FFD700'
            }}>
              感じ取った言葉の読み解き
            </h1>

            {/* 説明文 */}
            <div style={{
              fontSize: '16px',
              lineHeight: '1.8',
              marginBottom: '35px',
              opacity: 0.9,
              letterSpacing: '1px',
              fontFamily: "'Klee One', serif",
              textAlign: 'left' as const
            }}>
              書き留めていた言葉たちを、この場所に映してください。秘められた意味は、このあと静かに開かれていきます。受け取った言葉を入力してください。
            </div>

            {/* フォーム */}
            <div style={{
              marginBottom: '40px',
              position: 'relative' as const
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '10px',
                marginBottom: '0'
              }}>
                {[...Array(10)].map((_, i) => (
                  <input
                    key={i}
                    type="text"
                    value={receivedWords[i]}
                    onChange={(e) => {
                      const newWords = [...receivedWords];
                      newWords[i] = e.target.value;
                      setReceivedWords(newWords);
                    }}
                    placeholder={`言葉${i + 1}`}
                    style={{
                      width: '100%',
                      height: '40px',
                      padding: '15px',
                      border: 'none',
                      backgroundColor: '#ffffff',
                      color: '#000099',
                      fontSize: '16px',
                      outline: 'none',
                      fontFamily: "'Klee One', serif",
                      letterSpacing: '0.5px',
                      boxSizing: 'border-box' as const,
                      boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 2px rgba(0, 0, 0, 0.05)'
                    }}
                    onFocus={(e) => {
                      (e.target as HTMLInputElement).style.backgroundColor = '#ffffff';
                      (e.target as HTMLInputElement).style.boxShadow = 'inset 0 3px 6px rgba(0, 0, 0, 0.15), inset 0 1px 3px rgba(0, 0, 0, 0.1)';
                    }}
                    onBlur={(e) => {
                      (e.target as HTMLInputElement).style.backgroundColor = '#ffffff';
                      (e.target as HTMLInputElement).style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 2px rgba(0, 0, 0, 0.05)';
                    }}
                  />
                ))}
              </div>

              <button
                onClick={handleWordSubmit}
                disabled={receivedWords.every(word => !word.trim())}
                style={{
                  width: '100%',
                  padding: '18px 25px',
                  border: 'none',
                  backgroundColor: receivedWords.some(word => word.trim()) ? '#ffffdd' : 'rgba(255, 255, 221, 0.5)',
                  color: receivedWords.some(word => word.trim()) ? '#000099' : 'rgba(0, 0, 153, 0.5)',
                  fontSize: '16px',
                  fontFamily: "'Klee One', serif",
                  letterSpacing: '1px',
                  cursor: receivedWords.some(word => word.trim()) ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s ease',
                  fontWeight: 'bold' as const,
                  boxShadow: receivedWords.some(word => word.trim()) 
                    ? '0 3px 6px rgba(0, 0, 0, 0.2), 0 1px 3px rgba(0, 0, 0, 0.3)' 
                    : '0 1px 2px rgba(0, 0, 0, 0.1)',
                  transform: 'translateY(0)',
                  marginTop: '15px'
                }}
                onMouseEnter={(e) => {
                  if (receivedWords.some(word => word.trim())) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#ffffff';
                    (e.target as HTMLButtonElement).style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 255, 255, 0.5), 0 0 40px rgba(255, 255, 255, 0.3)';
                    (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (receivedWords.some(word => word.trim())) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#ffffdd';
                    (e.target as HTMLButtonElement).style.boxShadow = '0 3px 6px rgba(0, 0, 0, 0.2), 0 1px 3px rgba(0, 0, 0, 0.3)';
                    (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
                  }
                }}
              >
                受け取ったことばを読み解く
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 解析結果画面 */}
      {showResult && (
        <div
          className="font-klee"
          style={{
            backgroundColor: "#000099",
            color: "#ffffdd",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "30px 20px",
          }}
        >
          {/* メインタイトル */}
          <h1 style={{ fontSize: "1.25rem", marginBottom: "1rem", fontWeight: "normal", color: "#ff4444" }}>
            チャネリング読み解き結果
          </h1>

          {/* 質問内容 */}
          <h3 style={{ 
            fontSize: "1.1rem", 
            marginBottom: "0.5rem", 
            color: "#FFD700",
            fontWeight: "bold",
            textAlign: "center",
            maxWidth: "600px"
          }}>
            あなたの問いかけ
          </h3>
          <div style={{
            maxWidth: "600px",
            width: "100%",
            margin: "0 20px",
            marginBottom: "1rem",
            padding: "15px",
            backgroundColor: "rgba(255, 255, 221, 0.03)",
            border: "1px solid rgba(255, 255, 221, 0.15)",
            borderRadius: "8px",
            textAlign: "center",
          }}>
            <p style={{ 
              fontSize: "16px", 
              lineHeight: "1.6",
              margin: "0"
            }}>
              {question}
            </p>
          </div>

          {/* 受け取った言葉 */}
          <h3 style={{ 
            fontSize: "1.1rem", 
            marginBottom: "0.5rem", 
            color: "#FFD700",
            fontWeight: "bold",
            textAlign: "center",
            maxWidth: "600px"
          }}>
            受け取った言葉
          </h3>
          <div style={{
            maxWidth: "600px",
            width: "100%",
            margin: "0 20px",
            marginBottom: "1rem",
            padding: "15px",
            backgroundColor: "rgba(255, 255, 221, 0.03)",
            border: "1px solid rgba(255, 255, 221, 0.15)",
            borderRadius: "8px",
            textAlign: "center",
          }}>
            <p style={{ 
              fontSize: "16px", 
              lineHeight: "1.6",
              margin: "0"
            }}>
              {receivedWords.filter(word => word.trim()).join('、')}
            </p>
          </div>

          {/* 読み解き結果 */}
          <h3 style={{ 
            fontSize: "1.2rem", 
            marginBottom: "0.5rem", 
            color: "#FFD700",
            fontWeight: "bold",
            textShadow: "0 0 10px rgba(255, 215, 0, 0.5)",
            textAlign: "center",
            maxWidth: "600px"
          }}>
            魂からのメッセージ
          </h3>
          <div style={{
            maxWidth: "600px",
            width: "100%",
            margin: "0 20px",
            marginBottom: "1rem",
            padding: "20px",
            backgroundColor: "rgba(255, 255, 221, 0.04)",
            border: "1px solid rgba(255, 215, 0, 0.2)",
            borderRadius: "12px",
            textAlign: "left",
            maxHeight: "400px",
            overflowY: "auto"
          }}>
            <div style={{ 
              fontSize: "16px", 
              lineHeight: "1.8",
              whiteSpace: "pre-wrap" as const,
              color: "#ffffdd"
            }}>
              {interpretationResult}
            </div>
          </div>

          {/* メニューへ戻るリンク */}
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <a
              href="/home"
              style={{
                fontSize: "16px",
                color: "rgba(255, 255, 221, 0.7)",
                textDecoration: "underline",
                fontFamily: "'Klee One', serif",
                transition: "all 0.3s ease",
                display: "inline-block",
                padding: "8px 0"
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLAnchorElement).style.color = "#ffffdd";
                (e.target as HTMLAnchorElement).style.textShadow = "0 0 8px rgba(255, 255, 221, 0.5)";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLAnchorElement).style.color = "rgba(255, 255, 221, 0.7)";
                (e.target as HTMLAnchorElement).style.textShadow = "none";
              }}
            >
              メニューへ戻る
            </a>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}