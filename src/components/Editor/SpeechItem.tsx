import { memo, useState, useEffect } from "react";
import { CheckSquare2, Square, Play, Pause } from "lucide-react";
import { twMerge } from "tailwind-merge";
import MoreButton from "../MoreButton";
import { RecordItem } from "./types";
import useAudioPlayer, { useAudioPlayerStore } from "@/hooks/useAudioPlayer";

type SpeechItemProps = {
  item: RecordItem;
  index: number;
  nameColor: string;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<RecordItem>) => void;
};

const SpeechItem = memo(
  ({
    item,
    index,
    nameColor,
    isSelected,
    onSelect,
    onUpdate,
  }: SpeechItemProps) => {
    const [localSpeaker, setLocalSpeaker] = useState(item.speaker);
    const [localText, setLocalText] = useState(item.text);
    const [speakerTimeout, setSpeakerTimeout] = useState<NodeJS.Timeout | null>(
      null
    );
    const [textTimeout, setTextTimeout] = useState<NodeJS.Timeout | null>(null);

    // 音頻播放相關
    const { jumpToSegment, togglePlay } = useAudioPlayer();
    const currentTime = useAudioPlayerStore((state) => state.currentTime);
    const isPlaying = useAudioPlayerStore((state) => state.isPlaying);
    const audioFile = useAudioPlayerStore((state) => state.audioFile);
    const currentSegmentId = useAudioPlayerStore(
      (state) => state.currentSegmentId
    );

    // 判斷當前片段是否正在播放
    const isCurrentSegment =
      currentSegmentId === item.id ||
      (item.start !== undefined &&
        item.end !== undefined &&
        currentTime >= item.start &&
        currentTime <= item.end &&
        isPlaying);

    // Sync local state with props when they change externally
    useEffect(() => {
      setLocalSpeaker(item.speaker);
      setLocalText(item.text);
    }, [item.speaker, item.text]);

    const handleSpeakerChange = (newSpeaker: string) => {
      setLocalSpeaker(newSpeaker);
      if (speakerTimeout) {
        clearTimeout(speakerTimeout);
      }
      const timeout = setTimeout(() => {
        onUpdate({ speaker: newSpeaker });
      }, 300);
      setSpeakerTimeout(timeout);
    };

    const handleTextChange = (newText: string) => {
      setLocalText(newText);
      if (textTimeout) {
        clearTimeout(textTimeout);
      }
      const timeout = setTimeout(() => {
        onUpdate({ text: newText });
      }, 300);
      setTextTimeout(timeout);
    };

    const handlePlayClick = () => {
      try {
        // 如果當前片段正在播放，則暫停
        if (isCurrentSegment && isPlaying) {
          console.log("暫停當前播放");
          togglePlay(); // 直接調用暫停功能
          return;
        }

        console.log(
          `播放按鈕點擊，片段ID: ${item.id}，開始時間: ${item.start}`
        );

        // 檢查音頻文件是否存在
        if (!audioFile) {
          console.warn("無法播放：目前沒有載入音頻文件");
          return;
        }

        // 確保有起始時間
        if (typeof item.start !== "number") {
          console.warn(`無法播放：片段 ${item.id} 缺少有效的開始時間`);
          return;
        }

        // 如果不是當前播放的片段，或者當前已暫停，則跳轉到該片段並播放
        jumpToSegment(item.id);
      } catch (error) {
        console.error("播放片段時發生錯誤:", error);
      }
    };

    return (
      <div
        className={twMerge(
          "flex gap-4 my-1 has-[input:focus]:bg-gray-50 rounded items-center group",
          isSelected ? "bg-gray-100" : "hover:bg-gray-50",
          isCurrentSegment ? "bg-blue-50 dark:bg-blue-900/20" : ""
        )}
      >
        <button className="p-1" onClick={onSelect}>
          {isSelected ? <CheckSquare2 /> : <Square className="text-gray-100" />}
        </button>
        <div
          className={twMerge(
            "text-gray-500 w-[7em] relative font-bold p-1 rounded",
            nameColor
          )}
        >
          <input
            className="w-full bg-transparent outline-0 text-center"
            value={localSpeaker}
            onChange={(e) => handleSpeakerChange(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <input
            className="w-full bg-transparent outline-0 p-1"
            value={localText}
            onChange={(e) => handleTextChange(e.target.value)}
          />
        </div>
        {audioFile && (
          <button
            className={`p-1.5 rounded-full transition-all duration-150 ${
              isCurrentSegment
                ? "bg-blue-500 text-white shadow-md"
                : "text-gray-500 hover:text-blue-500 hover:bg-blue-50"
            }`}
            onClick={handlePlayClick}
            title={isCurrentSegment && isPlaying ? "暫停播放" : "播放此片段"}
          >
            {isCurrentSegment && isPlaying ? (
              <Pause size={18} />
            ) : (
              <Play size={18} />
            )}
          </button>
        )}
        <MoreButton index={index} />
      </div>
    );
  }
);

SpeechItem.displayName = "SpeechItem";

export default SpeechItem;
