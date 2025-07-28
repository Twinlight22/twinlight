// import { useState, useEffect } from 'react';

//  export default function MeditationPage() {
//    const [impulse, setImpulse] = useState('');
//    const [isGenerating, setIsGenerating] = useState(false);
//    const [showPlayer, setShowPlayer] = useState(false);
//    const [generatedSections, setGeneratedSections] = useState<string[]>([]);
//    const [audioUrls, setAudioUrls] = useState<string[]>([]);
//    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
//    const [isPlaying, setIsPlaying] = useState(false);
//    const [isPaused, setIsPaused] = useState(false);
//    const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  
//     BGM関連のstate追加
//    const [bgmAudio, setBgmAudio] = useState<HTMLAudioElement | null>(null);
//    const [isBgmPlaying, setIsBgmPlaying] = useState(false);

//    useEffect(() => {
//      document.title = '連絡衝動/絶縁衝動駆け込み寺「誘導瞑想ワーク」';
    
//       BGM音声ファイルを事前読み込み
//      const bgm = new Audio('/meditation.mp3');
//      bgm.loop = true;   ループ再生
//      bgm.volume = 0.3;  音量30%
//      setBgmAudio(bgm);
    
//      return () => {
//        if (bgm) {
//          bgm.pause();
//          bgm.src = '';
//        }
//      };
//    }, []);

//    const handleSubmit = async () => {
//      if (!impulse.trim()) return;
    
//      setIsGenerating(true);
    
//      try {
//         1. 誘導瞑想セクションを6つ生成
//        const textResponse = await fetch('http:localhost:3001/api/generate-meditation', {
//          method: 'POST',
//          headers: { 'Content-Type': 'application/json' },
//          body: JSON.stringify({ impulse })
//        });

//        if (!textResponse.ok) {
//          throw new Error('誘導瞑想テキストの生成に失敗しました');
//        }

//        const textData = await textResponse.json();
//        setGeneratedSections(textData.sections);

//         2. 各セクションの音声を個別生成
//        const audioUrls = [];
      
//        for (let i = 0; i < textData.sections.length; i++) {
//          console.log(`🎵 セクション${i + 1}音声生成中...`);
        
//          const audioResponse = await fetch('http:localhost:3001/api/generate-audio', {
//            method: 'POST',
//            headers: { 'Content-Type': 'application/json' },
//            body: JSON.stringify({ 
//              text: textData.sections[i],
//              speed: 0.9
//            })
//          });

//          if (!audioResponse.ok) {
//            throw new Error(`セクション${i + 1}の音声生成に失敗しました`);
//          }

//          const audioData = await audioResponse.json();
//          audioUrls.push(audioData.audioUrl);
//        }

//        setAudioUrls(audioUrls);
//        setIsGenerating(false);
//        setShowPlayer(true);
      
//      } catch (error) {
//        console.error('誘導瞑想処理エラー:', error);
//        setIsGenerating(false);
//        alert('誘導瞑想処理中にエラーが発生しました: ' + error.message);
//      }
//    };

//     リバーブ用インパルスレスポンス生成関数
//    function createReverbImpulse(audioContext: AudioContext, duration: number, decay: number, reverse: boolean) {
//      const sampleRate = audioContext.sampleRate;
//      const length = sampleRate * duration;
//      const impulse = audioContext.createBuffer(2, length, sampleRate);
    
//      for (let channel = 0; channel < 2; channel++) {
//        const channelData = impulse.getChannelData(channel);
//        for (let i = 0; i < length; i++) {
//          const n = reverse ? length - i : i;
//          channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
//        }
//      }
    
//      return impulse;
//    }

//     セクション内容に基づいた2分間指示を生成
//    const generatePracticeInstruction = async (sectionIndex: number) => {
//      try {
//        console.log('🔔 2分間実践指示生成中...');
      
//         セクション内容を分析して2分間指示を生成
//        const sectionContent = generatedSections[sectionIndex];
      
//        const response = await fetch('http:localhost:3001/api/generate-practice-instruction', {
//          method: 'POST',
//          headers: { 'Content-Type': 'application/json' },
//          body: JSON.stringify({
//            sectionContent: sectionContent,
//            sectionIndex: sectionIndex
//          })
//        });

//        if (!response.ok) {
//          throw new Error('2分間指示生成に失敗しました');
//        }

//        const data = await response.json();
      
//         指示音声を生成・再生
//        const audioResponse = await fetch('http:localhost:3001/api/generate-audio', {
//          method: 'POST',
//          headers: { 'Content-Type': 'application/json' },
//          body: JSON.stringify({ 
//            text: data.instruction,
//            speed: 0.9
//          })
//        });

//        const audioData = await audioResponse.json();
//        const instructionAudio = new Audio(audioData.audioUrl);
      
//        return new Promise<void>((resolve) => {
//          instructionAudio.onended = () => {
//            console.log('🔔 2分間実践指示完了');
//            console.log('🔇 2分間の沈黙時間開始...');
//            resolve();
//          };
//          instructionAudio.play();
//        });
      
//      } catch (error) {
//        console.error('2分間指示生成エラー:', error);
//        return Promise.resolve();
//      }
//    };

//    const playSection = async (sectionIndex: number) => {
//      if (!audioUrls[sectionIndex] || isPlaying) return;
    
//      try {
//         BGM開始（最初のセクションのみ - 重複チェック強化）
//        if (sectionIndex === 0 && bgmAudio && !isBgmPlaying) {
//          try {
//            bgmAudio.currentTime = 0;
//            bgmAudio.volume = 0.3;
//            const playPromise = bgmAudio.play();
//            if (playPromise !== undefined) {
//              await playPromise;
//              setIsBgmPlaying(true);
//              console.log('🎵 BGMセクション開始時に確実に再生');
//            }
//          } catch (error) {
//            console.log('BGM再生失敗（自動再生制限の可能性）:', error);
//          }
//        }

//        const audio = new Audio(audioUrls[sectionIndex]);
//        setCurrentAudio(audio);

//         リバーブ効果を追加
//        if (window.AudioContext || (window as any).webkitAudioContext) {
//          try {
//            const audioContext = new ((window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext)();
//            const source = audioContext.createMediaElementSource(audio);
//            const convolver = audioContext.createConvolver();
          
//             簡易リバーブ用インパルスレスポンス生成
//            const impulseResponse = createReverbImpulse(audioContext, 2, 2, false);
//            convolver.buffer = impulseResponse;
          
//            const dryGainNode = audioContext.createGain();
//            dryGainNode.gain.value = 0.5;  ドライ音声（リバーブ強化のため減少）
          
//            const wetGainNode = audioContext.createGain();
//            wetGainNode.gain.value = 0.5;  リバーブ音声（より効かせる）
          
//            source.connect(dryGainNode);
//            dryGainNode.connect(audioContext.destination);
          
//            source.connect(convolver);
//            convolver.connect(wetGainNode);
//            wetGainNode.connect(audioContext.destination);
          
//            console.log('🎧 リバーブ効果適用');
//          } catch (error) {
//            console.log('リバーブ適用失敗:', error);
//          }
//        }

//        audio.onended = () => {
//          console.log(`✅ セクション${sectionIndex + 1}再生終了`);
//          setIsPlaying(false);
        
//           次のセクションへ（各セクション後に2分間指示生成→2分間沈黙）
//          if (sectionIndex < audioUrls.length - 1) {
//             セクション終了後に2分間指示を生成
//            generatePracticeInstruction(sectionIndex).then(() => {
//              setTimeout(() => {
//                console.log('🔇 2分間の沈黙時間終了');
//                setCurrentSectionIndex(sectionIndex + 1);
//                playSection(sectionIndex + 1);
//              }, 120000);  2分間
//            });
//          } else {
//             全セクション終了
//            setIsPaused(false);
//            setCurrentSectionIndex(0);
          
//             BGM停止
//            if (bgmAudio && isBgmPlaying) {
//              const fadeInterval = setInterval(() => {
//                if (bgmAudio.volume > 0.1) {
//                  bgmAudio.volume -= 0.05;
//                } else {
//                  bgmAudio.pause();
//                  bgmAudio.currentTime = 0;
//                  clearInterval(fadeInterval);
//                  setIsBgmPlaying(false);
//                }
//              }, 200);
//            }
          
//            console.log('🧘 瞑想セッション完了');
//          }
//        };

//        audio.onerror = (error) => {
//          console.error(`❌ セクション${sectionIndex + 1}audio.onerror:`, error);
//          alert('音声の再生中にエラーが発生しました');
//          setIsPlaying(false);
//          setIsPaused(false);
//        };

//        await audio.play();
//        setIsPlaying(true);
//        setIsPaused(false);
//        setCurrentSectionIndex(sectionIndex);
      
//      } catch (error) {
//        console.error(`❌ セクション${sectionIndex + 1}再生エラー:`, error);
//        alert(`音声の再生中にエラーが発生しました: ${error}`);
//        setIsPlaying(false);
//        setIsPaused(false);
//      }
//    };

//    const playAudio = async () => {
//      if (!audioUrls.length || isPlaying) return;
    
//       BGM開始（ユーザーインタラクション後に確実に再生）
//      if (bgmAudio && !isBgmPlaying) {
//        bgmAudio.currentTime = 0;
//        bgmAudio.volume = 0.3;
      
//        try {
//          const playPromise = bgmAudio.play();
//          if (playPromise !== undefined) {
//            await playPromise;
//            setIsBgmPlaying(true);
//            console.log('🎵 BGM再生開始確認');
//          }
//        } catch (error) {
//          console.error('BGM再生エラー:', error);
//           BGMエラーでも瞑想は続行
//        }
//      }
    
//      playSection(0);  最初のセクションから開始
//    };

//    const pauseAudio = () => {
//      if (currentAudio && isPlaying) {
//        currentAudio.pause();
//        setIsPlaying(false);
//        setIsPaused(true);
      
//         BGMも一時停止
//        if (bgmAudio && isBgmPlaying) {
//          bgmAudio.pause();
//        }
//      }
//    };

//    const resumeAudio = () => {
//      if (currentAudio && isPaused) {
//        currentAudio.play().then(() => {
//          setIsPlaying(true);
//          setIsPaused(false);
        
//           BGMも再開
//          if (bgmAudio && isBgmPlaying) {
//            bgmAudio.play();
//          }
//        }).catch(error => {
//          console.error('音声再開エラー:', error);
//          alert('音声の再開に失敗しました');
//        });
//      }
//    };

//    return (
//      <div>
//        {/* 入力フォーム画面 */}
//        {!showPlayer && !isGenerating && (
//          <div style={{
//            minHeight: '100vh',
//            backgroundColor: '#000099',
//            color: '#ffffdd',
//            fontFamily: "'Klee One', serif",
//            display: 'flex',
//            flexDirection: 'column' as const,
//            alignItems: 'center',
//            justifyContent: 'center',
//            padding: '7px 2.5px 60px 2.5px',
//            position: 'relative' as const
//          }}>
//            {/* 背景の光の効果 */}
//            <div style={{
//              position: 'absolute' as const,
//              top: '10%',
//              left: '20%',
//              width: '3px',
//              height: '3px',
//              backgroundColor: '#ffffdd',
//              borderRadius: '50%',
//              opacity: 0.6,
//              boxShadow: '0 0 20px #ffffdd, 0 0 40px #ffffdd'
//            }}></div>
//            <div style={{
//              position: 'absolute' as const,
//              top: '30%',
//              right: '15%',
//              width: '2px',
//              height: '2px',
//              backgroundColor: '#ffffdd',
//              borderRadius: '50%',
//              opacity: 0.4,
//              boxShadow: '0 0 15px #ffffdd'
//            }}></div>
//            <div style={{
//              position: 'absolute' as const,
//              bottom: '20%',
//              left: '10%',
//              width: '2px',
//              height: '2px',
//              backgroundColor: '#ffffdd',
//              borderRadius: '50%',
//              opacity: 0.5,
//              boxShadow: '0 0 18px #ffffdd'
//            }}></div>

//            <div style={{
//              maxWidth: '600px',
//              width: '100%',
//              textAlign: 'center' as const,
//              position: 'relative' as const,
//              zIndex: 10
//            }}>
            
//              {/* タイトル */}
//              <h1 style={{
//                fontSize: '32px',
//                fontWeight: 'normal' as const,
//                marginBottom: '20px',
//                letterSpacing: '2px',
//                lineHeight: '1.4',
//                textShadow: '0 0 20px rgba(255, 255, 221, 0.3)',
//                fontFamily: "'Klee One', serif"
//              }}>
//                <span style={{ color: '#ff6600' }}>連絡衝動</span><span style={{ width: '0.5ch', display: 'inline-block' }}></span>/<span style={{ width: '0.5ch', display: 'inline-block' }}></span><span style={{ color: '#ff6600' }}>絶縁衝動</span><br />駆け込み寺<br />「誘導瞑想ワーク」
//              </h1>

//              {/* サブタイトル */}
//              <h1 style={{
//                fontSize: '16px',
//                lineHeight: '1.8',
//                marginBottom: '35px',
//                opacity: 0.9,
//                letterSpacing: '1px',
//                fontFamily: "'Klee One', serif",
//                fontWeight: 'normal' as const,
//                textAlign: 'left' as const
//              }}>
//                サイレント期特有の辛い衝動をクールダウンする専用瞑想です。連絡したい気持ち、諦めたい気持ち、どんな感情も一旦立ち止まって心を整えましょう。あなたのための時間を作ります。
//              </h1>

