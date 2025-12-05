interface ProcessBtnProps {
  text: string;
  handler: () => void;
  disabled?: boolean;
}

function ProcessBtn({ text, handler, disabled = false }: ProcessBtnProps) {
  return (
    <button disabled={disabled} onClick={handler}
        className={`
            relative overflow-hidden px-2 rounded-md font-semibold transition-colors duration-300 mx-1
            ${disabled 
            ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
            : "bg-stone-400 text-black group"}
        `}>
        <span
            className={`relative z-2 transition-colors duration-300 ${disabled ? "" : "group-hover:text-white"}`}>
            {text}
        </span>
        {!disabled && (
            <span className="absolute left-0 top-0 h-full w-0 bg-gray-600 transition-all duration-300 group-hover:w-full"></span>
        )}
    </button>
  );
}

export default ProcessBtn;
