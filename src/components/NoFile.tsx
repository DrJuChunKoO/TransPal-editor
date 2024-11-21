import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import useCurrentFile from "@/hooks/useCurrentFile";
export default function NoFile() {
  const { loadFile } = useCurrentFile();
  const [onDrag, setOnDrag] = useState(false);
  return (
    <div
      className="flex flex-col items-center md:grid md:grid-cols-2 gap-8 h-full p-4 justify-center place-items-center w-full relative"
      onDrag={(e) => {
        e.preventDefault();
        setOnDrag(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setOnDrag(false);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setOnDrag(true);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setOnDrag(false);
        const dataTransferFile = e.dataTransfer.files[0];
        if (dataTransferFile) loadFile(dataTransferFile);
      }}
    >
      <div>
        <div className="text-4xl text-slate-600">歡迎使用 TransPal 編輯器</div>
        <div className="text-2xl text-slate-400 mt-1">目前支援下列檔案類型</div>
        <div className="grid grid-cols-1 gap-3 sm:w-[400px] max-w-full mt-4">
          <div className="bg-slate-50 text-slate-600 p-3 rounded">
            <div className="font-bold">TransPal JSON 檔案</div>
            <p className="text-sm">
              使用本編輯器儲存的檔案，或是透過 TransPal 轉錄後產生的檔案
            </p>
          </div>
          <div className="bg-slate-50 text-slate-600 p-3 rounded">
            <div className="font-bold"> Vocol.ai 匯出的 SRT 檔案 </div>
            <p className="text-sm">
              透過 Vocol.ai 匯出，並帶有說話者標記的 SRT 檔案
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center flex-col">
        <div className="text-4xl text-gray-400">直接拖入檔案來開始編輯</div>
      </div>
      <AnimatePresence>
        {onDrag && (
          <motion.div
            className="absolute top-0 left-0 w-full h-full bg-slate-100 bg-opacity-90 z-50 flex justify-center items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ y: 50, filter: "blur(8px)", opacity: 0 }}
              animate={{ y: 0, filter: "blur(0px)", opacity: 1 }}
              exit={{ y: 50, filter: "blur(8px)", opacity: 0 }}
              className="text-4xl text-slate-600"
            >
              放開檔案來開始編輯
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
