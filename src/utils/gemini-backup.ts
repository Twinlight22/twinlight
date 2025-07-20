


export async function fetchFromGemini(userInput: string) {
  const res = await fetch("/api/gemini", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: userInput,
      //systemPrompt: lumielPrompt, // ← 明示的に送る
    }),
  });

  const data = await res.json();

  const reply =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ??
    "ルミエルの返答が取得できませんでした。";

  return reply;
}
