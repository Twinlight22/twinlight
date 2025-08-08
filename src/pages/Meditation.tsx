// // src/pages/meditation.tsx
// import React, { useState, useEffect, useRef } from 'react';

// // 音声管理クラス
// class AudioManager {
//   private audioContext: AudioContext | null = null;
//   private currentAudio: HTMLAudioElement | null = null;
//   private bgmAudio: HTMLAudioElement | null = null;
//   private convolver: ConvolverNode | null = null;
//   private gainNode: GainNode | null = null;
//   private bgmGainNode: GainNode | null = null;

//   async initialize() {
//     try {
//       this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
//       await this.createReverbEffect();
//       console.log('🎧 AudioManager初期化完了');
//     } catch (error) {
//       console.error('🎧 AudioManager初期化エラー:', error);
//     }
//   }

//   private async createReverbEffect() {
//     if (!this.audioContext) return;

//     // リバーブ用インパルスレスポンス生成
//     const duration = 3;
//     const decay = 2;
//     const sampleRate = this.audioContext.sampleRate;
//     const length = sampleRate * duration;
//     const impulse = this.audioContext.createBuffer(2, length, sampleRate);

//     for (let channel = 0; channel < 2; channel++) {
//       const channelData = impulse.getChannelData(channel);
//       for (let i = 0; i < length; i++) {
//         const decayFactor = Math.pow(1 - i / length, decay);
//         channelData[i] = (Math.random() * 0.5 - 0.25) * decayFactor;
//       }
//     }

//     this.convolver = this.audioContext.createConvolver();
//     this.convolver.buffer = impulse;
    
//     this.gainNode = this.audioContext.createGain();
//     this.gainNode.gain.value = 0.3; // リバーブの強さ
//   }

//   async playWithReverb(audioUrl: string): Promise<void> {
//     return new Promise(async (resolve, reject) => {
//       try {
//         console.log('🎵 音声再生試行:', audioUrl);
        
//         // 既存音声を停止
//         this.stopCurrent();
        
//         // 1秒待機（確実な切り替えのため）
//         await new Promise(resolve => setTimeout(resolve, 1000));

//         // 新しい音声要素を作成（シンプル版）
//         this.currentAudio = new Audio(audioUrl);

//         // 音声終了時の処理
//         this.currentAudio.addEventListener('ended', () => {
//           console.log('🎵 音声再生終了');
//           resolve();
//         });

//         this.currentAudio.addEventListener('error', (error) => {
//           console.error('🎵 音声エラー:', error);
//           // エラーでも続行（サービス継続性優先）
//           resolve();
//         });

//         // 音声読み込み確認
//         this.currentAudio.addEventListener('canplaythrough', () => {
//           console.log('🎵 音声読み込み完了');
//         });

//         // 音声を再生
//         console.log('🎵 音声再生開始試行...');
//         await this.currentAudio.play();
//         console.log('🎵 ✅ 音声再生成功');

//       } catch (error) {
//         console.error('🎵 再生エラー:', error);
//         // エラーでも続行
//         resolve();
//       }
//     });
//   }

//   startBGM() {
//     if (this.bgmAudio) return; // 既に再生中

//     try {
//       this.bgmAudio = new Audio('/meditation.mp3');
//       this.bgmAudio.loop = true;
//       this.bgmAudio.volume = 0.2;
      
//       // Web Audio APIでBGMも処理
//       if (this.audioContext) {
//         try {
//           const bgmSource = this.audioContext.createMediaElementSource(this.bgmAudio);
//           this.bgmGainNode = this.audioContext.createGain();
//           this.bgmGainNode.gain.value = 0.2;
          
//           bgmSource.connect(this.bgmGainNode);
//           this.bgmGainNode.connect(this.audioContext.destination);
//         } catch (bgmError) {
//           console.warn('🎵 BGM Web Audio処理失敗:', bgmError);
//         }
//       }

//       this.bgmAudio.play().catch(console.error);
//       console.log('🎵 BGM開始');
//     } catch (error) {
//       console.error('🎵 BGM開始エラー:', error);
//     }
//   }

//   stopBGM() {
//     if (this.bgmAudio) {
//       this.bgmAudio.pause();
//       this.bgmAudio.currentTime = 0;
//       this.bgmAudio = null;
//       console.log('🎵 BGM停止');
//     }
//   }

//   stopCurrent() {
//     if (this.currentAudio) {
//       this.currentAudio.pause();
//       this.currentAudio.currentTime = 0;
//       this.currentAudio = null;
//     }
//   }

//   pauseCurrent() {
//     if (this.currentAudio) {
//       this.currentAudio.pause();
//     }
//   }

//   resumeCurrent() {
//     if (this.currentAudio) {
//       return this.currentAudio.play();
//     }
//   }

//   cleanup() {
//     this.stopCurrent();
//     this.stopBGM();
//     if (this.audioContext) {
//       this.audioContext.close();
//     }
//   }
// }

