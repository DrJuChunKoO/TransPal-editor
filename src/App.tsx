import Editor from "./components/Editor";
import Menu from "./components/Menu";
import NoFile from "./components/NoFile";
import { useLocalStorage } from "usehooks-ts";
function App() {
  const [file] = useLocalStorage<any>("current-file", {});
  return (
    <div className="h-[100dvh] w-full flex flex-col">
      <Menu />
      {file?.content ? <Editor /> : <NoFile />}
    </div>
  );
}

export default App;
