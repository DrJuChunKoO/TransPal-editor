import { memo } from "react";
import { Combine, Speech, X } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { motion } from "motion/react";
import { useFileContent } from "@/hooks/useFileContent";

type BatchChangePanelProps = {
  selectedItem: string[];
  isShiftPressed: boolean;
  speakers: string[];
  onMerge: () => void;
  onClearSelection: () => void;
};

const BatchChangePanel = memo(
  ({
    selectedItem,
    isShiftPressed,
    speakers,
    onMerge,
    onClearSelection,
  }: BatchChangePanelProps) => {
    const { content, setContent } = useFileContent();

    if (!content || selectedItem.length <= 1) return null;

    return (
      <>
        <motion.div className="overflow-hidden absolute z-10 w-64 m-auto inset-0 h-max">
          <motion.div className="bg-white border border-slate-200 p-3 flex flex-col gap-4 w-full rounded-lg ">
            <div className="font-bold text-slate-700">批次變更</div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <button
                className="text-left hover:bg-slate-100 active:bg-slate-200 rounded px-2 py-1 w-full flex items-center gap-2"
                onClick={onMerge}
              >
                <Combine /> 合併選取的發言
              </button>
              {speakers.map((x) => (
                <button
                  className="text-left hover:bg-slate-100 active:bg-slate-200 rounded px-2 py-1 w-full flex items-center gap-2"
                  key={x}
                  onClick={() => {
                    const newValues = content.map((item) =>
                      selectedItem.includes(item.id)
                        ? { ...item, speaker: x }
                        : item,
                    );
                    setContent(newValues);
                    onClearSelection();
                  }}
                >
                  <Speech /> 批次變更為「{x}」
                </button>
              ))}
              <button
                className="text-left hover:bg-slate-100 active:bg-slate-200 rounded px-2 py-1 w-full flex items-center gap-2"
                onClick={onClearSelection}
              >
                <X /> 取消選取
              </button>
            </div>
          </motion.div>
          <motion.div className="text-center text-sm mt-2 opacity-75 flex items-center justify-center">
            按住
            <span
              className={twMerge(
                "font-bold mx-1 px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700",
                isShiftPressed && "text-blue-50 bg-blue-500",
              )}
            >
              Shift
            </span>
            鍵可以選取多個項目
          </motion.div>
        </motion.div>
      </>
    );
  },
);

export default BatchChangePanel;
