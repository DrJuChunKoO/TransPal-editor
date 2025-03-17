import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { useFileContentStore } from "@/hooks/useCurrentFile";
import { create } from "zustand";

// 定義音訊元素 ID
export const AUDIO_PLAYER_ID = "global-audio-player";

// 定義 AudioPlayerStore
interface AudioPlayerStore {
  audioFile: File | null;
  setAudioFile: (file: File | null) => void;
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  currentTime: number;
  setCurrentTime: (time: number) => void;
  duration: number;
  setDuration: (duration: number) => void;
  audioUrl: string | null;
  setAudioUrl: (url: string | null) => void;
  currentSegmentId: string | null;
  setCurrentSegmentId: (id: string | null) => void;
}

// 創建 Audio Player Store
export const useAudioPlayerStore = create<AudioPlayerStore>((set) => ({
  audioFile: null,
  setAudioFile: (file) => set({ audioFile: file }),
  isPlaying: false,
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  currentTime: 0,
  setCurrentTime: (currentTime) => set({ currentTime }),
  duration: 0,
  setDuration: (duration) => set({ duration }),
  audioUrl: null,
  setAudioUrl: (audioUrl) => set({ audioUrl }),
  currentSegmentId: null,
  setCurrentSegmentId: (id) => set({ currentSegmentId: id }),
}));

// 音訊上下文的類型定義
interface AudioPlayerContextType {
  getAudioElement: () => HTMLAudioElement | null;
  showAudioInContainer: (containerElement: HTMLElement | null) => void;
  restoreToGlobal: () => void;
  audioFile: File | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  togglePlay: () => void;
  seekTo: (time: number) => void;
  jumpToSegment: (segmentId: string) => void;
  handleAudioUpload: (file: File) => Promise<void>;
  currentSegmentId: string | null;
}

// 創建 Context
const AudioPlayerContext = createContext<AudioPlayerContextType | null>(null);