//              {/* 説明 */}
//              <div style={{
//                fontSize: '12px',
//                marginBottom: '15px',
//                letterSpacing: '0.5px',
//                fontFamily: "'Klee One', serif",
//                opacity: 0.8,
//                textAlign: 'left' as const
//              }}>
//                今あなたが抱えている辛い気持ちや衝動について教えてください。
//              </div>

//              {/* フォーム */}
//              <div style={{
//                marginBottom: '40px',
//                position: 'relative' as const
//              }}>
//                <textarea
//                  value={impulse}
//                  onChange={(e) => setImpulse(e.target.value)}
//                  placeholder="例）彼に連絡したい衝動が止まりません..."
//                  style={{
//                    width: '100%',
//                    height: '120px',
//                    padding: '15px',
//                    border: 'none',
//                    backgroundColor: '#ffffff',
//                    color: '#000099',
//                    fontSize: '16px',
//                    lineHeight: '1.6',
//                    resize: 'none' as const,
//                    outline: 'none',
//                    fontFamily: "'Klee One', serif",
//                    letterSpacing: '0.5px',
//                    boxSizing: 'border-box' as const,
//                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 2px rgba(0, 0, 0, 0.05)'
//                  }}
//                  onFocus={(e) => {
//                    (e.target as HTMLTextAreaElement).style.backgroundColor = '#ffffff';
//                    (e.target as HTMLTextAreaElement).style.boxShadow = 'inset 0 3px 6px rgba(0, 0, 0, 0.15), inset 0 1px 3px rgba(0, 0, 0, 0.1)';
//                  }}
//                  onBlur={(e) => {
//                    (e.target as HTMLTextAreaElement).style.backgroundColor = '#ffffff';
//                    (e.target as HTMLTextAreaElement).style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 2px rgba(0, 0, 0, 0.05)';
//                  }}
//                  maxLength={200}
//                />

//                <button
//                  onClick={handleSubmit}
//                  disabled={!impulse.trim() || isGenerating}
//                  style={{
//                    width: '100%',
//                    padding: '18px 25px',
//                    border: 'none',
//                    backgroundColor: impulse.trim() && !isGenerating ? '#ffffdd' : 'rgba(255, 255, 221, 0.5)',
//                    color: impulse.trim() && !isGenerating ? '#000099' : 'rgba(0, 0, 153, 0.5)',
//                    fontSize: '16px',
//                    fontFamily: "'Klee One', serif",
//                    letterSpacing: '1px',
//                    cursor: impulse.trim() && !isGenerating ? 'pointer' : 'not-allowed',
//                    transition: 'all 0.3s ease',
//                    fontWeight: 'bold' as const,
//                    boxShadow: impulse.trim() && !isGenerating 
//                      ? '0 3px 6px rgba(0, 0, 0, 0.2), 0 1px 3px rgba(0, 0, 0, 0.3)' 
//                      : '0 1px 2px rgba(0, 0, 0, 0.1)',
//                    transform: 'translateY(0)'
//                  }}
//                  onMouseEnter={(e) => {
//                    if (impulse.trim() && !isGenerating) {
//                      (e.target as HTMLButtonElement).style.backgroundColor = '#ffffff';
//                      (e.target as HTMLButtonElement).style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 255, 255, 0.5), 0 0 40px rgba(255, 255, 255, 0.3)';
//                      (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)';
//                    }
//                  }}
//                  onMouseLeave={(e) => {
//                    if (impulse.trim() && !isGenerating) {
//                      (e.target as HTMLButtonElement).style.backgroundColor = '#ffffdd';
//                      (e.target as HTMLButtonElement).style.boxShadow = '0 3px 6px rgba(0, 0, 0, 0.2), 0 1px 3px rgba(0, 0, 0, 0.3)';
//                      (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
//                    }
//                  }}
//                >
//                  {isGenerating ? (
//                    <div style={{
//                      display: 'flex',
//                      alignItems: 'center',
//                      justifyContent: 'center',
//                      gap: '10px'
//                    }}>
//                      <div style={{
//                        width: '16px',
//                        height: '16px',
//                        border: '2px solid rgba(0, 0, 153, 0.3)',
//                        borderTop: '2px solid #000099',
//                        borderRadius: '50%',
//                        animation: 'spin 1s linear infinite'
//                      }}></div>
//                      <span>瞑想作成中...</span>
//                    </div>
//                  ) : (
//                    'クールダウン瞑想を開始'
//                  )}
//                </button>
//              </div>
            
//            </div>
//          </div>
//        )}

//        {/* 生成中画面 */}
//        {isGenerating && (
//          <div style={{
//            position: 'fixed' as const,
//            top: 0,
//            left: 0,
//            width: '100%',
//            height: '100%',
//            backgroundColor: 'rgba(0, 0, 153, 0.95)',
//            display: 'flex',
//            alignItems: 'center',
//            justifyContent: 'center',
//            zIndex: 9999,
//            fontFamily: "'Klee One', serif",
//            color: '#ffffdd'
//          }}>
//            <p style={{
//              fontSize: '18px',
//              textAlign: 'center' as const
//            }}>
//              あなたの心をケアする瞑想を作成しています...
//            </p>
//          </div>
//        )}

//        {/* 音声プレーヤー画面 */}
//        {showPlayer && (
//          <div style={{
//            minHeight: '100vh',
//            backgroundColor: '#000099',
//            color: '#ffffdd',
//            fontFamily: "'Klee One', serif",
//            display: 'flex',
//            alignItems: 'center',
//            justifyContent: 'center',
//            padding: '20px'
//          }}>
//            <div style={{
//              maxWidth: '500px',
//              width: '100%',
//              textAlign: 'center' as const
//            }}>
//              <p style={{
//                fontSize: '18px',
//                lineHeight: '1.8',
//                marginBottom: '40px'
//              }}>
//                あなたのための心のケア瞑想が<br />完成しました。<br />
//                ゆっくりと音声に身を委ねてください。
//              </p>

//              <div style={{
//                background: 'rgba(255, 255, 221, 0.1)',
//                border: '1px solid rgba(255, 255, 221, 0.3)',
//                borderRadius: '8px',
//                padding: '40px 30px'
//              }}>
//                <button 
//                  onClick={() => {
//                    if (!isPlaying && !isPaused) {
//                      playAudio();
//                    } else if (isPlaying) {
//                      pauseAudio();
//                    } else if (isPaused) {
//                      resumeAudio();
//                    }
//                  }}
//                  style={{
//                    width: '60px',
//                    height: '60px',
//                    borderRadius: '50%',
//                    border: '2px solid #ffffdd',
//                    backgroundColor: 'rgba(255, 255, 221, 0.1)',
//                    color: '#ffffdd',
//                    cursor: 'pointer',
//                    display: 'flex',
//                    alignItems: 'center',
//                    justifyContent: 'center',
//                    fontSize: '20px',
//                    margin: '0 auto 20px'
//                  }}
//                >
//                  {isPlaying ? '⏸' : '▶'}
//                </button>

//                <div style={{
//                  fontSize: '14px',
//                  opacity: 0.7,
//                  marginBottom: '15px'
//                }}>
//                  {isPlaying ? 
//                    `セクション${currentSectionIndex + 1}/3 再生中...` : 
//                    isPaused ? '一時停止中' : 'あなたのためのケア瞑想準備完了'
//                  }
//                </div>

//                <div style={{
//                  fontSize: '12px',
//                  opacity: 0.6,
//                  marginBottom: '10px'
//                }}>
//                  {['理解と受容', 'クールダウン', '前向きな転換'][currentSectionIndex] || '準備中'}
//                </div>
//              </div>

//              {/* メニューへ戻るリンク */}
//              <div style={{ textAlign: "center", marginTop: "30px" }}>
//                <a
//                  href="/home"
//                  style={{
//                    fontSize: "16px",
//                    color: "rgba(255, 255, 221, 0.7)",
//                    textDecoration: "underline",
//                    fontFamily: "'Klee One', serif",
//                    transition: "all 0.3s ease",
//                    display: "inline-block",
//                    padding: "8px 0"
//                  }}
//                  onMouseEnter={(e) => {
//                    (e.target as HTMLAnchorElement).style.color = "#ffffdd";
//                    (e.target as HTMLAnchorElement).style.textShadow = "0 0 8px rgba(255, 255, 221, 0.5)";
//                  }}
//                  onMouseLeave={(e) => {
//                    (e.target as HTMLAnchorElement).style.color = "rgba(255, 255, 221, 0.7)";
//                    (e.target as HTMLAnchorElement).style.textShadow = "none";
//                  }}
//                >
//                  メニューへ戻る
//                </a>
//              </div>
//            </div>
//          </div>
//        )}

//        <style jsx>{`
//          @keyframes spin {
//            0% { transform: rotate(0deg); }
//            100% { transform: rotate(360deg); }
//          }
//        `}</style>
//      </div>
//    );
//  }




//  import { useState, useEffect } from 'react';

//  export default function MeditationPage() {
//    const [impulse, setImpulse] = useState('');
//    const [isGenerating, setIsGenerating] = useState(false);
//    const [showPlayer, setShowPlayer] = useState(false);
//    const [generatedSections, setGeneratedSections] = useState<string[]>([]);
//    const [audioUrls, setAudioUrls] = useState<string[]>([]);
//    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
//    const [isPlaying, setIsPlaying] = useState(false);
//    const [isPaused, setIsPaused] = useState(false);
//    const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  
//     BGM関連のstate追加
//    const [bgmAudio, setBgmAudio] = useState<HTMLAudioElement | null>(null);
//    const [isBgmPlaying, setIsBgmPlaying] = useState(false);

//    useEffect(() => {
//      document.title = '連絡衝動/絶縁衝動駆け込み寺「誘導瞑想ワーク」';
    
//       BGM音声ファイルを事前読み込み
//      const bgm = new Audio('/meditation.mp3');
//      bgm.loop = true;   ループ再生
//      bgm.volume = 0.3;  音量30%
//      setBgmAudio(bgm);
    
//      return () => {
//        if (bgm) {
//          bgm.pause();
//          bgm.src = '';
//        }
//      };
//    }, []);

//    const handleSubmit = async () => {
//      if (!impulse.trim()) return;
    
//      setIsGenerating(true);
    
//      try {
//         1. 誘導瞑想セクションを6つ生成
//        const textResponse = await fetch('http:localhost:3001/api/generate-meditation', {
//          method: 'POST',
//          headers: { 'Content-Type': 'application/json' },
//          body: JSON.stringify({ impulse })
//        });

//        if (!textResponse.ok) {
//          throw new Error('誘導瞑想テキストの生成に失敗しました');
//        }

//        const textData = await textResponse.json();
//        setGeneratedSections(textData.sections);

//         2. 各セクションの音声を個別生成
//        const audioUrls = [];
      
//        for (let i = 0; i < textData.sections.length; i++) {
//          console.log(`🎵 セクション${i + 1}音声生成中...`);
        
//          const audioResponse = await fetch('http:localhost:3001/api/generate-audio', {
//            method: 'POST',
//            headers: { 'Content-Type': 'application/json' },
//            body: JSON.stringify({ 
//              text: textData.sections[i],
//              speed: 0.9
//            })
//          });

//          if (!audioResponse.ok) {
//            throw new Error(`セクション${i + 1}の音声生成に失敗しました`);
//          }

//          const audioData = await audioResponse.json();
//          audioUrls.push(audioData.audioUrl);
//        }

//        setAudioUrls(audioUrls);
//        setIsGenerating(false);
//        setShowPlayer(true);
      
//      } catch (error) {
//        console.error('誘導瞑想処理エラー:', error);
//        setIsGenerating(false);
//        alert('誘導瞑想処理中にエラーが発生しました: ' + error.message);
//      }
//    };

//     リバーブ用インパルスレスポンス生成関数
//    function createReverbImpulse(audioContext: AudioContext, duration: number, decay: number, reverse: boolean) {
//      const sampleRate = audioContext.sampleRate;
//      const length = sampleRate * duration;
//      const impulse = audioContext.createBuffer(2, length, sampleRate);
    
//      for (let channel = 0; channel < 2; channel++) {
//        const channelData = impulse.getChannelData(channel);
//        for (let i = 0; i < length; i++) {
//          const n = reverse ? length - i : i;
//          channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
//        }
//      }
    
//      return impulse;
//    }

//    const playSection = async (sectionIndex: number) => {
//      if (!audioUrls[sectionIndex] || isPlaying) return;
    
//      try {
//         BGM開始（最初のセクションのみ - 重複チェック強化）
//        if (sectionIndex === 0 && bgmAudio && !isBgmPlaying) {
//          try {
//            bgmAudio.currentTime = 0;
//            bgmAudio.volume = 0.3;
//            const playPromise = bgmAudio.play();
//            if (playPromise !== undefined) {
//              await playPromise;
//              setIsBgmPlaying(true);
//              console.log('🎵 BGMセクション開始時に確実に再生');
//            }
//          } catch (error) {
//            console.log('BGM再生失敗（自動再生制限の可能性）:', error);
//          }
//        }

//        const audio = new Audio(audioUrls[sectionIndex]);
//        setCurrentAudio(audio);

//         リバーブ効果を追加
//        if (window.AudioContext || (window as any).webkitAudioContext) {
//          try {
//            const audioContext = new ((window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext)();
//            const source = audioContext.createMediaElementSource(audio);
//            const convolver = audioContext.createConvolver();
          
//             簡易リバーブ用インパルスレスポンス生成
//            const impulseResponse = createReverbImpulse(audioContext, 2, 2, false);
//            convolver.buffer = impulseResponse;
          
