import { useLocalStorage } from "usehooks-ts";
import { pangu } from "pangu-ts";
import { create } from "zustand";

interface FileInfoStore {
  info: TranspalFile["info"];
  setInfo: (info: TranspalFile["info"]) => void;
}

interface FileContentStore {
  content: TranspalFile["content"];
  setContent: (content: TranspalFile["content"]) => void;
}

interface FileRawStore {
  raw: TranspalFile["raw"];
  setRaw: (raw: TranspalFile["raw"]) => void;
}

export const useFileInfoStore = create<FileInfoStore>((set) => ({
  info: undefined,
  setInfo: (info) => set({ info }),
}));

export const useFileContentStore = create<FileContentStore>((set) => ({
  content: [],
  setContent: (content) => set({ content }),
}));

export const useFileRawStore = create<FileRawStore>((set) => ({
  raw: undefined,
  setRaw: (raw) => set({ raw }),
}));

interface TranspalFile {
  raw?: {
    diarization?: unknown;
    transcript?: unknown;
    srt?: string;
  };
  info?: {
    filename?: string;
    name?: string;
    date?: string;
    slug?: string;
    description?: string;
    time?: string;
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

function toSeconds(time: string) {
  const timeArr = time.split(":");
  const hours = parseInt(timeArr[0]);
  const minutes = parseInt(timeArr[1]);
  const seconds = parseInt(timeArr[2].split(",")[0]);
  const milliseconds = parseInt(timeArr[2].split(",")[1]);
  return hours * 60 * 60 + minutes * 60 + seconds + milliseconds / 1000;
}

export default function useCurrentFile() {
  const [panguEnabled] = useLocalStorage("pangu-enabled", true);
  const info = useFileInfoStore((state) => state.info);
  const setInfo = useFileInfoStore((state) => state.setInfo);
  const content = useFileContentStore((state) => state.content);
  const setContent = useFileContentStore((state) => state.setContent);
  const raw = useFileRawStore((state) => state.raw);
  const setRaw = useFileRawStore((state) => state.setRaw);
  function loadJson(json: TranspalFile) {
    const { info, raw, content } = json;

    setInfo(info);
    setRaw(raw);
    setContent(content);
  }
  function loadFile(file: File) {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result;
        const fileExtension = file.name.split(".").pop();
        if (typeof content === "string" && fileExtension === "srt") {
          // parse srt to json
          const srt = content.split("\n\n").map((x) => x.split("\n"));
          const info = {
            filename: file.name,
          };
          const raw = {
            diarization: null,
            transcript: null,
            srt: content,
          };
          const parsedContent: TranspalFile["content"] = [];
          let lastEnd = 0;

          // 00:00:00,000
          srt.forEach((x) => {
            const randomId = Math.random().toString(36).substring(7);
            if (x.length < 3) return;
            const textMatch = x[2].match(/(.*): (.*)/);
            const speaker = textMatch ? textMatch[1] : "Unknown";
            let text = textMatch ? textMatch[2] : x[2];
            if (panguEnabled) {
              text = pangu.spacing(text.trim());
            }

            const [start, end] = x[1].split(" --> ").map((x) => toSeconds(x));

            if (start > lastEnd + 60) {
              parsedContent.push({
                start: lastEnd,
                end: start,
                id: randomId,
                type: "divider",
                text: "",
                speaker: "",
              });
            }

            lastEnd = end;

            parsedContent.push({
              start,
              end,
              id: randomId,
              type: "speech",
              text,
              speaker,
            });
          });

          setInfo(info);
          setRaw(raw);
          setContent(parsedContent);
        } else if (typeof content === "string" && fileExtension === "json") {
          const res = JSON.parse(content);
          if (panguEnabled) {
            res.content = res.content.map(
              (x: { text: string; [key: string]: unknown }) => {
                x.text = pangu.spacing(x.text.trim());
                return x;
              }
            );
          }

          setInfo(res.info);
          setRaw(res.raw);
          setContent(res.content);
        }
      };
      reader.readAsText(file);
    }
  }

  const setFile = (file: TranspalFile | null) => {
    if (file === null) {
      setInfo(undefined);
      setContent([]);
      setRaw(undefined);
      return;
    }
    setInfo(file.info);
    setContent(file.content);
    setRaw(file.raw);
  };

  return {
    file: {
      info,
      content,
      raw,
    },
    setFile,
    loadFile,
    loadJson,
  };
}
