"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { User as GraphQLUser } from "@/graphql/types";
import { useCreateUser, useUser } from "@/graphql/hooks";
import { useLazyQuery } from "@apollo/client";
import { GET_USER } from "@/graphql/queries";
import { isBackendAvailable } from "@/lib/apollo-client";
import { mockUsers } from "@/lib/mock-data";

// Liste des routes publiques (accessibles sans authentification)
const PUBLIC_ROUTES = ["/auth", "/register"];

// Type représentant un utilisateur dans notre contexte d'authentification
interface AuthUser extends GraphQLUser {
  email: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<boolean>;
  logout: () => void;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  authError: null,
  login: async () => false,
  register: async () => false,
  logout: () => {},
  clearAuthError: () => {},
});

/**
 * Vérifie si une route est publique (accessible sans authentification)
 */
export const isPublicRoute = (path: string): boolean => {
  return PUBLIC_ROUTES.some(
    (route) => path === route || path.startsWith(`${route}/`)
  );
};

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const { createUser } = useCreateUser();
  const [getUserQuery] = useLazyQuery(GET_USER);

  // Initialize auth state from localStorage
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedAuth = localStorage.getItem("isAuthenticated");
        const storedUserId = localStorage.getItem("currentUserId");

        if (storedAuth === "true" && storedUserId) {
          try {
            // Si le backend n'est pas disponible, utiliser les données fictives
            if (!isBackendAvailable) {
              const mockUser = mockUsers.find((u) => u.id === storedUserId);

              if (mockUser) {
                setUser(mockUser as AuthUser);
                setIsAuthenticated(true);
                console.log(
                  "Using mock user data due to backend unavailability"
                );
              } else {
                // Nettoyer si même l'utilisateur fictif n'est pas trouvé
                localStorage.removeItem("currentUserId");
                localStorage.removeItem("isAuthenticated");
                setAuthError("Session expirée. Veuillez vous reconnecter.");
              }
              setIsLoading(false);
              return;
            }

            // Récupérer les données utilisateur depuis l'API
            const { data } = await getUserQuery({
              variables: { id: storedUserId },
            });

            if (data && data.user) {
              setUser(data.user as AuthUser);
              setIsAuthenticated(true);
            } else {
              // Utilisateur non trouvé dans l'API, nettoyage
              localStorage.removeItem("currentUserId");
              localStorage.removeItem("isAuthenticated");
              setAuthError("Session expirée. Veuillez vous reconnecter.");
            }
          } catch (error) {
            console.error("Failed to fetch user data:", error);

            // En cas d'erreur, essayer d'utiliser les données fictives
            const mockUser = mockUsers.find((u) => u.id === storedUserId);

            if (mockUser) {
              setUser(mockUser as AuthUser);
              setIsAuthenticated(true);
              console.warn("Using mock user data due to backend error");
            } else {
              localStorage.removeItem("currentUserId");
              localStorage.removeItem("isAuthenticated");
              setAuthError("Problème de connexion. Veuillez vous reconnecter.");
            }
          }
        } else if (storedAuth === "true" && !storedUserId) {
          // Données incohérentes, nettoyage
          localStorage.removeItem("isAuthenticated");
          setAuthError("Session invalide. Veuillez vous reconnecter.");
        }
      } catch (e) {
        console.error("Error checking authentication:", e);
        setAuthError(
          "Une erreur s'est produite lors de la vérification de l'authentification."
        );
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [getUserQuery]);
  // Redirect based on auth state
  useEffect(() => {
    if (!isLoading) {
      const currentPath = pathname || "/";

      // Si l'utilisateur n'est pas authentifié et tente d'accéder à une route protégée
      if (!isAuthenticated && !isPublicRoute(currentPath)) {
        console.log(
          `Redirecting to /auth from protected route: ${currentPath}`
        );
        router.push("/auth");
      }

      // Si l'utilisateur est authentifié et tente d'accéder à une route publique (comme la page de login)
      if (isAuthenticated && isPublicRoute(currentPath)) {
        console.log(`Redirecting to / from public route: ${currentPath}`);
        router.push("/");
      }
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  // Fonction pour effacer les erreurs d'authentification
  const clearAuthError = () => {
    setAuthError(null);
  };
  // Connexion d'un utilisateur
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setAuthError(null);

      // Validation des entrées
      if (!email || !email.trim()) {
        setAuthError("L'email est requis");
        return false;
      }

      if (!password || password.length < 6) {
        setAuthError("Le mot de passe doit contenir au moins 6 caractères");
        return false;
      }

      // Si le backend n'est pas disponible, utiliser les données fictives
      if (!isBackendAvailable) {
        // Trouver un utilisateur fictif correspondant à l'email ou utiliser le premier
        const mockUser = mockUsers.find(
          (u) =>
            u.email === email || u.email.toLowerCase() === email.toLowerCase()
        );

        if (!mockUser) {
          setAuthError("Aucun utilisateur trouvé avec cet email");
          return false;
        }

        setUser(mockUser as AuthUser);
        setIsAuthenticated(true);
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("currentUserId", mockUser.id);

        console.warn("Using mock login due to backend unavailability");
        return true;
      }

      // Dans une application réelle, vous feriez une requête d'authentification ici
      const { data } = await getUserQuery({
        variables: { id: "simulatedUserId" },
        // Cette requête est juste pour la simulation, elle ne fonctionnera pas réellement
      });

      // Simulons un utilisateur trouvé
      const userToLogin: AuthUser = {
        id: "user-1",
        username: email.split("@")[0],
        email: email,
        avatarUrl: "/placeholder.svg",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setUser(userToLogin);
      setIsAuthenticated(true);
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("currentUserId", userToLogin.id);

      return true;
    } catch (error) {
      console.error("Login error:", error);
      setAuthError(
        "Erreur de connexion: " +
          (error instanceof Error ? error.message : "Erreur inconnue")
      );

      // En cas d'erreur, essayer le login avec des données fictives
      try {
        const mockUser = mockUsers.find(
          (u) =>
            u.email === email || u.email.toLowerCase() === email.toLowerCase()
        );

        if (!mockUser) {
          setAuthError("Aucun utilisateur trouvé avec cet email");
          return false;
        }

        setUser(mockUser as AuthUser);
        setIsAuthenticated(true);
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("currentUserId", mockUser.id);

        console.warn("Fallback to mock login after error");
        return true;
      } catch (mockError) {
        console.error("Even mock login failed:", mockError);
        setAuthError("Erreur critique lors de la connexion");
        return false;
      }
    }
  };
  // Inscription d'un utilisateur
  const register = async (
    username: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      setAuthError(null);

      // Validation des entrées
      if (!username || username.length < 3) {
        setAuthError(
          "Le nom d'utilisateur doit contenir au moins 3 caractères"
        );
        return false;
      }

      if (!email || !email.includes("@")) {
        setAuthError("Email invalide");
        return false;
      }

      if (!password || password.length < 6) {
        setAuthError("Le mot de passe doit contenir au moins 6 caractères");
        return false;
      }

      // Si le backend n'est pas disponible, créer un utilisateur fictif
      if (!isBackendAvailable) {
        // Vérifier si un utilisateur avec cet email existe déjà
        const existingUser = mockUsers.find(
          (u) => u.email.toLowerCase() === email.toLowerCase()
        );

        if (existingUser) {
          setAuthError("Un utilisateur avec cet email existe déjà");
          return false;
        }

        const newMockUser: AuthUser = {
          id: `user-${Date.now()}`,
          username: username,
          email: email,
          avatarUrl: "/placeholder.svg",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Ajouter l'utilisateur aux données fictives
        mockUsers.push(newMockUser);

        // Connecter l'utilisateur
        setUser(newMockUser);
        setIsAuthenticated(true);
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("currentUserId", newMockUser.id);

        console.warn("Using mock registration due to backend unavailability");
        return true;
      }

      // Dans une application réelle, vous utiliseriez la mutation createUser
      const newUser = await createUser({
        username,
        email,
        avatarUrl: "/placeholder.svg", // Avatar par défaut
      });

      if (newUser) {
        // Si l'utilisateur est créé avec succès, connectez-le
        const authUser = newUser as AuthUser;
        setUser(authUser);
        setIsAuthenticated(true);
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("currentUserId", authUser.id);
        return true;
      }

      setAuthError("Échec de la création du compte");
      return false;
    } catch (error) {
      console.error("Registration error:", error);
      setAuthError(
        "Erreur d'inscription: " +
          (error instanceof Error ? error.message : "Erreur inconnue")
      );

      // En cas d'erreur, essayer d'utiliser un utilisateur fictif
      try {
        // Vérifier si un utilisateur avec cet email existe déjà
        const existingUser = mockUsers.find(
          (u) => u.email.toLowerCase() === email.toLowerCase()
        );

        if (existingUser) {
          setAuthError("Un utilisateur avec cet email existe déjà");
          return false;
        }

        const newMockUser: AuthUser = {
          id: `user-${Date.now()}`,
          username: username,
          email: email,
          avatarUrl: "/placeholder.svg",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        mockUsers.push(newMockUser);

        setUser(newMockUser);
        setIsAuthenticated(true);
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("currentUserId", newMockUser.id);

        console.warn("Fallback to mock registration after error");
        return true;
      } catch (mockError) {
        console.error("Even mock registration failed:", mockError);
        setAuthError("Erreur critique lors de l'inscription");
        return false;
      }
    }
  };
  // Déconnexion
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setAuthError(null);
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("currentUserId");
    router.push("/auth");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        authError,
        login,
        register,
        logout,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
