import {
  useAudioPlayerContext,
  useAudioPlayerStore,
} from "@/contexts/AudioPlayerContext";

// 導出音訊元素 ID 用於全局參考
export const AUDIO_PLAYER_ID = "global-audio-player";

// 擴展 Window 接口來包含 showOpenFilePicker
declare global {
  interface Window {
    showOpenFilePicker: (options?: {
      types?: Array<{
        description: string;
        accept: Record<string, string[]>;
      }>;
      excludeAcceptAllOption?: boolean;
      multiple?: boolean;
    }) => Promise<FileSystemFileHandle[]>;
  }
}

// 導出 store 以便其他組件使用
export { useAudioPlayerStore };

// 導出一個簡化的鉤子，代理到 AudioPlayerContext
export default function useAudioPlayer() {
  const {
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
  } = useAudioPlayerContext();

  return {
    // 保持與原接口兼容的屬性名稱
    getAudioElement,
    showAudioInEditor: showAudioInContainer,
    restoreAudioToGlobal: restoreToGlobal,
    audioFile,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    seekTo,
    jumpToSegment,
    handleAudioUpload,
  };
}
