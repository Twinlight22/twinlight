import { useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Chat24h() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/.netlify/functions/openai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "ft:gpt-3.5-turbo-0125:parsonal::BpC8FstH",
          messages: [
            {
              role: "system",
              content:
                "あなたはツインライトのルミエル。静かで誠実なガイドとして質問者に寄り添いつつ、落ち着いた言葉で具体的な回答をしてください。回答の最後には相手がさらに話しやすくなるような短い問いかけを必ず一つ添えてください。この問いかけを添えることは最優先事項であり、必ず守ってください。",
            },
            ...messages,
            userMessage,
          ],
          temperature: 0.7,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Unknown error");
      }

      const reply = data.message ?? "ルミエルの返答が取得できませんでした。";
      const assistantMessage: Message = { role: "assistant", content: reply };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error("🔥 OpenAI API エラー:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `エラーが発生しました: ${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#000099",
        height: "100vh",
        width: "100vw",
        margin: 0,
        padding: 0,
        display: "flex",
        flexDirection: "column",
        color: "#ffffdd",
        fontFamily: "'Klee One', serif",
        overflow: "hidden",
        position: "fixed",
        top: 0,
        left: 0,
      }}
    >
      {/* タイトル */}
      <div
        style={{
          textAlign: "center",
          fontSize: "24px",
          fontWeight: "bold",
          padding: "12px 8px",
          flexShrink: 0,
          color: "#ffffdd",
        }}
      >
        24時間寄り添い相談
      </div>

      {/* メッセージ一覧 */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "8px 8px 20px 8px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              width: "100%",
            }}
          >
            <div
              style={{
                maxWidth: "80%",
                padding: "12px 16px",
                borderRadius: "16px",
                color: msg.role === "user" ? "#000099" : "#ffffdd",
                fontSize: "14px",
                backgroundColor:
                  msg.role === "user"
                    ? "rgba(255, 255, 221, 0.8)"
                    : "rgba(0, 0, 51, 0.8)",
                wordBreak: "break-word",
                lineHeight: "1.5",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div
            style={{
              textAlign: "center",
              padding: "16px",
              fontSize: "14px",
              opacity: 0.8,
            }}
          >
            ルミエルが考え中…
          </div>
        )}
      </div>

      {/* 入力欄 */}
      <div
        style={{
          display: "flex",
          backgroundColor: "#000099",
          padding: "12px",
          borderTop: "1px solid rgba(255, 255, 221, 0.2)",
          gap: "8px",
          width: "100%",
          boxSizing: "border-box",
          flexShrink: 0,
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="貴女の気持ちを聞かせて…"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSend();
            }
          }}
          style={{
            flex: 1,
            padding: "12px 16px",
            fontSize: "14px",
            borderRadius: "0px",
            border: "none",
            outline: "none",
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            color: "#333",
          }}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          style={{
            minWidth: "80px",
            padding: "12px 20px",
            backgroundColor:
              loading || !input.trim()
                ? "rgba(255, 255, 221, 0.3)"
                : "#ffffdd",
            border: "none",
            color:
              loading || !input.trim()
                ? "rgba(0, 0, 51, 0.5)"
                : "#000033",
            fontSize: "14px",
            borderRadius: "0px",
            cursor: loading || !input.trim() ? "not-allowed" : "pointer",
            fontWeight: "bold",
            transition: "all 0.2s ease",
          }}
        >
          送信
        </button>
      </div>
    </div>
  );
}
