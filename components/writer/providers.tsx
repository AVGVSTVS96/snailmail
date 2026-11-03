"use client";

import { AuthKitProvider, useAccessToken, useAuth } from "@workos-inc/authkit-nextjs/components";
import { ConvexProviderWithAuth, ConvexReactClient } from "convex/react";
import type { Hosts } from "@/lib/links";
import { createContext, type ReactNode, useCallback, useContext, useState } from "react";

const Links = createContext<Hosts>({ root: null, site: "" });

export function useHosts() {
  return useContext(Links);
}

function useConvexAuthFromAuthKit() {
  const { user, loading } = useAuth();
  const { getAccessToken, refresh } = useAccessToken();

  const fetchAccessToken = useCallback(
    async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
      if (!user) return null;

      try {
        return (forceRefreshToken ? await refresh() : await getAccessToken()) ?? null;
      } catch {
        return null;
      }
    },
    [user, refresh, getAccessToken],
  );

  return { isLoading: loading, isAuthenticated: Boolean(user), fetchAccessToken };
}

export function WriterProviders({ children, hosts }: { children: ReactNode; hosts: Hosts }) {
  const [convex] = useState(() => new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL ?? ""));

  return (
    <AuthKitProvider>
      <ConvexProviderWithAuth client={convex} useAuth={useConvexAuthFromAuthKit}>
        <Links value={hosts}>{children}</Links>
      </ConvexProviderWithAuth>
    </AuthKitProvider>
  );
}
