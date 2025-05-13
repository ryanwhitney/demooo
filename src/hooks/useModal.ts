import { ModalContext } from "@/providers/ModalContext";
import type { ModalContextType } from "@/types/modal";
import { useContext } from "react";

export function useModal(): ModalContextType {
  const context = useContext(ModalContext);

  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider");
  }

  return context;
}
