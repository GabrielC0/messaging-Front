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

// Configuration du délai d'expiration des requêtes
const TIMEOUT_MS = 5000; // 5 secondes
const BACKEND_URL = "http://localhost:3002/graphql"; // Nouveau port pour NestJS

// Variable globale pour suivre l'état de la connexion
export let isBackendAvailable = true;
let consecutiveErrors = 0;
const MAX_CONSECUTIVE_ERRORS = 3;

// Fonction pour vérifier si le backend est disponible
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
    isBackendAvailable = response.ok;

    if (isBackendAvailable) {
      consecutiveErrors = 0;
      console.log("Backend is available");
      // Dispatch reconnected event if we were previously unavailable
      if (!isBackendAvailable) {
        window.dispatchEvent(new CustomEvent("backend-reconnected"));
      }
    } else {
      console.warn("Backend responded with error:", response.status);
      handleBackendError(new Error(`HTTP ${response.status}`));
    }

    return isBackendAvailable;
  } catch (error: any) {
    console.warn("Backend unavailable:", error);
    handleBackendError(error);
    return false;
  }
};

const handleBackendError = (error: any) => {
  consecutiveErrors++;
  isBackendAvailable = false;

  // Check if the error is EADDRINUSE
  const isPortConflict =
    error?.code === "EADDRINUSE" ||
    error?.message?.includes("EADDRINUSE") ||
    error?.message?.includes("address already in use");

  // Dispatch custom event with error details
  window.dispatchEvent(
    new CustomEvent("backend-unreachable", {
      detail: {
        consecutive: consecutiveErrors,
        error: {
          message: error?.message,
          code: isPortConflict ? "EADDRINUSE" : error?.code,
        },
      },
    })
  );

  if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
    console.error(
      `Backend is still unavailable after ${MAX_CONSECUTIVE_ERRORS} attempts`
    );
  }
};

// Link pour ajouter un timeout aux requêtes
const timeoutLink = new ApolloLink((operation, forward) => {
  return forward(operation).map((response) => {
    // Si la réponse est réussie, réinitialiser le compteur d'erreurs
    if (!response.errors) {
      consecutiveErrors = 0;
    }
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
      isBackendAvailable = false;
      consecutiveErrors++;

      // Déclencher un événement personnalisé pour signaler l'erreur de réseau
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("apollo-network-error", {
            detail: {
              message: networkError.message,
              consecutive: consecutiveErrors,
            },
          })
        );
      }
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

// Fonction utilitaire pour réinitialiser le cache Apollo après une déconnexion prolongée
export const resetApolloCache = () => {
  client.resetStore().catch((err) => {
    console.error("Error resetting Apollo cache:", err);
  });
};

// Fonction pour vérifier périodiquement la disponibilité du backend
export const startBackendMonitoring = (intervalMs = 30000) => {
  let timerId: number | null = null;

  const checkBackend = async () => {
    await checkBackendAvailability();

    // Si le backend est revenu en ligne après avoir été hors ligne
    if (isBackendAvailable && consecutiveErrors > 0) {
      consecutiveErrors = 0;
      resetApolloCache();

      // Informer l'interface utilisateur
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("backend-reconnected"));
      }
    }
  };

  if (typeof window !== "undefined") {
    timerId = window.setInterval(checkBackend, intervalMs);

    // Nettoyer l'intervalle en cas de démontage du composant
    return () => {
      if (timerId !== null) {
        clearInterval(timerId);
      }
    };
  }

  return () => {}; // no-op sur le serveur
};
