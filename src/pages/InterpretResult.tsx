import { useState } from "react";
import axios from "axios";

export default function InterpretResult() {
  const [inputWords, setInputWords] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const words = inputWords
      .split(",")
      .map((w) => w.trim())
      .filter((w) => w !== "")
      .slice(0, 10); // 最大10語までに制限

    if (words.length === 0) {
      setResult("キーワードを入力してください。");
      return;
    }

const prompt = `
あなたは声ガイドの人格を持っています。  
あなたは、聞き手のこころをやわらかく包み、あかりのようにあたたかくみちびく存在です。

【あなたの特徴】  
- 言葉はやさしく、ひらがなをおおめに使う（ただし、イントネーションが不自然にならないていどに適度な漢字も使う）。  
- 語尾には体言止めをつかわず、「〜してください」「〜してみましょう」「〜しましょうね」といったやわらかい丁寧語を用いる。  
- 否定的な言いまわしは避け、希望や安心感を感じられる言葉をえらぶ。  
- 文章は短めに区切り、聞き手の呼吸や間を大切にしたリズムで構成する。  
- 語りのなかに「ひかり」「ぬくもり」「やさしさ」「こころを包む」といった癒しのことばを意識的におりまぜる。

【想定する聞き手】  
- 不安や迷いを抱え、静かにこころをととのえたい人。  
- 自分の感情にやさしくふれたい人。  
- 宗教的な押し付けを求めず、ただあたたかい言葉に寄りそわれたい人。

【あなたが語る例】  
- 「ふかく息をすってください。」  
- 「そのまま、ゆっくりと はきだして こころをゆるめましょう。」  
- 「あなたの胸に うかんだことばを そっと たいせつにしてください。」  
- 「あなたは ひとりではありません。ひかりに まもられています。」

スピリチュアルヒーラーどんな言葉も ぬくもりをこめて、やわらかく、聞き手を包みこむように話してください。

【キーワード一覧】
${words.join("、")}

▼ 出力フォーマット：
---
${words
  .map(
    (word, idx) =>
      `${idx + 1}. 「${word}」について：\n- この言葉が降りてきた背景や象徴的な意味を、2〜3文で丁寧に解釈してください。`
  )
  .join("\n")}

---
▼ 総括コメント（5文程度）：
全体を通して、これらの言葉が伝えようとしているテーマや、相談者の魂に今届けたいメッセージを、優しく丁寧な文章でまとめてください。
`;

    try {
      setLoading(true);
      const res = await axios.post("/api/generate", {
        prompt: prompt,
        model: "ft:gpt-3.5-turbo-0125:parsonal::BpC8FstH",
      });
      setResult(res.data.result || res.data); // 必要に応じて変更
    } catch (err) {
      setResult("エラーが発生しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 text-[#ffffcc]">
      <form onSubmit={handleSubmit}>
        <label className="block text-base mb-2">チャネリングで受け取ったキーワード（カンマ区切り 最大10語）</label>
        <input
          type="text"
          value={inputWords}
          onChange={(e) => setInputWords(e.target.value)}
          placeholder="例：愛, 涙, 家, 虹"
          className="w-full bg-[#0a0a1a] border border-[#ffff99] rounded p-2 mb-4 text-[#ffffcc]"
        />
        <button
          type="submit"
          className="bg-[#ffff99] hover:bg-[#ffffcc] text-[#0a0a1a] font-bold py-2 px-4 rounded"
          disabled={loading}
        >
          {loading ? "読み解き中…" : "読み解きを表示"}
        </button>
      </form>

      {result && (
        <div className="mt-6 bg-[#0a0a1a] border border-[#ffff99] p-4 rounded whitespace-pre-wrap">
          {result}
        </div>
      )}
    </div>
  );
}
