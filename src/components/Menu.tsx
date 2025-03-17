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
import { useFileInfo } from "@/hooks/useFileInfo";
import { useFileContent } from "@/hooks/useFileContent";
import { useFileRaw } from "@/hooks/useFileRaw";
import useAudioPlayer, { useAudioPlayerStore } from "@/hooks/useAudioPlayer";
import EditMenu from "./Menu/Edit";
import { toast } from "sonner";

export default function Menu() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const [panguEnabled, setPanguEnabled] = useLocalStorage(
    "pangu-enabled",
    true
  );
  const { loadFile } = useCurrentFile();
  const { info, setInfo } = useFileInfo();
  const { content, setContent } = useFileContent();
  const { raw, setRaw } = useFileRaw();
  const { handleAudioUpload } = useAudioPlayer();
  const audioFile = useAudioPlayerStore((state) => state.audioFile);

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
        if (e.key === "j") {
          CopyJson();
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [info, content, raw]);

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

  function HandleLoadAudio() {
    if (typeof window === "undefined") return;
    const audioInput = audioInputRef.current;
    if (!audioInput) return;

    audioInput.click();
    audioInput.onchange = () => {
      const file = audioInput.files?.[0];
      if (file) handleAudioUpload(file);
    };
  }

  function SaveFile() {
    if (typeof window === "undefined") return;
    if (!info) {
      return toast.error("目前沒有檔案可以儲存");
    }
    if (!info?.name || !info?.date || !info?.slug) {
      return toast.error("請輸入名稱、代稱和日期");
    }
    const { date, slug } = info;
    const downloadElement = document.createElement("a");
    const fileBolb = new Blob(
      [JSON.stringify({ info, content, raw }, null, 2)],
      {
        type: "application/json",
      }
    );
    downloadElement.href = URL.createObjectURL(fileBolb);
    downloadElement.download = `${date}-${slug}.json`;
    downloadElement.click();
    toast.success("已下載檔案");
  }

  function CopyJson() {
    const json = JSON.stringify({ info, content, raw }, null, 2);
    navigator.clipboard.writeText(json).then(() => {
      toast.success("已複製到剪貼簿");
    });
  }

  function CloseFile() {
    if (content && confirm("關閉檔案後將遺失目前所有的更改")) {
      setInfo(undefined);
      setContent([]);
      setRaw(undefined);
    }
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
              <MenubarItem onClick={() => CopyJson()}>
                複製 JSON <MenubarShortcut> ⌘J</MenubarShortcut>
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem onClick={() => CloseFile()}>關閉檔案</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <EditMenu />
          <MenubarMenu>
            <MenubarTrigger>音訊</MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={() => HandleLoadAudio()}>
                載入音訊檔案
              </MenubarItem>
              {audioFile && (
                <MenubarItem
                  onClick={() => {
                    // 清理並重置所有音訊狀態
                    const store = useAudioPlayerStore.getState();

                    // 清理 URL 資源
                    if (store.audioUrl) {
                      URL.revokeObjectURL(store.audioUrl);
                    }

                    // 重置所有相關狀態
                    store.setAudioFile(null);
                    store.setAudioUrl(null);
                    store.setIsPlaying(false);
                    store.setCurrentTime(0);

                    // 隱藏全局音訊元素
                    const audioElement = document.getElementById(
                      "global-audio-player"
                    ) as HTMLAudioElement;
                    if (audioElement) {
                      audioElement.style.display = "none";
                      audioElement.src =
                        "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
                      audioElement.load();
                    }

                    toast.success("已移除音訊");
                  }}
                >
                  移除音訊
                </MenubarItem>
              )}
            </MenubarContent>
          </MenubarMenu>
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
      <input
        ref={audioInputRef}
        type="file"
        accept="audio/*"
        style={{
          display: "none",
        }}
      />
    </>
  );
}
