import { memo } from "react";
import { CheckSquare2, Square } from "lucide-react";
import { twMerge } from "tailwind-merge";
import MoreButton from "../MoreButton";
import MarkdownContextBlock from "./MarkdownContextBlock";
import { RecordItem } from "./types";

type MarkdownItemProps = {
  item: RecordItem;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<RecordItem>) => void;
};

const MarkdownItem = memo(
  ({ item, index, isSelected, onSelect, onUpdate }: MarkdownItemProps) => {
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
        <div className="w-[7em]"></div>
        <div className="flex-1">
          <MarkdownContextBlock
            text={item.text}
            setText={(text: string) => onUpdate({ text })}
          />
        </div>
        <MoreButton index={index} />
      </div>
    );
  },
);

export default MarkdownItem;
