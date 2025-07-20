


// import { useNavigate, useLocation } from "react-router-dom";
// import { useEffect, useState } from "react";

// type SoulType = "消失型" | "投影型" | "自罰型" | "抜け殻型" | "希望恐怖型" | "混乱型";

// export default function Result() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [soulType, setSoulType] = useState<SoulType>("消失型"); // デフォルト値

//   useEffect(() => {
//     // Diagnosis.tsxから渡された結果を取得
//     if (location.state?.result) {
//       setSoulType(location.state.result);
//     }
//   }, [location.state]);

//   const menus = [
//     "24時間寄り添い相談",
//     "過去世リーディングセッション",
//     "自己対話セッション",
//     "魂の設計図を読むセッション",
//     "今生のテーマを知るリーディング",
//   ];

//   return (
//     <div
//       style={{
//         backgroundColor: "#000099",
//         color: "#ffffdd",
//         minHeight: "100vh",
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         paddingTop: "60px",
//         fontFamily: "'Klee One', sans-serif",
//       }}
//     >
//       {/* メインタイトル（h1） */}
//       <h1 style={{ fontSize: "1.25rem", marginBottom: "0.5rem", fontWeight: "normal" }}>
//         現在の魂の状態は
//       </h1>

//       {/* タイプ名 - 上下線のみ */}
//       <h2 style={{ 
//         color: "#FF6600", // オレンジ色のまま
//         fontSize: "1.75rem", 
//         marginBottom: "1rem",
//         padding: "12px 24px",
//         borderTop: "2px solid #FFD700", // 上線はゴールド
//         borderBottom: "2px solid #FFD700", // 下線はゴールド
//         display: "inline-block",
//       }}>
//         {soulType}
//       </h2>

//       {/* 導きの見出し */}
//       <h2 style={{ fontSize: "1.25rem", marginBottom: "1.5rem" }}>
//         あなたに今必要な導き
//       </h2>

//       {/* メニューボタン群 → ハイパーリンク風に変更 */}
//       <div
//         style={{
//           width: "100%",
//           display: "flex",
//           flexDirection: "column",
//           alignItems: "center",
//           gap: "16px",
//           paddingTop: "60px", // 40px → 60px に増加
//         }}
//       >
//         {menus.map((menu, index) => (
//           <a
//             key={index}
//             href="#"
//             onClick={(e) => {
//               e.preventDefault();
//               if (menu === "24時間寄り添い相談") {
//                 navigate("/24h");
//               }
//             }}
//             style={{
//               color: "#ffffdd",
//               fontSize: "18px",
//               textDecoration: "underline",
//               transition: "all 0.3s ease",
//               padding: "8px",
//             }}
//             onMouseEnter={(e) => {
//               e.currentTarget.style.textShadow = "0 0 20px #ffffff, 0 0 40px #ffffff, 0 0 60px #ffffff"; // 影を重ねて強い光に
//               e.currentTarget.style.color = "#ffffff";
//             }}
//             onMouseLeave={(e) => {
//               e.currentTarget.style.textShadow = "none";
//               e.currentTarget.style.color = "#ffffdd";
//             }}
//           >
//             {menu}
//           </a>
//         ))}
//       </div>
//     </div>
//   );
// }
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

type SoulType = "消失型" | "投影型" | "自罰型" | "抜け殻型" | "希望恐怖型" | "混乱型";

export default function Result() {
  const navigate = useNavigate();
  const location = useLocation();
  const [soulType, setSoulType] = useState<SoulType>("消失型"); // デフォルト値


//削除予定

 useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/comingsoon");
    }, 10000); // 診断結果表示から10秒後に遷移

        return () => clearTimeout(timer);
  }, [navigate]);
  // ★ここまで追加・修正する部分★

