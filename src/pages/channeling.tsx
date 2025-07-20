import { useState, useEffect } from 'react';

export default function ChannelingPage() {
  const [question, setQuestion] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [showWordInput, setShowWordInput] = useState(false);
  const [generatedText, setGeneratedText] = useState<string>(''); // 生成されたテキスト
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
  const [receivedWords, setReceivedWords] = useState(Array(10).fill(''));
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [pausedTime, setPausedTime] = useState(0);
  const [duration] = useState(900); // 15分 = 900秒
  const [audioSource, setAudioSource] = useState<AudioBufferSourceNode | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    document.title = 'チャネリング誘導音声ワーク';
  }, []);

  // 音声合成・再生関数（Google Cloud TTS使用）
  const generateAndPlayChannelingAudio = async (text: string) => {
    try {
      setIsPlaying(true);
      
      // 冒頭音声テキスト
      const openingText = `
いまから、あなたの魂の声と静かにつながる時間をひらきます。
まず、今日あなたがつながりたい存在を心の中で決めてください。
ツインレイのお相手、守護天使、アセンデッドマスター、
ハイヤーセルフ、宇宙の叡智、何でも構いません。
あなたの心が求める存在を選んでください。

言葉を超えたところに、
光のようにそっと降りてくる感覚を、
ただ、まっすぐに受け取ってください。
これは答えを探すための時間ではなく、
あなた自身の内なる宇宙に、耳をすますための練習です。
目を閉じて、呼吸を深くしていきましょう。
      `;

      // 終わり音声テキスト
      const closingText = `
宇宙からの贈り物を受け取りました。
今日感じたすべては、あなたの魂に深く刻まれています。
受け取ったメッセージや感覚を、
どうぞフォームに入力してください。
この神聖な体験を胸に、
日常という舞台で輝いて生きてください。
お疲れさまでした。
愛と光に包まれて。
      `;

      console.log('音声生成開始...');

      // 1. 冒頭音声生成
      const openingResponse = await fetch('/api/generate-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: openingText.trim(),
          speed: 0.7 // ゆっくりと
        })
      });

      if (!openingResponse.ok) {
        throw new Error('冒頭音声の生成に失敗しました');
      }

      const openingData = await openingResponse.json();
      
      // 2. メイン音声生成
      const mainResponse = await fetch('/api/generate-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: text.trim(),
          speed: 0.7
        })
      });

      if (!mainResponse.ok) {
        throw new Error('メイン音声の生成に失敗しました');
      }

      const mainData = await mainResponse.json();

      // 3. 終わり音声生成
      const closingResponse = await fetch('/api/generate-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: closingText.trim(),
          speed: 0.7
        })
      });

      if (!closingResponse.ok) {
        throw new Error('終わり音声の生成に失敗しました');
      }

      const closingData = await closingResponse.json();

      console.log('音声生成完了、順次再生開始...');

      // 4. 順次再生
      await playAudioSequence([
        openingData.audioUrl,
        mainData.audioUrl,
        closingData.audioUrl
      ]);

    } catch (error) {
      console.error('音声生成・再生エラー:', error);
      setIsPlaying(false);
      alert('音声の生成中にエラーが発生しました: ' + error.message);
    }
  };

  // 音声を順次再生する関数
  const playAudioSequence = async (audioUrls: string[]) => {
    return new Promise<void>((resolve, reject) => {
      let currentIndex = 0;
      
      const playNext = () => {
        if (currentIndex >= audioUrls.length) {
          // 全て再生完了
          setIsPlaying(false);
          setIsPaused(false);
          setCurrentTime(0);
          setPausedTime(0);
          setTimeout(() => {
            setShowPlayer(false);
            setShowWordInput(true);
          }, 1000);
          resolve();
          return;
        }

        const audio = new Audio(audioUrls[currentIndex]);
        
        audio.onended = () => {
          currentIndex++;
          playNext(); // 次の音声を再生
        };

        audio.onerror = (error) => {
          console.error('音声再生エラー:', error);
          reject(new Error('音声の再生中にエラーが発生しました'));
        };

        audio.play().catch(error => {
          console.error('音声再生開始エラー:', error);
          reject(error);
        });
      };

      playNext(); // 再生開始
    });
  };

  const playAudio = () => {
    if (!isPlaying && !isPaused && generatedText) {
      generateAndPlayChannelingAudio(generatedText);
    }
  };

  const pauseAudio = () => {
    if (isPlaying && timer) {
      clearInterval(timer);
      setIsPlaying(false);
      setIsPaused(true);
      setPausedTime(currentTime);
    }
  };

  const resumeAudio = () => {
    if (isPaused) {
      setIsPlaying(true);
      setIsPaused(false);
      
      const newTimer = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            clearInterval(newTimer);
            setIsPlaying(false);
            setIsPaused(false);
            setCurrentTime(0);
            setPausedTime(0);
            setTimeout(() => {
              setShowPlayer(false);
              setShowWordInput(true);
            }, 1000);
            return duration;
          }
          return prev + 1;
        });
      }, 1000);
      setTimer(newTimer);
    }
  };

  const handleSubmit = async () => {
    if (!question.trim()) return;
    
    setIsGenerating(true);
    
    try {
      // テスト用のダミーテキスト生成（実際のAPI実装まで）
      const demoText = `
**練習1回目の指示（約1.5分）：**
では、1回目の聖なる練習を始めます。今回は、あなたのハートチャクラに意識を向けてみましょう。胸の中央、心臓のあたりに温かな光をイメージしてください。

まずは何でも構いません。あなたが選んだ存在とつながって、${question}について、今この瞬間に感じるもの全てを受け取ってみてください。温かさ、涼しさ、色、音、香り、言葉、映像、なんでも構いません。最初は小さな感覚かもしれませんが、それも大切なメッセージです。

それでは、神聖なる静寂の時間に入ります。これから2分間、心を空にして、どんな小さなことでも感じたものを受け取ってください。

**【2分間の沈黙】**

**練習2回目の指示（約1.5分）：**
お疲れさまでした。2回目の神聖な旅路に入りましょう。今度は、あなたの頭頂部から天の恵みが純粋な光となって降り注いでくるイメージをしてみてください。

1回目よりも深いつながりができているはずです。今度は少し意識を向けてみてください。${question}に関連して、あなたの現在の状況について、高次元からどのようなメッセージが届くでしょうか。答えを探そうとせず、ただ受け取ってください。

再び聖なる静寂に入ります。これから2分間、あなた自身の現在について、高次元からの導きを受け取ってください。

**【2分間の沈黙】**

**練習3回目の指示（約1.5分）：**
最後の神聖なる儀式に入りましょう。3回目では、いよいよあなたの質問についてのメッセージを受け取る時間です。

${question}について、宇宙の叡智に問いかけてみてください。高次元からのメッセージを、どんな形でも受け取ってください。言葉、映像、感覚、直感、すべてがあなたへの答えです。

最後の聖なる時間です。これから2分間、高次元からの導きを受け取り、感じたことすべてを心に刻んでください。後でフォームに入力できるよう、メモするつもりで受け取ってください。

**【2分間の沈黙】**
      `;

      // 2秒待機してダミーテキストを設定
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setGeneratedText(demoText);
      console.log('生成されたチャネリング指導テキスト:', demoText);
      
      setIsGenerating(false);
      setGeneratedAudio('generated-audio-url'); // 音声生成完了フラグ
      setShowPlayer(true);
      
    } catch (error) {
      console.error('エラー:', error);
      setIsGenerating(false);
      alert('チャネリング指導テキストの生成中にエラーが発生しました。再度お試しください。');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div>
      {/* 入力フォーム画面 */}
      {!showPlayer && !isGenerating && !showWordInput && (
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
                placeholder="例）彼にはもう会えないのでしょうか？"
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
                width: '100%',
                height: '4px',
                backgroundColor: 'rgba(255, 255, 221, 0.2)',
                borderRadius: '2px',
                marginBottom: '15px'
              }}>
                <div style={{
                  width: `${(currentTime / duration) * 100}%`,
                  height: '100%',
                  backgroundColor: '#ffffdd',
                  borderRadius: '2px',
                  transition: 'width 0.1s ease'
                }} />
              </div>

              <div style={{
                fontSize: '14px',
                opacity: 0.7
              }}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            {/* デバッグ用：生成されたテキスト表示 */}
            {generatedText && (
              <div style={{
                marginTop: '20px',
                padding: '20px',
                background: 'rgba(255, 255, 221, 0.05)',
                border: '1px solid rgba(255, 255, 221, 0.2)',
                borderRadius: '8px',
                fontSize: '12px',
                textAlign: 'left' as const,
                whiteSpace: 'pre-wrap' as const,
                maxHeight: '200px',
                overflow: 'auto'
              }}>
                <strong>生成されたテキスト（デバッグ用）:</strong><br />
                {generatedText}
              </div>
            )}
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
              fontSize: '16px',
              fontWeight: 'normal' as const,
              marginBottom: '20px',
              letterSpacing: '3px',
              lineHeight: '1.4',
              textShadow: '0 0 20px rgba(255, 255, 221, 0.3)',
              fontFamily: "'Klee One', serif"
            }}>
              感じ取った言葉の読み解き
            </h1>

            {/* サブタイトル */}
            <div style={{
              fontSize: '16px',
              lineHeight: '1.8',
              marginBottom: '35px',
              opacity: 0.9,
              letterSpacing: '1px',
              fontFamily: "'Klee One', serif",
              textAlign: 'left' as const
            }}>
              書き留めていた言葉たちを、この場所に映してください。秘められた意味は、このあと静かに開かれていきます。
            </div>

            {/* 説明 */}
            <div style={{
              fontSize: '12px',
              marginBottom: '15px',
              letterSpacing: '0.5px',
              fontFamily: "'Klee One', serif",
              opacity: 0.8,
              textAlign: 'left' as const
            }}>
              受け取った言葉を入力してください。
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
                onClick={() => alert('解釈結果画面へ（未実装）')}
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

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// import { useState, useEffect } from 'react';

