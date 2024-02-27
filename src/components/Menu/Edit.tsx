import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { useState } from "react";
import useCurrentFile from "@/hooks/useCurrentFile";
export default function EditMenu() {
  const [replaceDialog, setReplaceDialog] = useState(false);
  return (
    <>
      <MenubarMenu>
        <MenubarTrigger>編輯</MenubarTrigger>
        <MenubarContent>
          <MenubarItem onClick={() => setReplaceDialog(true)}>取代</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <ReplaceDialog open={replaceDialog} setOpen={setReplaceDialog} />
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
  const [replaceText, setReplaceText] = useState("");
  const [replaceWith, setReplaceWith] = useState("");
  const { file, setFile } = useCurrentFile();
  function onReplaceText() {
    if (replaceText === "") return;
    let currentContent = structuredClone(file.content)!;
    currentContent.forEach((x) => {
      //@ts-ignore
      x.text = x.text.replaceAll(replaceText, replaceWith);
    });
    setFile({ ...file, content: currentContent });
    setReplaceText("");
    setReplaceWith("");
    closeDialog();
  }
  function closeDialog() {
    setOpen(false);
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>取代</DialogTitle>
          <DialogDescription className="flex flex-col gap-4 pt-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="replaceText">搜尋</Label>
              <Input
                id="replaceText"
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
              />
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="replaceText">取代成</Label>
              <Input
                id="replaceWith"
                value={replaceWith}
                onChange={(e) => setReplaceWith(e.target.value)}
              />
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" onClick={closeDialog}>
            取消
          </Button>
          <Button onClick={onReplaceText}>取代</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
