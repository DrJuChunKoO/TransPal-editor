import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  // MenubarShortcut,
  MenubarCheckboxItem,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { useRef } from "react";
import { useLocalStorage } from "usehooks-ts";
import { pangu } from "pangu-ts";
import useCurrentFile from "@/hooks/useCurrentFile";
import EditMenu from "./Menu/Edit";
export default function Menu() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [panguEnabled, setPanguEnabled] = useLocalStorage(
    "pangu-enabled",
    true
  );
  const { file, setFile } = useCurrentFile();
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
              let text = textMatch ? textMatch[2] : x[2];
              if (panguEnabled) {
                text = pangu.spacing(text.trim());
              }

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
            let res = JSON.parse(content);
            if (panguEnabled) {
              res.content = res.content.map((x: any) => {
                x.text = pangu.spacing(x.text.trim());
                return x;
              });
            }
            setFile(res);
          }
        };
        reader.readAsText(file);
      }
    };
  }
  function SaveFile() {
    if (typeof window === "undefined") return;
    if (!file?.info?.name || !file?.info?.date || !file?.info?.slug) {
      return alert("請輸入名稱、代稱和日期");
    }
    const { date, slug } = file.info;
    const downloadElement = document.createElement("a");
    const fileBolb = new Blob([JSON.stringify(file)], {
      type: "application/json",
    });
    downloadElement.href = URL.createObjectURL(fileBolb);
    downloadElement.download = `${date} ${slug}.json`;
    downloadElement.click();
  }
  function CloseFile() {
    if (Object.keys(file).length && confirm("關閉檔案後將遺失目前所有的更改"))
      setFile({});
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
              <MenubarItem onClick={() => CloseFile()}>關閉檔案</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <EditMenu />
          <MenubarMenu>
            <MenubarTrigger>選項</MenubarTrigger>
            <MenubarContent>
              <MenubarCheckboxItem
                checked={panguEnabled}
                onClick={() => setPanguEnabled(!panguEnabled)}
              >
                自動修正中文排版
              </MenubarCheckboxItem>
              {/* <MenubarItem>編輯常用發言者</MenubarItem>
              <MenubarSeparator /> */}
            </MenubarContent>
          </MenubarMenu>
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