// export default function MeditationPage() {
//   const [impulse, setImpulse] = useState('');
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [showPlayer, setShowPlayer] = useState(false);
//   const [generatedSections, setGeneratedSections] = useState<string[]>([]);
//   const [audioUrls, setAudioUrls] = useState<string[]>([]);
//   const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [isPaused, setIsPaused] = useState(false);
//   const [isInPractice, setIsInPractice] = useState(false);
//   const [practiceTimeLeft, setPracticeTimeLeft] = useState(120);
//   const [sessionComplete, setSessionComplete] = useState(false);

//   const audioManagerRef = useRef<AudioManager | null>(null);
//   const practiceTimerRef = useRef<NodeJS.Timeout | null>(null);

//   useEffect(() => {
//     document.title = '連絡衝動/絶縁衝動駆け込み寺「誘導瞑想ワーク」';
    
//     // AudioManager初期化
//     audioManagerRef.current = new AudioManager();
//     audioManagerRef.current.initialize();

//     return () => {
//       // クリーンアップ
//       if (audioManagerRef.current) {
//         audioManagerRef.current.cleanup();
//       }
//       if (practiceTimerRef.current) {
//         clearInterval(practiceTimerRef.current);
//       }
//     };
//   }, []);

//   // 2分間実践タイマー
//   useEffect(() => {
//     if (practiceTimerRef.current) {
//       clearInterval(practiceTimerRef.current);
//     }

//     if (isInPractice && practiceTimeLeft > 0) {
//       practiceTimerRef.current = setInterval(() => {
//         setPracticeTimeLeft(prev => {
//           if (prev <= 1) {
//             setIsInPractice(false);
//             setPracticeTimeLeft(120);
            
//             // 次のセクションへ
//             const nextIndex = currentSectionIndex + 1;
//             if (nextIndex < audioUrls.length) {
//               setTimeout(() => {
//                 playSection(nextIndex);
//               }, 1000);
//             } else {
//               // 全セクション完了
//               handleSessionComplete();
//             }
//             return 120;
//           }
//           return prev - 1;
//         });
//       }, 1000);
//     }

//     return () => {
//       if (practiceTimerRef.current) {
//         clearInterval(practiceTimerRef.current);
//       }
//     };
//   }, [isInPractice, currentSectionIndex, audioUrls.length]);

//   const handleSubmit = async () => {
//     if (!impulse.trim()) return;
    
//     setIsGenerating(true);
    
//     try {
//       // 1. 誘導瞑想セクションを生成
//       const textResponse = await fetch('http://localhost:3001/api/generate-meditation', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ impulse })
//       });

//       if (!textResponse.ok) {
//         throw new Error('誘導瞑想テキストの生成に失敗しました');
//       }

//       const textData = await textResponse.json();
//       console.log('📝 API レスポンス確認:', textData);
//       console.log('📝 生成されたセクション数:', textData.sections?.length);
      
//       // server.jsからの正しいレスポンス構造を確認
//       if (!textData.sections || !Array.isArray(textData.sections)) {
//         throw new Error('APIレスポンスの形式が不正です');
//       }
      
//       console.log('📝 各セクション内容確認:');
//       textData.sections.forEach((section: string, index: number) => {
//         console.log(`セクション${index + 1}:`, section.substring(0, 100) + '...');
//       });
      
//       setGeneratedSections(textData.sections);

//       // 2. 音声を生成
//       const audioUrls = [];
      
//       for (let i = 0; i < textData.sections.length; i++) {
//         console.log(`🎵 セクション${i + 1}音声生成中...`);
        
//         const audioResponse = await fetch('http://localhost:3001/api/generate-audio', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ 
//             text: textData.sections[i],
//             speed: 0.9
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
//       console.error('誘導瞑想処理エラー:', error);
//       setIsGenerating(false);
//       alert('誘導瞑想処理中にエラーが発生しました: ' + (error as Error).message);
//     }
//   };

//   const playSection = async (sectionIndex: number) => {
//     console.log('🎵 playSection呼び出し:', sectionIndex, 'isPlaying:', isPlaying);
    
//     if (!audioUrls[sectionIndex] || isPlaying || !audioManagerRef.current) {
//       console.log('🎵 再生条件チェック失敗 - 処理中止');
//       return;
//     }

//     try {
//       console.log(`🎵 セクション${sectionIndex + 1}再生開始`);
      
//       // 状態を先に設定して重複防止
//       setIsPlaying(true);
//       setCurrentSectionIndex(sectionIndex);

//       // BGMがまだ開始されていなければ開始
//       if (sectionIndex === 0) {
//         audioManagerRef.current.startBGM();
//       }

//       // リバーブ効果付きで音声再生
//       await audioManagerRef.current.playWithReverb(audioUrls[sectionIndex]);

//       // 再生完了
//       setIsPlaying(false);
//       console.log(`🎵 セクション${sectionIndex + 1}再生完了`);

//       // 最後のセクションでなければ2分間実践開始
//       if (sectionIndex < audioUrls.length - 1) {
//         console.log('🔇 2分間実践開始');
//         setIsInPractice(true);
//         setPracticeTimeLeft(120);
//       } else {
//         // 全セクション完了
//         handleSessionComplete();
//       }

