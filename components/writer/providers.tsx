"use client";

import { AuthKitProvider, useAccessToken, useAuth } from "@workos-inc/authkit-nextjs/components";
import {
  Authenticated,
  AuthLoading,
  ConvexProviderWithAuth,
  ConvexReactClient,
  Unauthenticated,
} from "convex/react";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

import type { Hosts } from "@/lib/links";

const Links = createContext<Hosts>({ root: null, site: "" });

export const useHosts = () => useContext(Links);

const useConvexAuthFromAuthKit = () => {
  const { user, loading } = useAuth();
  const { getAccessToken, refresh } = useAccessToken();

  const fetchAccessToken = useCallback(
    async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
      if (!user) {
        return null;
      }

      try {
        return (forceRefreshToken ? await refresh() : await getAccessToken()) ?? null;
      } catch {
        return null;
      }
    },
    [user, refresh, getAccessToken],
  );

  return { isLoading: loading, isAuthenticated: Boolean(user), fetchAccessToken };
};

const SignInAgain = () => {
  useEffect(() => {
    location.assign(`/sign-in?next=${encodeURIComponent(location.pathname)}`);
  }, []);

  return <div className="writer w-loading" />;
};

export const WriterProviders = ({ children, hosts }: { children: ReactNode; hosts: Hosts }) => {
  const [convex] = useState(() => new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL ?? ""));

  return (
    <AuthKitProvider>
      <ConvexProviderWithAuth client={convex} useAuth={useConvexAuthFromAuthKit}>
        <Links value={hosts}>
          <AuthLoading>
            <div className="writer w-loading" />
          </AuthLoading>
          <Authenticated>{children}</Authenticated>
          <Unauthenticated>
            <SignInAgain />
          </Unauthenticated>
        </Links>
      </ConvexProviderWithAuth>
    </AuthKitProvider>
  );
};
