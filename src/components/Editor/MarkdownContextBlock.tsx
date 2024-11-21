import { useState, memo, useEffect } from "react";
import { twMerge } from "tailwind-merge";
import Markdown from "react-markdown";

type MarkdownContextBlockProps = {
  text: string;
  setText: (text: string) => void;
};

const MarkdownContextBlock = memo(
  ({ text, setText }: MarkdownContextBlockProps) => {
    const [mode, setMode] = useState<"markdown" | "preview">("markdown");
    const [localText, setLocalText] = useState(text);
    const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);

    // Sync local state with prop when text changes externally
    useEffect(() => {
      setLocalText(text);
    }, [text]);

    const handleTextChange = (newText: string) => {
      setLocalText(newText);
      
      // Clear any existing timeout
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
      
      // Set a new timeout to update the parent state after 300ms of no typing
      const timeout = setTimeout(() => {
        setText(newText);
      }, 300);
      
      setDebounceTimeout(timeout);
    };

    return (
      <div className="relative">
        <div className="absolute top-1 right-1">
          <button
            className={twMerge(
              "px-2 py-1 rounded text-sm",
              mode === "markdown"
                ? "bg-slate-100 text-slate-800"
                : "hover:bg-slate-100 hover:text-slate-800",
            )}
            onClick={() => setMode("markdown")}
          >
            編輯
          </button>
          <button
            className={twMerge(
              "px-2 py-1 rounded-md text-sm",
              mode === "preview"
                ? "bg-slate-100 text-slate-800"
                : "hover:bg-slate-100 hover:text-slate-800",
            )}
            onClick={() => setMode("preview")}
          >
            預覽
          </button>
        </div>
        {mode === "markdown" && (
          <textarea
            className="text-sm p-2 w-full ring-1 ring-slate-900/10 shadow-sm rounded-md h-40"
            value={localText}
            onChange={(e) => {
              handleTextChange(e.target.value);
            }}
          />
        )}
        {mode === "preview" && (
          <div className="prose prose-sm p-2 w-full max-w-full ring-1 ring-slate-900/10 shadow-sm rounded-md min-h-12 bg-white">
            <Markdown>{localText}</Markdown>
          </div>
        )}
      </div>
    );
  }
);

MarkdownContextBlock.displayName = "MarkdownContextBlock";

export default MarkdownContextBlock;
