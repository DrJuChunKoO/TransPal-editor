import React, { createContext, useContext } from "react";

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
export const initialState: FileState = {
  past: [],
  present: null,
  future: [],
};

export const FileContext = createContext<FileState | null>(null);
export const FileDispatchContext = createContext<React.Dispatch<any> | null>(
  null
);

export const fileReducer = (
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