//     } catch (error) {
//       console.error(`❌ セクション${sectionIndex + 1}再生エラー:`, error);
//       setIsPlaying(false);
      
//       // エラーでも次に進む（サービス継続性優先）
//       if (sectionIndex < audioUrls.length - 1) {
//         setTimeout(() => {
//           setIsInPractice(true);
//           setPracticeTimeLeft(120);
//         }, 1000);
//       } else {
//         handleSessionComplete();
//       }
//     }
//   };

//   const handleSessionComplete = () => {
//     console.log('🧘 瞑想セッション完了');
//     setSessionComplete(true);
//     setIsPlaying(false);
//     setIsPaused(false);
//     setIsInPractice(false);
//     setCurrentSectionIndex(0);
    
//     if (audioManagerRef.current) {
//       audioManagerRef.current.stopBGM();
//     }
//   };

//   const startMeditation = () => {
//     console.log('🎵 startMeditation呼び出し - isPlaying:', isPlaying);
//     if (audioUrls.length === 0 || isPlaying) {
//       console.log('🎵 startMeditation - 条件チェック失敗');
//       return;
//     }
//     playSection(0);
//   };

//   const pauseMeditation = () => {
//     if (audioManagerRef.current && isPlaying) {
//       audioManagerRef.current.pauseCurrent();
//       setIsPlaying(false);
//       setIsPaused(true);
//     }
//   };

//   const resumeMeditation = () => {
//     if (audioManagerRef.current && isPaused) {
//       audioManagerRef.current.resumeCurrent()?.then(() => {
//         setIsPlaying(true);
//         setIsPaused(false);
//       }).catch(console.error);
//     }
//   };

//   const resetSession = () => {
//     if (audioManagerRef.current) {
//       audioManagerRef.current.cleanup();
//       audioManagerRef.current.initialize();
//     }
//     setSessionComplete(false);
//     setShowPlayer(false);
//     setIsPlaying(false);
//     setIsPaused(false);
//     setIsInPractice(false);
//     setCurrentSectionIndex(0);
//     setAudioUrls([]);
//     setGeneratedSections([]);
//     setImpulse('');
//   };

//   // 時間フォーマット
//   const formatTime = (seconds: number): string => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins}:${secs.toString().padStart(2, '0')}`;
//   };

