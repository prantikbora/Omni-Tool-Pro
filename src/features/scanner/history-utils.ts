export interface HistoryItem {
  id: string;
  type: "scan" | "ocr";
  data: string;
  timestamp: number;
}

export const saveToHistory = (data: string, type: "scan" | "ocr") => {
  if (typeof window === "undefined") return;

  const history: HistoryItem[] = JSON.parse(localStorage.getItem("omnitool_history") || "[]");
  
  const newItem: HistoryItem = {
    id: crypto.randomUUID(),
    type,
    data,
    timestamp: Date.now(),
  };

  // Keep only the last 20 items to avoid bloating storage
  const updatedHistory = [newItem, ...history].slice(0, 20);
  localStorage.setItem("omnitool_history", JSON.stringify(updatedHistory));
};

export const getHistory = (): HistoryItem[] => {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem("omnitool_history") || "[]");
};