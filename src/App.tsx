import { useEffect } from "react";
import Editor from "./components/Editor/Editor";
import Menu from "./components/Menu";
import NoFile from "./components/NoFile";
import { useFileContent } from "@/hooks/useFileContent";
import useCurrentFile from "@/hooks/useCurrentFile";
import { Toaster, toast } from "sonner";
function App() {
  const { content } = useFileContent();
  const { loadJson } = useCurrentFile();
  useEffect(() => {
    // check query file=
    const file = new URLSearchParams(window.location.search).get("file");
    if (file) {
      const loadingToast = toast.loading(`正在載入「${file}」`);
      try {
        loadOnlineFile(file);
        toast.success(`已載入「${file}」`);
      } catch (e) {
        alert("載入檔案失敗");
      }
      toast.dismiss(loadingToast);
    }
    async function loadOnlineFile(file: string) {
      const response = await fetch(
        `https://transpal.juchunko.com/speeches/${encodeURIComponent(
          file
        )}.json`
      ).then((x) => x.json());
      loadJson(response);
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
  return <App />;
}

export default Layout;
