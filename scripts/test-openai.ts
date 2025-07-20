import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config(); // ← ローカルだけで使う

async function test() {
  const res = await fetch("http://localhost:8888/.netlify/functions/openai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "user", content: "こんにちは、ルミエル" },
      ],
    }),
  });

  const data = await res.json();
  console.log("✅ 返答:", data);
}

test().catch((err) => {
  console.error("❌ エラー:", err);
});
