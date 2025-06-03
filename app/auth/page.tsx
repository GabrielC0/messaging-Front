"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-provider";
import { isBackendAvailable } from "@/lib/apollo-client";

export default function AuthPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { login, register, authError, clearAuthError } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState<
    "available" | "unavailable" | "checking"
  >("checking");

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form state
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");

  // Vérifier la disponibilité du backend
  useEffect(() => {
    setBackendStatus(isBackendAvailable ? "available" : "unavailable");

    // Écouter les événements de déconnexion du backend
    const handleBackendUnreachable = () => {
      setBackendStatus("unavailable");
      toast({
        title: "Serveur indisponible",
        description: "Mode hors-ligne activé. Données limitées.",
        variant: "destructive",
      });
    };

    // Écouter les événements de reconnexion au backend
    const handleBackendReconnected = () => {
      setBackendStatus("available");
      toast({
        title: "Connexion rétablie",
        description: "Le serveur est à nouveau disponible.",
      });
    };

    window.addEventListener("backend-unreachable", handleBackendUnreachable);
    window.addEventListener("backend-reconnected", handleBackendReconnected);

    return () => {
      window.removeEventListener(
        "backend-unreachable",
        handleBackendUnreachable
      );
      window.removeEventListener(
        "backend-reconnected",
        handleBackendReconnected
      );
    };
  }, [toast]);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAuthError();
    setIsLoading(true);

    try {
      // Validation basique côté client
      if (!loginEmail.trim()) {
        toast({
          title: "Erreur de validation",
          description: "L'email est requis",
          variant: "destructive",
        });
        return;
      }

      if (!loginPassword || loginPassword.length < 6) {
        toast({
          title: "Erreur de validation",
          description: "Le mot de passe doit contenir au moins 6 caractères",
          variant: "destructive",
        });
        return;
      }

      const success = await login(loginEmail, loginPassword);

      if (success) {
        toast({
          title: "Connexion réussie",
          description:
            backendStatus === "unavailable"
              ? "Connecté en mode hors-ligne"
              : "Vous êtes maintenant connecté",
        });
      } else if (authError) {
        // L'erreur sera affichée via authError dans le formulaire
      } else {
        throw new Error("Échec de la connexion");
      }
    } catch (error) {
      toast({
        title: "Erreur de connexion",
        description: "Vérifiez vos identifiants et réessayez",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAuthError();
    setIsLoading(true);

    try {
      // Validation côté client
      if (!registerName || registerName.length < 3) {
        toast({
          title: "Erreur de validation",
          description:
            "Le nom d'utilisateur doit contenir au moins 3 caractères",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (!registerEmail || !registerEmail.includes("@")) {
        toast({
          title: "Erreur de validation",
          description: "Email invalide",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (!registerPassword || registerPassword.length < 6) {
        toast({
          title: "Erreur de validation",
          description: "Le mot de passe doit contenir au moins 6 caractères",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Validation
      if (registerPassword !== registerConfirmPassword) {
        toast({
          title: "Erreur de validation",
          description: "Les mots de passe ne correspondent pas",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const success = await register(
        registerName,
        registerEmail,
        registerPassword
      );

      if (success) {
        toast({
          title: "Inscription réussie",
          description:
            backendStatus === "unavailable"
              ? "Compte créé en mode hors-ligne"
              : "Votre compte a été créé avec succès",
        });
      } else if (authError) {
        // L'erreur sera affichée via authError dans le formulaire
      } else {
        throw new Error("Échec de l'inscription");
      }
    } catch (error) {
      toast({
        title: "Erreur d'inscription",
        description:
          error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">WhatsApp Clone</CardTitle>
          <CardDescription>
            Connectez-vous ou créez un compte pour commencer à discuter
          </CardDescription>

          {backendStatus === "unavailable" && (
            <Alert className="mt-4 bg-yellow-100 border-yellow-200">
              <AlertDescription className="text-sm text-yellow-800">
                Serveur indisponible. Mode hors-ligne activé. Fonctionnalités
                limitées.
              </AlertDescription>
            </Alert>
          )}

          {authError && (
            <Alert className="mt-4 bg-red-100 border-red-200">
              <AlertDescription className="text-sm text-red-800">
                {authError}
              </AlertDescription>
            </Alert>
          )}
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">Connexion</TabsTrigger>
              <TabsTrigger value="register">Inscription</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="exemple@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Mot de passe</Label>
                    <Link
                      href="#"
                      className="text-sm text-blue-500 hover:underline"
                    >
                      Mot de passe oublié?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Connexion en cours..." : "Se connecter"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet</Label>
                  <Input
                    id="name"
                    placeholder="Votre nom"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="exemple@email.com"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Mot de passe</Label>
                  <Input
                    id="register-password"
                    type="password"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">
                    Confirmer le mot de passe
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={registerConfirmPassword}
                    onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Inscription en cours..." : "S'inscrire"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-center text-gray-500">
            En vous connectant, vous acceptez nos conditions d'utilisation et
            notre politique de confidentialité
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
