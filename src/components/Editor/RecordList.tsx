import { memo, useMemo } from "react";
import { useFileContent } from "@/hooks/useFileContent";
import SpeechItem from "./SpeechItem";
import DividerItem from "./DividerItem";
import MarkdownItem from "./MarkdownItem";
import { RecordItem } from "./types";

type RecordListProps = {
  selectedItem: string[];
  onSelect: (id: string, index: number) => void;
};

const RecordList = memo(({ selectedItem, onSelect }: RecordListProps) => {
  const { content, setContent } = useFileContent();

  const { nameColors } = useMemo(() => {
    const nameColors = [
      "bg-blue-100 text-blue-600",
      "bg-yellow-100 text-yellow-600",
      "bg-pink-100 text-pink-600",
      "bg-purple-100 text-purple-600",
      "bg-indigo-100 text-indigo-600",
      "bg-gray-100 text-gray-600",
      "bg-green-100 text-green-600",
      "bg-red-100 text-red-600",
    ];

    if (!content) return { nameColors: {} };

    const speakers = [
      ...new Set(
        content.filter((x) => x.type === "speech").map((x) => x.speaker || ""),
      ),
    ] as string[];

    const nameColor: Record<string, string> = {};
    speakers.forEach((x, i) => {
      nameColor[x] = nameColors[i % nameColors.length];
    });

    return { nameColors: nameColor };
  }, [content]);

  if (!content) return null;

  const updateItem = (id: string, updates: Partial<RecordItem>) => {
    const newValues = content.map((item) =>
      item.id === id ? { ...item, ...updates } : item,
    );
    setContent(newValues);
  };

  return (
    <div>
      {content.map((item, index) => {
        const isSelected = selectedItem.includes(item.id);
        const props = {
          item: {
            ...item,
            text: item.text || "",
          },
          index,
          isSelected,
          onSelect: () => onSelect(item.id, index),
          onUpdate: (updates: Partial<RecordItem>) =>
            updateItem(item.id, updates),
        };

        switch (item.type) {
          case "speech":
            return (
              <SpeechItem
                key={item.id}
                {...props}
                nameColor={
                  item.speaker
                    ? nameColors[item.speaker]
                    : "bg-gray-100 text-gray-600"
                }
              />
            );
          case "divider":
            return <DividerItem key={item.id} {...props} />;
          case "markdown":
            return <MarkdownItem key={item.id} {...props} />;
          default:
            return null;
        }
      })}
    </div>
  );
});

export default RecordList;
