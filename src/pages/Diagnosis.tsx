import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

type SoulType =
  | "消失型"
  | "投影型"
  | "自罰型"
  | "抜け殻型"
  | "希望恐怖型"
  | "混乱型";

interface Option {
  text: string;
  value: SoulType;
}

interface Question {
  question: string;
  options: Option[];
}

const questions: Question[] = [
  {
    question: "最後にかけてほしかった言葉は？",
    options: [
      { text: "「また会おう」", value: "消失型" },
      { text: "「悪かったよ」", value: "投影型" },
      { text: "「ごめんね…」", value: "自罰型" },
      { text: "「さようなら」", value: "抜け殻型" },
      { text: "「信じていいよ」", value: "希望恐怖型" },
      { text: "「間違いだったの？」", value: "混乱型" },
    ],
  },
  {
    question: "眠れない夜に浮かぶものは？",
    options: [
      { text: "届かないLINE", value: "消失型" },
      { text: "責める言葉", value: "投影型" },
      { text: "過去の後悔", value: "自罰型" },
      { text: "無音の時間", value: "抜け殻型" },
      { text: "笑顔の残像", value: "希望恐怖型" },
      { text: "ツインの定義", value: "混乱型" },
    ],
  },
  {
    question: "心に焼きついた最後の姿は？",
    options: [
      { text: "背を向けた背中", value: "消失型" },
      { text: "怒った顔", value: "投影型" },
      { text: "泣かせた自分", value: "自罰型" },
      { text: "無表情な横顔", value: "抜け殻型" },
      { text: "微笑んだままの目", value: "希望恐怖型" },
      { text: "夢だった気もする", value: "混乱型" },
    ],
  },
  {
    question: "戻れないと思った理由は？",
    options: [
      { text: "連絡が途絶えた", value: "消失型" },
      { text: "許せない言葉", value: "投影型" },
      { text: "自分が壊れた気がする", value: "自罰型" },
      { text: "感情が動かない", value: "抜け殻型" },
      { text: "傷つくのが怖い", value: "希望恐怖型" },
      { text: "正しさが分からない", value: "混乱型" },
    ],
  },
  {
    question: "「愛してた」とはどういうこと？",
    options: [
      { text: "消えた人を想うこと", value: "消失型" },
      { text: "恨んでしまうこと", value: "投影型" },
      { text: "自分を責めること", value: "自罰型" },
      { text: "何も感じなくなること", value: "抜け殻型" },
      { text: "まだ信じたいこと", value: "希望恐怖型" },
      { text: "答えを探し続けること", value: "混乱型" },
    ],
  },
  {
    question: "何度も繰り返してしまうことは？",
    options: [
      { text: "既読の確認", value: "消失型" },
      { text: "言葉の再生", value: "投影型" },
      { text: "自己反省", value: "自罰型" },
      { text: "ぼんやりする時間", value: "抜け殻型" },
      { text: "占いの検索", value: "希望恐怖型" },
      { text: "ツインの調べもの", value: "混乱型" },
    ],
  },
  {
    question: "今のあなたに一番近い言葉は？",
    options: [
      { text: "待ちぼうけ", value: "消失型" },
      { text: "被害者意識", value: "投影型" },
      { text: "自己否定", value: "自罰型" },
      { text: "抜け殻のよう", value: "抜け殻型" },
      { text: "信じたいけど怖い", value: "希望恐怖型" },
      { text: "情報に溺れてる", value: "混乱型" },
    ],
  },
];

export default function Diagnosis() {
  const [currentQ, setCurrentQ] = useState(0);
  const [scores, setScores] = useState<Record<SoulType, number>>({
    消失型: 0,
    投影型: 0,
    自罰型: 0,
    抜け殻型: 0,
    希望恐怖型: 0,
    混乱型: 0,
  });
  const [isFinished, setIsFinished] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<SoulType | null>(null);
  const navigate = useNavigate();

  const handleAnswer = (
    event: React.MouseEvent<HTMLButtonElement>,
    value: SoulType,
    index: number
  ) => {
    event.currentTarget.blur();
    setScores((prev) => {
      const updated = { ...prev, [value]: prev[value] + 1 };
      if (currentQ === questions.length - 1) {
        const maxType = getHighestScoredType(updated);
        setDiagnosisResult(maxType);
        setIsFinished(true);
      } else {
        setTimeout(() => {
          setCurrentQ((prevQ) => prevQ + 1);
        }, 500);
      }
      return updated;
    });
  };

  useEffect(() => {
    if (isFinished && diagnosisResult) {
      setTimeout(() => {
        navigate("/result", { state: { result: diagnosisResult } });
      }, 500);
    }
  }, [isFinished, diagnosisResult, navigate]);

  const getHighestScoredType = (scoreMap: Record<SoulType, number>): SoulType => {
    const entries = Object.entries(scoreMap) as [SoulType, number][];
    return entries.reduce((max, current) => (current[1] > max[1] ? current : max))[0];
  };

  useEffect(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    const buttons = document.querySelectorAll("button");
    buttons.forEach((button) => {
      button.classList.remove("active", "focus");
      // boxShadowのリセットを削除（ホバー効果を維持）
    });
  }, [currentQ]);

  const current = questions[currentQ];

  return (
    <div className="min-h-screen w-full bg-[#000099] flex flex-col items-center justify-center text-[#ffffdd] px-4">
      <h1 className="w-full text-center text-xl sm:text-2xl md:text-3xl leading-snug tracking-tight mb-6">
        {current.question}
      </h1>

      <div className="w-full flex flex-col items-center gap-[1rem]">
        {current.options.map((option, index) => (
          <button
            key={index}
            onClick={(e) => handleAnswer(e, option.value, index)}
            className="w-[80vw] max-w-[600px] bg-[#ffffdd]/70 text-[#000099] text-center py-3 px-4 rounded-none shadow focus:outline-none transition-all duration-300 text-base font-medium"
            style={{
              border: "none",
              outline: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 0 30px 15px #ffffff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "none";
            }}
            onTouchStart={(e) => {
              e.currentTarget.style.boxShadow = "0 0 30px 15px #ffffff";
            }}
            onTouchEnd={(e) => {
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {option.text}
          </button>
        ))}
      </div>
    </div>
  );
}