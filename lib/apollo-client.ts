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

// Configuration dynamique basée sur l'environnement
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
    console.log(`Checking backend availability at: ${BACKEND_URL}`);
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
      credentials: IS_PRODUCTION ? "omit" : "include", // Pas de credentials en production cross-origin
    });

    clearTimeout(timeoutId);
    const prevStatus = isBackendAvailable;
    isBackendAvailable = response.ok;
    connectionState = isBackendAvailable ? "connected" : "error";

    console.log(
      `Backend status: ${
        isBackendAvailable ? "✅ Available" : "❌ Unavailable"
      }`
    );
    console.log(`Environment: ${IS_PRODUCTION ? "Production" : "Development"}`);

    if (!prevStatus && isBackendAvailable) {
      window.dispatchEvent(new CustomEvent("backend-reconnected"));
    }

    return isBackendAvailable;
  } catch (error: any) {
    console.warn("Backend unavailable:", error.message || error);
    const prevStatus = isBackendAvailable;
    isBackendAvailable = false;
    connectionState = "error";

    // Dispatch event if status changes from online to offline
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

// Link pour ajouter un timeout aux requêtes
const timeoutLink = new ApolloLink((operation, forward) => {
  return forward(operation).map((response) => {
    return response;
  });
});

// Intercepteur d'erreurs amélioré pour l'environnement cloud
const errorLink = onError(
  ({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, locations, path }) => {
        console.error(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
        );

        // Log supplémentaire pour la production
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

      // Dispatch event for network errors
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

// Link pour ajouter les headers d'authentification et de configuration cloud
const authLink = setContext((_, { headers }) => {
  // Récupérer le token d'authentification depuis localStorage si nécessaire
  const token =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  return {
    headers: {
      ...headers,
      // Ne pas inclure cache-control et x-requested-with pour éviter les erreurs CORS
      authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  };
});

// Configuration HTTP adaptée pour l'environnement cloud
const httpLink = new HttpLink({
  uri: BACKEND_URL,
  credentials: IS_PRODUCTION ? "omit" : "include", // Pas de credentials en production cross-origin
  fetchOptions: {
    timeout: TIMEOUT_MS,
  },
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Création du client Apollo optimisé pour l'environnement cloud
export const client: ApolloClient<NormalizedCacheObject> = new ApolloClient({
  link: from([errorLink, timeoutLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          // Politiques de cache personnalisées pour l'environnement cloud
          users: {
            merge: false, // Remplace complètement les données utilisateur
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
      fetchPolicy: IS_PRODUCTION ? "cache-first" : "cache-and-network", // Plus agressif en production
      errorPolicy: "all",
      notifyOnNetworkStatusChange: true,
    },
    query: {
      fetchPolicy: "cache-first", // D'abord le cache, puis le réseau uniquement si nécessaire
      errorPolicy: "all",
    },
    mutate: {
      errorPolicy: "all",
      fetchPolicy: "no-cache", // Toujours aller au serveur pour les mutations
    },
  },
  connectToDevTools: !IS_PRODUCTION, // Désactivé en production
});

// Fonction utilitaire pour réinitialiser le cache Apollo
export const resetApolloCache = () => {
  client.resetStore().catch((err) => {
    console.error("Error resetting Apollo cache:", err);
  });
};

// Nouvelles fonctions utilitaires pour l'environnement cloud
export const getConnectionInfo = () => ({
  url: BACKEND_URL,
  isProduction: IS_PRODUCTION,
  timeout: TIMEOUT_MS,
  reconnectInterval: RECONNECT_INTERVAL,
  connectionState,
  isAvailable: isBackendAvailable,
});

// Fonction pour forcer une reconnexion
export const forceReconnect = async () => {
  console.log("🔄 Forcing reconnection to backend...");
  connectionState = "connecting";
  await checkBackendAvailability();

  if (isBackendAvailable) {
    // Refetch toutes les requêtes actives
    await client.refetchQueries({ include: "active" });
  }
};

// Fonction pour tester la connectivité avec retry
export const testConnectivity = async (maxRetries = 3): Promise<boolean> => {
  for (let i = 0; i < maxRetries; i++) {
    console.log(`🔄 Testing connectivity... Attempt ${i + 1}/${maxRetries}`);

    const isConnected = await checkBackendAvailability();
    if (isConnected) {
      console.log("✅ Connectivity test successful");
      return true;
    }

    if (i < maxRetries - 1) {
      // Attendre avant le prochain essai (délai exponentiel)
      const delay = Math.min(1000 * Math.pow(2, i), 10000);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  console.log("❌ Connectivity test failed after all retries");
  return false;
};

// Export de la configuration pour debugging
export const apolloConfig = {
  BACKEND_URL,
  IS_PRODUCTION,
  TIMEOUT_MS,
  RECONNECT_INTERVAL,
} as const;