//            const dryGainNode = audioContext.createGain();
//            dryGainNode.gain.value = 0.5;  ドライ音声（リバーブ強化のため減少）
          
//            const wetGainNode = audioContext.createGain();
//            wetGainNode.gain.value = 0.5;  リバーブ音声（より効かせる）
          
//            source.connect(dryGainNode);
//            dryGainNode.connect(audioContext.destination);
          
//            source.connect(convolver);
//            convolver.connect(wetGainNode);
//            wetGainNode.connect(audioContext.destination);
          
//            console.log('🎧 リバーブ効果適用');
//          } catch (error) {
//            console.log('リバーブ適用失敗:', error);
//          }
//        }

//        audio.onended = () => {
//          console.log(`✅ セクション${sectionIndex + 1}再生終了`);
//          setIsPlaying(false);
        
//           次のセクションへ（1,3,5の後は2分間沈黙）
//          if (sectionIndex < audioUrls.length - 1) {
//             1,3,5（2分間指示）の後は2分間沈黙
//            if (sectionIndex === 1 || sectionIndex === 3 || sectionIndex === 5) {
//              console.log('🔇 2分間の沈黙時間開始...');
//              setTimeout(() => {
//                console.log('🔇 2分間の沈黙時間終了');
//                setCurrentSectionIndex(sectionIndex + 1);
//                playSection(sectionIndex + 1);
//              }, 120000);  2分間
//            } else {
//               0,2,4（セクション）の後はすぐ次へ
//              setCurrentSectionIndex(sectionIndex + 1);
//              playSection(sectionIndex + 1);
//            }
//          } else {
//             全セクション終了
//            setIsPaused(false);
//            setCurrentSectionIndex(0);
          
//             BGM停止
//            if (bgmAudio && isBgmPlaying) {
//              const fadeInterval = setInterval(() => {
//                if (bgmAudio.volume > 0.1) {
//                  bgmAudio.volume -= 0.05;
//                } else {
//                  bgmAudio.pause();
//                  bgmAudio.currentTime = 0;
//                  clearInterval(fadeInterval);
//                  setIsBgmPlaying(false);
//                }
//              }, 200);
//            }
          
//            console.log('🧘 瞑想セッション完了');
//          }
//        };

//        audio.onerror = (error) => {
//          console.error(`❌ セクション${sectionIndex + 1}audio.onerror:`, error);
//          alert('音声の再生中にエラーが発生しました');
//          setIsPlaying(false);
//          setIsPaused(false);
//        };

//        await audio.play();
//        setIsPlaying(true);
//        setIsPaused(false);
//        setCurrentSectionIndex(sectionIndex);
      
//      } catch (error) {
//        console.error(`❌ セクション${sectionIndex + 1}再生エラー:`, error);
//        alert(`音声の再生中にエラーが発生しました: ${error}`);
//        setIsPlaying(false);
//        setIsPaused(false);
//      }
//    };

//    const playAudio = async () => {
//      if (!audioUrls.length || isPlaying) return;
    
//       BGM開始（ユーザーインタラクション後に確実に再生）
//      if (bgmAudio && !isBgmPlaying) {
//        bgmAudio.currentTime = 0;
//        bgmAudio.volume = 0.3;
      
//        try {
//          const playPromise = bgmAudio.play();
//          if (playPromise !== undefined) {
//            await playPromise;
//            setIsBgmPlaying(true);
//            console.log('🎵 BGM再生開始確認');
//          }
//        } catch (error) {
//          console.error('BGM再生エラー:', error);
//           BGMエラーでも瞑想は続行
//        }
//      }
    
//      playSection(0);  最初のセクションから開始
//    };

//    const pauseAudio = () => {
//      if (currentAudio && isPlaying) {
//        currentAudio.pause();
//        setIsPlaying(false);
//        setIsPaused(true);
      
//         BGMも一時停止
//        if (bgmAudio && isBgmPlaying) {
//          bgmAudio.pause();
//        }
//      }
//    };

//    const resumeAudio = () => {
//      if (currentAudio && isPaused) {
//        currentAudio.play().then(() => {
//          setIsPlaying(true);
//          setIsPaused(false);
        
//           BGMも再開
//          if (bgmAudio && isBgmPlaying) {
//            bgmAudio.play();
//          }
//        }).catch(error => {
//          console.error('音声再開エラー:', error);
//          alert('音声の再開に失敗しました');
//        });
//      }
//    };

//    return (
//      <div>
//        {/* 入力フォーム画面 */}
//        {!showPlayer && !isGenerating && (
//          <div style={{
//            minHeight: '100vh',
//            backgroundColor: '#000099',
//            color: '#ffffdd',
//            fontFamily: "'Klee One', serif",
//            display: 'flex',
//            flexDirection: 'column' as const,
//            alignItems: 'center',
//            justifyContent: 'center',
//            padding: '7px 2.5px 60px 2.5px',
//            position: 'relative' as const
//          }}>
//            {/* 背景の光の効果 */}
//            <div style={{
//              position: 'absolute' as const,
//              top: '10%',
//              left: '20%',
//              width: '3px',
//              height: '3px',
//              backgroundColor: '#ffffdd',
//              borderRadius: '50%',
//              opacity: 0.6,
//              boxShadow: '0 0 20px #ffffdd, 0 0 40px #ffffdd'
//            }}></div>
//            <div style={{
//              position: 'absolute' as const,
//              top: '30%',
//              right: '15%',
//              width: '2px',
//              height: '2px',
//              backgroundColor: '#ffffdd',
//              borderRadius: '50%',
//              opacity: 0.4,
//              boxShadow: '0 0 15px #ffffdd'
//            }}></div>
//            <div style={{
//              position: 'absolute' as const,
//              bottom: '20%',
//              left: '10%',
//              width: '2px',
//              height: '2px',
//              backgroundColor: '#ffffdd',
//              borderRadius: '50%',
//              opacity: 0.5,
//              boxShadow: '0 0 18px #ffffdd'
//            }}></div>

//            <div style={{
//              maxWidth: '600px',
//              width: '100%',
//              textAlign: 'center' as const,
//              position: 'relative' as const,
//              zIndex: 10
//            }}>
            
//              {/* タイトル */}
//              <h1 style={{
//                fontSize: '32px',
//                fontWeight: 'normal' as const,
//                marginBottom: '20px',
//                letterSpacing: '2px',
//                lineHeight: '1.4',
//                textShadow: '0 0 20px rgba(255, 255, 221, 0.3)',
//                fontFamily: "'Klee One', serif"
//              }}>
//                <span style={{ color: '#ff6600' }}>連絡衝動</span><span style={{ width: '0.5ch', display: 'inline-block' }}></span>/<span style={{ width: '0.5ch', display: 'inline-block' }}></span><span style={{ color: '#ff6600' }}>絶縁衝動</span><br />駆け込み寺<br />「誘導瞑想ワーク」
//              </h1>

//              {/* サブタイトル */}
//              <h1 style={{
//                fontSize: '16px',
//                lineHeight: '1.8',
//                marginBottom: '35px',
//                opacity: 0.9,
//                letterSpacing: '1px',
//                fontFamily: "'Klee One', serif",
//                fontWeight: 'normal' as const,
//                textAlign: 'left' as const
//              }}>
//                サイレント期特有の辛い衝動をクールダウンする専用瞑想です。連絡したい気持ち、諦めたい気持ち、どんな感情も一旦立ち止まって心を整えましょう。あなたのための時間を作ります。
//              </h1>

//              {/* 説明 */}
//              <div style={{
//                fontSize: '12px',
//                marginBottom: '15px',
//                letterSpacing: '0.5px',
//                fontFamily: "'Klee One', serif",
//                opacity: 0.8,
//                textAlign: 'left' as const
//              }}>
//                今あなたが抱えている辛い気持ちや衝動について教えてください。
//              </div>

//              {/* フォーム */}
//              <div style={{
//                marginBottom: '40px',
//                position: 'relative' as const
//              }}>
//                <textarea
//                  value={impulse}
//                  onChange={(e) => setImpulse(e.target.value)}
//                  placeholder="例）彼に連絡したい衝動が止まりません..."
//                  style={{
//                    width: '100%',
//                    height: '120px',
//                    padding: '15px',
//                    border: 'none',
//                    backgroundColor: '#ffffff',
//                    color: '#000099',
//                    fontSize: '16px',
//                    lineHeight: '1.6',
//                    resize: 'none' as const,
//                    outline: 'none',
//                    fontFamily: "'Klee One', serif",
//                    letterSpacing: '0.5px',
//                    boxSizing: 'border-box' as const,
//                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 2px rgba(0, 0, 0, 0.05)'
//                  }}
//                  onFocus={(e) => {
//                    (e.target as HTMLTextAreaElement).style.backgroundColor = '#ffffff';
//                    (e.target as HTMLTextAreaElement).style.boxShadow = 'inset 0 3px 6px rgba(0, 0, 0, 0.15), inset 0 1px 3px rgba(0, 0, 0, 0.1)';
//                  }}
//                  onBlur={(e) => {
//                    (e.target as HTMLTextAreaElement).style.backgroundColor = '#ffffff';
//                    (e.target as HTMLTextAreaElement).style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 2px rgba(0, 0, 0, 0.05)';
//                  }}
//                  maxLength={200}
//                />

//                <button
//                  onClick={handleSubmit}
//                  disabled={!impulse.trim() || isGenerating}
//                  style={{
//                    width: '100%',
//                    padding: '18px 25px',
//                    border: 'none',
//                    backgroundColor: impulse.trim() && !isGenerating ? '#ffffdd' : 'rgba(255, 255, 221, 0.5)',
//                    color: impulse.trim() && !isGenerating ? '#000099' : 'rgba(0, 0, 153, 0.5)',
//                    fontSize: '16px',
//                    fontFamily: "'Klee One', serif",
//                    letterSpacing: '1px',
//                    cursor: impulse.trim() && !isGenerating ? 'pointer' : 'not-allowed',
//                    transition: 'all 0.3s ease',
//                    fontWeight: 'bold' as const,
//                    boxShadow: impulse.trim() && !isGenerating 
//                      ? '0 3px 6px rgba(0, 0, 0, 0.2), 0 1px 3px rgba(0, 0, 0, 0.3)' 
//                      : '0 1px 2px rgba(0, 0, 0, 0.1)',
//                    transform: 'translateY(0)'
//                  }}
//                  onMouseEnter={(e) => {
//                    if (impulse.trim() && !isGenerating) {
//                      (e.target as HTMLButtonElement).style.backgroundColor = '#ffffff';
//                      (e.target as HTMLButtonElement).style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 255, 255, 0.5), 0 0 40px rgba(255, 255, 255, 0.3)';
//                      (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)';
//                    }
//                  }}
//                  onMouseLeave={(e) => {
//                    if (impulse.trim() && !isGenerating) {
//                      (e.target as HTMLButtonElement).style.backgroundColor = '#ffffdd';
//                      (e.target as HTMLButtonElement).style.boxShadow = '0 3px 6px rgba(0, 0, 0, 0.2), 0 1px 3px rgba(0, 0, 0, 0.3)';
//                      (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
//                    }
//                  }}
//                >
//                  {isGenerating ? (
//                    <div style={{
//                      display: 'flex',
//                      alignItems: 'center',
//                      justifyContent: 'center',
//                      gap: '10px'
//                    }}>
//                      <div style={{
//                        width: '16px',
//                        height: '16px',
//                        border: '2px solid rgba(0, 0, 153, 0.3)',
//                        borderTop: '2px solid #000099',
//                        borderRadius: '50%',
//                        animation: 'spin 1s linear infinite'
//                      }}></div>
//                      <span>瞑想作成中...</span>
//                    </div>
//                  ) : (
//                    'クールダウン瞑想を開始'
//                  )}
//                </button>
//              </div>
            
//            </div>
//          </div>
//        )}

//        {/* 生成中画面 */}
//        {isGenerating && (
//          <div style={{
//            position: 'fixed' as const,
//            top: 0,
//            left: 0,
//            width: '100%',
//            height: '100%',
//            backgroundColor: 'rgba(0, 0, 153, 0.95)',
//            display: 'flex',
//            alignItems: 'center',
//            justifyContent: 'center',
//            zIndex: 9999,
//            fontFamily: "'Klee One', serif",
//            color: '#ffffdd'
//          }}>
//            <p style={{
//              fontSize: '18px',
//              textAlign: 'center' as const
//            }}>
//              あなたの心をケアする瞑想を作成しています...
//            </p>
//          </div>
//        )}

//        {/* 音声プレーヤー画面 */}
//        {showPlayer && (
//          <div style={{
//            minHeight: '100vh',
//            backgroundColor: '#000099',
//            color: '#ffffdd',
//            fontFamily: "'Klee One', serif",
//            display: 'flex',
//            alignItems: 'center',
//            justifyContent: 'center',
//            padding: '20px'
//          }}>
//            <div style={{
//              maxWidth: '500px',
//              width: '100%',
//              textAlign: 'center' as const
//            }}>
//              <p style={{
//                fontSize: '18px',
//                lineHeight: '1.8',
//                marginBottom: '40px'
//              }}>
//                あなたのための心のケア瞑想が<br />完成しました。<br />
//                ゆっくりと音声に身を委ねてください。
//              </p>

