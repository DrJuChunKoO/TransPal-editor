export type RecordItem = {
  id: string;
  type: "speech" | "divider" | "markdown";
  text: string;
  speaker?: string;
  start?: number;
  end?: number;
};
