"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/auth-provider";
import { isBackendAvailable } from "@/lib/apollo-client";

export default function AuthPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { register, authError, clearAuthError } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState<
    "available" | "unavailable" | "checking"
  >("checking");

  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");

  const [loginEmail, setLoginEmail] = useState("");

  useEffect(() => {
    setBackendStatus(isBackendAvailable ? "available" : "unavailable");

    const handleBackendUnreachable = () => {
      setBackendStatus("unavailable");
      toast({
        title: "Serveur indisponible",
        description: "Mode hors-ligne activé. Données limitées.",
        variant: "destructive",
      });
    };

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
      if (!loginEmail.trim()) {
        toast({
          title: "Erreur de validation",
          description: "L'email est requis",
          variant: "destructive",
        });
        return;
      }

      const success = await register(loginEmail);

      if (success) {
        console.log("Login successful");
        toast({
          title: "Connexion réussie",
          description: "Bienvenue",
        });
        router.push("/");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Erreur de connexion",
        description:
          error instanceof Error ? error.message : "Une erreur est survenue",
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
      if (!registerEmail.trim()) {
        toast({
          title: "Erreur de validation",
          description: "L'email est requis",
          variant: "destructive",
        });
        return;
      }

      if (!registerName.trim()) {
        toast({
          title: "Erreur de validation",
          description: "Le nom d'utilisateur est requis",
          variant: "destructive",
        });
        return;
      }

      const success = await register(registerEmail, registerName);

      if (success) {
        console.log("Registration successful");
        toast({
          title: "Inscription réussie",
          description: "Vous êtes maintenant connecté",
        });
        router.push("/");
      }
    } catch (error) {
      console.error("Registration error:", error);
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
    <main className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-1 lg:px-0">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <Card>
          <CardHeader>
            <CardTitle>LAMG-Messages</CardTitle>
            <CardDescription>
              Commencez à discuter avec vos amis et collègues
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              defaultValue={activeTab}
              onValueChange={(v) => setActiveTab(v as "login" | "register")}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Connexion</TabsTrigger>
                <TabsTrigger value="register">Inscription</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                {authError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{authError}</AlertDescription>
                  </Alert>
                )}
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="m@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || backendStatus !== "available"}
                  >
                    {isLoading ? "Connexion..." : "Se connecter"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                {authError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{authError}</AlertDescription>
                  </Alert>
                )}
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="register-name">Nom d'utilisateur</Label>
                    <Input
                      id="register-name"
                      placeholder="John Doe"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="m@example.com"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || backendStatus !== "available"}
                  >
                    {isLoading ? "Inscription..." : "S'inscrire"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
