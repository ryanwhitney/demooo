import { useContext } from "react"
import { AuthContextType } from "../types/auth"
import { AuthContext } from "../providers/AuthContext";

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}