//              <div style={{
//                background: 'rgba(255, 255, 221, 0.1)',
//                border: '1px solid rgba(255, 255, 221, 0.3)',
//                borderRadius: '8px',
//                padding: '40px 30px'
//              }}>
//                <button 
//                  onClick={() => {
//                    if (!isPlaying && !isPaused) {
//                      playAudio();
//                    } else if (isPlaying) {
//                      pauseAudio();
//                    } else if (isPaused) {
//                      resumeAudio();
//                    }
//                  }}
//                  style={{
//                    width: '60px',
//                    height: '60px',
//                    borderRadius: '50%',
//                    border: '2px solid #ffffdd',
//                    backgroundColor: 'rgba(255, 255, 221, 0.1)',
//                    color: '#ffffdd',
//                    cursor: 'pointer',
//                    display: 'flex',
//                    alignItems: 'center',
//                    justifyContent: 'center',
//                    fontSize: '20px',
//                    margin: '0 auto 20px'
//                  }}
//                >
//                  {isPlaying ? '⏸' : '▶'}
//                </button>

//                <div style={{
//                  fontSize: '14px',
//                  opacity: 0.7,
//                  marginBottom: '15px'
//                }}>
//                  {isPlaying ? 
//                    `セクション${currentSectionIndex + 1}/6 再生中...` : 
//                    isPaused ? '一時停止中' : 'あなたのためのケア瞑想準備完了'
//                  }
//                </div>

//                <div style={{
//                  fontSize: '12px',
//                  opacity: 0.6,
//                  marginBottom: '10px'
//                }}>
//                  {['理解と受容', '実践指示1', 'クールダウン', '実践指示2', '前向きな転換', '実践指示3'][currentSectionIndex] || '準備中'}
//                </div>
//              </div>

//              {/* メニューへ戻るリンク */}
//              <div style={{ textAlign: "center", marginTop: "30px" }}>
//                <a
//                  href="/home"
//                  style={{
//                    fontSize: "16px",
//                    color: "rgba(255, 255, 221, 0.7)",
//                    textDecoration: "underline",
//                    fontFamily: "'Klee One', serif",
//                    transition: "all 0.3s ease",
//                    display: "inline-block",
//                    padding: "8px 0"
//                  }}
//                  onMouseEnter={(e) => {
//                    (e.target as HTMLAnchorElement).style.color = "#ffffdd";
//                    (e.target as HTMLAnchorElement).style.textShadow = "0 0 8px rgba(255, 255, 221, 0.5)";
//                  }}
//                  onMouseLeave={(e) => {
//                    (e.target as HTMLAnchorElement).style.color = "rgba(255, 255, 221, 0.7)";
//                    (e.target as HTMLAnchorElement).style.textShadow = "none";
//                  }}
//                >
//                  メニューへ戻る
//                </a>
//              </div>
//            </div>
//          </div>
//        )}

//        <style jsx>{`
//          @keyframes spin {
//            0% { transform: rotate(0deg); }
//            100% { transform: rotate(360deg); }
//          }
//        `}</style>
//      </div>
//    );
//  }
//  import { useState, useEffect } from 'react';

//  export default function MeditationPage() {
//    const [impulse, setImpulse] = useState('');
//    const [isGenerating, setIsGenerating] = useState(false);
//    const [showPlayer, setShowPlayer] = useState(false);
//    const [generatedSections, setGeneratedSections] = useState<string[]>([]);
//    const [audioUrls, setAudioUrls] = useState<string[]>([]);
//    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
//    const [isPlaying, setIsPlaying] = useState(false);
//    const [isPaused, setIsPaused] = useState(false);
//    const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  
//     BGM関連のstate追加
//    const [bgmAudio, setBgmAudio] = useState<HTMLAudioElement | null>(null);
//    const [isBgmPlaying, setIsBgmPlaying] = useState(false);

//    useEffect(() => {
//      document.title = '連絡衝動/絶縁衝動駆け込み寺「誘導瞑想ワーク」';
    
//       BGM音声ファイルを事前読み込み
//      const bgm = new Audio('/meditation.mp3');
//      bgm.loop = true;   ループ再生
//      bgm.volume = 0.3;  音量30%
//      setBgmAudio(bgm);
    
//      return () => {
//        if (bgm) {
//          bgm.pause();
//          bgm.src = '';
//        }
//      };
//    }, []);

//    const handleSubmit = async () => {
//      if (!impulse.trim()) return;
    
//      setIsGenerating(true);
    
//      try {
//         1. 誘導瞑想セクションを3つ生成
//        const textResponse = await fetch('http:localhost:3001/api/generate-meditation', {
//          method: 'POST',
//          headers: { 'Content-Type': 'application/json' },
//          body: JSON.stringify({ impulse })
//        });

//        if (!textResponse.ok) {
//          throw new Error('誘導瞑想テキストの生成に失敗しました');
//        }

//        const textData = await textResponse.json();
//        setGeneratedSections(textData.sections);

//         2. 各セクションの音声を個別生成
//        const audioUrls = [];
      
//        for (let i = 0; i < textData.sections.length; i++) {
//          console.log(`🎵 セクション${i + 1}音声生成中...`);
        
//          const audioResponse = await fetch('http:localhost:3001/api/generate-audio', {
//            method: 'POST',
//            headers: { 'Content-Type': 'application/json' },
//            body: JSON.stringify({ 
//              text: textData.sections[i],
//              speed: 1.2
//            })
//          });

//          if (!audioResponse.ok) {
//            throw new Error(`セクション${i + 1}の音声生成に失敗しました`);
//          }

//          const audioData = await audioResponse.json();
//          audioUrls.push(audioData.audioUrl);
//        }

//        setAudioUrls(audioUrls);
//        setIsGenerating(false);
//        setShowPlayer(true);
      
//      } catch (error) {
//        console.error('誘導瞑想処理エラー:', error);
//        setIsGenerating(false);
//        alert('誘導瞑想処理中にエラーが発生しました: ' + error.message);
//      }
//    };

//     30秒実践時間の指示音声生成
//    const playPracticeInstruction = async (nextSectionIndex: number) => {
//      const instructions = [
//        "今から30秒間、深い呼吸を続けながら、心の静寂を感じてください。",
//        "30秒間、今感じている平安な気持ちを大切に保ってください。",
//        "最後の30秒です。ツインレイとの絆を心で感じながら、静かに呼吸してください。"
//      ];
    
//      const instructionText = instructions[nextSectionIndex - 1] || instructions[0];
    
//      try {
//        console.log('🔔 30秒実践指示音声生成中...');
      
//        const audioResponse = await fetch('http:localhost:3001/api/generate-audio', {
//          method: 'POST',
//          headers: { 'Content-Type': 'application/json' },
//          body: JSON.stringify({ 
//            text: instructionText,
//            speed: 0.8   少しゆっくり
//          })
//        });

//        if (!audioResponse.ok) {
//          throw new Error('実践指示音声生成に失敗しました');
//        }

//        const audioData = await audioResponse.json();
//        const instructionAudio = new Audio(audioData.audioUrl);
      
//        return new Promise<void>((resolve) => {
//          instructionAudio.onended = () => {
//            console.log('🔔 30秒実践指示完了');
//            resolve();
//          };
//          instructionAudio.play();
//        });
      
//      } catch (error) {
//        console.error('実践指示音声エラー:', error);
//         エラーの場合は指示なしで進行
//        return Promise.resolve();
//      }
//    };

//     リバーブ用インパルスレスポンス生成関数
//    function createReverbImpulse(audioContext: AudioContext, duration: number, decay: number, reverse: boolean) {
//      const sampleRate = audioContext.sampleRate;
//      const length = sampleRate * duration;
//      const impulse = audioContext.createBuffer(2, length, sampleRate);
    
//      for (let channel = 0; channel < 2; channel++) {
//        const channelData = impulse.getChannelData(channel);
//        for (let i = 0; i < length; i++) {
//          const n = reverse ? length - i : i;
//          channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
//        }
//      }
    
//      return impulse;
//    }

//    const playSection = async (sectionIndex: number) => {
//      if (!audioUrls[sectionIndex] || isPlaying) return;
    
//      try {
//         BGM開始（最初のセクションのみ - 重複チェック強化）
//        if (sectionIndex === 0 && bgmAudio && !isBgmPlaying) {
//          try {
//            bgmAudio.currentTime = 0;
//            bgmAudio.volume = 0.3;
//            const playPromise = bgmAudio.play();
//            if (playPromise !== undefined) {
//              await playPromise;
//              setIsBgmPlaying(true);
//              console.log('🎵 BGMセクション開始時に確実に再生');
//            }
//          } catch (error) {
//            console.log('BGM再生失敗（自動再生制限の可能性）:', error);
//          }
//        }

//        const audio = new Audio(audioUrls[sectionIndex]);
//        setCurrentAudio(audio);

//         リバーブ効果を追加
//        if (window.AudioContext || (window as any).webkitAudioContext) {
//          try {
//            const audioContext = new ((window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext)();
//            const source = audioContext.createMediaElementSource(audio);
//            const convolver = audioContext.createConvolver();
          
//             簡易リバーブ用インパルスレスポンス生成
//            const impulseResponse = createReverbImpulse(audioContext, 2, 2, false);
//            convolver.buffer = impulseResponse;
          
//            const gainNode = audioContext.createGain();
//            gainNode.gain.value = 0.85;  音量調整（リバーブ軽減）
          
//            const dryGainNode = audioContext.createGain();
//            dryGainNode.gain.value = 0.7;  ドライ音声
          
//            const wetGainNode = audioContext.createGain();
//            wetGainNode.gain.value = 0.3;  リバーブ音声（半分に）
          
//            source.connect(dryGainNode);
//            dryGainNode.connect(audioContext.destination);
          
//            source.connect(convolver);
//            convolver.connect(wetGainNode);
//            wetGainNode.connect(audioContext.destination);
          
//            console.log('🎧 リバーブ効果適用');
//          } catch (error) {
//            console.log('リバーブ適用失敗:', error);
//          }
//        }

//        audio.onended = () => {
//          console.log(`✅ セクション${sectionIndex + 1}再生終了`);
//          setIsPlaying(false);
        
//           次の処理（必ず指示→30秒沈黙のセット）
//          if (sectionIndex < audioUrls.length - 1) {
//            console.log('🔔 30秒実践指示を開始...');
          
//             必ず指示音声を先に再生
//            playPracticeInstruction(sectionIndex + 1).then(() => {
//              console.log('🔇 30秒の沈黙時間開始...');
            
//               指示完了後に30秒の沈黙
//              setTimeout(() => {
//                console.log('🔇 30秒の沈黙時間終了');
//                setCurrentSectionIndex(sectionIndex + 1);
//                playSection(sectionIndex + 1);
//              }, 30000);  30秒
//            }).catch((error) => {
//              console.error('指示音声エラー:', error);
//               エラーでも30秒後に次へ進む
//              setTimeout(() => {
//                setCurrentSectionIndex(sectionIndex + 1);
//                playSection(sectionIndex + 1);
//              }, 30000);
//            });
//          } else {
//             全セクション終了
//            setIsPaused(false);
//            setCurrentSectionIndex(0);
          
//             BGM停止
//            if (bgmAudio && isBgmPlaying) {
//              const fadeInterval = setInterval(() => {
//                if (bgmAudio.volume > 0.1) {
//                  bgmAudio.volume -= 0.05;
//                } else {
//                  bgmAudio.pause();
//                  bgmAudio.currentTime = 0;
//                  clearInterval(fadeInterval);
//                  setIsBgmPlaying(false);
//                }
//              }, 200);
//            }
          
//            console.log('🧘 瞑想セッション完了');
//          }
//        };

//        audio.onerror = (error) => {
//          console.error(`❌ セクション${sectionIndex + 1}audio.onerror:`, error);
//          alert('音声の再生中にエラーが発生しました');
//          setIsPlaying(false);
//          setIsPaused(false);
//        };

//        await audio.play();
//        setIsPlaying(true);
//        setIsPaused(false);
//        setCurrentSectionIndex(sectionIndex);
      
//      } catch (error) {
//        console.error(`❌ セクション${sectionIndex + 1}再生エラー:`, error);
//        alert(`音声の再生中にエラーが発生しました: ${error}`);
//        setIsPlaying(false);
//        setIsPaused(false);
//      }
//    };

//    const playAudio = async () => {
//      if (!audioUrls.length || isPlaying) return;
    
//       BGM開始（ユーザーインタラクション後に確実に再生）
//      if (bgmAudio && !isBgmPlaying) {
//        bgmAudio.currentTime = 0;
//        bgmAudio.volume = 0.3;
      
//        try {
//          const playPromise = bgmAudio.play();
//          if (playPromise !== undefined) {
//            await playPromise;
//            setIsBgmPlaying(true);
//            console.log('🎵 BGM再生開始確認');
//          }
//        } catch (error) {
//          console.error('BGM再生エラー:', error);
//           BGMエラーでも瞑想は続行
//        }
//      }
    
//      playSection(0);  最初のセクションから開始
//    };

//    const pauseAudio = () => {
//      if (currentAudio && isPlaying) {
//        currentAudio.pause();
//        setIsPlaying(false);
//        setIsPaused(true);
      
//         BGMも一時停止
//        if (bgmAudio && isBgmPlaying) {
//          bgmAudio.pause();
//        }
//      }
//    };

//    const resumeAudio = () => {
//      if (currentAudio && isPaused) {
//        currentAudio.play().then(() => {
//          setIsPlaying(true);
//          setIsPaused(false);
        
//           BGMも再開
//          if (bgmAudio && isBgmPlaying) {
//            bgmAudio.play();
//          }
//        }).catch(error => {
//          console.error('音声再開エラー:', error);
//          alert('音声の再開に失敗しました');
//        });
//      }
//    };

