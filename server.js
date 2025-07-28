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
  
  // タイマー状態管理
  const [isInPracticeMode, setIsInPracticeMode] = useState(false);
  const [practiceTimeLeft, setPracticeTimeLeft] = useState(120);
  
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

  // 2分タイマーのカウントダウン
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isInPracticeMode && practiceTimeLeft > 0) {
      interval = setInterval(() => {
        setPracticeTimeLeft(prev => {
          if (prev <= 1) {
            setIsInPracticeMode(false);
            setPracticeTimeLeft(120);
            
            const nextIndex = currentSectionIndex + 1;
            if (nextIndex < audioUrls.length) {
              console.log('🔇 2分間完了 - 次のセクションへ');
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
  }, [isInPracticeMode, practiceTimeLeft, currentSectionIndex, audioUrls.length]);

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

  // セクションタイプを判定
  const getSectionInfo = (sectionIndex: number) => {
    const isInstructionSection = (sectionIndex + 1) % 2 === 0;
    
    if (isInstructionSection) {
      const stageNumber = Math.floor(sectionIndex / 2) + 1;
      return {
        type: 'instruction',
        label: `Stage${stageNumber} - 2分指示`,
        description: '2分間の実践指示'
      };
    } else {
      const stageNumber = Math.floor(sectionIndex / 2) + 1;
      const stageNames = ['理解と受容', 'クールダウン', '前向きな転換'];
      return {
        type: 'content',
        label: `Stage${stageNumber} - ${stageNames[stageNumber - 1]}`,
        description: stageNames[stageNumber - 1]
      };
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
    if (!audioUrls[sectionIndex] || isPlaying || isInPracticeMode) return;
    
    try {
      // BGM開始（最初のセクションのみ）
      if (sectionIndex === 0 && bgmAudio && !isBgmPlaying) {
        try {
          bgmAudio.currentTime = 0;
          bgmAudio.volume = 0.3;
          const playPromise = bgmAudio.play();
          if (playPromise !== undefined) {
            await playPromise;
            setIsBgmPlaying(true);
            console.log('🎵 BGM開始');
          }
        } catch (error) {
          console.log('BGM再生失敗:', error);
        }
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

      const sectionInfo = getSectionInfo(sectionIndex);
      console.log(`▶️ ${sectionInfo.label} 再生開始`);

      audio.onended = () => {
        console.log(`✅ ${sectionInfo.label} 再生終了`);
        console.log(`🔍 DEBUG: sectionIndex = ${sectionIndex}`);
        setIsPlaying(false);
        
        // セクション2,4,6（練習セクション）の後は2分タイマー開始
        if (sectionIndex === 1 || sectionIndex === 3 || sectionIndex === 5) {
          console.log('🔇 2分間実践タイマー開始...');
          setIsInPracticeMode(true);
          setPracticeTimeLeft(120);
        } else {
          // セクション1,3,5（文章セクション）の後はすぐ次のセクション（練習）へ
          console.log('📝 次のセクションへ進む条件に入った');
          const nextIndex = sectionIndex + 1;
          if (nextIndex < audioUrls.length) {
            console.log('📝 次の練習セクションへ');
            setCurrentSectionIndex(nextIndex);
            playSection(nextIndex);
          } else {
            handleSessionComplete();
          }
        }
      };.label} 再生終了`);
        setIsPlaying(false);
        
        // セクション2,4,6（練習セクション）の後は2分タイマー開始
        if (sectionIndex === 1 || sectionIndex === 3 || sectionIndex === 5) {
          console.log('🔇 2分間実践タイマー開始...');
          setIsInPracticeMode(true);
          setPracticeTimeLeft(120);
        } else {
          // セクション1,3,5（文章セクション）の後はすぐ次のセクション（練習）へ
          const nextIndex = sectionIndex + 1;
          if (nextIndex < audioUrls.length) {
            console.log('📝 次の練習セクションへ');
            setCurrentSectionIndex(nextIndex);
            playSection(nextIndex);
          } else {
            handleSessionComplete();
          }
        }
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
    setIsPaused(false);
    setCurrentSectionIndex(0);
    setIsInPracticeMode(false);
    setPracticeTimeLeft(120);
    
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
    if (!audioUrls.length || isPlaying || isInPracticeMode) return;
    
    // BGM開始
    if (bgmAudio && !isBgmPlaying) {
      bgmAudio.currentTime = 0;
      bgmAudio.volume = 0.3;
      
      try {
        const playPromise = bgmAudio.play();
        if (playPromise !== undefined) {
          await playPromise;
          setIsBgmPlaying(true);
          console.log('🎵 BGM再生開始');
        }
      } catch (error) {
        console.error('BGM再生エラー:', error);
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

  // 現在のセクション情報を取得
  const currentSectionInfo = getSectionInfo(currentSectionIndex);

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
                placeholder="例）彼をブロックしてしまいそうです"
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
                  if (!isPlaying && !isPaused && !isInPracticeMode) {
                    playAudio();
                  } else if (isPlaying) {
                    pauseAudio();
                  } else if (isPaused) {
                    resumeAudio();
                  }
                }}
                disabled={isInPracticeMode}
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  border: "2px solid #ffffdd",
                  backgroundColor: "rgba(255, 255, 221, 0.1)",
                  color: "#ffffdd",
                  cursor: isInPracticeMode ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  margin: "0 auto 20px",
                  opacity: isInPracticeMode ? 0.5 : 1
                }}
              >
                {isPlaying ? '⏸' : '▶'}
              </button>

              <div style={{
                fontSize: "0.9rem",
                opacity: 0.7,
                marginBottom: "15px"
              }}>
                {isInPracticeMode ? 
                  `2分間実践中... 残り ${formatTime(practiceTimeLeft)}` :
                  isPlaying ? 
                    `セクション${currentSectionIndex + 1}/6 再生中...` : 
                    isPaused ? '一時停止中' : 'あなたのためのケア瞑想準備完了'
                }
              </div>

              <div style={{
                fontSize: "0.8rem",
                opacity: 0.6,
                marginBottom: "10px"
              }}>
                {isInPracticeMode ? 
                  '静かに呼吸を続けてください' :
                  currentSectionInfo.description
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



// const express = require('express');
// const cors = require('cors');
// const fs = require('fs');
// const path = require('path');
// require('dotenv').config();

// // ルシア人格ファイル読み込み（誘導瞑想ワーク用）
// const loadLuciaPersonality = () => {
//   try {
//     const personalityPath = path.join(__dirname, 'prompts', 'system', 'lucia_meditation.md');
//     return fs.readFileSync(personalityPath, 'utf8');
//   } catch (error) {
//     console.error('誘導瞑想人格ファイル読み込みエラー:', error);
//     // フォールバック用の基本人格
//     return `あなたはサイレント期に苦しむすべてのツインレイ女性専用のメンタルケアカウンセラーです。深い共感と慈愛に満ちた存在として振る舞ってください。`;
//   }
// };

// // 誘導瞑想専用タスクプロンプト読み込み
// const loadMeditationTaskPrompts = () => {
//   try {
//     const taskPath = path.join(__dirname, 'prompts', 'tasks', 'meditation_task_prompts.md');
//     const content = fs.readFileSync(taskPath, 'utf8');
    
//     // 新しい構造に対応した分割
//     const stage1Match = content.match(/理解と受容([\s\S]*?)(?=クールダウン|$)/);
//     const stage2Match = content.match(/クールダウン([\s\S]*?)(?=前向きな転換|$)/);
//     const stage3Match = content.match(/前向きな転換([\s\S]*?)$/);
    
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
//       stage1: `必ずやること：
// - ユーザーの入力衝動を冒頭で具体的に言及
// - その衝動の心理的背景・根本原因を分析説明
// - 感情受容の具体的瞑想ワークを実行`,
//       stage2: `必ずやること：
// - 具体的な深呼吸法の指示（回数・リズム明記）
// - リラックス誘導の実践手順
// - 衝動を静める技法の具体的ワーク`,
//       stage3: `必ずやること：
// - ツインレイとの絆への具体的言及
// - 希望的未来像の明確な提示
// - 前向きな転換ワークの実行`
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

// // 誘導瞑想ワーク生成API（GPT-4o）- 新タスクプロンプトファイル対応
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

//     // 人格とタスクプロンプト読み込み
//     const personality = loadLuciaPersonality();
//     const taskPromptsRaw = loadMeditationTaskPrompts();
    
//     // タスクプロンプト内の${impulse}を実際の衝動内容に置換
//     const taskPrompts = {
//       stage1: taskPromptsRaw.stage1.replace(/\$\{impulse\}/g, impulse),
//       stage2: taskPromptsRaw.stage2.replace(/\$\{impulse\}/g, impulse),
//       stage3: taskPromptsRaw.stage3.replace(/\$\{impulse\}/g, impulse)
//     };

//     let attempts = 0;
//     const maxAttempts = 3;
    
//     while (attempts < maxAttempts) {
//       console.log('🧘 OpenAI API呼び出し開始...');
//       const completion = await openai.chat.completions.create({
//         model: "gpt-4o",
//         messages: [{
//           role: "system", 
//           content: `${personality}

// ${taskPrompts.stage1}

// ${taskPrompts.stage2}

// ${taskPrompts.stage3}

// 上記の人格設定とタスクプロンプトに従って、3つの段階を含む1つの連続した誘導瞑想テキストを生成してください。各段階は改行で区切ってください。必ず各段階の必須タスクをすべて実行してください。`
//         }, {
//           role: "user",
//           content: `衝動内容: ${impulse}

// この衝動に対して、ルシアの人格とタスクプロンプトに従った完全カスタマイズ誘導瞑想を作成してください。必ず3つの段階すべての必須タスクを実行してください。`
//         }],
//         max_tokens: 2500,
//         temperature: 0.7
//       });
      
//       console.log('🧘 OpenAI API呼び出し成功');
//       const aiResponse = completion.choices[0].message.content;
//       console.log(`🧘 誘導瞑想生成完了 (試行${attempts + 1})`);
//       console.log('🧘 生成されたテキスト全文:', aiResponse);
      
//       // テキストを3つのセクションに分割
//       const sections = parseGeneratedMeditation(aiResponse);
      
//       console.log('🧘 分割後の各セクション全文:');
//       sections.forEach((section, index) => {
//         console.log(`セクション${index + 1}:`, section);
//       });
      
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

// // 音声生成API
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

// // ヘルスチェック
// app.get('/health', (req, res) => {
//   res.json({ status: 'OK', timestamp: new Date().toISOString() });
// });

// サーバー起動
app.listen(PORT, () => {
  console.log(`🧘 誘導瞑想サーバーがポート${PORT}で起動しました`);
  console.log(`ヘルスチェック: http://localhost:${PORT}/health`);
  console.log('利用可能なAPI:');
  console.log('- POST /api/generate-meditation (誘導瞑想生成)');
  console.log('- POST /api/generate-audio (音声生成)');
});


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
//   console.log('- POST /api/channeling-practice-3 (チャネリング練習3) ✅上級レベル');
//   console.log('- POST /api/generate-audio (音声生成)');
//   console.log('- POST /api/interpret-words (ワード読み解き) ✅GPT-4o統一');
// });





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

// // 誘導瞑想専用人格ファイル読み込み
// const loadMeditationPersonality = () => {
//   try {
//     const personalityPath = path.join(__dirname, 'prompts', 'system', 'lucia_meditation.md');
//     return fs.readFileSync(personalityPath, 'utf8');
//   } catch (error) {
//     console.error('誘導瞑想人格ファイル読み込みエラー:', error);
//     console.error('ファイルパス:', path.join(__dirname, 'prompts', 'system', 'lucia_meditation.md'));
//     // フォールバック用の基本人格
//     return `あなたはサイレント期のツインレイ女性専用のメンタルケアカウンセラーです。ユーザーの具体的な衝動に完全特化したカスタマイズ誘導瞑想を提供してください。`;
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

// // OpenAI版（本番用）
// const { OpenAI } = require('openai');
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// // Claude版バックアップ（将来使用）
// // const callClaudeAPI = async (systemPrompt, userMessage) => {
// //   const response = await fetch('https://api.anthropic.com/v1/messages', {
// //     method: 'POST',
// //     headers: {
// //       'x-api-key': process.env.ANTHROPIC_API_KEY,
// //       'content-type': 'application/json',
// //       'anthropic-version': '2023-06-01'
// //     },
// //     body: JSON.stringify({
// //       model: 'claude-3-5-sonnet-20241022',
// //       max_tokens: 1500,
// //       system: systemPrompt,
// //       messages: [{ role: 'user', content: userMessage }]
// //     })
// //   });
// //   const data = await response.json();
// //   return data.content[0].text;
// // };

// // Google Cloud TTSクライアント初期化
// const ttsClient = new textToSpeech.TextToSpeechClient({
//   apiKey: process.env.GOOGLE_CLOUD_API_KEY,
// });

// // 誘導瞑想ワーク生成API（GPT-4o）
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

//     // 誘導瞑想専用人格ファイル読み込み
//     const meditationPersonality = loadMeditationPersonality();

//     let attempts = 0;
//     const maxAttempts = 3;
    
//     while (attempts < maxAttempts) {
//       console.log('🧘 OpenAI API呼び出し開始...');
//       const completion = await openai.chat.completions.create({
//         model: "gpt-4o",
//         messages: [{
//           role: "system", 
//           content: `あなたはサイレント期のツインレイ女性専用のカウンセラーです。

// ユーザーの具体的な衝動を分析し、その人だけのための完全カスタマイズ誘導瞑想を作成してください。

// 必須の構成:
// 1. 冒頭でユーザーの状況を理解していることを示す
//    例：「彼にLINEを送りたい衝動と戦っているあなたへ」
// 2. その衝動の心理的背景を説明
//    例：「連絡したくなるのは、彼への愛と不安の表れです」
// 3. 具体的なクールダウン方法を3段階で提示
// 4. 各段階後に30秒の実践時間

// 重要な注意事項:
// - 記号（#、*、-等）は一切使用禁止
// - 見出しやタイトルも音声に含めない
// - ユーザーの入力内容を必ず冒頭で言及する
// - 一般論ではなく、その人の状況に特化した内容にする
// - 優しく共感的な語りかけ`
//         }, {
//           role: "user",
//           content: `私は今このような状況です：${impulse}

// この状況にいる私だけのために、完全にカスタマイズされた誘導瞑想を作成してください。

// 必ず以下を含めてください：
// - 冒頭で私の具体的な状況への理解を示す
// - なぜその衝動が起きるのかの心理的説明
// - その衝動に特化した具体的なクールダウン方法
// - 記号や見出しは一切使わない
// - 私の入力内容を踏まえた完全オリジナル内容`
//         }],
//         max_tokens: 2000,
//         temperature: 0.7
//       });
      
//       console.log('🧘 OpenAI API呼び出し成功');
//       const aiResponse = completion.choices[0].message.content;
//       console.log(`🧘 誘導瞑想生成完了 (試行${attempts + 1})`);
      
//       // NGワードフィルター適用
//       const filtered = ngFilter.filterResponse(aiResponse, maxAttempts - attempts - 1);
      
//       if (!filtered.needsRegeneration) {
//         console.log('🧘 レスポンス送信:', filtered.text.substring(0, 100) + '...');
//         return res.json({ 
//           text: filtered.text,
//           success: true 
//         });
//       }
      
//       attempts++;
//       console.log(`🧘 NGワード検出 - 再生成中 (${attempts}/${maxAttempts})`);
//     }

//   } catch (error) {
//     console.error('🧘 誘導瞑想生成エラー:', error);
//     console.error('🧘 エラー詳細:', error.message);
//     res.status(500).json({ 
//       error: '誘導瞑想生成に失敗しました',
//       details: error.message 
//     });
//   }
// });

// // チャネリングテキスト生成API（OpenAI版）
// app.post('/api/generate-channeling', async (req, res) => {
//   console.log('🚀🚀🚀 API呼び出し確認 (OpenAI版) 🚀🚀🚀');
//   try {
//     const { question } = req.body;

//     if (!question) {
//       return res.status(400).json({ error: '質問が必要です' });
//     }

//     console.log('チャネリング生成リクエスト (OpenAI版):', question);

//     // ルシア人格ファイル読み込み（使用する場合）
//     // const luciaPersonality = loadLuciaPersonality();

//     let attempts = 0;
//     const maxAttempts = 3;
    
//     while (attempts < maxAttempts) {
//       // OpenAI版（GPT-4o統一）
//       const completion = await openai.chat.completions.create({
//         model: "gpt-4o",
//         messages: [{
//           role: "system", 
//           content: "あなたはチャネリング指導者です。ユーザーの質問に対して、瞑想的で神聖なチャネリング指導テキストを生成してください。"
//         }, {
//           role: "user",
//           content: `質問: ${question}`
//         }],
//         max_tokens: 1500,
//         temperature: 0.7
//       });
//       const aiResponse = completion.choices[0].message.content;
      
//       console.log(`チャネリング生成完了 (OpenAI版 - 試行${attempts + 1})`);
      
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
//     console.error('チャネリング生成エラー (OpenAI版):', error);
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
//   console.log('- POST /api/generate-channeling (チャネリング生成) ✅GPT-4o統一');
//   console.log('- POST /api/generate-meditation (誘導瞑想生成) ✅GPT-4o統一');
//   console.log('- POST /api/generate-audio (音声生成)');
//   console.log('- POST /api/interpret-words (ワード読み解き) ✅GPT-4o統一');
// });
// const express = require('express');
// const cors = require('cors');
// const fs = require('fs');
// const path = require('path');
// require('dotenv').config();

// // ルシア人格ファイル読み込み
// const loadLuciaPersonality = () => {
//   try {
//     const personalityPath = path.join(__dirname, 'prompts', 'system', 'lucia_system_prompt.md');
//     return fs.readFileSync(personalityPath, 'utf8');
//   } catch (error) {
//     console.error('人格ファイル読み込みエラー:', error);
//     console.error('ファイルパス:', path.join(__dirname, 'prompts', 'system', 'lucia_system_prompt.md'));
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

// // OpenAI版（本番用）
// const { OpenAI } = require('openai');
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// // Claude版バックアップ（将来使用）
// // const callClaudeAPI = async (systemPrompt, userMessage) => {
// //   const response = await fetch('https://api.anthropic.com/v1/messages', {
// //     method: 'POST',
// //     headers: {
// //       'x-api-key': process.env.ANTHROPIC_API_KEY,
// //       'content-type': 'application/json',
// //       'anthropic-version': '2023-06-01'
// //     },
// //     body: JSON.stringify({
// //       model: 'claude-3-5-sonnet-20241022',
// //       max_tokens: 1500,
// //       system: systemPrompt,
// //       messages: [{ role: 'user', content: userMessage }]
// //     })
// //   });
// //   const data = await response.json();
// //   return data.content[0].text;
// // };

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
//       // OpenAI版（本番）
//       const completion = await openai.chat.completions.create({
//         model: "ft:gpt-3.5-turbo-0125:parsonal::BpC8FstH",
//         messages: [{
//           role: "system", 
//           content: luciaPersonality + "\n\nユーザーの質問に対して、瞑想的で神聖なチャネリング指導テキストを生成してください。"
//         }, {
//           role: "user",
//           content: `質問: ${question}`
//         }],
//         max_tokens: 1500,
//         temperature: 0.7
//       });
//       const aiResponse = completion.choices[0].message.content;
      
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
//       // OpenAI版（本番）
//       const completion = await openai.chat.completions.create({
//         model: "ft:gpt-3.5-turbo-0125:parsonal::BpC8FstH",
//         messages: [{
//           role: "system", 
//           content: luciaPersonality + "\n\nチャネリングで受け取った言葉を深く読み解き、美しく神秘的な解釈を提供してください。"
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