//削除予定




  useEffect(() => {
    // Diagnosis.tsxから渡された結果を取得
    if (location.state?.result) {
      setSoulType(location.state.result);
    }
  }, [location.state]);

  // タイプ名演出用のuseEffect（追加分）
  useEffect(() => {
    const timer = setTimeout(() => {
      const elements = document.querySelectorAll('.type-highlight');
      elements.forEach(element => {
        element.classList.add('shine-animation');
        setTimeout(() => element.classList.remove('shine-animation'), 1000);
      });
    }, 800);
    return () => clearTimeout(timer);
  }, [soulType]);

  const menus = [
    "24時間寄り添い相談",
    "過去世リーディングセッション",
    "自己対話セッション",
    "魂の設計図を読むセッション",
    "今生のテーマを知るリーディング",
  ];


  return (
    <div
      style={{
        backgroundColor: "#000099",
        color: "#ffffdd",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "30px", // 60px → 30px に半分
        fontFamily: "'Klee One', sans-serif",
      }}
    >
      {/* メインタイトル（h1） */}
      <h1 style={{ fontSize: "1.25rem", marginBottom: "0.5rem", fontWeight: "normal" }}>
        現在の魂の状態は
      </h1>

      {/* タイプ名 - 上下線のみ（className="type-highlight"を追加） */}
      <h2 
        className="type-highlight"
        style={{ 
          color: "#FF6600", // オレンジ色のまま
          fontSize: "1.75rem", 
          marginBottom: "1rem",
          padding: "12px 24px",
          borderTop: "2px solid #FFD700", // 上線はゴールド
          borderBottom: "2px solid #FFD700", // 下線はゴールド
          display: "inline-block",
        }}
      >
        {soulType}
      </h2>

      {/* タイプ説明文 */}
      <div style={{ 
        maxWidth: "600px", 
        margin: "0 10px", // 1rem → 10px
        padding: "0",
        textAlign: "left", // center → left
        lineHeight: "1.6",
        fontSize: "16px"
      }}>
        {soulType === "消失型" && (
          <p>このタイプは相手が急に離れてしまうことが多く、強い喪失感を抱えやすい特徴があります。ご縁の行方や、あなた自身が今できることを一緒に見つけていきましょう。</p>
        )}
        {soulType === "投影型" && (
          <p>このタイプは相手に自分の思いを重ねやすく、相手の反応で心が大きく揺れてしまうことがあります。あなたの中の本当の願いを見つけるサポートをいたします。</p>
        )}
        {soulType === "自罰型" && (
          <p>このタイプは「自分が悪いのでは」と自分を責めやすく、苦しさを抱え込みやすい特徴があります。あなたがもっと優しく自分を抱きしめられるようお手伝いします。</p>
        )}
        {soulType === "抜け殻型" && (
          <p>このタイプは感情を感じないようにして心を守る傾向があり、無気力や孤独感に悩むことがあります。閉じ込めた気持ちを優しく解きほぐすお手伝いをいたします。</p>
        )}
        {soulType === "希望恐怖型" && (
          <p>このタイプは「うまくいくかもしれない」という希望と「失うかもしれない」という恐れの間で揺れ動きやすい特徴があります。安心して進めるタイミングを一緒に整えましょう。</p>
        )}
        {soulType === "混乱型" && (
          <p>このタイプは感情や状況が複雑に絡み合い、どうしたらいいのか分からなくなりやすい特徴があります。今の状況を整理し、進む方向を一緒に見つけていきましょう。</p>
        )}
      </div>

      {/* 1.5行あける */}
      <div style={{ height: "36px" }}></div>

      {/* 導きの見出し - 目立たせる */}
      <h2 style={{ 
        fontSize: "1.5rem", // 1.25rem → 1.5rem に大きく
        marginBottom: "1rem",
        color: "#FFD700", // ゴールド色で目立たせる
        textShadow: "0 0 10px rgba(255, 215, 0, 0.5)", // 光る効果
        fontWeight: "bold"
      }}>
        あなたに今必要な導き
      </h2>

      {/* メニューボタン群 → ハイパーリンク風に変更 */}
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
          paddingTop: "24px", // 40px → 60px に増加 → 24px に変更（1行あけ程度）
        }}
      >
        {menus.map((menu, index) => (
          <a
            key={index}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (menu === "24時間寄り添い相談") {
                navigate("/24h");
              }
            }}
            style={{
              color: "#ffffdd",
              fontSize: "18px",
              textDecoration: "underline",
              transition: "all 0.3s ease",
              padding: "8px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.textShadow = "0 0 20px #ffffff, 0 0 40px #ffffff, 0 0 60px #ffffff"; // 影を重ねて強い光に
              e.currentTarget.style.color = "#ffffff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.textShadow = "none";
              e.currentTarget.style.color = "#ffffdd";
            }}
          >
            {menu}
          </a>
        ))}
      </div>
    </div>
  );
}
