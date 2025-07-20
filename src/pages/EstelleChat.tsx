// import { useState } from "react";
// import axios from "axios";

// export default function EstelleChat() {
//   const [messages, setMessages] = useState([
//     {
//       role: "system",
//       content:
//         "あなたは『エステル』という名前の心の癒し手。恋愛や感情の悩みに寄り添うカウンセラーです。スピリチュアルな要素は使わず、現実の感情に寄り添い、共感と思いやりのある言葉で対応してください。利用者がどんな言葉を発しても否定せず、やさしく、でも本気で寄り添ってください。",
//     },
//   ]);

//    const [input, setInput] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleSend = async () => {
//     console.log(" handleSend() が呼ばれました");
//     if (!input.trim()) return;

//     const userMessage = { role: "user", content: input };
//     const updatedMessages = [...messages, userMessage];

//     setMessages(updatedMessages);
//     setInput("");
//     setLoading(true);

//     try {
//       const response = await axios.post("http://localhost:3001/api/openai", {
//         messages: updatedMessages,
//       });

//       console.log(" response.data:", response.data); // ← ここ重要！

//       const assistantReply = response.data.choices?.[0]?.message?.content;
//       if (assistantReply) {
//         setMessages((prev) => [
//           ...prev,
//           { role: "assistant", content: assistantReply },
//         ]);
//       } else {
//         setMessages((prev) => [
//           ...prev,
//           { role: "assistant", content: "（返答がありませんでした）" },
//         ]);
//       }
//     } catch (error) {
//       console.error("通信エラー:", error);
//       setMessages((prev) => [
//         ...prev,
//         { role: "assistant", content: "（通信に失敗しました）" },
//       ]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div
//       className="w-screen h-screen flex flex-col justify-between"
//       style={{ backgroundColor: "#000099", color: "#ffffdd" }}
//     >
//       {/* チャット欄 */}
//       <div className="flex-1 overflow-y-auto px-4 py-6">
//         {messages
//           .filter((msg) => msg.role !== "system")
//           .map((msg, idx) => (
//             <div
//               key={idx}
//               className={`mb-4 flex ${
//                 msg.role === "user" ? "justify-end" : "justify-start"
//               }`}
//             >
//               <div
//                 className={`max-w-[80%] p-3 rounded-lg text-sm leading-relaxed ${
//                   msg.role === "user"
//                     ? "bg-[#ffffdd] text-[#000099]"
//                     : "bg-[#333366] text-[#ffffdd]"
//                 }`}
//               >
//                 {msg.content}
//               </div>
//             </div>
//           ))}
//         {loading && (
//           <div className="text-left text-[#ffffdd] text-sm">…</div>
//         )}
//       </div>

//       {/* 入力欄 */}
//       <div className="w-full flex px-4 py-3 border-t border-[#333366] bg-[#000099]">
//         <input
//           className="flex-1 px-3 py-2 rounded-none text-[#000099] bg-[#ffffdd] text-base"
//           type="text"
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           onKeyDown={(e) => {
//             if (e.key === "Enter") handleSend(); // ← Enterで送信
//           }}
//           placeholder="こころの声を言葉にしてみてください"
//         />
//         <button
//           onClick={handleSend}
//           className="ml-2 px-4 py-2 bg-[#ffffdd] text-[#000099] rounded-none font-medium"
//         >
//           送信
//         </button>
//       </div>
//     </div>
//   );
// }


// ======= frontend/src/pages/EstelleChat.tsx =======
// ======= frontend/src/pages/EstelleChat.tsx =======
import { useState } from "react";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export default function EstelleChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
    };

    const fullMessages = [...messages, userMessage];

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/openai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: fullMessages }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.message }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", content: "エラーが発生しました。" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="w-full h-screen bg-[#000099] text-[#ffffdd] flex flex-col overflow-hidden">
      {/* タイトル */}
      <div className="text-xl font-bold text-center py-4">誰にも言えない相談</div>

      {/* チャット欄 */}
      <div className="flex-1 overflow-y-auto px-4 space-y-2 flex-shrink-0 pt-2">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`whitespace-pre-wrap p-2 rounded-md break-words max-w-[75%] ${
              msg.role === "user"
                ? "self-end bg-[#ffff99]/70 text-[#000033] ml-auto text-left"
                : "self-start bg-white/10 text-left"
            }`}
          >
            {msg.content}
          </div>
        ))}
        {loading && <div className="text-sm">エステルが考え中……</div>}
      </div>

      {/* 入力欄：横幅100%で広げる */}
      <div className="w-full flex px-4 py-2 bg-[#000099] flex-shrink-0 mt-auto">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          className="w-full p-2 text-black"
          placeholder="あなたの気持ちを聞かせて…"
        />
        <button
          onClick={sendMessage}
          className="ml-2 px-4 py-2 bg-[#ffff99] text-[#000033] rounded-none"
        >
          送信
        </button>
      </div>
    </div>
  );
}







