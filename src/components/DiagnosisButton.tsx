import { useNavigate } from 'react-router-dom';

export default function DiagnosisButton() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/diagnosis');
  };

  return (
    <div className="text-center mt-10">
      <button
        onClick={handleClick}
        className="bg-[#ffffdd] opacity-80 hover:opacity-100 text-[#000099] px-6 py-3 rounded-xl text-base font-semibold hover:bg-yellow-200 transition duration-300"
        style={{
          outline: "none",
          border: "none",
          boxShadow: "none",
        }}
        onFocus={(e) => {
          e.currentTarget.style.outline = "none";
          e.currentTarget.style.border = "none";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        魂の診断をはじめる
      </button>
    </div>
  );
}