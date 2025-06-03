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

// Type représentant un utilisateur dans notre contexte d'authentification
interface AuthUser extends GraphQLUser {
  email: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => false,
  register: async () => false,
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const { createUser } = useCreateUser();
  const [getUserQuery] = useLazyQuery(GET_USER);

  // Initialize auth state from localStorage
  useEffect(() => {
    const checkAuth = async () => {
      const storedAuth = localStorage.getItem("isAuthenticated");
      const storedUserId = localStorage.getItem("currentUserId");

      if (storedAuth === "true" && storedUserId) {
        try {
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
          }
        } catch (error) {
          console.error("Failed to fetch user data:", error);
          localStorage.removeItem("currentUserId");
          localStorage.removeItem("isAuthenticated");
        }
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [getUserQuery]);

  // Redirect based on auth state
  useEffect(() => {
    if (!isLoading) {
      // If not authenticated and not on auth page, redirect to auth
      if (!isAuthenticated && pathname !== "/auth") {
        router.push("/auth");
      }

      // If authenticated and on auth page, redirect to home
      if (isAuthenticated && pathname === "/auth") {
        router.push("/");
      }
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  // Connexion d'un utilisateur
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Dans une application réelle, vous feriez une requête d'authentification ici
      // Pour l'instant, nous simulerons une recherche par email
      const { data } = await getUserQuery({
        variables: { id: "simulatedUserId" },
        // Cette requête est juste pour la simulation, elle ne fonctionnera pas réellement
      });

      // Dans une application réelle, vous vérifieriez le mot de passe ici
      // Pour cette démo, nous considérons toute tentative de connexion comme réussie

      // Simulons un utilisateur trouvé
      const mockUser: AuthUser = {
        id: "user-1",
        username: email.split("@")[0],
        email: email,
        avatarUrl: "/placeholder.svg",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setUser(mockUser);
      setIsAuthenticated(true);
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("currentUserId", mockUser.id);

      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  // Inscription d'un utilisateur
  const register = async (
    username: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
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

      return false;
    } catch (error) {
      console.error("Registration error:", error);
      return false;
    }
  };

  // Déconnexion
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("currentUserId");
    router.push("/auth");
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isLoading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