//    return (
//      <div>
//        {/* 入力フォーム画面 */}
//        {!showPlayer && !isGenerating && (
//          <div style={{
//            minHeight: '100vh',
//            backgroundColor: '#000099',
//            color: '#ffffdd',
//            fontFamily: "'Klee One', serif",
//            display: 'flex',
//            flexDirection: 'column' as const,
//            alignItems: 'center',
//            justifyContent: 'center',
//            padding: '7px 2.5px 60px 2.5px',
//            position: 'relative' as const
//          }}>
//            {/* 背景の光の効果 */}
//            <div style={{
//              position: 'absolute' as const,
//              top: '10%',
//              left: '20%',
//              width: '3px',
//              height: '3px',
//              backgroundColor: '#ffffdd',
//              borderRadius: '50%',
//              opacity: 0.6,
//              boxShadow: '0 0 20px #ffffdd, 0 0 40px #ffffdd'
//            }}></div>
//            <div style={{
//              position: 'absolute' as const,
//              top: '30%',
//              right: '15%',
//              width: '2px',
//              height: '2px',
//              backgroundColor: '#ffffdd',
//              borderRadius: '50%',
//              opacity: 0.4,
//              boxShadow: '0 0 15px #ffffdd'
//            }}></div>
//            <div style={{
//              position: 'absolute' as const,
//              bottom: '20%',
//              left: '10%',
//              width: '2px',
//              height: '2px',
//              backgroundColor: '#ffffdd',
//              borderRadius: '50%',
//              opacity: 0.5,
//              boxShadow: '0 0 18px #ffffdd'
//            }}></div>

//            <div style={{
//              maxWidth: '600px',
//              width: '100%',
//              textAlign: 'center' as const,
//              position: 'relative' as const,
//              zIndex: 10
//            }}>
            
//              {/* タイトル */}
//              <h1 style={{
//                fontSize: '32px',
//                fontWeight: 'normal' as const,
//                marginBottom: '20px',
//                letterSpacing: '2px',
//                lineHeight: '1.4',
//                textShadow: '0 0 20px rgba(255, 255, 221, 0.3)',
//                fontFamily: "'Klee One', serif"
//              }}>
//                <span style={{ color: '#ff6600' }}>連絡衝動</span><span style={{ width: '0.5ch', display: 'inline-block' }}></span>/<span style={{ width: '0.5ch', display: 'inline-block' }}></span><span style={{ color: '#ff6600' }}>絶縁衝動</span><br />駆け込み寺<br />「誘導瞑想ワーク」
//              </h1>

//              {/* サブタイトル */}
//              <h1 style={{
//                fontSize: '16px',
//                lineHeight: '1.8',
//                marginBottom: '35px',
//                opacity: 0.9,
//                letterSpacing: '1px',
//                fontFamily: "'Klee One', serif",
//                fontWeight: 'normal' as const,
//                textAlign: 'left' as const
//              }}>
//                サイレント期特有の辛い衝動をクールダウンする専用瞑想です。連絡したい気持ち、諦めたい気持ち、どんな感情も一旦立ち止まって心を整えましょう。あなたのための時間を作ります。
//              </h1>

//              {/* 説明 */}
//              <div style={{
//                fontSize: '12px',
//                marginBottom: '15px',
//                letterSpacing: '0.5px',
//                fontFamily: "'Klee One', serif",
//                opacity: 0.8,
//                textAlign: 'left' as const
//              }}>
//                今あなたが抱えている辛い気持ちや衝動について教えてください。
//              </div>

//              {/* フォーム */}
//              <div style={{
//                marginBottom: '40px',
//                position: 'relative' as const
//              }}>
//                <textarea
//                  value={impulse}
//                  onChange={(e) => setImpulse(e.target.value)}
//                  placeholder="例）彼に連絡したい衝動が止まりません..."
//                  style={{
//                    width: '100%',
//                    height: '120px',
//                    padding: '15px',
//                    border: 'none',
//                    backgroundColor: '#ffffff',
//                    color: '#000099',
//                    fontSize: '16px',
//                    lineHeight: '1.6',
//                    resize: 'none' as const,
//                    outline: 'none',
//                    fontFamily: "'Klee One', serif",
//                    letterSpacing: '0.5px',
//                    boxSizing: 'border-box' as const,
//                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 2px rgba(0, 0, 0, 0.05)'
//                  }}
//                  onFocus={(e) => {
//                    (e.target as HTMLTextAreaElement).style.backgroundColor = '#ffffff';
//                    (e.target as HTMLTextAreaElement).style.boxShadow = 'inset 0 3px 6px rgba(0, 0, 0, 0.15), inset 0 1px 3px rgba(0, 0, 0, 0.1)';
//                  }}
//                  onBlur={(e) => {
//                    (e.target as HTMLTextAreaElement).style.backgroundColor = '#ffffff';
//                    (e.target as HTMLTextAreaElement).style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 2px rgba(0, 0, 0, 0.05)';
//                  }}
//                  maxLength={200}
//                />

//                <button
//                  onClick={handleSubmit}
//                  disabled={!impulse.trim() || isGenerating}
//                  style={{
//                    width: '100%',
//                    padding: '18px 25px',
//                    border: 'none',
//                    backgroundColor: impulse.trim() && !isGenerating ? '#ffffdd' : 'rgba(255, 255, 221, 0.5)',
//                    color: impulse.trim() && !isGenerating ? '#000099' : 'rgba(0, 0, 153, 0.5)',
//                    fontSize: '16px',
//                    fontFamily: "'Klee One', serif",
//                    letterSpacing: '1px',
//                    cursor: impulse.trim() && !isGenerating ? 'pointer' : 'not-allowed',
//                    transition: 'all 0.3s ease',
//                    fontWeight: 'bold' as const,
//                    boxShadow: impulse.trim() && !isGenerating 
//                      ? '0 3px 6px rgba(0, 0, 0, 0.2), 0 1px 3px rgba(0, 0, 0, 0.3)' 
//                      : '0 1px 2px rgba(0, 0, 0, 0.1)',
//                    transform: 'translateY(0)'
//                  }}
//                  onMouseEnter={(e) => {
//                    if (impulse.trim() && !isGenerating) {
//                      (e.target as HTMLButtonElement).style.backgroundColor = '#ffffff';
//                      (e.target as HTMLButtonElement).style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 255, 255, 0.5), 0 0 40px rgba(255, 255, 255, 0.3)';
//                      (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)';
//                    }
//                  }}
//                  onMouseLeave={(e) => {
//                    if (impulse.trim() && !isGenerating) {
//                      (e.target as HTMLButtonElement).style.backgroundColor = '#ffffdd';
//                      (e.target as HTMLButtonElement).style.boxShadow = '0 3px 6px rgba(0, 0, 0, 0.2), 0 1px 3px rgba(0, 0, 0, 0.3)';
//                      (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
//                    }
//                  }}
//                >
//                  {isGenerating ? (
//                    <div style={{
//                      display: 'flex',
//                      alignItems: 'center',
//                      justifyContent: 'center',
//                      gap: '10px'
//                    }}>
//                      <div style={{
//                        width: '16px',
//                        height: '16px',
//                        border: '2px solid rgba(0, 0, 153, 0.3)',
//                        borderTop: '2px solid #000099',
//                        borderRadius: '50%',
//                        animation: 'spin 1s linear infinite'
//                      }}></div>
//                      <span>瞑想作成中...</span>
//                    </div>
//                  ) : (
//                    'クールダウン瞑想を開始'
//                  )}
//                </button>
//              </div>
            
//            </div>
//          </div>
//        )}

//        {/* 生成中画面 */}
//        {isGenerating && (
//          <div style={{
//            position: 'fixed' as const,
//            top: 0,
//            left: 0,
//            width: '100%',
//            height: '100%',
//            backgroundColor: 'rgba(0, 0, 153, 0.95)',
//            display: 'flex',
//            alignItems: 'center',
//            justifyContent: 'center',
//            zIndex: 9999,
//            fontFamily: "'Klee One', serif",
//            color: '#ffffdd'
//          }}>
//            <p style={{
//              fontSize: '18px',
//              textAlign: 'center' as const
//            }}>
//              あなたの心をケアする瞑想を作成しています...
//            </p>
//          </div>
//        )}

//        {/* 音声プレーヤー画面 */}
//        {showPlayer && (
//          <div style={{
//            minHeight: '100vh',
//            backgroundColor: '#000099',
//            color: '#ffffdd',
//            fontFamily: "'Klee One', serif",
//            display: 'flex',
//            alignItems: 'center',
//            justifyContent: 'center',
//            padding: '20px'
//          }}>
//            <div style={{
//              maxWidth: '500px',
//              width: '100%',
//              textAlign: 'center' as const
//            }}>
//              <p style={{
//                fontSize: '18px',
//                lineHeight: '1.8',
//                marginBottom: '40px'
//              }}>
//                あなたのための心のケア瞑想が<br />完成しました。<br />
//                ゆっくりと音声に身を委ねてください。
//              </p>

//              <div style={{
//                background: 'rgba(255, 255, 221, 0.1)',
//                border: '1px solid rgba(255, 255, 221, 0.3)',
//                borderRadius: '8px',
//                padding: '40px 30px'
//              }}>
//                <button 
//                  onClick={() => {
//                    if (!isPlaying && !isPaused) {
//                      playAudio();
//                    } else if (isPlaying) {
//                      pauseAudio();
//                    } else if (isPaused) {
//                      resumeAudio();
//                    }
//                  }}
//                  style={{
//                    width: '60px',
//                    height: '60px',
//                    borderRadius: '50%',
//                    border: '2px solid #ffffdd',
//                    backgroundColor: 'rgba(255, 255, 221, 0.1)',
//                    color: '#ffffdd',
//                    cursor: 'pointer',
//                    display: 'flex',
//                    alignItems: 'center',
//                    justifyContent: 'center',
//                    fontSize: '20px',
//                    margin: '0 auto 20px'
//                  }}
//                >
//                  {isPlaying ? '⏸' : '▶'}
//                </button>

//                <div style={{
//                  fontSize: '14px',
//                  opacity: 0.7,
//                  marginBottom: '15px'
//                }}>
//                  {isPlaying ? 
//                    `セクション${currentSectionIndex + 1}/3 再生中...` : 
//                    isPaused ? '一時停止中' : 'あなたのためのケア瞑想準備完了'
//                  }
//                </div>

//                <div style={{
//                  fontSize: '12px',
//                  opacity: 0.6,
//                  marginBottom: '10px'
//                }}>
//                  {['理解と受容', 'クールダウン', '前向きな転換'][currentSectionIndex] || '準備中'}
//                </div>
//              </div>

//              {/* メニューへ戻るリンク */}
//              <div style={{ textAlign: "center", marginTop: "30px" }}>
//                <a
//                  href="/home"
//                  style={{
//                    fontSize: "16px",
//                    color: "rgba(255, 255, 221, 0.7)",
//                    textDecoration: "underline",
//                    fontFamily: "'Klee One', serif",
//                    transition: "all 0.3s ease",
//                    display: "inline-block",
//                    padding: "8px 0"
//                  }}
//                  onMouseEnter={(e) => {
//                    (e.target as HTMLAnchorElement).style.color = "#ffffdd";
//                    (e.target as HTMLAnchorElement).style.textShadow = "0 0 8px rgba(255, 255, 221, 0.5)";
//                  }}
//                  onMouseLeave={(e) => {
//                    (e.target as HTMLAnchorElement).style.color = "rgba(255, 255, 221, 0.7)";
//                    (e.target as HTMLAnchorElement).style.textShadow = "none";
//                  }}
//                >
//                  メニューへ戻る
//                </a>
//              </div>
//            </div>
//          </div>
//        )}

//        <style jsx>{`
//          @keyframes spin {
//            0% { transform: rotate(0deg); }
//            100% { transform: rotate(360deg); }
//          }
//        `}</style>
//      </div>
//    );
//  }




//   src/pages/meditation.tsx
//  import { useState, useEffect } from 'react';
//  import { Link } from 'react-router-dom';

//  export default function MeditationPage() {
//    const [impulse, setImpulse] = useState('');
//    const [isGenerating, setIsGenerating] = useState(false);
//    const [showPlayer, setShowPlayer] = useState(false);
//    const [generatedSections, setGeneratedSections] = useState<string[]>([]);
//    const [audioUrls, setAudioUrls] = useState<string[]>([]);
//    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
//    const [isPlaying, setIsPlaying] = useState(false);
//    const [isPaused, setIsPaused] = useState(false);
//    const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  
//     タイマー状態管理
//    const [isInPracticeMode, setIsInPracticeMode] = useState(false);
//    const [practiceTimeLeft, setPracticeTimeLeft] = useState(120);
  
//     BGM関連のstate
//    const [bgmAudio, setBgmAudio] = useState<HTMLAudioElement | null>(null);
//    const [isBgmPlaying, setIsBgmPlaying] = useState(false);

//    useEffect(() => {
//      document.title = '連絡衝動/絶縁衝動駆け込み寺「誘導瞑想ワーク」';
    
//       BGM音声ファイルを事前読み込み
//      const bgm = new Audio('/meditation.mp3');
//      bgm.loop = true;
//      bgm.volume = 0.3;
//      setBgmAudio(bgm);
    
//      return () => {
//        if (bgm) {
//          bgm.pause();
//          bgm.src = '';
//        }
//      };
//    }, []);

//     2分タイマーのカウントダウン
//    useEffect(() => {
//      let interval: NodeJS.Timeout;
    
//      if (isInPracticeMode && practiceTimeLeft > 0) {
//        interval = setInterval(() => {
//          setPracticeTimeLeft(prev => {
//            if (prev <= 1) {
//              setIsInPracticeMode(false);
//              setPracticeTimeLeft(120);
            
