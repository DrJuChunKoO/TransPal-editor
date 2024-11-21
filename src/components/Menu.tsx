import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarCheckboxItem,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { useRef, useEffect } from "react";
import { useLocalStorage } from "usehooks-ts";

import useCurrentFile from "@/hooks/useCurrentFile";
import EditMenu from "./Menu/Edit";
export default function Menu() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [panguEnabled, setPanguEnabled] = useLocalStorage(
    "pangu-enabled",
    true,
  );
  const { file, setFile, loadFile } = useCurrentFile();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.metaKey) {
        if (e.key === "o") {
          HandleLoadFile();
          e.preventDefault();
        }
        if (e.key === "s") {
          SaveFile();
          e.preventDefault();
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [file]);
  function HandleLoadFile() {
    if (typeof window === "undefined") return;
    const fileInput = fileInputRef.current;
    if (!fileInput) return;

    fileInput.click();
    fileInput.onchange = () => {
      const file = fileInput.files?.[0];
      if (file) loadFile(file);
    };
  }
  function SaveFile() {
    if (typeof window === "undefined") return;
    if (!file?.info) {
      return alert("目前沒有檔案可以儲存");
    }
    if (!file?.info?.name || !file?.info?.date || !file?.info?.slug) {
      return alert("請輸入名稱、代稱和日期");
    }
    const { date, slug } = file.info;
    const downloadElement = document.createElement("a");
    const fileBolb = new Blob([JSON.stringify(file)], {
      type: "application/json",
    });
    downloadElement.href = URL.createObjectURL(fileBolb);
    downloadElement.download = `${date}-${slug}.json`;
    downloadElement.click();
  }
  function CloseFile() {
    if (file && confirm("關閉檔案後將遺失目前所有的更改")) setFile(null);
  }
  return (
    <>
      <nav className="border-b border-gray-50 flex justify-between items-center">
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>TransPal 編輯器</MenubarTrigger>
            <MenubarContent>
              <MenubarItem
                onClick={() => {
                  window.open("https://github.com/DrJuChunKoO/TransPal-editor");
                }}
              >
                GitHub
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>檔案</MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={() => HandleLoadFile()}>
                開啟舊檔 <MenubarShortcut> ⌘O</MenubarShortcut>
              </MenubarItem>
              <MenubarItem onClick={() => SaveFile()}>
                儲存 <MenubarShortcut> ⌘S</MenubarShortcut>
              </MenubarItem>
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
