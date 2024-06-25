import { useLocalStorage } from "usehooks-ts";
import { pangu } from "pangu-ts";
import { useHistory } from "@/context/fileContext";
const HISTORY_COUNT = 100;
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

export default function useCurrentFile() {
  const [panguEnabled] = useLocalStorage("pangu-enabled", true);
  const { history, setHistory } = useHistory();
  function loadFile(file: File) {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result;
        const fileExtension = file.name.split(".").pop();
        if (typeof content === "string" && fileExtension === "srt") {
          // parse srt to json
          const srt = content.split("\n\n").map((x) => x.split("\n"));
          let result = {
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
          function toSeconds(time: string) {
            const timeArr = time.split(":");
            const hours = parseInt(timeArr[0]);
            const minutes = parseInt(timeArr[1]);
            const seconds = parseInt(timeArr[2].split(",")[0]);
            const milliseconds = parseInt(timeArr[2].split(",")[1]);
            return (
              hours * 60 * 60 + minutes * 60 + seconds + milliseconds / 1000
            );
          }
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

          setHistory({
            past: [],
            present: result,
            future: [],
          });
        } else if (typeof content === "string" && fileExtension === "json") {
          let res = JSON.parse(content);
          if (panguEnabled) {
            res.content = res.content.map((x: any) => {
              x.text = pangu.spacing(x.text.trim());
              return x;
            });
          }

          setHistory({
            past: [],
            present: res,
            future: [],
          });
        }
      };
      reader.readAsText(file);
    }
  }
  const setFile = (file: TranspalFile | null) => {
    if (history.present)
      setHistory({
        past: [...history.past, history.present].slice(-HISTORY_COUNT),
        present: file,
        future: [],
      });
    window.onbeforeunload = () => {
      return "Are you sure you want to leave?";
    };
  };
  const undo = () => {
    if (history.past.length && history.present) {
      const previous = history.past[history.past.length - 1];
      const newPast = history.past.slice(0, history.past.length - 1);
      setHistory({
        past: newPast,
        present: previous,
        future: [history.present, ...history.future].slice(0, HISTORY_COUNT),
      });
    }
  };
  const redo = () => {
    if (history.future.length && history.present) {
      const next = history.future[0];
      const newFuture = history.future.slice(1);
      setHistory({
        past: [...history.past, history.present],
        present: next,
        future: newFuture,
      });
    }
  };
  return {
    file: history.present,
    setFile,
    loadFile,
    undo,
    redo,
    history,
    setHistory,
  };
}
