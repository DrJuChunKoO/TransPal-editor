import { useEffect, useState, useMemo, useRef } from "react";
import { AnimatePresence } from "motion/react";
import { useFileContent } from "@/hooks/useFileContent";
import useAudioPlayer from "../../hooks/useAudioPlayer";
import BasicInfoForm from "./BasicInfoForm";
import SpeakerRenameSection from "./SpeakerRenameSection";
import BatchChangePanel from "./BatchChangePanel";
import RecordList from "./RecordList";
import DescriptionEditor from "./DescriptionEditor";

const Editor = () => {
  const { content, setContent } = useFileContent();
  const [selectedItem, setSelectedItem] = useState<string[]>([]);
  const [isShiftPressed, setIsShiftPressed] = useState(false);

  // 從 useAudioPlayer 中獲取我們需要的方法和狀態
  const { showAudioInEditor, restoreAudioToGlobal } = useAudioPlayer();

  const audioContainerRef = useRef<HTMLDivElement>(null);

  // 處理音訊元素
  useEffect(() => {
    console.log("Editor 組件已載入，準備設置音訊顯示");

    // 將全局音訊元素移到編輯器容器中
    showAudioInEditor(audioContainerRef.current);

    // 組件卸載時，將音訊元素恢復到全局位置
    return () => {
      restoreAudioToGlobal();
    };
  }, []); // 空依賴數組，只在掛載和卸載時執行

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Shift") {
        setIsShiftPressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Shift") {
        setIsShiftPressed(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const batchChangeOpened = selectedItem.length > 1;

  const speakers = useMemo(() => {
    if (!content) return [];
    return [
      ...new Set(
        content.filter((x) => x.type === "speech").map((x) => x.speaker)
      ),
    ] as string[];
  }, [content]);

  if (!content) return <div>開啟檔案</div>;

  const handleSelect = (id: string, index: number) => {
    let ids = [id];
    if (isShiftPressed && selectedItem.length > 0) {
      const start = content.findIndex((y) => y.id === selectedItem.at(-1));
      const end = index;
      const [rangeStart, rangeEnd] = start < end ? [start, end] : [end, start];

      ids = content
        .slice(rangeStart, rangeEnd + 1)
        .map((y) => y.id)
        .filter((y) => y !== selectedItem.at(-1));
    }

    setSelectedItem((prev) => {
      const newSelected = [...prev];
      ids.forEach((id) => {
        const index = newSelected.indexOf(id);
        if (index === -1) {
          newSelected.push(id);
        } else {
          newSelected.splice(index, 1);
        }
      });
      return newSelected;
    });
  };

  const mergeSelected = () => {
    const selectedItems = content.filter((x) => selectedItem.includes(x.id));
    const firstItem = selectedItems[0];
    const mergedText = selectedItems.map((x) => x.text).join("");
    const endTime = selectedItems[selectedItems.length - 1].end;

    const newContent = content
      .filter((x) => !selectedItem.includes(x.id))
      .concat({
        ...firstItem,
        text: mergedText,
        end: endTime,
      })
      .sort((a, b) => (a.start || 0) - (b.start || 0));

    setContent(newContent);
    setSelectedItem([]);
  };

  return (
    <div className="flex-1 flex flex-col p-4 lg:grid lg:grid-cols-4 gap-4 h-full overflow-hidden">
      <div className="lg:col-span-1 flex flex-col gap-4 relative h-full overflow-auto">
        <div
          ref={audioContainerRef}
          className="w-full audio-container hidden"
        ></div>
        <AnimatePresence>
          {batchChangeOpened && (
            <BatchChangePanel
              selectedItem={selectedItem}
              isShiftPressed={isShiftPressed}
              speakers={speakers}
              onMerge={mergeSelected}
              onClearSelection={() => setSelectedItem([])}
            />
          )}
        </AnimatePresence>
        <BasicInfoForm batchChangeOpened={batchChangeOpened} />
        <SpeakerRenameSection batchChangeOpened={batchChangeOpened} />
      </div>
      <div className="lg:col-span-3 relative overflow-auto h-full">
        <DescriptionEditor />
        <RecordList selectedItem={selectedItem} onSelect={handleSelect} />
      </div>
    </div>
  );
};

export default Editor;
