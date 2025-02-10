import { memo } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { twMerge } from "tailwind-merge";
import { useFileInfo } from "@/hooks/useFileInfo";

type BasicInfoFormProps = {
  batchChangeOpened: boolean;
};

const BasicInfoForm = memo(({ batchChangeOpened }: BasicInfoFormProps) => {
  const { info, setInfo } = useFileInfo();

  if (!info) return null;

  return (
    <div
      className={twMerge(
        "bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col gap-4 transition-all",
        batchChangeOpened && "opacity-25 blur-sm pointer-events-none"
      )}
    >
      <div className="font-bold text-slate-700">基本資訊</div>
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="name">
          名稱
          <span className="bg-red-50 text-red-500 text-xs px-1.5 py-0.5 rounded ml-1">
            必填
          </span>
        </Label>
        <Input
          id="name"
          value={info.name || ""}
          onChange={(e) => setInfo({ ...info, name: e.target.value })}
        />
      </div>
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="name">
          代稱
          <span className="text-xs text-gray-500 ml-1">slug</span>
          <span className="bg-red-50 text-red-500 text-xs px-1.5 py-0.5 rounded ml-1">
            必填
          </span>
        </Label>
        <Input
          id="slug"
          value={info.slug || ""}
          onChange={(e) => {
            let val = e.target.value;
            val = val
              .toLowerCase()
              .replace(/ /g, "-")
              .replace(/-+/g, "-")
              .replace(/[^a-z0-9-]/g, "");
            setInfo({ ...info, slug: val });
          }}
        />
        <div className="text-xs text-gray-500">
          用於網址的代稱，請使用英文、數字和連字號（-）來命名
        </div>
      </div>
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="date">
          日期
          <span className="bg-red-50 text-red-500 text-xs px-1.5 py-0.5 rounded ml-1">
            必填
          </span>
        </Label>
        <Input
          id="date"
          value={info.date || ""}
          type="date"
          onChange={(e) => setInfo({ ...info, date: e.target.value })}
        />
      </div>
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="date">時間</Label>
        <Input
          id="time"
          value={info.time || ""}
          type="time"
          min="00:00"
          max="23:59"
          onChange={(e) => setInfo({ ...info, time: e.target.value })}
        />
      </div>
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="filename">原始檔案名稱</Label>
        <Input
          id="filename"
          placeholder="Email"
          value={info.filename || ""}
          disabled
        />
      </div>
    </div>
  );
});

export default BasicInfoForm;