//              const nextIndex = currentSectionIndex + 1;
//              if (nextIndex < audioUrls.length) {
//                console.log('🔇 2分間完了 - 次のセクションへ');
//                setCurrentSectionIndex(nextIndex);
//                playSection(nextIndex);
//              } else {
//                handleSessionComplete();
//              }
//              return 120;
//            }
//            return prev - 1;
//          });
//        }, 1000);
//      }
    
//      return () => {
//        if (interval) clearInterval(interval);
//      };
//    }, [isInPracticeMode, practiceTimeLeft, currentSectionIndex, audioUrls.length]);

//    const handleSubmit = async () => {
//      if (!impulse.trim()) return;
    
//      setIsGenerating(true);
    
//      try {
//         1. 誘導瞑想セクションを6つ生成
//        const textResponse = await fetch('http:localhost:3001/api/generate-meditation', {
//          method: 'POST',
//          headers: { 'Content-Type': 'application/json' },
//          body: JSON.stringify({ impulse })
//        });

//        if (!textResponse.ok) {
//          throw new Error('誘導瞑想テキストの生成に失敗しました');
//        }

//        const textData = await textResponse.json();
//        console.log('📝 生成されたセクション数:', textData.sections.length);
//        setGeneratedSections(textData.sections);

//         2. 各セクションの音声を個別生成
//        const audioUrls = [];
      
//        for (let i = 0; i < textData.sections.length; i++) {
//          console.log(`🎵 セクション${i + 1}音声生成中...`);
        
//          const audioResponse = await fetch('http:localhost:3001/api/generate-audio', {
//            method: 'POST',
//            headers: { 'Content-Type': 'application/json' },
//            body: JSON.stringify({ 
//              text: textData.sections[i],
//              speed: 0.9
//            })
//          });

//          if (!audioResponse.ok) {
//            throw new Error(`セクション${i + 1}の音声生成に失敗しました`);
//          }

//          const audioData = await audioResponse.json();
//          audioUrls.push(audioData.audioUrl);
//        }

//        setAudioUrls(audioUrls);
//        setIsGenerating(false);
//        setShowPlayer(true);
      
//      } catch (error) {
//        console.error('誘導瞑想処理エラー:', error);
//        setIsGenerating(false);
//        alert('誘導瞑想処理中にエラーが発生しました: ' + error.message);
//      }
//    };

//     セクションタイプを判定
//    const getSectionInfo = (sectionIndex: number) => {
//      const isInstructionSection = (sectionIndex + 1) % 2 === 0;
    
//      if (isInstructionSection) {
//        const stageNumber = Math.floor(sectionIndex / 2) + 1;
//        return {
//          type: 'instruction',
//          label: `Stage${stageNumber} - 2分指示`,
//          description: '2分間の実践指示'
//        };
//      } else {
//        const stageNumber = Math.floor(sectionIndex / 2) + 1;
//        const stageNames = ['理解と受容', 'クールダウン', '前向きな転換'];
//        return {
//          type: 'content',
//          label: `Stage${stageNumber} - ${stageNames[stageNumber - 1]}`,
//          description: stageNames[stageNumber - 1]
//        };
//      }
//    };

//     リバーブ用インパルスレスポンス生成関数
//    function createReverbImpulse(audioContext: AudioContext, duration: number, decay: number, reverse: boolean) {
//      const sampleRate = audioContext.sampleRate;
//      const length = sampleRate * duration;
//      const impulse = audioContext.createBuffer(2, length, sampleRate);
    
//      for (let channel = 0; channel < 2; channel++) {
//        const channelData = impulse.getChannelData(channel);
//        for (let i = 0; i < length; i++) {
//          const n = reverse ? length - i : i;
//          channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
//        }
//      }
    
//      return impulse;
//    }

//    const playSection = async (sectionIndex: number) => {
//      if (!audioUrls[sectionIndex] || isPlaying || isInPracticeMode) return;
    
//      try {
//         BGM開始（最初のセクションのみ）
//        if (sectionIndex === 0 && bgmAudio && !isBgmPlaying) {
//          try {
//            bgmAudio.currentTime = 0;
//            bgmAudio.volume = 0.3;
//            const playPromise = bgmAudio.play();
//            if (playPromise !== undefined) {
//              await playPromise;
//              setIsBgmPlaying(true);
//              console.log('🎵 BGM開始');
//            }
//          } catch (error) {
//            console.log('BGM再生失敗:', error);
//          }
//        }

//        const audio = new Audio(audioUrls[sectionIndex]);
//        setCurrentAudio(audio);

//         リバーブ効果を追加
//        if (window.AudioContext || (window as any).webkitAudioContext) {
//          try {
//            const audioContext = new ((window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext)();
//            const source = audioContext.createMediaElementSource(audio);
//            const convolver = audioContext.createConvolver();
          
//            const impulseResponse = createReverbImpulse(audioContext, 2, 2, false);
//            convolver.buffer = impulseResponse;
          
//            const dryGainNode = audioContext.createGain();
//            dryGainNode.gain.value = 0.5;
          
//            const wetGainNode = audioContext.createGain();
//            wetGainNode.gain.value = 0.5;
          
//            source.connect(dryGainNode);
//            dryGainNode.connect(audioContext.destination);
          
//            source.connect(convolver);
//            convolver.connect(wetGainNode);
//            wetGainNode.connect(audioContext.destination);
          
//            console.log('🎧 リバーブ効果適用');
//          } catch (error) {
//            console.log('リバーブ適用失敗:', error);
//          }
//        }

//        const sectionInfo = getSectionInfo(sectionIndex);
//        console.log(`▶️ ${sectionInfo.label} 再生開始`);

//        audio.onended = () => {
//          console.log(`✅ ${sectionInfo.label} 再生終了`);
//          setIsPlaying(false);
        
//           指示セクション（偶数番目）の後は2分タイマー開始
//          if (sectionInfo.type === 'instruction') {
//            console.log('🔇 2分間実践タイマー開始...');
//            setIsInPracticeMode(true);
//            setPracticeTimeLeft(120);
//          } else {
//             文章セクション（奇数番目）の後はすぐ次のセクション（指示）へ
//            const nextIndex = sectionIndex + 1;
//            if (nextIndex < audioUrls.length) {
//              console.log('📝 次の指示セクションへ');
//              setCurrentSectionIndex(nextIndex);
//              playSection(nextIndex);
//            } else {
//              handleSessionComplete();
//            }
//          }
//        };

//        audio.onerror = (error) => {
//          console.error(`❌ セクション${sectionIndex + 1}audio.onerror:`, error);
//          alert('音声の再生中にエラーが発生しました');
//          setIsPlaying(false);
//          setIsPaused(false);
//        };

//        await audio.play();
//        setIsPlaying(true);
//        setIsPaused(false);
//        setCurrentSectionIndex(sectionIndex);
      
//      } catch (error) {
//        console.error(`❌ セクション${sectionIndex + 1}再生エラー:`, error);
//        alert(`音声の再生中にエラーが発生しました: ${error}`);
//        setIsPlaying(false);
//        setIsPaused(false);
//      }
//    };

//     セッション完了処理
//    const handleSessionComplete = () => {
//      setIsPaused(false);
//      setCurrentSectionIndex(0);
//      setIsInPracticeMode(false);
//      setPracticeTimeLeft(120);
    
//       BGM停止
//      if (bgmAudio && isBgmPlaying) {
//        const fadeInterval = setInterval(() => {
//          if (bgmAudio.volume > 0.1) {
//            bgmAudio.volume -= 0.05;
//          } else {
//            bgmAudio.pause();
//            bgmAudio.currentTime = 0;
//            clearInterval(fadeInterval);
//            setIsBgmPlaying(false);
//          }
//        }, 200);
//      }
    
//      console.log('🧘 瞑想セッション完了');
//    };

//    const playAudio = async () => {
//      if (!audioUrls.length || isPlaying || isInPracticeMode) return;
    
//       BGM開始
//      if (bgmAudio && !isBgmPlaying) {
//        bgmAudio.currentTime = 0;
//        bgmAudio.volume = 0.3;
      
//        try {
//          const playPromise = bgmAudio.play();
//          if (playPromise !== undefined) {
//            await playPromise;
//            setIsBgmPlaying(true);
//            console.log('🎵 BGM再生開始');
//          }
//        } catch (error) {
//          console.error('BGM再生エラー:', error);
//        }
//      }
    
//      playSection(0);
//    };

//    const pauseAudio = () => {
//      if (currentAudio && isPlaying) {
//        currentAudio.pause();
//        setIsPlaying(false);
//        setIsPaused(true);
      
//        if (bgmAudio && isBgmPlaying) {
//          bgmAudio.pause();
//        }
//      }
//    };

//    const resumeAudio = () => {
//      if (currentAudio && isPaused) {
//        currentAudio.play().then(() => {
//          setIsPlaying(true);
//          setIsPaused(false);
        
//          if (bgmAudio && isBgmPlaying) {
//            bgmAudio.play();
//          }
//        }).catch(error => {
//          console.error('音声再開エラー:', error);
//          alert('音声の再開に失敗しました');
//        });
//      }
//    };

//     時間を mm:ss 形式でフォーマット
//    const formatTime = (seconds: number): string => {
//      const mins = Math.floor(seconds / 60);
//      const secs = seconds % 60;
//      return `${mins}:${secs.toString().padStart(2, '0')}`;
//    };

//     現在のセクション情報を取得
//    const currentSectionInfo = getSectionInfo(currentSectionIndex);

//    return (
//      <div className="meditation-wrapper" style={{
//        position: "fixed",
//        top: 0,
//        left: 0,
//        width: "100vw",
//        height: "100vh",
//        margin: 0,
//        padding: 0,
//        backgroundColor: "#000099",
//        display: "flex",
//        flexDirection: "column",
//        alignItems: "center",
//        justifyContent: "flex-start",
//        overflow: "auto",
//        zIndex: 1,
//      }}>
//        {/* 光の背景 */}
//        <div className="glow-background" />

//        {/* メインコンテンツ */}
//        <div className="meditation-content" style={{
//          width: "100%",
//          maxWidth: "600px",
//          margin: 0,
//          padding: "3rem 2rem",
//          boxSizing: "border-box",
//          position: "relative",
//          zIndex: 2,
//          color: "#ffffdd",
//          fontFamily: "'Klee One', serif",
//        }}>

//          {/* 入力フォーム画面 */}
//          {!showPlayer && !isGenerating && (
//            <>
//              {/* タイトル */}
//              <div style={{ textAlign: "center", marginBottom: "2rem" }}>
//                <h1 style={{
//                  fontSize: "2rem",
//                  fontWeight: "normal",
//                  margin: 0,
//                  marginBottom: "1rem",
//                  letterSpacing: "2px",
//                  lineHeight: "1.4",
//                  textShadow: "0 0 20px rgba(255, 255, 221, 0.3)",
//                }}>
//                  <span style={{ color: '#ff6600' }}>連絡衝動</span>
//                  <span style={{ margin: "0 0.5rem" }}>/</span>
//                  <span style={{ color: '#ff6600' }}>絶縁衝動</span><br />
//                  駆け込み寺<br />
//                  「誘導瞑想ワーク」
//                </h1>

//                <div style={{
//                  fontSize: "1rem",
//                  lineHeight: "1.8",
//                  opacity: 0.9,
//                  letterSpacing: "1px",
//                  textAlign: "left",
//                  marginBottom: "2rem"
//                }}>
//                  サイレント期特有の辛い衝動をクールダウンする専用瞑想です。連絡したい気持ち、諦めたい気持ち、どんな感情も一旦立ち止まって心を整えましょう。あなたのための時間を作ります。
//                </div>
//              </div>

//              {/* フォーム */}
//              <div style={{ marginBottom: "2rem" }}>
//                <div style={{
//                  fontSize: "0.8rem",
//                  marginBottom: "1rem",
//                  letterSpacing: "0.5px",
//                  opacity: 0.8,
//                }}>
//                  今あなたが抱えている辛い気持ちや衝動について教えてください。
//                </div>

//                <textarea
//                  value={impulse}
//                  onChange={(e) => setImpulse(e.target.value)}
//                  placeholder="例）彼に連絡したい衝動が止まりません..."
//                  style={{
//                    width: "100%",
//                    height: "120px",
//                    padding: "15px",
//                    border: "none",
//                    backgroundColor: "#ffffff",
//                    color: "#000099",
//                    fontSize: "1rem",
//                    lineHeight: "1.6",
//                    resize: "none",
//                    outline: "none",
//                    fontFamily: "'Klee One', serif",
//                    letterSpacing: "0.5px",
//                    boxSizing: "border-box",
//                    borderRadius: "4px",
//                    marginBottom: "1rem"
//                  }}
//                  maxLength={200}
//                />

//                <button
//                  onClick={handleSubmit}
//                  disabled={!impulse.trim() || isGenerating}
//                  style={{
//                    width: "100%",
//                    padding: "18px 25px",
//                    border: "none",
//                    backgroundColor: impulse.trim() && !isGenerating ? "#ffffdd" : "rgba(255, 255, 221, 0.5)",
//                    color: impulse.trim() && !isGenerating ? "#000099" : "rgba(0, 0, 153, 0.5)",
//                    fontSize: "1rem",
//                    fontFamily: "'Klee One', serif",
//                    letterSpacing: "1px",
//                    cursor: impulse.trim() && !isGenerating ? "pointer" : "not-allowed",
//                    transition: "all 0.3s ease",
//                    fontWeight: "bold",
//                    borderRadius: "4px"
//                  }}
//                >
//                  {isGenerating ? "瞑想作成中..." : "クールダウン瞑想を開始"}
//                </button>
//              </div>
//            </>
//          )}

