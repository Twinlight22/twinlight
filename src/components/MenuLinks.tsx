function MenuLinks() {
  return (
    <div className="p-0 m-0 w-screen bg-[#000099] flex flex-col items-center justify-center px-0 py-4 h-screen">
      <div className="w-full flex justify-center mb-6">
        <h1 className="text-center text-[#ffffdd] text-xl sm:text-2xl md:text-3xl leading-snug tracking-tight w-full max-w-[90%] mx-auto">
          メニュー一覧
        </h1>
      </div>
      <div className="flex flex-col items-center w-full gap-1.5">
        <div className="w-4/5 h-12 bg-[#ffffdd]/70 text-[#000099] text-base font-medium p-0 rounded-none border-none outline-none">
          セッション１
        </div>
        <div className="w-4/5 h-12 bg-[#ffffdd]/70 text-[#000099] text-base font-medium p-0 rounded-none border-none outline-none">
          セッション２
        </div>
        <div className="w-4/5 h-12 bg-[#ffffdd]/70 text-[#000099] text-base font-medium p-0 rounded-none border-none outline-none">
          セッション３
        </div>
      </div>
    </div>
  );
}

export default MenuLinks;
