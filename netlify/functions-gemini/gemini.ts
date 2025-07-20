export default async (req: Request) => {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      console.error("⚠️ プロンプトが空です");
      throw new Error("プロンプトが空です");
    }

    const apiKey = process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.error("❌ APIキーが見つかりません。envが未設定です");
      throw new Error("Gemini APIキーが未設定です");
    }

    // ❗URLに空白があるバグを修正
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-002:generateContent?key=${apiKey}`;

    const body = {
      contents: [{ parts: [{ text: prompt }] }],
      safetySettings: [
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
      ],
    };

    console.log("📤 送信内容:", JSON.stringify(body, null, 2));

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    console.log("📥 Geminiレスポンス:", JSON.stringify(data, null, 2));

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("🔥 Gemini APIエラー:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};





// export default async (req: Request) => {
//   try {
//     const { prompt } = await req.json();

//     if (!prompt) {
//       throw new Error("プロンプトが空です");
//     }

//     const apiKey = process.env.VITE_GEMINI_API_KEY;
//     const url = `https://generativelanguage.googleapis.com/v1/models/ models/gemini-1.5-pro-002:generateContent?key=${apiKey}`;

//     const res = await fetch(url, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         contents: [{ parts: [{ text: prompt }] }],
//         safetySettings: [
//           { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
//           { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
//           { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
//           { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" }
//         ]
//       }),
//     });

//     const data = await res.json();

//     return new Response(JSON.stringify(data), {
//       headers: { "Content-Type": "application/json" },
//     });
//   } catch (error) {
//     return new Response(JSON.stringify({ error: String(error) }), {
//       status: 500,
//       headers: { "Content-Type": "application/json" },
//     });
//   }
// };
