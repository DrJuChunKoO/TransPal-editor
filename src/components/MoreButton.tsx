import { MoreHorizontal, Trash, BetweenHorizonalEnd } from "lucide-react";
import React, { useState, useRef } from "react";
import { useOnClickOutside } from "usehooks-ts";
import { motion, AnimatePresence } from "framer-motion";
import { twMerge } from "tailwind-merge";
import useCurrentFile from "@/hooks/useCurrentFile";
function MenuButton({
  children,
  variant = "default",
  ...props
}: {
  children: React.ReactNode;
  variant?: "default" | "danger";
} & React.HTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={twMerge(
        "p-1 px-3 rounded-sm text-sm hover:bg-black/5 w-full text-left flex items-center gap-2",
        variant === "danger" && "text-red-500"
      )}
      {...props}
    >
      {children}
    </button>
  );
}
export default function MoreButton({ index }: { index: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(menuRef, () => setIsOpen(false));
  const { file, setFile } = useCurrentFile();
  function insertMarkdownBlock() {
    const randomId = Math.random().toString(36).substring(7);
    let newFile = { ...file };
    newFile.content!.splice(index + 1, 0, {
      id: randomId,
      type: "markdown",
      text: "",
    });
    setFile(newFile);
  }
  function insertDivider() {
    const randomId = Math.random().toString(36).substring(7);
    let newFile = { ...file };
    newFile.content!.splice(index + 1, 0, {
      id: randomId,
      type: "divider",
    });
    setFile(newFile);
  }
  function deleteItem() {
    let newFile = { ...file };
    newFile.content!.splice(index, 1);
    setFile(newFile);
  }
  return (
    <div className="p-1 relative" ref={menuRef}>
      <button
        className={twMerge(
          "size-6 flex items-center justify-center transition-colors rounded-sm",
          isOpen
            ? "bg-black/10 opacity-100 shadow-inner"
            : "opacity-0 group-hover:opacity-100 hover:bg-black/5 active:bg-black/10"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <MoreHorizontal size={16} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute bottom-0 right-0 bg-white shadow-md rounded overflow-hidden p-1 z-10 w-60 border border-gray-200"
            style={{
              y: "100%",
              originX: "calc(100% - 10px)",
              originY: "0",
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
          >
            <MenuButton
              onClick={() => {
                insertMarkdownBlock();
                setIsOpen(false);
              }}
            >
              <BetweenHorizonalEnd size={16} />
              <span>在下方插入 Markdown 區塊</span>
            </MenuButton>
            <MenuButton
              onClick={() => {
                insertDivider();
                setIsOpen(false);
              }}
            >
              <BetweenHorizonalEnd size={16} />
              <span>在下方插入分隔線</span>
            </MenuButton>
            <MenuButton
              variant="danger"
              onClick={() => {
                deleteItem();
                setIsOpen(false);
              }}
            >
              <Trash size={16} />
              <span>刪除這個項目</span>
            </MenuButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
