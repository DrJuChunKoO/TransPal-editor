import Editor from "./components/Editor";
import Menu from "./components/Menu";
import NoFile from "./components/NoFile";
import useCurrentFile from "@/hooks/useCurrentFile";
function App() {
  const { file } = useCurrentFile();
  return (
    <div className="h-[100dvh] w-full flex flex-col">
      <Menu />
      {file ? <Editor /> : <NoFile />}
    </div>
  );
}
function Layout() {
  return <App />;
}

export default Layout;