//          {/* 生成中画面 */}
//          {isGenerating && (
//            <div style={{
//              textAlign: "center",
//              padding: "4rem 0"
//            }}>
//              <p style={{
//                fontSize: "1.2rem",
//                marginBottom: "2rem"
//              }}>
//                あなたの心をケアする瞑想を作成しています...
//              </p>
//            </div>
//          )}

//          {/* 音声プレーヤー画面 */}
//          {showPlayer && (
//            <>
//              <div style={{ textAlign: "center", marginBottom: "2rem" }}>
//                <p style={{
//                  fontSize: "1.2rem",
//                  lineHeight: "1.8",
//                  marginBottom: "2rem"
//                }}>
//                  あなたのための心のケア瞑想が<br />完成しました。<br />
//                  ゆっくりと音声に身を委ねてください。
//                </p>
//              </div>

//              <div style={{
//                background: "rgba(255, 255, 221, 0.1)",
//                border: "1px solid rgba(255, 255, 221, 0.3)",
//                borderRadius: "8px",
//                padding: "2rem",
//                textAlign: "center"
//              }}>
//                <button 
//                  onClick={() => {
//                    if (!isPlaying && !isPaused && !isInPracticeMode) {
//                      playAudio();
//                    } else if (isPlaying) {
//                      pauseAudio();
//                    } else if (isPaused) {
//                      resumeAudio();
//                    }
//                  }}
//                  disabled={isInPracticeMode}
//                  style={{
//                    width: "60px",
//                    height: "60px",
//                    borderRadius: "50%",
//                    border: "2px solid #ffffdd",
//                    backgroundColor: "rgba(255, 255, 221, 0.1)",
//                    color: "#ffffdd",
//                    cursor: isInPracticeMode ? "not-allowed" : "pointer",
//                    display: "flex",
//                    alignItems: "center",
//                    justifyContent: "center",
//                    fontSize: "20px",
//                    margin: "0 auto 20px",
//                    opacity: isInPracticeMode ? 0.5 : 1
//                  }}
//                >
//                  {isPlaying ? '⏸' : '▶'}
//                </button>

//                <div style={{
//                  fontSize: "0.9rem",
//                  opacity: 0.7,
//                  marginBottom: "15px"
//                }}>
//                  {isInPracticeMode ? 
//                    `2分間実践中... 残り ${formatTime(practiceTimeLeft)}` :
//                    isPlaying ? 
//                      `セクション${currentSectionIndex + 1}/6 再生中...` : 
//                      isPaused ? '一時停止中' : 'あなたのためのケア瞑想準備完了'
//                  }
//                </div>

//                <div style={{
//                  fontSize: "0.8rem",
//                  opacity: 0.6,
//                  marginBottom: "10px"
//                }}>
//                  {isInPracticeMode ? 
//                    '静かに呼吸を続けてください' :
//                    currentSectionInfo.description
//                  }
//                </div>
//              </div>
//            </>
//          )}

//          {/* 戻るリンク */}
//          <div style={{
//            textAlign: "center",
//            marginTop: "3rem",
//          }}>
//            <Link
//              to="/menu"
//              style={{
//                color: "#ffffdd",
//                textDecoration: "underline",
//                fontSize: "0.9rem",
//                opacity: 0.8,
//              }}
//            >
//              メニューに戻る
//            </Link>
//          </div>
//        </div>
//      </div>
//    );
//  }





// // src/pages/meditation.tsx
// import { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';

// export default function MeditationPage() {
//   const [impulse, setImpulse] = useState('');
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [showPlayer, setShowPlayer] = useState(false);
//   const [generatedSections, setGeneratedSections] = useState<string[]>([]);
//   const [audioUrls, setAudioUrls] = useState<string[]>([]);
//   const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [isPaused, setIsPaused] = useState(false);
//   const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  
//   // タイマー状態管理
//   const [isInPracticeMode, setIsInPracticeMode] = useState(false);
//   const [practiceTimeLeft, setPracticeTimeLeft] = useState(120);
  
//   // BGM関連のstate
//   const [bgmAudio, setBgmAudio] = useState<HTMLAudioElement | null>(null);
//   const [isBgmPlaying, setIsBgmPlaying] = useState(false);

//   useEffect(() => {
//     document.title = '連絡衝動/絶縁衝動駆け込み寺「誘導瞑想ワーク」';
    
//     // BGM音声ファイルを事前読み込み
//     const bgm = new Audio('/meditation.mp3');
//     bgm.loop = true;
//     bgm.volume = 0.3;
//     setBgmAudio(bgm);
    
//     return () => {
//       if (bgm) {
//         bgm.pause();
//         bgm.src = '';
//       }
//     };
//   }, []);

//   // 2分タイマーのカウントダウン
//   useEffect(() => {
//     let interval: NodeJS.Timeout;
    
//     if (isInPracticeMode && practiceTimeLeft > 0) {
//       interval = setInterval(() => {
//         setPracticeTimeLeft(prev => {
//           if (prev <= 1) {
//             setIsInPracticeMode(false);
//             setPracticeTimeLeft(120);
            
//             const nextIndex = currentSectionIndex + 1;
//             if (nextIndex < audioUrls.length) {
//               console.log('🔇 2分間完了 - 次のセクションへ');
//               setCurrentSectionIndex(nextIndex);
//               playSection(nextIndex);
//             } else {
//               handleSessionComplete();
//             }
//             return 120;
//           }
//           return prev - 1;
//         });
//       }, 1000);
//     }
    
//     return () => {
//       if (interval) clearInterval(interval);
//     };
//   }, [isInPracticeMode, practiceTimeLeft, currentSectionIndex, audioUrls.length]);

//   const handleSubmit = async () => {
//     if (!impulse.trim()) return;
    
//     setIsGenerating(true);
    
//     try {
//       // 1. 誘導瞑想セクションを6つ生成
//       const textResponse = await fetch('http://localhost:3001/api/generate-meditation', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ impulse })
//       });

//       if (!textResponse.ok) {
//         throw new Error('誘導瞑想テキストの生成に失敗しました');
//       }

//       const textData = await textResponse.json();
//       console.log('📝 生成されたセクション数:', textData.sections.length);
//       setGeneratedSections(textData.sections);

//       // 2. 各セクションの音声を個別生成
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
//       alert('誘導瞑想処理中にエラーが発生しました: ' + error.message);
//     }
//   };

//   // セクションタイプを判定
//   const getSectionInfo = (sectionIndex: number) => {
//     const isInstructionSection = (sectionIndex + 1) % 2 === 0;
    
//     if (isInstructionSection) {
//       const stageNumber = Math.floor(sectionIndex / 2) + 1;
//       return {
//         type: 'instruction',
//         label: `Stage${stageNumber} - 2分指示`,
//         description: '2分間の実践指示'
//       };
//     } else {
//       const stageNumber = Math.floor(sectionIndex / 2) + 1;
//       const stageNames = ['理解と受容', 'クールダウン', '前向きな転換'];
//       return {
//         type: 'content',
//         label: `Stage${stageNumber} - ${stageNames[stageNumber - 1]}`,
//         description: stageNames[stageNumber - 1]
//       };
//     }
//   };

//   // リバーブ用インパルスレスポンス生成関数
//   function createReverbImpulse(audioContext: AudioContext, duration: number, decay: number, reverse: boolean) {
//     const sampleRate = audioContext.sampleRate;
//     const length = sampleRate * duration;
//     const impulse = audioContext.createBuffer(2, length, sampleRate);
    
//     for (let channel = 0; channel < 2; channel++) {
//       const channelData = impulse.getChannelData(channel);
//       for (let i = 0; i < length; i++) {
//         const n = reverse ? length - i : i;
//         channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
//       }
//     }
    
//     return impulse;
//   }

//   const playSection = async (sectionIndex: number) => {
//     if (!audioUrls[sectionIndex] || isPlaying || isInPracticeMode) return;
    
//     try {
//       // BGM開始（最初のセクションのみ）
//       if (sectionIndex === 0 && bgmAudio && !isBgmPlaying) {
//         try {
//           bgmAudio.currentTime = 0;
//           bgmAudio.volume = 0.3;
//           const playPromise = bgmAudio.play();
//           if (playPromise !== undefined) {
//             await playPromise;
//             setIsBgmPlaying(true);
//             console.log('🎵 BGM開始');
//           }
//         } catch (error) {
//           console.log('BGM再生失敗:', error);
//         }
//       }

//       const audio = new Audio(audioUrls[sectionIndex]);
//       setCurrentAudio(audio);

//       // リバーブ効果を追加
//       if (window.AudioContext || (window as any).webkitAudioContext) {
//         try {
//           const audioContext = new ((window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext)();
//           const source = audioContext.createMediaElementSource(audio);
//           const convolver = audioContext.createConvolver();
          
//           const impulseResponse = createReverbImpulse(audioContext, 2, 2, false);
//           convolver.buffer = impulseResponse;
          
//           const dryGainNode = audioContext.createGain();
//           dryGainNode.gain.value = 0.5;
          
//           const wetGainNode = audioContext.createGain();
//           wetGainNode.gain.value = 0.5;
          
//           source.connect(dryGainNode);
//           dryGainNode.connect(audioContext.destination);
          
//           source.connect(convolver);
//           convolver.connect(wetGainNode);
//           wetGainNode.connect(audioContext.destination);
          
//           console.log('🎧 リバーブ効果適用');
//         } catch (error) {
//           console.log('リバーブ適用失敗:', error);
//         }
//       }

//       const sectionInfo = getSectionInfo(sectionIndex);
//       console.log(`▶️ ${sectionInfo.label} 再生開始`);

//       audio.onended = () => {
//         console.log(`✅ ${sectionInfo.label} 再生終了`);
//         setIsPlaying(false);
        
//         // セクション2,4,6（練習セクション）の後は2分タイマー開始
//         if (sectionIndex === 1 || sectionIndex === 3 || sectionIndex === 5) {
//           console.log('🔇 2分間実践タイマー開始...');
//           setIsInPracticeMode(true);
//           setPracticeTimeLeft(120);
//         } else {
//           // セクション1,3,5（文章セクション）の後はすぐ次のセクション（練習）へ
//           const nextIndex = sectionIndex + 1;
//           if (nextIndex < audioUrls.length) {
//             console.log('📝 次の練習セクションへ');
//             setCurrentSectionIndex(nextIndex);
//             playSection(nextIndex);
//           } else {
//             handleSessionComplete();
//           }
//         }
//       };

//       audio.onerror = (error) => {
//         console.error(`❌ セクション${sectionIndex + 1}audio.onerror:`, error);
//         alert('音声の再生中にエラーが発生しました');
//         setIsPlaying(false);
//         setIsPaused(false);
//       };

//       await audio.play();
//       setIsPlaying(true);
//       setIsPaused(false);
//       setCurrentSectionIndex(sectionIndex);
      
//     } catch (error) {
//       console.error(`❌ セクション${sectionIndex + 1}再生エラー:`, error);
//       alert(`音声の再生中にエラーが発生しました: ${error}`);
//       setIsPlaying(false);
//       setIsPaused(false);
//     }
//   };

//   // セッション完了処理
//   const handleSessionComplete = () => {
//     setIsPaused(false);
//     setCurrentSectionIndex(0);
//     setIsInPracticeMode(false);
//     setPracticeTimeLeft(120);
    
//     // BGM停止
//     if (bgmAudio && isBgmPlaying) {
//       const fadeInterval = setInterval(() => {
//         if (bgmAudio.volume > 0.1) {
//           bgmAudio.volume -= 0.05;
//         } else {
//           bgmAudio.pause();
//           bgmAudio.currentTime = 0;
//           clearInterval(fadeInterval);
//           setIsBgmPlaying(false);
//         }
//       }, 200);
//     }
    
//     console.log('🧘 瞑想セッション完了');
//   };

//   const playAudio = async () => {
//     if (!audioUrls.length || isPlaying || isInPracticeMode) return;
    
//     // BGM開始
//     if (bgmAudio && !isBgmPlaying) {
//       bgmAudio.currentTime = 0;
//       bgmAudio.volume = 0.3;
      
//       try {
//         const playPromise = bgmAudio.play();
//         if (playPromise !== undefined) {
//           await playPromise;
//           setIsBgmPlaying(true);
//           console.log('🎵 BGM再生開始');
//         }
//       } catch (error) {
//         console.error('BGM再生エラー:', error);
//       }
//     }
    
//     playSection(0);
//   };

//   const pauseAudio = () => {
//     if (currentAudio && isPlaying) {
//       currentAudio.pause();
//       setIsPlaying(false);
//       setIsPaused(true);
      
//       if (bgmAudio && isBgmPlaying) {
//         bgmAudio.pause();
//       }
//     }
//   };

//   const resumeAudio = () => {
//     if (currentAudio && isPaused) {
//       currentAudio.play().then(() => {
//         setIsPlaying(true);
//         setIsPaused(false);
        
//         if (bgmAudio && isBgmPlaying) {
//           bgmAudio.play();
//         }
//       }).catch(error => {
//         console.error('音声再開エラー:', error);
//         alert('音声の再開に失敗しました');
//       });
//     }
//   };

//   // 時間を mm:ss 形式でフォーマット
//   const formatTime = (seconds: number): string => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins}:${secs.toString().padStart(2, '0')}`;
//   };

