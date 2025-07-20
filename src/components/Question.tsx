type QuestionProps = {
  question: string;
  options: string[];
  onSelect: (selected: string) => void;
};

export default function Question({ question, options, onSelect }: QuestionProps) {
  return (
    <div className="space-y-4 p-4">
      <p className="text-lg text-white">{question}</p>
      <div className="flex flex-col gap-2">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => onSelect(option)}
            className="bg-yellow-100 bg-opacity-10 text-yellow-100 border border-yellow-200 rounded-xl py-2 px-4 hover:bg-opacity-20"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
