import { memo } from "react";
import { CheckSquare2, Square } from "lucide-react";
import { twMerge } from "tailwind-merge";
import MoreButton from "../MoreButton";
import { RecordItem } from "./types";

type DividerItemProps = {
  item: RecordItem;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<RecordItem>) => void;
};

const DividerItem = memo(
  ({ item, index, isSelected, onSelect, onUpdate }: DividerItemProps) => {
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
        <div className="flex-1 flex gap-2 items-center">
          <div className="h-1 bg-gray-100 w-full"></div>
          <input
            className="w-full bg-transparent outline-0 p-1 text-center"
            value={item.text}
            onChange={(e) => onUpdate({ text: e.target.value })}
            placeholder="（分隔線）"
          />
          <div className="h-1 bg-gray-100 w-full"></div>
        </div>
        <MoreButton index={index} />
      </div>
    );
  },
);

export default DividerItem;
