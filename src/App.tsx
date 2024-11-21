import Editor from "./components/Editor/Editor";
import Menu from "./components/Menu";
import NoFile from "./components/NoFile";
import { useFileContent } from "@/hooks/useFileContent";

function App() {
  const { content } = useFileContent();
  return (
    <div className="h-[100dvh] w-full flex flex-col">
      <Menu />
      {content?.length ? <Editor /> : <NoFile />}
    </div>
  );
}

function Layout() {
  return <App />;
}

export default Layout;
