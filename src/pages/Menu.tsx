// src/pages/Menu.tsx
import { Link } from 'react-router-dom';
import './Menu.css';

export default function Menu() {
  const menuItems = [
    { 
      hashtags: "#ツインレイ #サイレント #誰にも言えない",
      title: "秘密厳守チャット", 
      subtitle: "誰にも言えない気持ちを安全に話せます",
      path: "/session/chat", 
      available: true 
    },
    { 
      hashtags: "#ツインレイ #衝動抑えたい #ブロック #絶縁",
      title: "緊急クールダウン瞑想", 
      subtitle: "衝動的な行動を止めて心を落ち着けます",
      path: "/session/meditation", 
      available: true 
    },
    { 
      hashtags: "#ツインレイ #どうしたらいい #決められない",
      title: "気持ち整理サポート", 
      subtitle: "30秒で混乱した気持ちを一緒に整理します",
      path: "/session/emotion-support", 
      available: false 
    },
    { 
      hashtags: "#ツインレイ #彼の気持ち #わからない",
      title: "感情整理サポート", 
      subtitle: "混乱した感情を言葉にして楽にします",
      path: "/session/emotion-clarity", 
      available: false 
    },
    { 
      hashtags: "#ツインレイ #このまま #待つべき",
      title: "現状診断サポート", 
      subtitle: "今の状況を客観視するお手伝いをします",
      path: "/session/situation-analysis", 
      available: false 
    },
    { 
      hashtags: "#ツインレイ #サイレント期 #乗り越え方",
      title: "体験談ガイド", 
      subtitle: "同じ経験をした人たちの対処法をお伝えします",
      path: "/session/experience-guide", 
      available: false 
    },
    { 
      hashtags: "#ツインレイ #苦しい #今すぐ",
      title: "緊急ケア", 
      subtitle: "心の荷物を一緒に降ろしましょう",
      path: "/session/emergency-care", 
      available: false 
    }
  ];

  return (
    <div className="menu-wrapper" style={{
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
      
      {/* メニューコンテンツ */}
      <div className="menu-content" style={{
        width: "100%",
        maxWidth: "900px",
        margin: 0,
        padding: "3rem 2rem",
        boxSizing: "border-box",
        position: "relative",
        zIndex: 2,
        color: "#ffffdd",
      }}>
        {/* ヘッダー */}
        <div style={{ 
          textAlign: "center", 
          marginBottom: "3rem" 
        }}>
          <h1 style={{
            fontSize: "2rem",
            fontWeight: "normal",
            margin: 0,
            marginBottom: "1rem",
            color: "#ffffdd",
          }}>
            すべてのメニュー
          </h1>
          <p style={{
            fontSize: "1rem",
            margin: 0,
            opacity: 0.9,
          }}>
            ご自分に最適なセッションをお選びください
          </p>
        </div>

        {/* メニューリスト */}
        <div className="menu-list" style={{
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
        }}>
          {menuItems.map((item, index) => (
            <div
              key={index}
              className="menu-item"
              style={{
                padding: "2rem",
                backgroundColor: item.available 
                  ? "rgba(255, 255, 255, 0.05)" 
                  : "rgba(255, 255, 255, 0.02)",
                border: item.available 
                  ? "1px solid rgba(255, 255, 221, 0.2)" 
                  : "1px solid rgba(255, 255, 221, 0.1)",
                borderRadius: "12px",
                color: item.available ? "#ffffdd" : "#ffffdd",
                opacity: item.available ? 1 : 0.6,
                cursor: item.available ? "pointer" : "default",
                transition: "all 0.3s ease",
                position: "relative",
              }}
              onMouseEnter={(e) => {
                if (item.available) {
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.15)";
                  e.currentTarget.style.borderColor = "#ffffdd";
                  e.currentTarget.style.boxShadow = "0 4px 20px rgba(255, 255, 221, 0.3)";
                }
              }}
              onMouseLeave={(e) => {
                if (item.available) {
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 221, 0.2)";
                  e.currentTarget.style.boxShadow = "none";
                }
              }}
              onClick={() => {
                if (item.available) {
                  window.location.href = item.path;
                }
              }}
            >
              {/* ハッシュタグ */}
              <div style={{
                fontSize: "0.85rem",
                color: item.available ? "#bbbbff" : "#8888aa",
                marginBottom: "0.8rem",
                fontWeight: "400",
              }}>
                {item.hashtags}
              </div>

              {/* サービス名 */}
              <div style={{
                fontSize: "1.3rem",
                fontWeight: "500",
                marginBottom: "0.8rem",
                color: item.available ? "#ffffdd" : "#cccccc",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}>
                {item.available ? "✅" : "🔜"} {item.title}
              </div>

              {/* 副題 */}
              <div style={{
                fontSize: "1rem",
                lineHeight: "1.5",
                color: item.available ? "#ffffdd" : "#aaaaaa",
                opacity: 0.9,
              }}>
                {item.subtitle}
              </div>

              {/* 近日公開表示 */}
              {!item.available && (
                <div style={{
                  fontSize: "0.8rem",
                  color: "#aaaaaa",
                  marginTop: "0.5rem",
                  fontStyle: "italic",
                }}>
                  近日公開予定
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 戻るリンク */}
        <div style={{
          textAlign: "center",
          marginTop: "3rem",
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
            トップページに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}