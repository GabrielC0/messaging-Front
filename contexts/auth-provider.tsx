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
import { useMutation, useLazyQuery, useQuery } from "@apollo/client";
import { GET_USER, GET_USERS, CREATE_USER } from "@/graphql/queries";

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
  register: (email: string, username?: string) => Promise<boolean>;
  logout: () => void;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  authError: null,
  register: async () => false,
  logout: () => {},
  clearAuthError: () => {},
});

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

  const [getUserQuery] = useLazyQuery(GET_USER);
  const {
    data: usersData,
    loading: usersLoading,
    error: usersError,
    refetch: refetchUsers,
  } = useQuery(GET_USERS, {
    onCompleted: (data) => {
      console.log("GET_USERS query completed:", data);
    },
    onError: (error) => {
      console.error("GET_USERS query error:", error);
    },
  });
  const [createUserMutation] = useMutation(CREATE_USER);

  // Log users data changes
  useEffect(() => {
    console.log("usersData changed:", usersData);
  }, [usersData]);

  // Initialize auth state from localStorage
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedAuth = localStorage.getItem("isAuthenticated");
        const storedUserId = localStorage.getItem("currentUserId");

        if (storedAuth === "true" && storedUserId) {
          try {
            const { data } = await getUserQuery({
              variables: { id: storedUserId },
            });

            if (data && data.user) {
              setUser(data.user as AuthUser);
              setIsAuthenticated(true);
            } else {
              localStorage.removeItem("currentUserId");
              localStorage.removeItem("isAuthenticated");
              setAuthError("Session expirée. Veuillez vous reconnecter.");
            }
          } catch (error) {
            console.error("Failed to fetch user data:", error);
            localStorage.removeItem("currentUserId");
            localStorage.removeItem("isAuthenticated");
            setAuthError("Problème de connexion. Veuillez vous reconnecter.");
          }
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

  useEffect(() => {
    if (!isLoading) {
      const currentPath = pathname || "/";
      if (!isAuthenticated && !isPublicRoute(currentPath)) {
        router.push("/auth");
      }
      if (isAuthenticated && isPublicRoute(currentPath)) {
        router.push("/");
      }
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  const clearAuthError = () => {
    setAuthError(null);
  };

  // Fonction pour gérer la connexion et l'inscription
  const register = async (
    email: string,
    username?: string
  ): Promise<boolean> => {
    try {
      setAuthError(null);

      if (!email || !email.trim()) {
        setAuthError("L'email est requis");
        return false;
      }

      // Récupérer la liste des utilisateurs et chercher par email
      console.log("Fetching users before checking email...");
      const { data: refreshedUsers } = await refetchUsers();
      console.log("Refreshed users data:", refreshedUsers);

      if (!refreshedUsers?.users) {
        console.error("Failed to fetch users list");
        setAuthError("Erreur lors de la récupération des utilisateurs");
        return false;
      }

      const existingUser = refreshedUsers.users.find(
        (u: GraphQLUser) => u.email === email
      );

      if (existingUser) {
        // L'utilisateur existe déjà, on le connecte
        console.log("User found, logging in:", existingUser);
        setUser(existingUser as AuthUser);
        setIsAuthenticated(true);
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("currentUserId", existingUser.id);
        return true;
      }

      // Si on n'a pas de username, c'est une tentative de connexion avec un compte inexistant
      if (!username) {
        setAuthError("Aucun compte trouvé avec cet email");
        return false;
      }

      // Validation du username pour l'inscription
      if (!username.trim()) {
        setAuthError("Le nom d'utilisateur est requis");
        return false;
      }

      // Créer l'utilisateur
      const { data } = await createUserMutation({
        variables: {
          createUserInput: {
            username,
            email,
            avatarUrl: "/placeholder.svg",
          },
        },
      });

      if (data?.createUser) {
        console.log("User created successfully:", data.createUser);
        setUser(data.createUser as AuthUser);
        setIsAuthenticated(true);
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("currentUserId", data.createUser.id);
        await refetchUsers(); // Rafraîchir la liste des utilisateurs
        return true;
      }

      setAuthError("Échec de la création de l'utilisateur");
      return false;
    } catch (error) {
      console.error("Auth error:", error);
      setAuthError(
        "Erreur: " +
          (error instanceof Error ? error.message : "Erreur inconnue")
      );
      return false;
    }
  };

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
        register,
        logout,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
