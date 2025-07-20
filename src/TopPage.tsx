// src/TopPage.tsx
import DiagnosisButton from './components/DiagnosisButton';
import Logo from './components/Logo';
import WelcomeMessage from './components/WelcomeMessage';
import ContactLink from './components/ContactLink'; 
import { Link } from 'react-router-dom';
import './TopPage.css';

export default function TopPage() {
  return (
    <div className="top-page-wrapper" style={{
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
      justifyContent: "center",
      overflow: "auto",
      zIndex: 1,
    }}>
      {/* 光の背景 */}
      <div className="glow-background" />

      {/* 中央コンテンツ */}
      <div className="content" style={{
        width: "100%",
        maxWidth: "none",
        margin: 0,
        padding: "2rem",
        boxSizing: "border-box",
        position: "relative",
        zIndex: 2,
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        paddingBottom: "80px", // フッター分の余白
      }}>
        <Logo />
        <WelcomeMessage />
        <DiagnosisButton />
        <Link
          to="/diagnosis"
          className="menu-link"
          style={{
            fontSize: "0.9rem",
            textDecoration: "underline",
            color: "#ffffdd",
            transition: "color 0.3s",
          }}
        >
          すべてのメニューを見る
        </Link>
      </div>

      {/* フッター */}
      <ContactLink />
    </div>
  );
}