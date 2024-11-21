import { memo } from "react";
import useCurrentFile from "@/hooks/useCurrentFile";
import MarkdownContextBlock from "./MarkdownContextBlock";

const DescriptionEditor = memo(() => {
  const { file, setFile } = useCurrentFile();
  if (!file) return <div>開啟檔案</div>;
  return (
    <>
      <div className="flex items-center mb-2 gap-4">
        <div className="text-bold border-b border-gray-50 flex-1">
          描述
          <span className="opacity-50 text-xs ml-2">Markdown</span>
        </div>
      </div>
      <MarkdownContextBlock
        text={file.info?.description || ""}
        setText={(text: string) => {
          setFile({
            ...file,
            info: { ...file.info, description: text },
          });
        }}
      />
    </>
  );
});

export default DescriptionEditor;