// export default function ChannelingPage() {
//   const [question, setQuestion] = useState('');
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [showPlayer, setShowPlayer] = useState(false);
//   const [showWordInput, setShowWordInput] = useState(false);
//   const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
//   const [receivedWords, setReceivedWords] = useState(Array(10).fill(''));
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [isPaused, setIsPaused] = useState(false);
//   const [currentTime, setCurrentTime] = useState(0);
//   const [pausedTime, setPausedTime] = useState(0);
//   const [duration] = useState(3);
//   const [audioSource, setAudioSource] = useState<AudioBufferSourceNode | null>(null);
//   const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
//   const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

//   useEffect(() => {
//     document.title = 'チャネリング誘導音声ワーク';
//   }, []);

//   const generateBeepAudio = (startTime = 0) => {
//     const audioCtx = new AudioContext();
//     const sampleRate = audioCtx.sampleRate;
//     const totalDuration = 3;
//     const remainingDuration = totalDuration - startTime;
//     const frameCount = sampleRate * remainingDuration;
    
//     if (remainingDuration <= 0) {
//       // 音声終了
//       setIsPlaying(false);
//       setIsPaused(false);
//       setCurrentTime(0);
//       setPausedTime(0);
//       setTimeout(() => {
//         setShowPlayer(false);
//         setShowWordInput(true);
//       }, 1000);
//       return null;
//     }
    
