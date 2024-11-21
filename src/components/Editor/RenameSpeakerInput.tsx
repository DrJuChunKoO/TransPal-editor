import { Input } from "@/components/ui/input";
import { useEffect, useState, memo } from "react";

type RenameSpeakerInputProps = {
  speaker: string;
  onChange: (value: string) => void;
};

const RenameSpeakerInput = memo(
  ({ speaker, onChange }: RenameSpeakerInputProps) => {
    const [value, setValue] = useState(speaker);
    useEffect(() => {
      setValue(speaker);
    }, [speaker]);
    return (
      <Input
        id={`speaker-${speaker}`}
        placeholder="請輸入發言者名稱"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          onChange(e.target.value);
        }}
      />
    );
  },
);

export default RenameSpeakerInput;
