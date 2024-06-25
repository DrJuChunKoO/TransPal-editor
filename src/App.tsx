import { useReducer } from "react";
import Editor from "./components/Editor";
import Menu from "./components/Menu";
import NoFile from "./components/NoFile";
import {
  FileContext,
  FileDispatchContext,
  fileReducer,
  initialState,
} from "@/context/fileContext";
function App() {
  const [file, dispatch] = useReducer(fileReducer, initialState);
  return (
    <FileContext.Provider value={file}>
      <FileDispatchContext.Provider value={dispatch}>
        <div className="h-[100dvh] w-full flex flex-col">
          <Menu />
          {file.present ? <Editor /> : <NoFile />}
        </div>
      </FileDispatchContext.Provider>
    </FileContext.Provider>
  );
}

export default App;