//     const audioBuffer = audioCtx.createBuffer(1, frameCount, sampleRate);
//     const channelData = audioBuffer.getChannelData(0);
    
//     for (let i = 0; i < frameCount; i++) {
//       channelData[i] = Math.sin(2 * Math.PI * 440 * (i + startTime * sampleRate) / sampleRate) * 0.1;
//     }
    
//     const source = audioCtx.createBufferSource();
//     source.buffer = audioBuffer;
//     source.connect(audioCtx.destination);
    
//     source.onended = () => {
//       // 音声が正常に最後まで再生された場合
//       setIsPlaying(false);
//       setIsPaused(false);
//       setCurrentTime(0);
//       setPausedTime(0);
//       setTimeout(() => {
//         setShowPlayer(false);
//         setShowWordInput(true);
//       }, 1000);
//     };
    
//     return { source, audioCtx };
//   };

//   const playAudio = () => {
//     if (!isPlaying && !isPaused) {
//       const result = generateBeepAudio(0);
//       if (result) {
//         const { source, audioCtx } = result;
//         source.start();
//         setIsPlaying(true);
//         setAudioSource(source);
//         setAudioContext(audioCtx);
        
//         const newTimer = setInterval(() => {
//           setCurrentTime(prev => {
//             if (prev >= duration) {
//               clearInterval(newTimer);
//               return duration;
//             }
//             return prev + 0.1;
//           });
//         }, 100);
//         setTimer(newTimer);
//       }
//     }
//   };

