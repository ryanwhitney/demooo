import { createContext } from "react";
import type { ModalContextType } from "../types/modal";

export const ModalContext = createContext<ModalContextType | undefined>(
	undefined,
);
