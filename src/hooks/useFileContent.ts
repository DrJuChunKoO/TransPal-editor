import { useFileContentStore } from './useCurrentFile';

export function useFileContent() {
  const content = useFileContentStore((state) => state.content);
  const setContent = useFileContentStore((state) => state.setContent);
  return { content, setContent };
}