//   const pauseAudio = () => {
//     if (isPlaying && audioSource && audioContext && timer) {
//       audioSource.stop();
//       audioSource.onended = null; // onendedイベントを無効化
//       clearInterval(timer);
//       setIsPlaying(false);
//       setIsPaused(true);
//       setPausedTime(currentTime);
//     }
//   };

//   const resumeAudio = () => {
//     if (isPaused) {
//       const result = generateBeepAudio(pausedTime);
//       if (result) {
//         const { source, audioCtx } = result;
//         source.start();
//         setIsPlaying(true);
//         setIsPaused(false);
//         setAudioSource(source);
//         setAudioContext(audioCtx);
        
//         const newTimer = setInterval(() => {
//           setCurrentTime(prev => {
//             if (prev >= duration) {
//               clearInterval(newTimer);
//               return duration;
//             }
//             return prev + 0.1;
//           });
//         }, 100);
//         setTimer(newTimer);
//       }
//     }
//   };

//   const handleSubmit = async () => {
//     if (!question.trim()) return;
    
//     setIsGenerating(true);
    
//     console.log('質問:', question);
    
//     setTimeout(() => {
//       setIsGenerating(false);
//       setGeneratedAudio('dummy-audio-url');
//       setShowPlayer(true);
//     }, 8000);
//   };

//   return (
//     <div>
//       {/* 入力フォーム画面 */}
//       {!showPlayer && !isGenerating && !showWordInput && (
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
//                 placeholder="例）彼にはもう会えないのでしょうか？"
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
//                 width: '100%',
//                 height: '4px',
//                 backgroundColor: 'rgba(255, 255, 221, 0.2)',
//                 borderRadius: '2px',
//                 marginBottom: '15px'
//               }}>
//                 <div style={{
//                   width: `${(currentTime / duration) * 100}%`,
//                   height: '100%',
//                   backgroundColor: '#ffffdd',
//                   borderRadius: '2px',
//                   transition: 'width 0.1s ease'
//                 }} />
//               </div>

//               <div style={{
//                 fontSize: '14px',
//                 opacity: 0.7
//               }}>
//                 {Math.floor(currentTime)}:{String(Math.floor((currentTime % 1) * 60)).padStart(2, '0')} / 0:03
//               </div>
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
//               fontSize: '16px',
//               fontWeight: 'normal' as const,
//               marginBottom: '20px',
//               letterSpacing: '3px',
//               lineHeight: '1.4',
//               textShadow: '0 0 20px rgba(255, 255, 221, 0.3)',
//               fontFamily: "'Klee One', serif"
//             }}>
//               感じ取った言葉の読み解き
//             </h1>

//             {/* サブタイトル */}
//             <div style={{
//               fontSize: '16px',
//               lineHeight: '1.8',
//               marginBottom: '35px',
//               opacity: 0.9,
//               letterSpacing: '1px',
//               fontFamily: "'Klee One', serif",
//               textAlign: 'left' as const
//             }}>
//               書き留めていた言葉たちを、この場所に映してください。秘められた意味は、このあと静かに開かれていきます。
//             </div>

//             {/* 説明 */}
//             <div style={{
//               fontSize: '12px',
//               marginBottom: '15px',
//               letterSpacing: '0.5px',
//               fontFamily: "'Klee One', serif",
//               opacity: 0.8,
//               textAlign: 'left' as const
//             }}>
//               受け取った言葉を入力してください。
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
//                 onClick={() => alert('解釈結果画面へ（未実装）')}
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
//     </div>
//   );
// }