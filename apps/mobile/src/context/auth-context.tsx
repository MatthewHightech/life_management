import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import * as Crypto from "expo-crypto";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { MobileAuthUser } from "@life/shared";
import { ApolloProvider } from "@apollo/client/react";
import { createApolloClient } from "@/src/lib/apollo";
import {
  clearStoredRefreshToken,
  exchangeGoogleCredentials,
  getStoredRefreshToken,
  logoutMobileSession,
  refreshMobileSession,
  storeRefreshToken,
  tokenPairToSession,
  type SessionState,
} from "@/src/lib/auth-storage";
import {
  getGoogleIosClientId,
  getGoogleIosUrlScheme,
  getGoogleWebClientId,
} from "@/src/lib/config";

WebBrowser.maybeCompleteAuthSession();

type AuthContextValue = {
  user: MobileAuthUser | null;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

function readIdToken(response: {
  authentication?: { idToken?: string | null } | null;
  params: Record<string, string>;
}): string | null {
  const fromAuth = response.authentication?.idToken?.trim();
  if (fromAuth) {
    return fromAuth;
  }
  const fromParams = response.params.id_token?.trim();
  return fromParams || null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const sessionRef = useRef<SessionState | null>(null);
  const deviceIdRef = useRef<string | null>(null);
  const pendingSignInRef = useRef<{
    resolve: () => void;
    reject: (error: Error) => void;
  } | null>(null);

  const iosClientId = getGoogleIosClientId();
  const googleNativeRedirect = `${getGoogleIosUrlScheme()}:/oauthredirect`;

  // Let Google provider pick platform client ID; native redirect must match iOS OAuth client.
  const [, response, promptAsync] = Google.useAuthRequest(
    {
      iosClientId,
      webClientId: getGoogleWebClientId(),
      scopes: ["openid", "profile", "email"],
    },
    {
      native: googleNativeRedirect,
    },
  );

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  const applySession = useCallback(async (next: SessionState) => {
    sessionRef.current = next;
    setSession(next);
    await storeRefreshToken(next.refreshToken);
  }, []);

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    const refreshToken = sessionRef.current?.refreshToken ?? (await getStoredRefreshToken());
    if (!refreshToken) {
      return null;
    }

    try {
      const pair = await refreshMobileSession(refreshToken);
      const next = tokenPairToSession(pair);
      await applySession(next);
      return next.accessToken;
    } catch {
      await clearStoredRefreshToken();
      sessionRef.current = null;
      setSession(null);
      return null;
    }
  }, [applySession]);

  const getAccessToken = useCallback(() => sessionRef.current?.accessToken ?? null, []);

  const apolloClient = useMemo(
    () => createApolloClient(getAccessToken, refreshAccessToken),
    [getAccessToken, refreshAccessToken],
  );

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      try {
        const refreshToken = await getStoredRefreshToken();
        if (!refreshToken) {
          return;
        }

        const pair = await refreshMobileSession(refreshToken);
        if (!cancelled) {
          await applySession(tokenPairToSession(pair));
        }
      } catch {
        await clearStoredRefreshToken();
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, [applySession]);

  // Code exchange completes async after promptAsync; wait for id_token on `response`.
  useEffect(() => {
    const pending = pendingSignInRef.current;
    if (!pending || !response) {
      return;
    }

    if (response.type === "dismiss" || response.type === "cancel" || response.type === "error") {
      pending.reject(new Error("Sign in cancelled"));
      pendingSignInRef.current = null;
      return;
    }

    if (response.type !== "success") {
      return;
    }

    const idToken = readIdToken(response);
    if (!idToken) {
      // Auto-exchange may still be in progress (code present, no token yet).
      if (response.params.code && !response.authentication) {
        return;
      }
      pending.reject(new Error("Google sign in did not return an ID token"));
      pendingSignInRef.current = null;
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        if (!deviceIdRef.current) {
          deviceIdRef.current = Crypto.randomUUID();
        }
        const pair = await exchangeGoogleCredentials({
          idToken,
          deviceId: deviceIdRef.current,
        });
        if (cancelled) {
          return;
        }
        await applySession(tokenPairToSession(pair));
        pending.resolve();
      } catch (error) {
        if (!cancelled) {
          pending.reject(error instanceof Error ? error : new Error("Sign in failed"));
        }
      } finally {
        if (!cancelled) {
          pendingSignInRef.current = null;
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [response, applySession]);

  const signIn = useCallback(async () => {
    if (pendingSignInRef.current) {
      throw new Error("Sign in already in progress");
    }

    await new Promise<void>((resolve, reject) => {
      pendingSignInRef.current = { resolve, reject };
      void promptAsync().then((result) => {
        if (result.type !== "success" && pendingSignInRef.current) {
          pendingSignInRef.current = null;
          reject(new Error("Sign in cancelled"));
        }
      });
    });
  }, [promptAsync]);

  const signOut = useCallback(async () => {
    const refreshToken = sessionRef.current?.refreshToken ?? (await getStoredRefreshToken());
    await logoutMobileSession(refreshToken);
    await clearStoredRefreshToken();
    sessionRef.current = null;
    setSession(null);
    await apolloClient.clearStore();
  }, [apolloClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      isLoading,
      signIn,
      signOut,
    }),
    [session, isLoading, signIn, signOut],
  );

  return (
    <AuthContext.Provider value={value}>
      <ApolloProvider client={apolloClient}>{children}</ApolloProvider>
    </AuthContext.Provider>
  );
}
