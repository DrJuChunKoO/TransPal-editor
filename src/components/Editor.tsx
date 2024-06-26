import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { CheckSquare2, Square, Combine, Speech, X } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { motion, AnimatePresence } from "framer-motion";
import Markdown from "react-markdown";
import MoreButton from "./MoreButton";
import useCurrentFile from "@/hooks/useCurrentFile";
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
function DescriptionEditor() {
  const { file, setFile } = useCurrentFile();
  if (!file) return <div>開啟檔案</div>;
  return (
    <>
      <div className="flex items-center mb-2 gap-4">
        <div className="text-bold border-b border-gray-50 flex-1">
          描述
          <span className="opacity-50 text-xs ml-2">Markdown</span>
        </div>
      </div>
      <MarkdownContextBlock
        text={file.info?.description || ""}
        setText={(text: string) => {
          setFile({
            ...file,
            info: { ...file.info, description: text },
          });
        }}
      />
    </>
  );
}
function MarkdownContextBlock({
  text,
  setText,
}: {
  text: string;
  setText: (text: string) => void;
}) {
  const [mode, setMode] = useState<"markdown" | "preview">("markdown");
  return (
    <div className="relative">
      <div className="absolute top-1 right-1">
        <button
          className={twMerge(
            "px-2 py-1 rounded text-sm",
            mode === "markdown"
              ? "bg-slate-100 text-slate-800"
              : "hover:bg-slate-100 hover:text-slate-800"
          )}
          onClick={() => setMode("markdown")}
        >
          編輯
        </button>
        <button
          className={twMerge(
            "px-2 py-1 rounded-md text-sm",
            mode === "preview"
              ? "bg-slate-100 text-slate-800"
              : "hover:bg-slate-100 hover:text-slate-800"
          )}
          onClick={() => setMode("preview")}
        >
          預覽
        </button>
      </div>
      {mode === "markdown" && (
        <textarea
          className="text-sm p-2 w-full ring-1 ring-slate-900/10 shadow-sm rounded-md h-40"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
          }}
        />
      )}
      {mode === "preview" && (
        <div className="prose prose-sm p-2 w-full max-w-full ring-1 ring-slate-900/10 shadow-sm rounded-md min-h-12 bg-white">
          <Markdown>{text}</Markdown>
        </div>
      )}
    </div>
  );
}
export default function Editor() {
  const { file, setFile } = useCurrentFile();
  const [selectedItem, setSelectedItem] = useState<any>([]);
  const [isShiftPressed, setIsShiftPressed] = useState(false);
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
  const nameColor: {
    [key: string]: string;
  } = {};

  if (!file || !file.content) return <div>開啟檔案</div>;

  const speakers = [
    ...new Set(
      file
        .content!.filter((x: any) => x.type == "speech")
        .map((x: any) => x.speaker as string)
    ),
  ] as string[];
  speakers.forEach((x, i) => {
    nameColor[x] = nameColors[i % nameColors.length];
  });

  return (
    <div className="flex-1 flex flex-col overflow-auto p-4 lg:grid lg:grid-cols-4 gap-4">
      <div className="lg:sticky lg:top-0 lg:self-top lg:h-[calc(100svh-73px)] lg:overflow-y-scroll flex flex-col gap-4">
        <AnimatePresence>
          {batchChangeOpened && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="overflow-hidden absolute z-10 w-64 m-auto inset-0 h-max"
            >
              <motion.div className="bg-white border border-slate-200  p-3 flex flex-col gap-4 w-full rounded-lg ">
                <div className="font-bold text-slate-700">批次變更</div>
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <button
                    className="text-left hover:bg-slate-100 active:bg-slate-200 rounded px-2 py-1 w-full flex items-center gap-2"
                    onClick={() => {
                      //@ts-ignore
                      let newValues = [...file.content];
                      // merge selected items
                      let mergedText = "";
                      let startTime = newValues.find(
                        (y) => y.id === selectedItem[0]
                      ).start;
                      let endTime = 0;
                      let speaker = newValues.find(
                        (y) => y.id === selectedItem[0]
                      )?.speaker;
                      newValues.forEach((y) => {
                        if (selectedItem.includes(y.id)) {
                          mergedText += y.text;
                          if (y.end > endTime) {
                            endTime = y.end;
                          }
                        }
                      });
                      newValues = newValues.filter(
                        (y) => !selectedItem.includes(y.id)
                      );
                      newValues.push({
                        id: selectedItem[0],
                        type: "speech",
                        text: mergedText,
                        speaker,
                        start: startTime,
                        end: endTime,
                      });
                      newValues = newValues.sort((a, b) => a.start - b.start);
                      setFile({ ...file, content: newValues });
                      setSelectedItem([]);
                    }}
                  >
                    <Combine /> 合併選取的發言
                  </button>
                  {speakers.map((x) => (
                    <button
                      className="text-left hover:bg-slate-100 active:bg-slate-200 rounded px-2 py-1 w-full flex items-center gap-2"
                      key={x}
                      onClick={() => {
                        let newValues = [...file.content];
                        newValues.forEach((y) => {
                          if (selectedItem.includes(y.id)) {
                            y.speaker = x;
                          }
                        });
                        setFile({ ...file, content: newValues });
                        setSelectedItem([]);
                      }}
                    >
                      <Speech /> 批次變更為「{x}」
                    </button>
                  ))}{" "}
                  <button
                    className="text-left hover:bg-slate-100 active:bg-slate-200 rounded px-2 py-1 w-full flex items-center gap-2"
                    onClick={() => {
                      setSelectedItem([]);
                    }}
                  >
                    <X /> 取消選取
                  </button>
                </div>
              </motion.div>
              <motion.div className="text-center text-sm mt-2 opacity-75 flex items-center justify-center">
                按住
                <span
                  className={twMerge(
                    "font-bold mx-1 px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700",
                    isShiftPressed && "text-blue-50 bg-blue-500"
                  )}
                >
                  Shift
                </span>
                鍵可以選取多個項目
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        <div
          className={twMerge(
            "bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col gap-4 transition-all",
            batchChangeOpened && "opacity-25 blur-sm pointer-events-none"
          )}
        >
          <div className="font-bold text-slate-700">基本資訊</div>
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
            <Label htmlFor="name">
              代稱
              <span className="text-xs text-gray-500 ml-1">slug</span>
            </Label>
            <Input
              id="slug"
              value={file.info?.slug || ""}
              onChange={(e) => {
                let val = e.target.value;

                val = val
                  .toLowerCase()
                  .replace(/ /g, "-")
                  .replace(/-+/g, "-")
                  .replace(/[^a-z0-9-]/g, "");

                setFile({
                  ...file,
                  info: { ...file.info, slug: val },
                });
              }}
            />
            <div className="text-xs text-gray-500">
              用於網址的代稱，請使用英文、數字和連字號（-）來命名
            </div>
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
        </div>
        <div
          className={twMerge(
            "bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col gap-4 transition-all",
            batchChangeOpened && "opacity-25 blur-sm pointer-events-none"
          )}
        >
          <div className="font-bold text-slate-700">重命名發言者</div>
          {speakers.map((x, i) => (
            <div className="grid w-full max-w-sm items-center gap-1.5" key={i}>
              <Label htmlFor={`speaker-${i}`}>{x as string}</Label>
              <RenameSpeakerInput
                speaker={x}
                onChange={(newValue: string) => {
                  let newValues = [...file.content!];
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
        </div>
      </div>
      <div className="col-span-3">
        <DescriptionEditor />
        <div className="text-bold border-b border-gray-50 py-2">會議紀錄</div>
        <div>
          {file.content &&
            file.content.map((x: any, index: number) => {
              if (x.type === "speech")
                return (
                  <div
                    className={twMerge(
                      "flex gap-4 my-1 has-[input:focus]:bg-gray-50 rounded items-center group",
                      selectedItem.includes(x.id)
                        ? "bg-gray-100"
                        : "hover:bg-gray-50"
                    )}
                    key={x.id}
                  >
                    <button
                      className="p-1"
                      onClick={() => {
                        let ids = [x.id];
                        if (isShiftPressed && selectedItem.length > 0) {
                          let start = file.content!.findIndex(
                            (y: any) => y.id === selectedItem.at(-1)
                          );
                          let end = index;
                          if (end < start) {
                            let temp = end;
                            end = start;
                            start = temp;
                          }

                          ids = file
                            .content!.filter(
                              (_: any, i: number) => i >= start && i <= end
                            )
                            .map((y: any) => y.id)
                            .filter((y: any) => y !== selectedItem.at(-1));
                        }

                        let newSelectedItem = [...selectedItem];
                        ids.map((y) => {
                          if (!newSelectedItem.includes(y)) {
                            newSelectedItem = [...newSelectedItem, y];
                          } else {
                            newSelectedItem = newSelectedItem.filter(
                              (z: any) => z !== y
                            );
                          }
                        });
                        setSelectedItem(newSelectedItem);
                      }}
                    >
                      {selectedItem.includes(x.id) ? (
                        <CheckSquare2 />
                      ) : (
                        <Square className="text-gray-100" />
                      )}
                    </button>
                    <div
                      className={twMerge(
                        "text-gray-500 w-[7em] relative font-bold p-1 rounded",
                        nameColor[x.speaker]
                      )}
                    >
                      <input
                        className="w-full bg-transparent outline-0 text-center"
                        value={x.speaker}
                        onChange={(e) => {
                          let newValues = [...file.content!];
                          newValues.forEach((y) => {
                            if (y.id === x.id) {
                              y.speaker = e.target.value;
                            }
                          });
                          setFile({ ...file, content: newValues });
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        className="w-full bg-transparent outline-0 p-1"
                        value={x.text}
                        onChange={(e) => {
                          //@ts-ignore
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
                    <MoreButton index={index} />
                  </div>
                );
              if (x.type === "divider") {
                return (
                  <div
                    className={twMerge(
                      "flex gap-4 my-1 has-[input:focus]:bg-gray-50 rounded items-center group",
                      selectedItem.includes(x.id)
                        ? "bg-gray-100"
                        : "hover:bg-gray-50"
                    )}
                    key={x.id}
                  >
                    <button
                      className="p-1"
                      onClick={() => {
                        if (!selectedItem.includes(x.id)) {
                          setSelectedItem([...selectedItem, x.id]);
                        } else {
                          setSelectedItem(
                            selectedItem.filter((y: any) => y !== x.id)
                          );
                        }
                      }}
                    >
                      {selectedItem.includes(x.id) ? (
                        <CheckSquare2 />
                      ) : (
                        <Square className="text-gray-100" />
                      )}
                    </button>
                    <div className="w-[7em]"></div>
                    <div className="flex-1 flex gap-2 items-center">
                      <div className="h-1 bg-gray-100 w-full"></div>
                      <input
                        className="w-full bg-transparent outline-0 p-1 text-center"
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
                        placeholder="（分隔線）"
                      />
                      <div className="h-1 bg-gray-100 w-full"></div>
                    </div>
                    <MoreButton index={index} />
                  </div>
                );
              }
              if (x.type === "markdown") {
                return (
                  <div
                    className={twMerge(
                      "flex gap-4 my-1 has-[input:focus]:bg-gray-50 rounded items-center group",
                      selectedItem.includes(x.id)
                        ? "bg-gray-100"
                        : "hover:bg-gray-50"
                    )}
                    key={x.id}
                  >
                    <button
                      className="p-1"
                      onClick={() => {
                        if (!selectedItem.includes(x.id)) {
                          setSelectedItem([...selectedItem, x.id]);
                        } else {
                          setSelectedItem(
                            selectedItem.filter((y: any) => y !== x.id)
                          );
                        }
                      }}
                    >
                      {selectedItem.includes(x.id) ? (
                        <CheckSquare2 />
                      ) : (
                        <Square className="text-gray-100" />
                      )}
                    </button>
                    <div className="w-[7em]"></div>
                    <div className="flex-1  ">
                      <MarkdownContextBlock
                        text={x.text}
                        setText={(text: string) => {
                          let newValues = [...file.content];
                          newValues.forEach((y) => {
                            if (y.id === x.id) {
                              y.text = text;
                            }
                          });
                          setFile({ ...file, content: newValues });
                        }}
                      />
                    </div>
                    <MoreButton index={index} />
                  </div>
                );
              }
            })}
        </div>
      </div>
    </div>
  );
}
