import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  // MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { useRef } from "react";
import { useLocalStorage } from "usehooks-ts";
export default function Menu() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useLocalStorage("current-file", {});
  function LoadFile() {
    if (typeof window === "undefined") return;
    const fileInput = fileInputRef.current;
    if (!fileInput) return;

    fileInput.click();
    fileInput.onchange = () => {
      const file = fileInput.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result;
          const fileExtension = file.name.split(".").pop();
          if (typeof content === "string" && fileExtension === "srt") {
            // parse srt to json
            const srt = content.split("\n\n").map((x) => x.split("\n"));
            let result = {
              version: "1.0",
              info: {
                filename: file.name,
              },
              raw: {
                diarization: null,
                transcript: null,
                srt: content,
              },
              content: [] as any[],
            };
            let lastEnd = 0;

            // 00:00:00,000
            function toSeconds(time: string) {
              const timeArr = time.split(":");
              const hours = parseInt(timeArr[0]);
              const minutes = parseInt(timeArr[1]);
              const seconds = parseInt(timeArr[2].split(",")[0]);
              const milliseconds = parseInt(timeArr[2].split(",")[1]);
              return (
                hours * 60 * 60 + minutes * 60 + seconds + milliseconds / 1000
              );
            }
            srt.forEach((x) => {
              const randomId = Math.random().toString(36).substring(7);
              if (x.length < 3) return;
              const textMatch = x[2].match(/(.*): (.*)/);
              const speaker = textMatch ? textMatch[1] : "Unknown";
              const text = textMatch ? textMatch[2] : x[2];
              const [start, end] = x[1].split(" --> ").map((x) => toSeconds(x));

              if (start > lastEnd + 60) {
                result.content.push({
                  start: lastEnd,
                  end: start,
                  id: randomId,
                  type: "divider",
                  text: "",
                  speaker: "",
                });
              }

              lastEnd = end;

              result.content.push({
                start,
                end,
                id: randomId,
                type: "speech",
                text,
                speaker,
              });
            });
            setFile(result);
          } else if (typeof content === "string" && fileExtension === "json") {
            setFile(JSON.parse(content));
          }
        };
        reader.readAsText(file);
      }
    };
  }
  function SaveFile() {
    if (typeof window === "undefined") return;
    const downloadElement = document.createElement("a");
    const fileBolb = new Blob([JSON.stringify(file)], {
      type: "application/json",
    });
    downloadElement.href = URL.createObjectURL(fileBolb);
    downloadElement.download = "transpal.json";
    downloadElement.click();
  }
  function CloseFile() {
    if (confirm("確定要關閉檔案嗎？")) setFile({});
  }
  return (
    <>
      <nav className="border-b border-gray-50 flex justify-between items-center">
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>TransPal 編輯器</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>TransPal 編輯器 v0.0.1</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>檔案</MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={() => LoadFile()}>開啟舊檔</MenubarItem>
              <MenubarItem onClick={() => SaveFile()}>儲存</MenubarItem>
              <MenubarSeparator />
              <MenubarItem onClick={() => CloseFile()}>
                不儲存關閉檔案
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          {/* <MenubarMenu>
            <MenubarTrigger>選項</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>編輯常用發言者</MenubarItem>
              <MenubarSeparator />
            </MenubarContent>
          </MenubarMenu> */}
        </Menubar>
      </nav>
      <input
        ref={fileInputRef}
        type="file"
        accept=".srt,.json"
        style={{
          display: "none",
        }}
      />
    </>
  );
}
