

import {Routes, Route } from "react-router-dom";
import TopPage from './TopPage';
import Diagnosis from "./pages/Diagnosis"; 
import Result from "./pages/Result";
import Chat24h from "./pages/24h";
import ChannelingPage from "./pages/channeling"; 
import ComingSoon from "./pages/ComingSoon";
import Menu from "./pages/Menu";
import'./App.css';


function App() {

return (
<Routes>
    <Route path="/" element={<ComingSoon />} /> 
    <Route path="/home" element={<TopPage />} /> 
    <Route path="/menu" element={<Menu />} />
    <Route path="/diagnosis" element={<Diagnosis /> } /> 
    <Route path="/result" element={<Result />} />
    <Route path="/24h" element={<Chat24h />} />
    <Route path="/channeling" element={<ChannelingPage />} />
    <Route path="/comingsoon" element={<ComingSoon />} /> 
</Routes>
)

}

export default App