import { useLocalStorage } from "usehooks-ts";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { useDetectClickOutside } from "react-detect-click-outside";

import { twMerge } from "tailwind-merge";
function RenameSpeakerInput({ speaker, onChange }: any) {
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
}
function SelectSpeakerInput({ speaker, speakers, onChange }: any) {
  const ref = useDetectClickOutside({ onTriggered: () => setFocused(false) });
  const [focused, setFocused] = useState(false);
  const [value, setValue] = useState(speaker);
  useEffect(() => {
    setValue(speaker);
  }, [speaker]);
  function handleSpeakButtonClick(speaker: string) {
    setValue(speaker);
    onChange(speaker);
    setFocused(false);
  }
  const codeChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    const element = event.target;
    const nextSibling = element.nextElementSibling as HTMLInputElement;
    console.log(nextSibling);
    nextSibling ? nextSibling.focus() : element.blur();
  };
  return (
    <div className="relative" ref={ref}>
      <input
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          onChange(e.target.value);
          codeChangeHandler(e);
        }}
        onKeyDown={(e) => {
          // tab
          if (e.key === "Tab") {
            setFocused(false);
          }
        }}
        className="w-full bg-transparent outline-0"
        onFocus={() => setFocused(true)}
      />

      {focused && (
        <div className="absolute top-[100%] z-10 bg-white border border-gray-200 shadow-lg rounded-lg w-full p-1">
          {speakers.map((x: string) => (
            <button
              key={x}
              onClick={() => handleSpeakButtonClick(x)}
              className="rounded px-2 py-1 hover:bg-gray-50 active:bg-gray-100 w-full text-left flex justify-between items-center"
            >
              <div>{x}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Editor() {
  const [file, setFile] = useLocalStorage<any>("current-file", {});
  const [dragSelectMode, setDragSelectMode] = useState<
    false | "mouse" | "keyboard"
  >(false);
  const [selectedItem, setSelectedItem] = useState<any>([]);

  const speakers = [
    ...new Set(file.content.map((x: any) => x.speaker as string)),
  ] as string[];
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey) {
        setDragSelectMode("keyboard");
      }
    }
    function handleKeyUp() {
      setDragSelectMode(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  if (!file.content) return <div>開啟檔案</div>;
  return (
    <div className="flex-1 overflow-auto p-4 lg:grid lg:grid-cols-4 gap-4">
      <div className="sticky top-0 self-top h-max flex flex-col gap-4">
        <div className="text-bold border-b border-gray-50 pb-2">基本資訊</div>

        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="name">名稱</Label>
          <Input
            id="name"
            value={file.info?.name || ""}
            onChange={(e) =>
              setFile({
                ...file,
                info: { ...file.info, name: e.target.value },
              })
            }
          />
        </div>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="date">日期</Label>
          <Input
            id="date"
            value={file.info?.date || ""}
            type="date"
            onChange={(e) =>
              setFile({
                ...file,
                info: { ...file.info, date: e.target.value },
              })
            }
          />
        </div>

        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="filename">原始檔案名稱</Label>
          <Input
            id="filename"
            placeholder="Email"
            value={file.info?.filename || ""}
            disabled
          />
        </div>
        <div className="text-bold border-b border-gray-50 pb-2">
          重命名發言者
        </div>
        {speakers.map((x, i) => (
          <div className="grid w-full max-w-sm items-center gap-1.5" key={i}>
            <Label htmlFor={`speaker-${i}`}>{x as string}</Label>
            <RenameSpeakerInput
              speaker={x}
              onChange={(newValue: string) => {
                let newValues = [...file.content];
                newValues.forEach((y) => {
                  if (y.speaker === x) {
                    y.speaker = newValue;
                  }
                });
                setFile({ ...file, content: newValues });
              }}
            />
          </div>
        ))}

        {selectedItem.length > 1 && (
          <>
            <div className="text-bold border-b border-gray-50 pb-2">
              批次修改發言者
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              {speakers.map((x) => (
                <button
                  className=" text-left hover:bg-gray-50 active:bg-gray-100 rounded px-2 py-1 -mx-2 w-full flex justify-between items-center"
                  key={x}
                  onClick={() => {
                    let newValues = [...file.content];
                    newValues.forEach((y) => {
                      if (selectedItem.includes(y.id)) {
                        y.speaker = x;
                      }
                    });
                    console.log(x);
                    setFile({ ...file, content: newValues });
                    setSelectedItem([]);
                  }}
                >
                  批次變更為「{x}」
                </button>
              ))}
            </div>
          </>
        )}
      </div>
      <div className="col-span-3">
        <div className="text-bold mb-4">會議紀錄</div>
        <div
          onMouseDown={() => {
            if (dragSelectMode === false) {
              setSelectedItem([]);
              setDragSelectMode("mouse");
            }
          }}
          onMouseUp={() => {
            if (dragSelectMode === "mouse") setDragSelectMode(false);
          }}
        >
          {file.content.map(
            (x: any) =>
              x.type === "speech" && (
                <div
                  className={twMerge(
                    "flex gap-4 my-1 p-1 has-[input:focus]:bg-gray-50",
                    selectedItem.includes(x.id)
                      ? "bg-gray-100"
                      : "hover:bg-gray-50",
                    dragSelectMode ? "*:pointer-events-none" : ""
                  )}
                  key={x.id}
                  onMouseOver={() => {
                    if (dragSelectMode === "mouse") {
                      setSelectedItem([...selectedItem, x.id]);
                    }
                  }}
                  onClick={() => {
                    if (dragSelectMode === "keyboard") {
                      setSelectedItem([...selectedItem, x.id]);
                    }
                  }}
                >
                  <div className="text-gray-500 w-[7em] relative">
                    <SelectSpeakerInput
                      speaker={x.speaker}
                      speakers={speakers}
                      onChange={(newValue: string) => {
                        let newValues = [...file.content];
                        newValues.forEach((y) => {
                          if (y.id === x.id) {
                            y.speaker = newValue;
                          }
                        });
                        setFile({ ...file, content: newValues });
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      className="w-full bg-transparent outline-0"
                      value={x.text}
                      onChange={(e) => {
                        let newValues = [...file.content];
                        newValues.forEach((y) => {
                          if (y.id === x.id) {
                            y.text = e.target.value;
                          }
                        });
                        setFile({ ...file, content: newValues });
                      }}
                    />
                  </div>
                </div>
              )
          )}
        </div>
        {/* <pre>{JSON.stringify(file, null, 2)}</pre>  */}
      </div>
    </div>
  );
}
