import { memo, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { twMerge } from "tailwind-merge";
import { useFileContent } from "@/hooks/useFileContent";
import RenameSpeakerInput from "./RenameSpeakerInput";

type SpeakerRenameSectionProps = {
  batchChangeOpened: boolean;
};

const SpeakerRenameSection = memo(({ batchChangeOpened }: SpeakerRenameSectionProps) => {
  const { content, setContent } = useFileContent();

  const speakers = useMemo(() => {
    if (!content) return [];
    return [
      ...new Set(
        content.filter((x) => x.type === "speech").map((x) => x.speaker),
      ),
    ] as string[];
  }, [content]);

  if (!content) return null;

  return (
    <div
      className={twMerge(
        "bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col gap-4 transition-all",
        batchChangeOpened && "opacity-25 blur-sm pointer-events-none",
      )}
    >
      <div className="font-bold text-slate-700">重命名發言者</div>
      {speakers.map((x, i) => (
        <div className="grid w-full max-w-sm items-center gap-1.5" key={i}>
          <Label htmlFor={`speaker-${i}`}>{x}</Label>
          <RenameSpeakerInput
            speaker={x}
            onChange={(newValue: string) => {
              const newValues = content.map((item) =>
                item.speaker === x ? { ...item, speaker: newValue } : item,
              );
              setContent(newValues);
            }}
          />
        </div>
      ))}
    </div>
  );
});

export default SpeakerRenameSection;
