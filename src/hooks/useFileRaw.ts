import { useFileRawStore } from './useCurrentFile';

export function useFileRaw() {
  const raw = useFileRawStore((state) => state.raw);
  const setRaw = useFileRawStore((state) => state.setRaw);
  return { raw, setRaw };
}
