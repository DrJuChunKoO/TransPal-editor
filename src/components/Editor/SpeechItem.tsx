import { memo, useState, useEffect } from "react";
import { CheckSquare2, Square } from "lucide-react";
import { twMerge } from "tailwind-merge";
import MoreButton from "../MoreButton";
import { RecordItem } from "./types";

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
      null,
    );
    const [textTimeout, setTextTimeout] = useState<NodeJS.Timeout | null>(null);

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

    return (
      <div
        className={twMerge(
          "flex gap-4 my-1 has-[input:focus]:bg-gray-50 rounded items-center group",
          isSelected ? "bg-gray-100" : "hover:bg-gray-50",
        )}
      >
        <button className="p-1" onClick={onSelect}>
          {isSelected ? <CheckSquare2 /> : <Square className="text-gray-100" />}
        </button>
        <div
          className={twMerge(
            "text-gray-500 w-[7em] relative font-bold p-1 rounded",
            nameColor,
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
        <MoreButton index={index} />
      </div>
    );
  },
);

SpeechItem.displayName = "SpeechItem";

export default SpeechItem;
