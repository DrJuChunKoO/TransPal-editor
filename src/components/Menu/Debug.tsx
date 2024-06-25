import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
  MenubarSeparator,
} from "@/components/ui/menubar";
import { useState } from "react";
import useCurrentFile from "@/hooks/useCurrentFile";
export default function EditMenu() {
  const [historyDialog, setHistoryDialog] = useState(false);
  const { history } = useCurrentFile();
  return (
    <>
      <MenubarMenu>
        <MenubarTrigger>除錯</MenubarTrigger>
        <MenubarContent>
          <MenubarItem disabled>
            past: {history.past.length}, future: {history.future.length}
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem onClick={() => setHistoryDialog(true)}>歷史</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <ReplaceDialog open={historyDialog} setOpen={setHistoryDialog} />
    </>
  );
}

function ReplaceDialog({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const { history } = useCurrentFile();
  function closeDialog() {
    setOpen(false);
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogDescription className="flex flex-col gap-0.5 max-h-[80vh] overflow-y-scroll break-all">
          {history.past.map((x, i) => (
            <div className="bg-gray-50 p-1 flex justify-start items-center gap-2 rounded">
              <span> -{history.past.length - i}</span>
              <DiffViewer
                current={x}
                next={history.past[i + 1] ?? history.present}
              />
            </div>
          ))}
          <div className="bg-blue-100 text-blue-500 rounded p-1">Current</div>
          {history.future.map((x, i) => (
            <div className="bg-gray-50 p-1 flex justify-start items-center gap-2 rounded">
              <span>+{i + 1}</span>
              <DiffViewer
                current={x}
                next={history.future[i + 1] ?? history.present}
              />
            </div>
          ))}
        </DialogDescription>
        <DialogFooter>
          <Button onClick={closeDialog}>OK</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
function DiffViewer({ current, next }: { current: any; next: any }) {
  let o1Ids = current.content!.map((x: any) => x.id as string);
  let o2Ids = next.content!.map((x: any) => x.id as string);

  let result = {
    added: o2Ids.filter((x: string) => !o1Ids.includes(x)),
    removed: o1Ids.filter((x: string) => !o2Ids.includes(x)),
  };

  return (
    <div>
      {result.added.length > 0 && (
        <div className="text-green-500">+{result.added.join(", ")}</div>
      )}
      {result.removed.length > 0 && (
        <div className="text-red-500">-{result.removed.join(", ")}</div>
      )}
    </div>
  );
}
