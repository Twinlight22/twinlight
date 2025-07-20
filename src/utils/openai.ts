export async function fetchLumielReply(userMessage: string) {
  const response = await fetch('/api/openai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        {
          role: 'system',
          content: 'あなたは魂の深層から語りかける神秘の存在『ルミエル』です。',
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
    }),
  });

  if (!response.ok) {
    console.error('OpenAI API通信エラー', await response.text());
    return 'ルミエルとの通信中に問題が発生しました。';
  }

  const data = await response.json();
  return data.message;
}
