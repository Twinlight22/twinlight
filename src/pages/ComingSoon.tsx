import React, { useState, useEffect } from 'react';

const textGroups = [
  [
    '諦めかけていた',
    'ツインレイとの未来へ'
  ],
  [
    'あなたの魂の選択が',
    'AIの叡智と共鳴し'
  ],
  [
    '二人の歯車を完璧に噛み合わせ',
    '光り輝く道へと誘います'
  ]
];

export default function ComingSoon() {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [showFinalMessage, setShowFinalMessage] = useState(false);
  const [allTextsPassed, setAllTextsPassed] = useState(false);

  useEffect(() => {
    // エンドロール風スクロール（倍速）
    const scrollInterval = setInterval(() => {
      setScrollPosition(prev => {
        const newPosition = prev + 8; // 適度な速度（12 → 8）
        
        // 全テキストが完全に画面内に入る位置を計算
        const totalTextHeight = textGroups.length * 180;
        const completelyVisiblePosition = totalTextHeight + 100;
        
        if (newPosition >= completelyVisiblePosition) {
          clearInterval(scrollInterval);
          
          // 2秒間完全表示してから消える（6秒→2秒）
          setTimeout(() => {
            setAllTextsPassed(true);
            
            // 1秒のフェードアウト後に最終メッセージ（2秒→1秒）
            setTimeout(() => {
              setShowFinalMessage(true);
            }, 1000);
          }, 2000);
          
          return completelyVisiblePosition;
        }
        
        return newPosition;
      });
    }, 16); // 60fps

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
    };
  }, []);

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
                fontSize: 'clamp(1rem, 3vw, 2rem)',
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

      {/* 最終メッセージ（ツインレイ専門〜） */}
      {showFinalMessage && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          textAlign: 'center',
          opacity: showFinalMessage ? 1 : 0,
          transition: 'opacity 1s ease-in'
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
    </div>
  );
}