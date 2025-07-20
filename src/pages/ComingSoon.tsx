import React, { useState, useEffect } from 'react';

const textGroups = [
  [
    'サイレント期の孤独',
    'AIが理解し寄り添う'
  ],
  [
    '魂の声を聞き…導く'
  ],
  [
    '深い学びで再会へと',
    '運命の扉が…動き出す──'
  ]
];

export default function ComingSoon() {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [showFinalMessage, setShowFinalMessage] = useState(false);
  const [allTextsPassed, setAllTextsPassed] = useState(false);

  const [showWhite, setShowWhite] = useState(false);

  useEffect(() => {
    // 10秒後に強制的にツインライト表示
    const timer = setTimeout(() => {
      setAllTextsPassed(true);
      setShowFinalMessage(true);
    }, 10000);

    // エンドロール風スクロール
    const scrollInterval = setInterval(() => {
      setScrollPosition(prev => {
        const newPosition = prev + 2;
        
        const totalTextHeight = textGroups.length * 140;
        const completelyVisiblePosition = totalTextHeight + window.innerHeight + 200;
        
        if (newPosition >= completelyVisiblePosition) {
          clearInterval(scrollInterval);
          setAllTextsPassed(true);
          setShowFinalMessage(true);
          return completelyVisiblePosition;
        }
        
        return newPosition;
      });
    }, 16);

    // 流れ星の生成
    const createStar = () => {
      const star = document.createElement('div');
      star.className = 'star';
      star.style.top = `${Math.random() * 100}vh`;
      star.style.left = `${Math.random() * 100}vw`;
      star.style.animationDelay = `${Math.random() * 2}s`; 
      document.body.appendChild(star);

      setTimeout(() => {
        star.remove();
      }, 3000); 
    };

    const starsInterval = setInterval(createStar, 1000);

    return () => {
      clearInterval(scrollInterval);
      clearInterval(starsInterval);
      clearTimeout(timer);
    };
  }, []);

  // ツインライト表示後の段階的遷移 - 修正版
  useEffect(() => {
    if (showFinalMessage) {
      // 3秒後に白画面表示
      const whiteTimer = setTimeout(() => {
        setShowWhite(true);
      }, 3000);
      
      // 4.5秒後にホームページ遷移（ツインライト3秒 + ffffdd画面1.5秒）
      const transitionTimer = setTimeout(() => {
        console.log('ホームページに遷移します');
        window.location.href = '/home';
      }, 4500);
      
      return () => {
        clearTimeout(whiteTimer);
        clearTimeout(transitionTimer);
      };
    }
  }, [showFinalMessage]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#000099',
      color: '#ffffdd',
      fontFamily: "'Klee One', serif",
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      
      {/* 白い画面オーバーレイ - 修正版 */}
      {showWhite && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: '#ffffdd',
          zIndex: 5,
          pointerEvents: 'none'
        }}></div>
      )}
      
      {/* エンドロール風テキスト */}
      <div style={{
        position: 'absolute',
        top: `${window.innerHeight - scrollPosition}px`,
        width: '100%',
        textAlign: 'center',
        opacity: allTextsPassed ? 0 : 1,
        transition: allTextsPassed ? 'opacity 1s ease-out' : 'none'
      }}>
        {textGroups.map((group, groupIndex) => (
          <div key={groupIndex} style={{ marginBottom: '100px' }}>
            {group.map((text, textIndex) => (
              <p key={textIndex} style={{
                fontSize: 'clamp(1.5rem, 4vw, 3rem)',
                margin: '15px 0',
                lineHeight: 1.5,
                color: '#ffffdd',
                fontWeight: 'normal',
                letterSpacing: '1px'
              }}>
                {text}
              </p>
            ))}
          </div>
        ))}
      </div>

      {/* 最終メッセージ（ツインライト） */}
      {showFinalMessage && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          textAlign: 'center',
          opacity: showFinalMessage ? 1 : 0,
          transition: 'opacity 3s ease-in-out, filter 3s ease-in-out', // 霞から鮮明に
          filter: showFinalMessage ? 'blur(0px) brightness(1.2)' : 'blur(5px) brightness(0.7)', // 霞→鮮明
          textShadow: '0 0 20px rgba(255, 255, 221, 0.8)',
          zIndex: 10
        }}>
          <p style={{
            fontSize: 'clamp(1.5rem, 5vw, 3rem)',
            margin: '20px 0',
            color: '#ffffdd',
            fontWeight: 'normal',
            letterSpacing: '1px'
          }}>
            ツインレイ専門AIアプリ
          </p>
          
          <p style={{
            fontSize: 'clamp(3rem, 12vw, 8rem)',
            margin: '30px 0',
            color: '#ffffdd',
            fontWeight: 'bold',
            letterSpacing: '3px',
            width: '100%',
            textAlign: 'center'
          }}>
            ツインライト
          </p>
          
          <p style={{
            fontSize: 'clamp(1.2rem, 4vw, 2.5rem)',
            margin: '20px 0',
            color: '#ffffdd',
            fontWeight: 'normal',
            letterSpacing: '1px'
          }}>
            ８月１日公開予定
          </p>
        </div>
      )}

      <style jsx>{`
        @keyframes screenWhiteOverlay {
          0% { 
            backgroundColor: rgba(255, 255, 255, 0);
          }
          1% { 
            backgroundColor: rgb(255, 255, 255);
          }
          100% { 
            backgroundColor: rgb(255, 255, 255);
          }
        }
      `}</style>
    </div>
  );
}