import { Handler } from '@netlify/functions';
import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const handler: Handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const messages = body.messages || [];

    const response = await openai.chat.completions.create({
<<<<<<< HEAD
      // model: 'ft:gpt-3.5-turbo-0125:personal::Blrb1fN2', 
      model: 'ft:gpt-3.5-turbo-0125:parsonal::BpC8FstH', 
=======
      model: 'ft:gpt-3.5-turbo-0125:personal::Blrb1fN2', 
>>>>>>> master
      // openai.ts の try 内で model も出力する
console.log("🌟 Using model: 'ft:gpt-3.5-turbo-1106:parsonal::BmZ5rsAl'; // ← model 変数を log に出す

      messages: [
        { role: 'system', content: 'あなたは優しく静かな光の導き「ルミエル」としてふるまいます。' },
        ...messages,
      ],
    });
console.log('GPT response:', response); // ← 追加！

    const reply = response.choices[0].message.content;

    if (!reply) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'OpenAIの応答が空でした。' }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ reply }),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'サーバーエラー' }),
    };
  }
};

export { handler };
