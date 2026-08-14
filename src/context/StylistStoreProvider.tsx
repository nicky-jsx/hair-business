"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { stylists as sampleStylists } from "@/data/stylists";
import {
  getCurrentAccount,
  getCustomStylists,
  getSessionAccountId,
  linkProfileToAccount,
  saveCustomStylist,
  signOut,
  signUp,
  updateCustomStylist,
} from "@/lib/stylist-store";
import type { StylistAccount, SignUpInput } from "@/types/account";
import type { Stylist, StylistFilters } from "@/types/stylist";
import { formatRegion } from "@/types/stylist";

interface StylistStoreContextValue {
  ready: boolean;
  stylists: Stylist[];
  account: StylistAccount | null;
  signUp: (input: SignUpInput) => { error?: string };
  signOut: () => void;
  createProfile: (stylist: Stylist) => void;
  updateProfile: (stylist: Stylist) => void;
  getStylistById: (id: string) => Stylist | undefined;
  filterStylists: (filters: StylistFilters) => Stylist[];
  refresh: () => void;
}

const StylistStoreContext = createContext<StylistStoreContextValue | null>(null);

export function StylistStoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [ready, setReady] = useState(false);
  const [customStylists, setCustomStylists] = useState<Stylist[]>([]);
  const [account, setAccount] = useState<StylistAccount | null>(null);

  const refresh = useCallback(() => {
    setCustomStylists(getCustomStylists());
    setAccount(getCurrentAccount());
    setReady(true);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const stylists = useMemo(
    () => [...sampleStylists, ...customStylists],
    [customStylists]
  );

  const getStylistById = useCallback(
    (id: string) => stylists.find((s) => s.id === id),
    [stylists]
  );

  const filterStylistsFn = useCallback(
    (filters: StylistFilters) => {
      const query = filters.query.trim().toLowerCase();

      return stylists.filter((stylist) => {
        const matchesSpecialty =
          !filters.specialty || stylist.specialties.includes(filters.specialty);
        const matchesRegion =
          !filters.region || stylist.region === filters.region;

        if (!query) return matchesSpecialty && matchesRegion;

        const searchable = [
          stylist.name,
          stylist.tagline,
          stylist.region,
          formatRegion(stylist.region),
          ...stylist.specialties,
        ]
          .join(" ")
          .toLowerCase();

        return (
          matchesSpecialty && matchesRegion && searchable.includes(query)
        );
      });
    },
    [stylists]
  );

  const handleSignUp = useCallback(
    (input: SignUpInput) => {
      const result = signUp(input.name, input.email, input.password);
      if ("error" in result) return { error: result.error };
      refresh();
      return {};
    },
    [refresh]
  );

  const handleSignOut = useCallback(() => {
    signOut();
    refresh();
  }, [refresh]);

  const createProfile = useCallback(
    (stylist: Stylist) => {
      saveCustomStylist(stylist);
      const sessionId = getSessionAccountId();
      if (sessionId) linkProfileToAccount(sessionId, stylist.id);
      refresh();
    },
    [refresh]
  );

  const updateProfile = useCallback(
    (stylist: Stylist) => {
      updateCustomStylist(stylist);
      refresh();
    },
    [refresh]
  );

  const value = useMemo(
    () => ({
      ready,
      stylists,
      account,
      signUp: handleSignUp,
      signOut: handleSignOut,
      createProfile,
      updateProfile,
      getStylistById,
      filterStylists: filterStylistsFn,
      refresh,
    }),
    [
      ready,
      stylists,
      account,
      handleSignUp,
      handleSignOut,
      createProfile,
      updateProfile,
      getStylistById,
      filterStylistsFn,
      refresh,
    ]
  );

  return (
    <StylistStoreContext.Provider value={value}>
      {children}
    </StylistStoreContext.Provider>
  );
}

export function useStylistStore() {
  const ctx = useContext(StylistStoreContext);
  if (!ctx) {
    throw new Error("useStylistStore must be used within StylistStoreProvider");
  }
  return ctx;
}
