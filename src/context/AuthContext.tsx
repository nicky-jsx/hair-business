"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { signUpStylist, signInStylist, getAccountById } from "@/lib/auth-db";
import { fetchStylistById } from "@/lib/stylists-db";
import type { Stylist } from "@/types/stylist";

interface StylistAccount {
  id: string;
  email: string;
  name: string;
  stylistId: string | null;
}

interface AuthContextType {
  ready: boolean;
  account: StylistAccount | null;
  profile: Stylist | null;
  signUp: (data: { email: string; password: string; name: string }) => Promise<{ error?: string }>;
  signIn: (data: { email: string; password: string }) => Promise<{ error?: string }>;
  signOut: () => void;
  refreshProfile: () => Promise<void>;
  setAccountStylistId: (stylistId: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = "strand_auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [account, setAccount] = useState<StylistAccount | null>(null);
  const [profile, setProfile] = useState<Stylist | null>(null);

  // Load account from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Verify account still exists in DB
        getAccountById(parsed.id).then((acc) => {
          if (acc) {
            setAccount(acc);
            if (acc.stylistId) {
              fetchStylistById(acc.stylistId).then(setProfile);
            }
          } else {
            localStorage.removeItem(STORAGE_KEY);
          }
          setReady(true);
        });
      } catch {
        localStorage.removeItem(STORAGE_KEY);
        setReady(true);
      }
    } else {
      setReady(true);
    }
  }, []);

  const signUp = useCallback(
    async (data: { email: string; password: string; name: string }) => {
      const result = await signUpStylist(data);
      if (result.error) {
        return { error: result.error };
      }
      if (result.account) {
        setAccount(result.account);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(result.account));
      }
      return {};
    },
    []
  );

  const signIn = useCallback(
    async (data: { email: string; password: string }) => {
      const result = await signInStylist(data);
      if (result.error) {
        return { error: result.error };
      }
      if (result.account) {
        setAccount(result.account);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(result.account));
        if (result.account.stylistId) {
          const stylist = await fetchStylistById(result.account.stylistId);
          setProfile(stylist);
        }
      }
      return {};
    },
    []
  );

  const signOut = useCallback(() => {
    setAccount(null);
    setProfile(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (account?.stylistId) {
      const stylist = await fetchStylistById(account.stylistId);
      setProfile(stylist);
    }
  }, [account?.stylistId]);

  const setAccountStylistId = useCallback((stylistId: string) => {
    if (account) {
      const updated = { ...account, stylistId };
      setAccount(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      fetchStylistById(stylistId).then(setProfile);
    }
  }, [account]);

  return (
    <AuthContext.Provider
      value={{
        ready,
        account,
        profile,
        signUp,
        signIn,
        signOut,
        refreshProfile,
        setAccountStylistId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
