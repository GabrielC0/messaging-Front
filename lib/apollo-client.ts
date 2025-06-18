"use client";

import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  from,
  NormalizedCacheObject,
  ApolloLink,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { setContext } from "@apollo/client/link/context";

const TIMEOUT_MS = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || "15000");
const BACKEND_URL =
  process.env.NEXT_PUBLIC_GRAPHQL_URL ||
  "https://messaging-platform-gfnp.onrender.com/graphql";
const WEBSOCKET_URL =
  process.env.NEXT_PUBLIC_WEBSOCKET_URL ||
  "https://messaging-platform-gfnp.onrender.com";
const IS_PRODUCTION = process.env.NEXT_PUBLIC_NODE_ENV === "production";
const RECONNECT_INTERVAL = parseInt(
  process.env.NEXT_PUBLIC_RECONNECT_INTERVAL || "30000"
);

export let isBackendAvailable = true;
export let connectionState:
  | "connected"
  | "disconnected"
  | "connecting"
  | "error" = "disconnected";

export const startBackendMonitoring = (interval = RECONNECT_INTERVAL) => {
  const timerId = setInterval(async () => {
    await checkBackendAvailability();
  }, interval);

  return () => clearInterval(timerId);
};

export const checkBackendAvailability = async (): Promise<boolean> => {
  try {
    connectionState = "connecting";

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: "{ __typename }",
      }),
      signal: controller.signal,
      credentials: IS_PRODUCTION ? "omit" : "include",
    });

    clearTimeout(timeoutId);
    const prevStatus = isBackendAvailable;
    isBackendAvailable = response.ok;
    connectionState = isBackendAvailable ? "connected" : "error";

    if (!prevStatus && isBackendAvailable) {
      window.dispatchEvent(new CustomEvent("backend-reconnected"));
    }

    return isBackendAvailable;
  } catch (error: any) {
    console.warn("Backend unavailable:", error.message || error);
    const prevStatus = isBackendAvailable;
    isBackendAvailable = false;
    connectionState = "error";

    if (prevStatus && !isBackendAvailable) {
      window.dispatchEvent(
        new CustomEvent("backend-unreachable", {
          detail: {
            error,
            url: BACKEND_URL,
            environment: IS_PRODUCTION ? "production" : "development",
          },
        })
      );
    }

    return false;
  }
};

const timeoutLink = new ApolloLink((operation, forward) => {
  return forward(operation).map((response) => {
    return response;
  });
});

const errorLink = onError(
  ({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, locations, path }) => {
        console.error(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
        );

        if (IS_PRODUCTION) {
          console.error("GraphQL Error in production:", {
            operation: operation.operationName,
            message,
            path,
          });
        }
      });
    }

    if (networkError) {
      console.error(`[Network error]: ${networkError}`);
      console.error("Network error details:", {
        url: BACKEND_URL,
        environment: IS_PRODUCTION ? "production" : "development",
        error: networkError,
      });

      window.dispatchEvent(
        new CustomEvent("apollo-network-error", {
          detail: {
            error: networkError,
            operation: operation.operationName,
            url: BACKEND_URL,
          },
        })
      );
    }
  }
);

const authLink = setContext((_, { headers }) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  };
});

const httpLink = new HttpLink({
  uri: BACKEND_URL,
  credentials: IS_PRODUCTION ? "omit" : "include",
  fetchOptions: {
    timeout: TIMEOUT_MS,
  },
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export const client: ApolloClient<NormalizedCacheObject> = new ApolloClient({
  link: from([errorLink, timeoutLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          users: {
            merge: false,
          },
          conversations: {
            merge: false,
          },
          messages: {
            merge: false,
          },
        },
      },
      User: {
        keyFields: ["id"],
      },
      Conversation: {
        keyFields: ["id"],
      },
      Message: {
        keyFields: ["id"],
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: IS_PRODUCTION ? "cache-first" : "cache-and-network",
      errorPolicy: "all",
      notifyOnNetworkStatusChange: true,
    },
    query: {
      fetchPolicy: "cache-first",
      errorPolicy: "all",
    },
    mutate: {
      errorPolicy: "all",
      fetchPolicy: "no-cache",
    },
  },
  connectToDevTools: !IS_PRODUCTION,
});

export const resetApolloCache = () => {
  client.resetStore().catch((err) => {
    console.error("Error resetting Apollo cache:", err);
  });
};

export const getConnectionInfo = () => ({
  url: BACKEND_URL,
  isProduction: IS_PRODUCTION,
  timeout: TIMEOUT_MS,
  reconnectInterval: RECONNECT_INTERVAL,
  connectionState,
  isAvailable: isBackendAvailable,
});

export const forceReconnect = async () => {
  connectionState = "connecting";
  await checkBackendAvailability();

  if (isBackendAvailable) {
    await client.refetchQueries({ include: "active" });
  }
};

export const testConnectivity = async (maxRetries = 3): Promise<boolean> => {
  for (let i = 0; i < maxRetries; i++) {
    const isConnected = await checkBackendAvailability();
    if (isConnected) {
      return true;
    }

    if (i < maxRetries - 1) {
      const delay = Math.min(1000 * Math.pow(2, i), 10000);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  return false;
};

export const apolloConfig = {
  BACKEND_URL,
  IS_PRODUCTION,
  TIMEOUT_MS,
  RECONNECT_INTERVAL,
} as const;
