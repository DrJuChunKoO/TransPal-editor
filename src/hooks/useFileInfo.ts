import { useFileInfoStore } from './useCurrentFile';

export function useFileInfo() {
  const info = useFileInfoStore((state) => state.info);
  const setInfo = useFileInfoStore((state) => state.setInfo);
  return { info, setInfo };
}
