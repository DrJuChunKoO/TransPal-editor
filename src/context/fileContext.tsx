import React, { createContext, useContext, useReducer, ReactNode } from "react";

interface FileState {
  past: TranspalFile[];
  present: TranspalFile | null;
  future: TranspalFile[];
}

interface TranspalFile {
  raw?: any;
  info?: {
    filename?: string;
    name?: string;
    date?: string;
    slug?: string;
    description?: string;
  };
  content?: {
    start?: number;
    end?: number;
    id: string;
    type: "speech" | "divider" | "markdown";
    text?: string;
    speaker?: string;
  }[];
}

const initialState: FileState = {
  past: [],
  present: null,
  future: [],
};

const FileContext = createContext<FileState | null>(null);
const FileDispatchContext = createContext<React.Dispatch<any> | null>(null);

const fileReducer = (
  state: FileState,
  action: {
    type: string;
    payload: FileState;
  }
): FileState => {
  switch (action.type) {
    case "setFile":
      return action.payload;
    default:
      return state;
  }
};

interface FileProviderProps {
  children: ReactNode;
}

export function FileProvider({ children }: FileProviderProps) {
  const [file, dispatch] = useReducer(fileReducer, initialState);
  return (
    <FileContext.Provider value={file}>
      <FileDispatchContext.Provider value={dispatch}>
        {children}
      </FileDispatchContext.Provider>
    </FileContext.Provider>
  );
}

export const useHistory = () => {
  const history = useContext(FileContext);
  const historyDispatch = useContext(FileDispatchContext);
  if (!history || !historyDispatch) {
    throw new Error("useHistory must be used within a FileProvider");
  }
  const setHistory = (newContext: FileState) => {
    historyDispatch({
      type: "setFile",
      payload: JSON.parse(JSON.stringify(newContext)),
    });
  };
  return { history, setHistory };
};
