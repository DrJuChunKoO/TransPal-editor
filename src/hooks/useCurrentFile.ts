import { useLocalStorage } from "usehooks-ts";

export default function useCurrentFile() {
  const [file, setFile] = useLocalStorage<{
    raw?: any;
    info?: {
      filename?: string;
      name?: string;
      date?: string;
      slug?: string;
      description?: string;
    };
    content?: {
      start: number;
      end: number;
      id: string;
      type: "speech" | "divider";
      text: string;
      speaker: string;
    }[];
  }>("current-file", {});
  return { file, setFile };
}
