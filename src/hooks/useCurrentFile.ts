import { useLocalStorage } from "usehooks-ts";
import { pangu } from "pangu-ts";
import { create } from "zustand";

interface FileStore {
  file: TranspalFile | null;
  setFile: (file: TranspalFile | null) => void;
}

const useFileStore = create<FileStore>((set) => ({
  file: null,
  setFile: (file) => set({ file }),
}));

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
  const file = useFileStore((state) => state.file);
  const setCurrentFile = useFileStore((state) => state.setFile);
  function loadFile(file: File) {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result;
        const fileExtension = file.name.split(".").pop();
        if (typeof content === "string" && fileExtension === "srt") {
          // parse srt to json
          const srt = content.split("\n\n").map((x) => x.split("\n"));
          const result = {
            version: "1.0",
            info: {
              filename: file.name,
            },
            raw: {
              diarization: null,
              transcript: null,
              srt: content,
            },
            content: [] as any[],
          };
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
              result.content.push({
                start: lastEnd,
                end: start,
                id: randomId,
                type: "divider",
                text: "",
                speaker: "",
              });
            }

            lastEnd = end;

            result.content.push({
              start,
              end,
              id: randomId,
              type: "speech",
              text,
              speaker,
            });
          });

          setCurrentFile(result);
        } else if (typeof content === "string" && fileExtension === "json") {
          const res = JSON.parse(content);
          if (panguEnabled) {
            res.content = res.content.map((x: any) => {
              x.text = pangu.spacing(x.text.trim());
              return x;
            });
          }

          setCurrentFile(res);
        }
      };
      reader.readAsText(file);
    }
  }

  const setFile = (file: TranspalFile | null) => {
    setCurrentFile(file);
  };

  return {
    file,
    setFile,
    loadFile,
  };
}
