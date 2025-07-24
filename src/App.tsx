import { Routes, Route } from "react-router-dom";

// コンポーネントのインポート（アルファベット順に整理）
import Chat24h from "./pages/24h";
import ChannelingPage from "./pages/channeling"; 
import ComingSoon from "./pages/ComingSoon"; 
import Diagnosis from "./pages/Diagnosis"; 
import Result from "./pages/Result";
import TopPage from './TopPage';

import './App.css';

function App() {
  return (
    <Routes>
      {/* メインページ */}
      <Route path="/" element={<ComingSoon />} /> 
      <Route path="/home" element={<TopPage />} /> 
      
      {/* 診断関連 */}
      <Route path="/diagnosis" element={<Diagnosis />} /> 
      <Route path="/result" element={<Result />} />
      
      {/* サービス関連 */}
      <Route path="/24h" element={<Chat24h />} />
      <Route path="/channeling" element={<ChannelingPage />} />
      
      {/* その他 */}
      <Route path="/comingsoon" element={<ComingSoon />} /> 
    </Routes>
  );
}

export default App;