import { useContext } from "react";
import { ModalContext } from "@/providers/ModalContext";
import type { ModalContextType } from "@/types/modal";

export function useModal(): ModalContextType {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
} 