// Provider 組件
export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const content = useFileContentStore((state) => state.content);
  // 使用 refs 來保存事件處理函數
  const eventHandlersRef = useRef({
    timeUpdate: null as ((e: Event) => void) | null,
    durationChange: null as ((e: Event) => void) | null,
    ended: null as ((e: Event) => void) | null,
  });

  const {
    audioFile,
    setAudioFile,
    isPlaying,
    setIsPlaying,
    currentTime,
    setCurrentTime,
    duration,
    setDuration,
    audioUrl,
    setAudioUrl,
    currentSegmentId,
    setCurrentSegmentId,
  } = useAudioPlayerStore();

  // 輔助函數：獲取全局音訊元素
  const getAudioElement = (): HTMLAudioElement | null => {
    return document.getElementById(AUDIO_PLAYER_ID) as HTMLAudioElement;
  };

  // 輔助函數：確保全局音訊元素存在
  const ensureAudioElement = (): HTMLAudioElement => {
    let audioElement = getAudioElement();

    // 如果元素不存在，則創建它
    if (!audioElement) {
      audioElement = document.createElement("audio");
      audioElement.id = AUDIO_PLAYER_ID;
      audioElement.controls = true;
      audioElement.style.position = "fixed";
      audioElement.style.bottom = "0";
      audioElement.style.left = "0";
      audioElement.style.width = "100%";
      audioElement.style.zIndex = "1000";
      audioElement.style.display = "none"; // 初始時隱藏

      // 添加到 body
      document.body.appendChild(audioElement);
      console.log("已創建全局音訊元素");
    }

    return audioElement;
  };

  // 處理音訊文件上傳
  const handleAudioUpload = async (file: File) => {
    if (file) {
      try {
        console.log("開始上傳音訊文件:", file.name);

        // 確保音訊元素存在
        const audioElement = ensureAudioElement();

        // 先清理之前的 URL 以避免內存洩漏
        if (audioUrl) {
          URL.revokeObjectURL(audioUrl);
        }

        // 使用 URL.createObjectURL 創建音訊 URL
        const objectUrl = URL.createObjectURL(file);
        setAudioUrl(objectUrl);
        setAudioFile(file);

        // 設置音訊源
        audioElement.src = objectUrl;

        // 顯示音訊元素
        audioElement.style.display = "block";

        console.log("音訊文件已上傳, URL 已創建");

        // 重置播放狀態
        setIsPlaying(false);
        setCurrentTime(0);

        // 加載音訊
        audioElement.load();
      } catch (error) {
        console.error("載入音訊文件時發生錯誤:", error);
      }
    }
  };

  // 播放控制功能
  const togglePlay = () => {
    const audioElement = getAudioElement();

    if (!audioElement) {
      console.warn("無法控制播放：音訊元素不存在");
      return;
    }

    try {
      if (isPlaying) {
        console.log("暫停音訊播放");
        audioElement.pause();
        setIsPlaying(false);
      } else {
        console.log("開始音訊播放");
        audioElement
          .play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch((error) => {
            console.error("播放音訊時發生錯誤:", error);
            setIsPlaying(false);
          });
      }
    } catch (error) {
      console.error("控制音訊播放時發生錯誤:", error);
    }
  };

  // 跳轉到特定時間
  const seekTo = (time: number) => {
    const audioElement = getAudioElement();

    if (!audioElement) {
      console.warn("無法跳轉音訊：音訊元素不存在");
      return;
    }

    try {
      console.log(`音訊跳轉到時間點: ${time}秒`);

      // 確保時間點在有效範圍內
      const safeTime = Math.max(0, Math.min(time, audioElement.duration || 0));

      // 設置音訊時間點
      audioElement.currentTime = safeTime;
      setCurrentTime(safeTime);
    } catch (error) {
      console.error("設置音訊時間點時發生錯誤:", error);
    }
  };

  // 跳轉到特定語音片段
  const jumpToSegment = (segmentId: string) => {
    console.log("嘗試跳轉到片段:", segmentId);
    const audioElement = getAudioElement();

    // 檢查是否有音訊文件和參考
    if (!audioElement || !audioFile) {
      console.warn("無法跳轉到音訊片段：音訊元素或音訊文件不存在");
      return;
    }

    // 查找對應的片段
    const segment = content?.find((item) => item.id === segmentId);

    if (!segment) {
      console.warn(`無法找到ID為 ${segmentId} 的音訊片段`);
      return;
    }

    if (typeof segment.start !== "number") {
      console.warn(`音訊片段 ${segmentId} 沒有有效的開始時間`);
      return;
    }

    console.log(`跳轉到片段 ${segmentId}，時間點: ${segment.start}秒`);

    // 設置當前播放片段的 ID
    setCurrentSegmentId(segmentId);

    // 跳轉到對應時間點
    seekTo(segment.start);

    // 如果當前未播放，則開始播放
    if (!isPlaying) {
      console.log("開始播放音訊");
      audioElement
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((error) => {
          console.error("播放音訊時發生錯誤:", error);
        });
    }
  };

  // 在容器中顯示音訊元素
  const showAudioInContainer = (containerElement: HTMLElement | null) => {
    if (!containerElement) return;

    const audioElement = getAudioElement();
    if (!audioElement) return;

    // 將音訊元素移動到指定容器
    containerElement.appendChild(audioElement);
    audioElement.style.position = "static";
    audioElement.style.width = "100%";
    audioElement.style.zIndex = "auto";

    // 顯示音訊元素
    if (audioFile) {
      audioElement.style.display = "block";
    }
  };

  // 將音訊恢復到全局位置
  const restoreToGlobal = () => {
    const audioElement = getAudioElement();
    if (!audioElement) return;

    // 將音訊元素移回 body
    document.body.appendChild(audioElement);

    // 恢復全局樣式
    audioElement.style.position = "fixed";
    audioElement.style.bottom = "0";
    audioElement.style.left = "0";
    audioElement.style.width = "100%";
    audioElement.style.zIndex = "1000";
  };

  // 組件掛載時，創建全局音訊元素並添加事件監聽器
  useEffect(() => {
    // 確保音訊元素存在
    const audioElement = ensureAudioElement();

    // 創建事件處理函數，確保其不被頻繁重建
    const handleTimeUpdate = (e: Event) => {
      const audio = e.target as HTMLAudioElement;
      setCurrentTime(audio.currentTime);
    };

    const handleDurationChange = (e: Event) => {
      const audio = e.target as HTMLAudioElement;
      console.log("音訊時長已更新:", audio.duration);
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      console.log("音訊播放結束");
      setIsPlaying(false);
      const audio = getAudioElement();
      if (audio) {
        setCurrentTime(audio.duration);
      }
    };

    // 保存處理函數到 ref，以便在清理時使用
    eventHandlersRef.current = {
      timeUpdate: handleTimeUpdate,
      durationChange: handleDurationChange,
      ended: handleEnded,
    };

    // 設置事件監聽器
    audioElement.addEventListener("timeupdate", handleTimeUpdate);
    audioElement.addEventListener("durationchange", handleDurationChange);
    audioElement.addEventListener("ended", handleEnded);

    // 如果有預設音訊，則設置
    if (audioUrl) {
      audioElement.src = audioUrl;
      audioElement.style.display = "block";
      audioElement.load();
    } else {
      // 如果沒有音訊，設置一個空白音訊
      audioElement.src =
        "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
      audioElement.style.display = "none";
    }

    // 清理函數
    return () => {
      // 移除事件監聽器
      if (eventHandlersRef.current.timeUpdate) {
        audioElement.removeEventListener(
          "timeupdate",
          eventHandlersRef.current.timeUpdate
        );
      }
      if (eventHandlersRef.current.durationChange) {
        audioElement.removeEventListener(
          "durationchange",
          eventHandlersRef.current.durationChange
        );
      }
      if (eventHandlersRef.current.ended) {
        audioElement.removeEventListener(
          "ended",
          eventHandlersRef.current.ended
        );
      }
    };
  }, []); // 空依賴數組，只在組件掛載和卸載時執行

  // 當音訊 URL 變更時更新音訊元素
  useEffect(() => {
    const audioElement = getAudioElement();
    if (!audioElement) return;

    console.log("更新音訊源:", audioUrl ? "有音訊 URL" : "無音訊 URL");

    // 直接設置 src 屬性為對象 URL
    if (audioUrl) {
      audioElement.src = audioUrl;
      audioElement.style.display = "block";
    } else {
      // 如果沒有音訊，設置一個非常短的空白音訊
      audioElement.src =
        "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
      audioElement.style.display = "none";
    }

    // 重新加載音訊元素
    audioElement.load();
  }, [audioUrl]);

  // 組件卸載時釋放創建的對象 URL
  useEffect(() => {
    return () => {
      if (audioUrl) {
        console.log("清理音訊 URL 資源");
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  // 自動更新當前播放的片段 - 使用 currentTime 的變化檢測當前片段
  useEffect(() => {
    if (!content?.length || currentTime === 0) return;

    // 如果有當前正在播放的片段 ID，檢查是否需要自動暫停
    if (currentSegmentId && isPlaying) {
      const currentSegment = content.find(
        (item) => item.id === currentSegmentId
      );

      if (currentSegment && typeof currentSegment.end === "number") {
        // 如果當前時間超過了片段結束時間，自動暫停播放
        if (currentTime >= currentSegment.end) {
          console.log(`播放完片段 ${currentSegmentId}，自動暫停`);
          togglePlay(); // 暫停播放
          setCurrentSegmentId(null); // 清除當前片段 ID
        }
      }
    }

    // 可選：查找當前播放位置所在的片段（如果不是從特定片段開始播放）
    content.find(
      (item) =>
        item.type === "speech" &&
        typeof item.start === "number" &&
        typeof item.end === "number" &&
        currentTime >= item.start &&
        currentTime <= item.end
    );
  }, [currentTime, content, currentSegmentId, isPlaying]);

  // 提供的上下文值
  const contextValue: AudioPlayerContextType = {
    getAudioElement,
    showAudioInContainer,
    restoreToGlobal,
    audioFile,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    seekTo,
    jumpToSegment,
    handleAudioUpload,
    currentSegmentId,
  };

  return (
    <AudioPlayerContext.Provider value={contextValue}>
      {children}
    </AudioPlayerContext.Provider>
  );
}

// 自定義 Hook，方便使用音訊上下文
export function useAudioPlayerContext() {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error(
      "useAudioPlayerContext 必須在 AudioPlayerProvider 內部使用"
    );
  }
  return context;
}
