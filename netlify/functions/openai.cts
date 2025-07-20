const OpenAI = require('openai');
const dotenv = require('dotenv');
//iconst削除
dotenv.config();

// OpenAI クライアント初期化
const openai = new OpenAI({
 apiKey: process.env.OPENAI_API_KEY,   // ← .env / Netlify 環境変数
});

const handler = async (event) => {
 // POST 以外は拒否
 // CORSプリフライト対応
 if (event.httpMethod === 'OPTIONS') {
   return {
     statusCode: 200,
     headers: {
       'Access-Control-Allow-Origin': '*',
       'Access-Control-Allow-Headers': 'Content-Type',
       'Access-Control-Allow-Methods': 'POST, OPTIONS',
     },
     body: '',
   };
 }

 if (event.httpMethod !== 'POST') {
   return {
     statusCode: 405,
     headers: {
       'Access-Control-Allow-Origin': '*',
       'Access-Control-Allow-Headers': 'Content-Type',
     },
     body: JSON.stringify({ message: 'POST以外は受け付けません' }),
   };
 }

 try {
   const body = JSON.parse(event.body || '{}');
   const messages = body.messages;

   if (!Array.isArray(messages)) {
     return {
       statusCode: 400,
       headers: {
         'Access-Control-Allow-Origin': '*',
         'Access-Control-Allow-Headers': 'Content-Type',
       },
       body: JSON.stringify({ message: 'messages が配列じゃないよ' }),
     };
   }

   const messagesWithSystem = [...messages];

   const completion = await openai.chat.completions.create({
     model: 'ft:gpt-3.5-turbo-0125:parsonal::BpC8FstH',
     messages: messagesWithSystem,
     max_tokens: 1000,
   });

   const assistantMessage = completion.choices?.[0]?.message?.content ?? '（返答が取得できませんでした）';

   return {
     statusCode: 200,
     headers: {
       'Access-Control-Allow-Origin': '*',
       'Access-Control-Allow-Headers': 'Content-Type',
       'Content-Type': 'application/json',
     },
     body: JSON.stringify({
       message: assistantMessage
     }),
   };

 } catch (error) {
   console.error('Error:', error);
   
   return {
     statusCode: 500,
     headers: {
       'Access-Control-Allow-Origin': '*',
       'Access-Control-Allow-Headers': 'Content-Type',
       'Content-Type': 'application/json',
     },
     body: JSON.stringify({
       message: 'サーバーでエラーが発生しました。',
       error: error.message ?? 'Unknown error',
       details: error.toString(),
     }),
   };
 }
};

module.exports = { handler };