//   // セッション完了画面
//   if (sessionComplete) {
//     return (
//       <div className="meditation-wrapper" style={{
//         position: "fixed",
//         top: 0,
//         left: 0,
//         width: "100vw",
//         height: "100vh",
//         margin: 0,
//         padding: 0,
//         backgroundColor: "#000099",
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         justifyContent: "center",
//         overflow: "auto",
//         zIndex: 1,
//       }}>
//         <div style={{
//           textAlign: "center",
//           color: "#ffffdd",
//           fontFamily: "'Klee One', serif",
//           padding: "2rem"
//         }}>
//           <h1 style={{ fontSize: "2rem", marginBottom: "2rem" }}>
//             🌟 瞑想セッション完了 🌟
//           </h1>
//           <p style={{ fontSize: "1.2rem", marginBottom: "2rem", lineHeight: "1.8" }}>
//             お疲れ様でした。<br />
//             心を整える時間をお過ごしいただき、<br />
//             ありがとうございました。
//           </p>
//           <button
//             onClick={resetSession}
//             style={{
//               padding: "15px 30px",
//               fontSize: "1rem",
//               backgroundColor: "#ffffdd",
//               color: "#000099",
//               border: "none",
//               borderRadius: "8px",
//               cursor: "pointer",
//               fontFamily: "'Klee One', serif"
//             }}
//           >
//             新しい瞑想を始める
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="meditation-wrapper" style={{
//       position: "fixed",
//       top: 0,
//       left: 0,
//       width: "100vw",
//       height: "100vh",
//       margin: 0,
//       padding: 0,
//       backgroundColor: "#000099",
//       display: "flex",
//       flexDirection: "column",
//       alignItems: "center",
//       justifyContent: "flex-start",
//       overflow: "auto",
//       zIndex: 1,
//     }}>
//       {/* 光の背景 */}
//       <div className="glow-background" />

//       {/* メインコンテンツ */}
//       <div className="meditation-content" style={{
//         width: "100%",
//         maxWidth: "600px",
//         margin: 0,
//         padding: "3rem 2rem",
//         boxSizing: "border-box",
//         position: "relative",
//         zIndex: 2,
//         color: "#ffffdd",
//         fontFamily: "'Klee One', serif",
//       }}>

//         {/* 入力フォーム画面 */}
//         {!showPlayer && !isGenerating && (
//           <>
//             {/* タイトル */}
//             <div style={{ textAlign: "center", marginBottom: "2rem" }}>
//               <h1 style={{
//                 fontSize: "2rem",
//                 fontWeight: "normal",
//                 margin: 0,
//                 marginBottom: "1rem",
//                 letterSpacing: "2px",
//                 lineHeight: "1.4",
//                 textShadow: "0 0 20px rgba(255, 255, 221, 0.3)",
//               }}>
//                 <span style={{ color: '#ffffdd', fontSize: "1.5rem" }}>連絡衝動</span>
//                 <span style={{ margin: "0 0.5rem", fontSize: "1.5rem" }}>/</span>
//                 <span style={{ color: '#ffffdd', fontSize: "1.5rem" }}>絶縁衝動</span><br />
//                 <span style={{ fontSize: "1.5rem" }}>駆け込み寺</span><br />
//                 <span style={{ color: '#FFD700' }}>緊急クールダウン瞑想</span>
//               </h1>

//               <div style={{
//                 fontSize: "1rem",
//                 lineHeight: "1.8",
//                 opacity: 0.9,
//                 letterSpacing: "1px",
//                 textAlign: "left",
//                 marginBottom: "2rem"
//               }}>
//                 サイレント期特有の辛い衝動をクールダウンする専用瞑想です。連絡したい気持ち、諦めたい気持ち、どんな感情も一旦立ち止まって心を整えましょう。心を整える時間をご一緒に作りましょう。
//               </div>
//             </div>

//             {/* フォーム */}
//             <div style={{ marginBottom: "2rem" }}>
//               <div style={{
//                 fontSize: "0.8rem",
//                 marginBottom: "1rem",
//                 letterSpacing: "0.5px",
//                 opacity: 0.8,
//               }}>
//                 今あなたが抱えている辛い気持ちや衝動について教えてください。
//               </div>

//               <textarea
//                 value={impulse}
//                 onChange={(e) => setImpulse(e.target.value)}
//                 placeholder="例）もう何もかも終わりにしたい"
//                 style={{
//                   width: "100%",
//                   height: "120px",
//                   padding: "15px",
//                   border: "none",
//                   backgroundColor: "#ffffff",
//                   color: "#000099",
//                   fontSize: "1rem",
//                   lineHeight: "1.6",
//                   resize: "none",
//                   outline: "none",
//                   fontFamily: "'Klee One', serif",
//                   letterSpacing: "0.5px",
//                   boxSizing: "border-box",
//                   borderRadius: "4px",
//                   marginBottom: "1rem"
//                 }}
//                 maxLength={200}
//               />

//               <button
//                 onClick={handleSubmit}
//                 disabled={!impulse.trim() || isGenerating}
//                 style={{
//                   width: "100%",
//                   padding: "18px 25px",
//                   border: "none",
//                   backgroundColor: impulse.trim() && !isGenerating ? "#ffffdd" : "rgba(255, 255, 221, 0.5)",
//                   color: impulse.trim() && !isGenerating ? "#000099" : "rgba(0, 0, 153, 0.5)",
//                   fontSize: "1rem",
//                   fontFamily: "'Klee One', serif",
//                   letterSpacing: "1px",
//                   cursor: impulse.trim() && !isGenerating ? "pointer" : "not-allowed",
//                   transition: "all 0.3s ease",
//                   fontWeight: "bold",
//                   borderRadius: "4px"
//                 }}
//               >
//                 {isGenerating ? "瞑想作成中..." : "クールダウン瞑想を開始"}
//               </button>
//             </div>
//           </>
//         )}

//         {/* 生成中画面 */}
//         {isGenerating && (
//           <div style={{
//             textAlign: "center",
//             padding: "4rem 0",
//             display: "flex",
//             flexDirection: "column",
//             alignItems: "center",
//             justifyContent: "center",
//             minHeight: "60vh"
//           }}>
//             <p style={{
//               fontSize: "1.2rem",
//             }}>
//               あなたの心をケアする<br />瞑想を作成しています...
//             </p>
//           </div>
//         )}

//         {/* 音声プレーヤー画面 */}
//         {showPlayer && (
//           <div style={{
//             display: "flex",
//             flexDirection: "column",
//             alignItems: "center",
//             justifyContent: "center",
//             minHeight: "60vh"
//           }}>
//             <div style={{ 
//               textAlign: "center", 
//               marginBottom: "2rem"
//             }}>
//               <p style={{
//                 fontSize: "1.2rem",
//                 lineHeight: "1.8",
//                 marginBottom: "2rem"
//               }}>
//                 あなたの心のケア瞑想が<br />完成しました。<br />
//                 ゆっくりと音声に身を委ねてください。
//               </p>
//             </div>

//             <div style={{
//               background: "rgba(255, 255, 221, 0.1)",
//               border: "1px solid rgba(255, 255, 221, 0.3)",
//               borderRadius: "8px",
//               padding: "2rem",
//               textAlign: "center"
//             }}>
//               <button 
//                 onClick={() => {
//                   if (!isPlaying && !isPaused && !isInPractice) {
//                     startMeditation();
//                   } else if (isPlaying) {
//                     pauseMeditation();
//                   } else if (isPaused) {
//                     resumeMeditation();
//                   }
//                 }}
//                 disabled={isInPractice}
//                 style={{
//                   width: "60px",
//                   height: "60px",
//                   borderRadius: "50%",
//                   border: "2px solid #ffffdd",
//                   backgroundColor: "rgba(255, 255, 221, 0.1)",
//                   color: "#ffffdd",
//                   cursor: isInPractice ? "not-allowed" : "pointer",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   fontSize: "20px",
//                   margin: "0 auto 20px",
//                   opacity: isInPractice ? 0.5 : 1
//                 }}
//               >
//                 {isPlaying ? '⏸' : '▶'}
//               </button>

//               <div style={{
//                 fontSize: "0.9rem",
//                 opacity: 0.7,
//                 marginBottom: "15px"
//               }}>
//                 {isInPractice ? 
//                   `2分間実践中... 残り ${formatTime(practiceTimeLeft)}` :
//                   isPlaying ? 
//                     `Stage${currentSectionIndex + 1}/3 再生中...` : 
//                     isPaused ? '一時停止中' : 'あなたのためのケア瞑想準備完了'
//                 }
//               </div>

//               <div style={{
//                 fontSize: "0.8rem",
//                 opacity: 0.6,
//                 marginBottom: "10px"
//               }}>
//                 {isInPractice ? 
//                   '静かに呼吸を続けてください' :
//                   (() => {
//                     const stageNames = ['理解と受容', 'クールダウン', '前向きな転換'];
//                     return stageNames[currentSectionIndex] || '';
//                   })()
//                 }
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }





// src/pages/meditation.tsx
import React, { useState, useEffect, useRef } from 'react';

// 音声管理クラス
class AudioManager {
  private audioContext: AudioContext | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private bgmAudio: HTMLAudioElement | null = null;
  private convolver: ConvolverNode | null = null;
  private gainNode: GainNode | null = null;
  private bgmGainNode: GainNode | null = null;

  async initialize() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      await this.createReverbEffect();
      console.log('🎧 AudioManager初期化完了');
    } catch (error) {
      console.error('🎧 AudioManager初期化エラー:', error);
    }
  }

  private async createReverbEffect() {
    if (!this.audioContext) return;

    // リバーブ用インパルスレスポンス生成
    const duration = 3;
    const decay = 2;
    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * duration;
    const impulse = this.audioContext.createBuffer(2, length, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        const decayFactor = Math.pow(1 - i / length, decay);
        channelData[i] = (Math.random() * 0.5 - 0.25) * decayFactor;
      }
    }

    this.convolver = this.audioContext.createConvolver();
    this.convolver.buffer = impulse;
    
    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = 0.3; // リバーブの強さ
  }

  async playWithReverb(audioUrl: string): Promise<void> {
    return new Promise(async (resolve) => {
      try {
        console.log('🎵 音声再生試行:', audioUrl);
        
        // 既存音声を停止
        this.stopCurrent();
        
        // 1秒待機（確実な切り替えのため）
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 新しい音声要素を作成（シンプル版）
        this.currentAudio = new Audio(audioUrl);

        // 音声終了時の処理
        this.currentAudio.addEventListener('ended', () => {
          console.log('🎵 音声再生終了');
          resolve();
        });

        this.currentAudio.addEventListener('error', (error) => {
          console.error('🎵 音声エラー:', error);
          // エラーでも続行（サービス継続性優先）
          resolve();
        });

        // 音声を再生
        console.log('🎵 音声再生開始試行...');
        await this.currentAudio.play();
        console.log('🎵 ✅ 音声再生成功');

      } catch (error) {
        console.error('🎵 再生エラー:', error);
        // エラーでも続行
        resolve();
      }
    });
  }

  startBGM() {
    console.log('🎵 BGM開始要求 - 現在の状態:', !!this.bgmAudio);
    // BGMは一旦無効化
    return;
  }

  stopBGM() {
    if (this.bgmAudio) {
      this.bgmAudio.pause();
      this.bgmAudio.currentTime = 0;
      this.bgmAudio = null;
      console.log('🎵 BGM停止');
    }
  }

  stopCurrent() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }

  pauseCurrent() {
    if (this.currentAudio) {
      this.currentAudio.pause();
    }
  }

  resumeCurrent() {
    if (this.currentAudio) {
      return this.currentAudio.play();
    }
  }

  cleanup() {
    this.stopCurrent();
    this.stopBGM();
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

export default function MeditationPage() {
  const [impulse, setImpulse] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [generatedSections, setGeneratedSections] = useState<string[]>([]);
  const [audioUrls, setAudioUrls] = useState<string[]>([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isInPractice, setIsInPractice] = useState(false);
  const [practiceTimeLeft, setPracticeTimeLeft] = useState(10);
  const [sessionComplete, setSessionComplete] = useState(false);

  const audioManagerRef = useRef<AudioManager | null>(null);
  const practiceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    document.title = '連絡衝動/絶縁衝動駆け込み寺「誘導瞑想ワーク」';
    
    // AudioManager初期化
    audioManagerRef.current = new AudioManager();
    audioManagerRef.current.initialize();

    return () => {
      // クリーンアップ
      if (audioManagerRef.current) {
        audioManagerRef.current.cleanup();
      }
      if (practiceTimerRef.current) {
        clearInterval(practiceTimerRef.current);
      }
    };
  }, []);

  // 2分間実践タイマー
  useEffect(() => {
    console.log('⏰ タイマーuseEffect実行:', { isInPractice, practiceTimeLeft, currentSectionIndex });
    
    if (practiceTimerRef.current) {
      clearInterval(practiceTimerRef.current);
      practiceTimerRef.current = null;
    }

    if (isInPractice && practiceTimeLeft > 0) {
      console.log('⏰ タイマー開始');
      practiceTimerRef.current = setInterval(() => {
        setPracticeTimeLeft(prev => {
          console.log('⏰ タイマーカウント:', prev);
          if (prev <= 1) {
            console.log('⏰ タイマー終了 - 次のセクションへ');
            setIsInPractice(false);
            setPracticeTimeLeft(10);
            
            // 次のセクションへ
            const nextIndex = currentSectionIndex + 1;
            console.log('⏰ 次のセクション計算:', {
              current: currentSectionIndex,
              next: nextIndex,
              totalSections: audioUrls.length
            });
            
            if (nextIndex < audioUrls.length) {
              console.log('⏰ 次のセクション再生:', nextIndex);
              setTimeout(() => {
                playSection(nextIndex);
              }, 1000);
            } else {
              console.log('⏰ 全セクション完了');
              // 全セクション完了
              setSessionComplete(true);
            }
            return 10;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (practiceTimerRef.current) {
        clearInterval(practiceTimerRef.current);
        practiceTimerRef.current = null;
      }
    };
  }, [isInPractice, currentSectionIndex, audioUrls.length]);

  const handleSubmit = async () => {
    if (!impulse.trim()) return;
    
    setIsGenerating(true);
    
    try {
      // 1. 誘導瞑想セクションを生成
      const textResponse = await fetch('http://localhost:3001/api/generate-meditation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ impulse })
      });

      if (!textResponse.ok) {
        throw new Error('誘導瞑想テキストの生成に失敗しました');
      }

      const textData = await textResponse.json();
      console.log('📝 API レスポンス確認:', textData);
      console.log('📝 生成されたセクション数:', textData.sections?.length);
      
      // server.jsからの正しいレスポンス構造を確認
      if (!textData.sections || !Array.isArray(textData.sections)) {
        throw new Error('APIレスポンスの形式が不正です');
      }
      
      console.log('📝 デバッグ - textData.sections:', textData.sections);
      console.log('📝 デバッグ - textData.sections.length:', textData.sections.length);
      
      // 4つ目のセクション（終了挨拶）を追加
      const endingMessage = `ここまで、自分の心と静かに向き合ってくれてありがとう。深いところまで旅をしてきたあなたに、静かな祝福を。手放しも、受容も、再出発も――すべては魂の流れの中で選ばれたひととき。今、内に満ちているあたたかな感覚を大切に。その光は、確かにあなたの中にある。では、ゆっくりと目を開けてください。現実へと還るその瞬間にも、優しさと光を。`;
      
      console.log('📝 デバッグ - endingMessage:', endingMessage.substring(0, 50) + '...');
      
      const sectionsWithEnding = [...textData.sections, endingMessage];
      
      console.log('📝 デバッグ - sectionsWithEnding作成後:', sectionsWithEnding);
      console.log('📝 デバッグ - sectionsWithEnding.length:', sectionsWithEnding.length);
      
      console.log('📝 4セクション構成確認:');
      console.log('📝 元のセクション数:', textData.sections.length);
      console.log('📝 終了挨拶追加後:', sectionsWithEnding.length);
      sectionsWithEnding.forEach((section: string, index: number) => {
        console.log(`📝 セクション${index + 1}:`, section.substring(0, 50) + '...');
      });
      
      setGeneratedSections(sectionsWithEnding);

      // 2. 4つの文章セクションの音声を生成（終了挨拶込み）
      const audioUrls = [];
      
      console.log('🎵 音声生成開始 - セクション数:', sectionsWithEnding.length);
      
      for (let i = 0; i < sectionsWithEnding.length; i++) {
        console.log(`🎵 セクション${i + 1}/${sectionsWithEnding.length} 音声生成中...`);
        console.log(`🎵 セクション${i + 1}内容:`, sectionsWithEnding[i].substring(0, 50) + '...');
        
        try {
          const audioResponse = await fetch('http://localhost:3001/api/generate-audio', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              text: sectionsWithEnding[i],
              speed: 0.9
            })
          });

          console.log(`🎵 セクション${i + 1} API応答ステータス:`, audioResponse.status);

          if (!audioResponse.ok) {
            const errorText = await audioResponse.text();
            console.error(`🎵 セクション${i + 1} APIエラー:`, errorText);
            throw new Error(`セクション${i + 1}の音声生成に失敗しました: ${audioResponse.status}`);
          }

          const audioData = await audioResponse.json();
          audioUrls.push(audioData.audioUrl);
          console.log(`🎵 セクション${i + 1} 音声生成完了:`, audioData.audioUrl);
          
        } catch (error) {
          console.error(`🎵 セクション${i + 1} 音声生成エラー:`, error);
          throw error;
        }
      }

      setAudioUrls(audioUrls);
      setIsGenerating(false);
      setShowPlayer(true);
      
    } catch (error) {
      console.error('誘導瞑想処理エラー:', error);
      setIsGenerating(false);
      alert('誘導瞑想処理中にエラーが発生しました: ' + (error as Error).message);
    }
  };

  const playSection = async (sectionIndex: number) => {
    console.log('🎵 playSection呼び出し:', sectionIndex, 'isPlaying:', isPlaying, 'audioUrls.length:', audioUrls.length);
    
    if (!audioUrls[sectionIndex] || isPlaying || !audioManagerRef.current) {
      console.log('🎵 再生条件チェック失敗 - 処理中止');
      return;
    }

    try {
      console.log(`🎵 セクション${sectionIndex + 1}再生開始`);
      
      // 状態を先に設定して重複防止
      setIsPlaying(true);
      setCurrentSectionIndex(sectionIndex);

      // BGMがまだ開始されていなければ開始
      if (sectionIndex === 0) {
        audioManagerRef.current.startBGM();
      }

      // リバーブ効果付きで音声再生
      await audioManagerRef.current.playWithReverb(audioUrls[sectionIndex]);

      // 再生完了
      setIsPlaying(false);
      console.log(`🎵 セクション${sectionIndex + 1}再生完了`);

      // 条件分岐を明確にする
      const isLastSection = sectionIndex === audioUrls.length - 1;
      console.log('🎵 セクション判定:', {
        currentSection: sectionIndex + 1,
        totalSections: audioUrls.length,
        isLastSection: isLastSection
      });

      if (isLastSection) {
        // 本当の最後のセクション（セクション4：終了挨拶）= 全セクション完了
        console.log('🧘 最終セクション完了 - セッション終了');
        setSessionComplete(true);
      } else {
        // セクション1,2,3の後 = 2分間実践開始
        console.log(`🔇 セクション${sectionIndex + 1}後の10秒実践開始`);
        setIsInPractice(true);
        setPracticeTimeLeft(10);
      }

    } catch (error) {
      console.error(`❌ セクション${sectionIndex + 1}再生エラー:`, error);
      setIsPlaying(false);
      
      // エラーでも次に進む（サービス継続性優先）
      const isLastSection = sectionIndex === audioUrls.length - 1;
      if (!isLastSection) {
        setTimeout(() => {
          setIsInPractice(true);
          setPracticeTimeLeft(10);
        }, 1000);
      } else {
        setSessionComplete(true);
      }
    }
  };

  const handleSessionComplete = () => {
    console.log('🧘 瞑想セッション完了');
    setSessionComplete(true);
    setIsPlaying(false);
    setIsPaused(false);
    setIsInPractice(false);
    setCurrentSectionIndex(0);
    
    if (audioManagerRef.current) {
      audioManagerRef.current.stopBGM();
    }
  };

  const startMeditation = () => {
    console.log('🎵 startMeditation呼び出し - isPlaying:', isPlaying);
    if (audioUrls.length === 0 || isPlaying) {
      console.log('🎵 startMeditation - 条件チェック失敗');
      return;
    }
    playSection(0);
  };

  const pauseMeditation = () => {
    if (audioManagerRef.current && isPlaying) {
      audioManagerRef.current.pauseCurrent();
      setIsPlaying(false);
      setIsPaused(true);
    }
  };

  const resumeMeditation = () => {
    if (audioManagerRef.current && isPaused) {
      audioManagerRef.current.resumeCurrent()?.then(() => {
        setIsPlaying(true);
        setIsPaused(false);
      }).catch(console.error);
    }
  };

  const resetSession = () => {
    if (audioManagerRef.current) {
      audioManagerRef.current.cleanup();
      audioManagerRef.current.initialize();
    }
    setSessionComplete(false);
    setShowPlayer(false);
    setIsPlaying(false);
    setIsPaused(false);
    setIsInPractice(false);
    setCurrentSectionIndex(0);
    setAudioUrls([]);
    setGeneratedSections([]);
    setImpulse('');
  };

  // 時間フォーマット
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="meditation-wrapper" style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      margin: 0,
      padding: 0,
      backgroundColor: "#000099",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-start",
      overflow: "auto",
      zIndex: 1,
    }}>
      {/* 光の背景 */}
      <div className="glow-background" />

      {/* メインコンテンツ */}
      <div className="meditation-content" style={{
        width: "100%",
        maxWidth: "600px",
        margin: 0,
        padding: "3rem 2rem",
        boxSizing: "border-box",
        position: "relative",
        zIndex: 2,
        color: "#ffffdd",
        fontFamily: "'Klee One', serif",
      }}>

        {/* 入力フォーム画面 */}
        {!showPlayer && !isGenerating && (
          <>
            {/* タイトル */}
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <h1 style={{
                fontSize: "2rem",
                fontWeight: "normal",
                margin: 0,
                marginBottom: "1rem",
                letterSpacing: "2px",
                lineHeight: "1.4",
                textShadow: "0 0 20px rgba(255, 255, 221, 0.3)",
              }}>
                <span style={{ color: '#ffffdd', fontSize: "1.5rem" }}>連絡衝動</span>
                <span style={{ margin: "0 0.5rem", fontSize: "1.5rem" }}>/</span>
                <span style={{ color: '#ffffdd', fontSize: "1.5rem" }}>絶縁衝動</span><br />
                <span style={{ fontSize: "1.5rem" }}>駆け込み寺</span><br />
                <span style={{ color: '#FFD700' }}>緊急クールダウン瞑想</span>
              </h1>

              <div style={{
                fontSize: "1rem",
                lineHeight: "1.8",
                opacity: 0.9,
                letterSpacing: "1px",
                textAlign: "left",
                marginBottom: "2rem"
              }}>
                サイレント期特有の辛い衝動をクールダウンする専用瞑想です。連絡したい気持ち、諦めたい気持ち、どんな感情も一旦立ち止まって心を整えましょう。心を整える時間をご一緒に作りましょう。
              </div>
            </div>

            {/* フォーム */}
            <div style={{ marginBottom: "2rem" }}>
              <div style={{
                fontSize: "0.8rem",
                marginBottom: "1rem",
                letterSpacing: "0.5px",
                opacity: 0.8,
              }}>
                今あなたが抱えている辛い気持ちや衝動について教えてください。
              </div>

              <textarea
                value={impulse}
                onChange={(e) => setImpulse(e.target.value)}
                placeholder="例）もう何もかも終わりにしたい"
                style={{
                  width: "100%",
                  height: "120px",
                  padding: "15px",
                  border: "none",
                  backgroundColor: "#ffffff",
                  color: "#000099",
                  fontSize: "1rem",
                  lineHeight: "1.6",
                  resize: "none",
                  outline: "none",
                  fontFamily: "'Klee One', serif",
                  letterSpacing: "0.5px",
                  boxSizing: "border-box",
                  borderRadius: "4px",
                  marginBottom: "1rem"
                }}
                maxLength={200}
              />

              <button
                onClick={handleSubmit}
                disabled={!impulse.trim() || isGenerating}
                style={{
                  width: "100%",
                  padding: "18px 25px",
                  border: "none",
                  backgroundColor: impulse.trim() && !isGenerating ? "#ffffdd" : "rgba(255, 255, 221, 0.5)",
                  color: impulse.trim() && !isGenerating ? "#000099" : "rgba(0, 0, 153, 0.5)",
                  fontSize: "1rem",
                  fontFamily: "'Klee One', serif",
                  letterSpacing: "1px",
                  cursor: impulse.trim() && !isGenerating ? "pointer" : "not-allowed",
                  transition: "all 0.3s ease",
                  fontWeight: "bold",
                  borderRadius: "4px"
                }}
              >
                {isGenerating ? "瞑想作成中..." : "クールダウン瞑想を開始"}
              </button>
            </div>
          </>
        )}

        {/* 生成中画面 */}
        {isGenerating && (
          <div style={{
            textAlign: "center",
            padding: "4rem 0",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "60vh"
          }}>
            <p style={{
              fontSize: "1.2rem",
            }}>
              あなたの心をケアする<br />瞑想を作成しています...
            </p>
          </div>
        )}

        {/* 音声プレーヤー画面 */}
        {showPlayer && (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "60vh"
          }}>
            <div style={{ 
              textAlign: "center", 
              marginBottom: "2rem"
            }}>
              <p style={{
                fontSize: "1.2rem",
                lineHeight: "1.8",
                marginBottom: "2rem"
              }}>
                あなたの心のケア瞑想が<br />完成しました。<br />
                ゆっくりと音声に身を委ねてください。
              </p>
            </div>

            <div style={{
              background: "rgba(255, 255, 221, 0.1)",
              border: "1px solid rgba(255, 255, 221, 0.3)",
              borderRadius: "8px",
              padding: "2rem",
              textAlign: "center"
            }}>
              <button 
                onClick={() => {
                  if (!isPlaying && !isPaused && !isInPractice) {
                    startMeditation();
                  } else if (isPlaying) {
                    pauseMeditation();
                  } else if (isPaused) {
                    resumeMeditation();
                  }
                }}
                disabled={isInPractice}
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  border: "2px solid #ffffdd",
                  backgroundColor: "rgba(255, 255, 221, 0.1)",
                  color: "#ffffdd",
                  cursor: isInPractice ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  margin: "0 auto 20px",
                  opacity: isInPractice ? 0.5 : 1
                }}
              >
                {isPlaying ? '⏸' : '▶'}
              </button>

              <div style={{
                fontSize: "0.9rem",
                opacity: 0.7,
                marginBottom: "15px"
              }}>
                {isInPractice ? 
                  `10秒実践中... 残り ${formatTime(practiceTimeLeft)}` :
                  isPlaying ? 
                    `Stage${currentSectionIndex + 1}/4 再生中...` : 
                    isPaused ? '一時停止中' : 'あなたのためのケア瞑想準備完了'
                }
              </div>

              <div style={{
                fontSize: "0.8rem",
                opacity: 0.6,
                marginBottom: "10px"
              }}>
                {isInPractice ? 
                  '静かに呼吸を続けてください' :
                  (() => {
                    const stageNames = ['理解と受容', 'クールダウン', '前向きな転換', '終了の挨拶'];
                    return stageNames[currentSectionIndex] || '';
                  })()
                }
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}