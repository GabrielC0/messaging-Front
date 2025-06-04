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

const TIMEOUT_MS = 5000;
const BACKEND_URL = "http://localhost:3002/graphql"; // Nouveau port pour NestJS

export let isBackendAvailable = true;

export const startBackendMonitoring = (interval = 30000) => {
  const timerId = setInterval(async () => {
    await checkBackendAvailability();
  }, interval);

  return () => clearInterval(timerId);
};

export const checkBackendAvailability = async (): Promise<boolean> => {
  try {
    console.log("Checking backend availability...");
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: "{ __typename }",
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const prevStatus = isBackendAvailable;
    isBackendAvailable = response.ok;
    console.log("Backend is available:", isBackendAvailable);

    if (!prevStatus && isBackendAvailable) {
      window.dispatchEvent(new CustomEvent("backend-reconnected"));
    }

    return isBackendAvailable;
  } catch (error: any) {
    console.warn("Backend unavailable:", error);
    const prevStatus = isBackendAvailable;
    isBackendAvailable = false;

    // Dispatch event if status changes from online to offline
    if (prevStatus && !isBackendAvailable) {
      window.dispatchEvent(
        new CustomEvent("backend-unreachable", {
          detail: { error },
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

// Intercepteur d'erreurs amélioré
const errorLink = onError(
  ({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, locations, path }) =>
        console.error(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
        )
      );
    }

    if (networkError) {
      console.error(`[Network error]: ${networkError}`);

      // Dispatch event for network errors
      window.dispatchEvent(
        new CustomEvent("apollo-network-error", {
          detail: { error: networkError },
        })
      );
    }
  }
);

// Link pour ajouter les headers d'authentification si nécessaire
const authLink = setContext((_, { headers }) => {
  // Récupérer le token d'authentification depuis localStorage si nécessaire
  const token = localStorage.getItem("authToken");

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

// Ajout d'un délai de timeout pour les requêtes HTTP
const httpLink = new HttpLink({
  uri: BACKEND_URL,
  credentials: "include",
  fetchOptions: {
    timeout: TIMEOUT_MS,
  },
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Création du client Apollo
export const client: ApolloClient<NormalizedCacheObject> = new ApolloClient({
  link: from([errorLink, timeoutLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          // Politiques de cache personnalisées
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-and-network", // Utilise le cache puis met à jour avec les données du réseau
      errorPolicy: "all",
      notifyOnNetworkStatusChange: true,
    },
    query: {
      fetchPolicy: "cache-first", // D'abord le cache, puis le réseau uniquement si nécessaire
      errorPolicy: "all",
    },
    mutate: {
      errorPolicy: "all",
    },
  },
  connectToDevTools: true,
});

// Fonction utilitaire pour réinitialiser le cache Apollo
export const resetApolloCache = () => {
  client.resetStore().catch((err) => {
    console.error("Error resetting Apollo cache:", err);
  });
};
