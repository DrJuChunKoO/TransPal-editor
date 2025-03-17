import { useEffect } from "react";
import Editor from "./components/Editor/Editor";
import Menu from "./components/Menu";
import NoFile from "./components/NoFile";
import { useFileContent } from "@/hooks/useFileContent";
import useCurrentFile from "@/hooks/useCurrentFile";
import { Toaster, toast } from "sonner";
import { AudioPlayerProvider } from "@/contexts/AudioPlayerContext";

function App() {
  const { content } = useFileContent();
  const { loadJson } = useCurrentFile();
  useEffect(() => {
    // check query file=
    const file = new URLSearchParams(window.location.search).get("file");
    if (file) {
      loadOnlineFile(file);
    }
    async function loadOnlineFile(file: string) {
      const loadingToast = toast.loading(`正在載入檔案⋯`, {
        duration: Infinity,
      });
      try {
        const response = await fetch(
          `https://transpal.juchunko.com/speeches/${encodeURIComponent(
            file
          )}.json`
        ).then((x) => x.json());
        loadJson(response);
        toast.success(`${response.info.name} 載入完成`);
      } catch (e) {
        toast.error("載入檔案失敗");
      } finally {
        toast.dismiss(loadingToast);
      }
    }
  }, []);
  return (
    <div className="h-[100dvh] w-full flex flex-col">
      <Menu />
      {content?.length ? <Editor /> : <NoFile />}
      <Toaster />
    </div>
  );
}

function Layout() {
  return (
    <AudioPlayerProvider>
      <App />
    </AudioPlayerProvider>
  );
}

export default Layout;