//   // 現在のセクション情報を取得
//   const currentSectionInfo = getSectionInfo(currentSectionIndex);

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
//                 placeholder="例）彼をブロックしてしまいそうです"
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
//             padding: "4rem 0"
//           }}>
//             <p style={{
//               fontSize: "1.2rem",
//               marginBottom: "2rem"
//             }}>
//               あなたの心をケアする瞑想を作成しています...
//             </p>
//           </div>
//         )}

//         {/* 音声プレーヤー画面 */}
//         {showPlayer && (
//           <>
//             <div style={{ 
//               textAlign: "center", 
//               marginBottom: "2rem",
//               display: "flex",
//               flexDirection: "column",
//               alignItems: "center",
//               justifyContent: "center",
//               minHeight: "40vh"
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
//                   if (!isPlaying && !isPaused && !isInPracticeMode) {
//                     playAudio();
//                   } else if (isPlaying) {
//                     pauseAudio();
//                   } else if (isPaused) {
//                     resumeAudio();
//                   }
//                 }}
//                 disabled={isInPracticeMode}
//                 style={{
//                   width: "60px",
//                   height: "60px",
//                   borderRadius: "50%",
//                   border: "2px solid #ffffdd",
//                   backgroundColor: "rgba(255, 255, 221, 0.1)",
//                   color: "#ffffdd",
//                   cursor: isInPracticeMode ? "not-allowed" : "pointer",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   fontSize: "20px",
//                   margin: "0 auto 20px",
//                   opacity: isInPracticeMode ? 0.5 : 1
//                 }}
//               >
//                 {isPlaying ? '⏸' : '▶'}
//               </button>

//               <div style={{
//                 fontSize: "0.9rem",
//                 opacity: 0.7,
//                 marginBottom: "15px"
//               }}>
//                 {isInPracticeMode ? 
//                   `2分間実践中... 残り ${formatTime(practiceTimeLeft)}` :
//                   isPlaying ? 
//                     `セクション${currentSectionIndex + 1}/6 再生中...` : 
//                     isPaused ? '一時停止中' : 'あなたのためのケア瞑想準備完了'
//                 }
//               </div>

//               <div style={{
//                 fontSize: "0.8rem",
//                 opacity: 0.6,
//                 marginBottom: "10px"
//               }}>
//                 {isInPracticeMode ? 
//                   '静かに呼吸を続けてください' :
//                   currentSectionInfo.description
//                 }
//               </div>
//             </div>
//           </>
//         )}

//         {/* トップへ戻るリンク */}
//         <div style={{
//           position: "fixed",
//           bottom: "20px",
//           left: "50%",
//           transform: "translateX(-50%)",
//           textAlign: "center",
//           zIndex: 1000
//         }}>
//           <Link
//             to="/"
//             style={{
//               color: "#ffffdd",
//               textDecoration: "underline",
//               fontSize: "0.9rem",
//               opacity: 0.8,
//             }}
//           >
//             トップへ戻る
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// }



// src/pages/meditation.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function MeditationPage() {
  const [impulse, setImpulse] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [generatedSections, setGeneratedSections] = useState<string[]>([]);
  const [audioUrls, setAudioUrls] = useState<string[]>([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  
  // タイマー状態管理（沈黙用）
  const [isInSilenceMode, setIsInSilenceMode] = useState(false);
  const [silenceTimeLeft, setSilenceTimeLeft] = useState(120);
  
  // BGM関連のstate
  const [bgmAudio, setBgmAudio] = useState<HTMLAudioElement | null>(null);
  const [isBgmPlaying, setIsBgmPlaying] = useState(false);

  useEffect(() => {
    document.title = '連絡衝動/絶縁衝動駆け込み寺「誘導瞑想ワーク」';
    
    // BGM音声ファイルを事前読み込み
    const bgm = new Audio('/meditation.mp3');
    bgm.loop = true;
    bgm.volume = 0.3;
    setBgmAudio(bgm);
    
    return () => {
      if (bgm) {
        bgm.pause();
        bgm.src = '';
      }
    };
  }, []);

  // 2分沈黙のカウントダウン
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isInSilenceMode && silenceTimeLeft > 0) {
      interval = setInterval(() => {
        setSilenceTimeLeft(prev => {
          if (prev <= 1) {
            setIsInSilenceMode(false);
            setSilenceTimeLeft(120);
            
            const nextIndex = currentSectionIndex + 1;
            if (nextIndex < audioUrls.length) {
              console.log('🔇 2分沈黙完了 - 次のセクションへ');
              setCurrentSectionIndex(nextIndex);
              playSection(nextIndex);
            } else {
              handleSessionComplete();
            }
            return 120;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isInSilenceMode, silenceTimeLeft, currentSectionIndex, audioUrls.length]);

  const handleSubmit = async () => {
    if (!impulse.trim()) return;
    
    setIsGenerating(true);
    
    try {
      // 1. 誘導瞑想セクションを3つ生成（文章のみ）
      const textResponse = await fetch('http://localhost:3001/api/generate-meditation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ impulse })
      });

      if (!textResponse.ok) {
        throw new Error('誘導瞑想テキストの生成に失敗しました');
      }

      const textData = await textResponse.json();
      console.log('📝 生成されたセクション数:', textData.sections.length);
      setGeneratedSections(textData.sections);

      // 2. 3つの文章セクションの音声を生成
      const audioUrls = [];
      
      for (let i = 0; i < textData.sections.length; i++) {
        console.log(`🎵 文章セクション${i + 1}音声生成中...`);
        
        const audioResponse = await fetch('http://localhost:3001/api/generate-audio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            text: textData.sections[i],
            speed: 0.9
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
      console.error('誘導瞑想処理エラー:', error);
      setIsGenerating(false);
      alert('誘導瞑想処理中にエラーが発生しました: ' + error.message);
    }
  };

  // リバーブ用インパルスレスポンス生成関数
  function createReverbImpulse(audioContext: AudioContext, duration: number, decay: number, reverse: boolean) {
    const sampleRate = audioContext.sampleRate;
    const length = sampleRate * duration;
    const impulse = audioContext.createBuffer(2, length, sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        const n = reverse ? length - i : i;
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
      }
    }
    
    return impulse;
  }

  const playSection = async (sectionIndex: number) => {
    if (!audioUrls[sectionIndex] || isPlaying) return;
    
    try {
      console.log('🎵 BGMチェック開始...');
      
      // BGM開始（全セクションで確実に再生）
      if (bgmAudio) {
        console.log('🎵 BGMオブジェクト存在確認:', !!bgmAudio);
        console.log('🎵 BGM一時停止状態:', bgmAudio.paused);
        
        try {
          // BGMが停止してたら再開
          if (bgmAudio.paused) {
            bgmAudio.currentTime = 0;
            bgmAudio.volume = 0.3;
            console.log('🎵 BGM再生試行中...');
            const playPromise = bgmAudio.play();
            if (playPromise !== undefined) {
              await playPromise;
              setIsBgmPlaying(true);
              console.log('🎵 BGM再生成功確認');
            }
          } else {
            console.log('🎵 BGMすでに再生中');
          }
        } catch (error) {
          console.error('🎵 BGM再生エラー:', error);
        }
      } else {
        console.error('🎵 BGMオブジェクトが存在しません');
      }

      const audio = new Audio(audioUrls[sectionIndex]);
      setCurrentAudio(audio);

      // リバーブ効果を追加
      if (window.AudioContext || (window as any).webkitAudioContext) {
        try {
          const audioContext = new ((window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext)();
          const source = audioContext.createMediaElementSource(audio);
          const convolver = audioContext.createConvolver();
          
          const impulseResponse = createReverbImpulse(audioContext, 2, 2, false);
          convolver.buffer = impulseResponse;
          
          const dryGainNode = audioContext.createGain();
          dryGainNode.gain.value = 0.5;
          
          const wetGainNode = audioContext.createGain();
          wetGainNode.gain.value = 0.5;
          
          source.connect(dryGainNode);
          dryGainNode.connect(audioContext.destination);
          
          source.connect(convolver);
          convolver.connect(wetGainNode);
          wetGainNode.connect(audioContext.destination);
          
          console.log('🎧 リバーブ効果適用');
        } catch (error) {
          console.log('リバーブ適用失敗:', error);
        }
      }

      // Stage情報を計算（3つのセクションのみ）
      const stageNumber = sectionIndex + 1;
      const stageNames = ['理解と受容', 'クールダウン', '前向きな転換'];
      console.log(`▶️ Stage${stageNumber} - ${stageNames[sectionIndex]} 再生開始`);

      audio.onended = () => {
        console.log(`✅ Stage${stageNumber} - ${stageNames[sectionIndex]} 再生終了`);
        setIsPlaying(false);
        
        // 各Stageの文章終了後は2分沈黙モードへ
        console.log('🔇 2分間沈黙タイマー開始...');
        setIsInSilenceMode(true);
        setSilenceTimeLeft(120);
      };

      audio.onerror = (error) => {
        console.error(`❌ セクション${sectionIndex + 1}audio.onerror:`, error);
        alert('音声の再生中にエラーが発生しました');
        setIsPlaying(false);
        setIsPaused(false);
      };

      await audio.play();
      setIsPlaying(true);
      setIsPaused(false);
      setCurrentSectionIndex(sectionIndex);
      
    } catch (error) {
      console.error(`❌ セクション${sectionIndex + 1}再生エラー:`, error);
      alert(`音声の再生中にエラーが発生しました: ${error}`);
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  // セッション完了処理
  const handleSessionComplete = () => {
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentSectionIndex(0);
    setIsInSilenceMode(false);
    setSilenceTimeLeft(120);
    
    // BGM停止
    if (bgmAudio && isBgmPlaying) {
      const fadeInterval = setInterval(() => {
        if (bgmAudio.volume > 0.1) {
          bgmAudio.volume -= 0.05;
        } else {
          bgmAudio.pause();
          bgmAudio.currentTime = 0;
          clearInterval(fadeInterval);
          setIsBgmPlaying(false);
        }
      }, 200);
    }
    
    console.log('🧘 瞑想セッション完了');
  };

  const playAudio = async () => {
    if (!audioUrls.length || isPlaying || isInSilenceMode) return;
    
    // BGM確実に開始（ユーザーインタラクション後）
    if (bgmAudio) {
      try {
        bgmAudio.currentTime = 0;
        bgmAudio.volume = 0.3;
        
        const playPromise = bgmAudio.play();
        if (playPromise !== undefined) {
          await playPromise;
          setIsBgmPlaying(true);
          console.log('🎵 BGM再生開始確認');
        }
      } catch (error) {
        console.error('BGM再生エラー:', error);
        // BGMエラーでも瞑想は続行
      }
    }
    
    playSection(0);
  };

  const pauseAudio = () => {
    if (currentAudio && isPlaying) {
      currentAudio.pause();
      setIsPlaying(false);
      setIsPaused(true);
      
      if (bgmAudio && isBgmPlaying) {
        bgmAudio.pause();
      }
    }
  };

  const resumeAudio = () => {
    if (currentAudio && isPaused) {
      currentAudio.play().then(() => {
        setIsPlaying(true);
        setIsPaused(false);
        
        if (bgmAudio && isBgmPlaying) {
          bgmAudio.play();
        }
      }).catch(error => {
        console.error('音声再開エラー:', error);
        alert('音声の再開に失敗しました');
      });
    }
  };

  // 時間を mm:ss 形式でフォーマット
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
            padding: "4rem 0"
          }}>
            <p style={{
              fontSize: "1.2rem",
              marginBottom: "2rem"
            }}>
              あなたの心をケアする瞑想を作成しています...
            </p>
          </div>
        )}

        {/* 音声プレーヤー画面 */}
        {showPlayer && (
          <>
            <div style={{ 
              textAlign: "center", 
              marginBottom: "2rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "40vh"
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
                  if (!isPlaying && !isPaused && !isInSilenceMode) {
                    playAudio();
                  } else if (isPlaying) {
                    pauseAudio();
                  } else if (isPaused) {
                    resumeAudio();
                  }
                }}
                disabled={isInSilenceMode}
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  border: "2px solid #ffffdd",
                  backgroundColor: "rgba(255, 255, 221, 0.1)",
                  color: "#ffffdd",
                  cursor: isInSilenceMode ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  margin: "0 auto 20px",
                  opacity: isInSilenceMode ? 0.5 : 1
                }}
              >
                {isPlaying ? '⏸' : '▶'}
              </button>

              <div style={{
                fontSize: "0.9rem",
                opacity: 0.7,
                marginBottom: "15px"
              }}>
                {isInSilenceMode ? 
                  `2分間沈黙中... 残り ${formatTime(silenceTimeLeft)}` :
                  isPlaying ? 
                    `Stage${currentSectionIndex + 1}/3 再生中...` : 
                    isPaused ? '一時停止中' : 'あなたのためのケア瞑想準備完了'
                }
              </div>

              <div style={{
                fontSize: "0.8rem",
                opacity: 0.6,
                marginBottom: "10px"
              }}>
                {isInSilenceMode ? 
                  '静かに呼吸を続けてください' :
                  (() => {
                    const stageNames = ['理解と受容', 'クールダウン', '前向きな転換'];
                    return stageNames[currentSectionIndex] || '';
                  })()
                }
              </div>
            </div>
          </>
        )}

        {/* トップへ戻るリンク */}
        <div style={{
          position: "fixed",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
          zIndex: 1000
        }}>
          <Link
            to="/"
            style={{
              color: "#ffffdd",
              textDecoration: "underline",
              fontSize: "0.9rem",
              opacity: 0.8,
            }}
          >
            トップへ戻る
          </Link>
        </div>
      </div>
    </div>
  );
}