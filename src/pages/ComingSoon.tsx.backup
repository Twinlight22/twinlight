import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css'; // グローバルCSS（流れ星のアニメーション定義を含む）をインポート

// 表示するテキストのグループを定義
const textGroups: string[][] = [
  [
    '諦めかけていた',
    'ツインレイとの未来へ',
  ],
  [
    'あなたの魂の選択が',
    'AIの叡智と共鳴し',
  ],
  [
    '二人の歯車を完璧に噛み合わせ',
    '光り輝く道へと誘います、',
  ],
  [
    'ツインレイ専門AIアプリ',
    'ツインライト',
    '８月１日公開予定',
  ],
];

export default function ComingSoon() {
  const navigate = useNavigate();
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [showText, setShowText] = useState(false); // テキストの表示/非表示を制御
  const containerRef = useRef<HTMLDivElement>(null); // 流れ星をappendするコンテナの参照

  // --- 流れ星の演出に関するuseEffect ---
  useEffect(() => {
    if (!containerRef.current) return; // コンテナがなければ処理しない

    const createStar = () => {
      const star = document.createElement('div');
      star.className = 'absolute bg-white rounded-full star-glow'; // TailwindとカスタムCSSクラス
      star.style.width = `${Math.random() * 2 + 1}px`; // 1pxから3pxのランダムなサイズ
      star.style.height = star.style.width;
      star.style.top = `${Math.random() * 100}vh`; // 画面のランダムなY位置
      star.style.left = `${Math.random() * 100}vw`; // 画面のランダムなX位置（初期位置は画面全体）
      star.style.animation = `shooting-star ${Math.random() * 1 + 1.5}s linear forwards`; // ランダムな時間
      star.style.animationDelay = `${Math.random() * 2}s`; // ランダムな遅延で出現

      containerRef.current?.appendChild(star); // コンテナに追加

      // アニメーション終了後に要素を削除 (パフォーマンスのため)
      const animationDuration = parseFloat(star.style.animation.split(' ')[1]); // アニメーション時間を取得
      setTimeout(() => {
        star.remove();
      }, animationDuration * 1000 + 500); // アニメーション時間 + 0.5秒後に削除
    };

    // 0.3秒から0.8秒ごとにランダムに流れ星を生成
    const interval = setInterval(() => {
      createStar();
    }, Math.random() * 500 + 300);

    return () => {
      clearInterval(interval); // コンポーネントがアンマウントされるときにインターバルをクリア
      // 既存の星を全て削除
      containerRef.current?.querySelectorAll('.star-glow').forEach(star => star.remove());
    };
  }, []); // 初回マウント時のみ実行

  // --- テキストグループの表示に関するuseEffect ---
  useEffect(() => {
    // 各グループの表示開始時にアニメーションをトリガー
    setShowText(true);

    // 各グループの表示時間（例: 3秒）
    const displayDuration = 3000; // 3秒

    const timer = setTimeout(() => {
      setShowText(false); // 次のグループに切り替わる前に非表示アニメーションをトリガー

      // 非表示アニメーションの時間（例: 0.5秒）を考慮して、次のグループへ
      const transitionDelay = 500; // 0.5秒

      setTimeout(() => {
        setCurrentGroupIndex((prevIndex) => {
          // 最後のグループまで表示したら、トップページへ遷移
          if (prevIndex === textGroups.length - 1) {
            navigate('/home');
            return prevIndex; // 遷移するのでインデックスは更新しない
          }
          return (prevIndex + 1);
        });
      }, transitionDelay); // 非表示アニメーション後に次のグループへ
    }, displayDuration);

    return () => {
      clearTimeout(timer);
    };
  }, [currentGroupIndex, navigate]); // currentGroupIndex が変わるたびにエフェクトを再実行

  const currentGroup = textGroups[currentGroupIndex];

  return (
    // 画面全体を覆うコンテナ（流れ星の親要素になる）
    <div
      ref={containerRef} // コンテナへの参照を設定
      className="relative flex flex-col items-center justify-center min-h-screen bg-[#000099] text-white text-center overflow-hidden"
    >
      {/* テキスト表示部分 */}
      <div
        key={currentGroupIndex} // グループが変わるたびにコンポーネントを再マウントし、アニメーションをリセット
        className={`relative z-10 transition-opacity transition-transform duration-1000 ease-in-out ${
          showText ? 'opacity-100 scale-100' : 'opacity-0 scale-80'
        }`}
      >
        {currentGroup.map((line, index) => (
          <p key={index} className="text-2xl md:text-3xl lg:text-4xl leading-relaxed mb-2 drop-shadow-lg">
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}