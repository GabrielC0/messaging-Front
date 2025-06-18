"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import {
  checkBackendAvailability,
  isBackendAvailable,
  resetApolloCache,
} from "@/lib/apollo-client";
import { useAuth } from "@/contexts/auth-provider";
import { ApiTestPanel } from "@/components/api-test-panel";
import { WebSocketTestPanel } from "@/components/websocket-test-panel";
import { SystemInfoPanel } from "@/components/system-info-panel";

export default function TestPage() {
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorCount, setErrorCount] = useState(0);

  const testConnection = async () => {
    setIsLoading(true);
    setTestResult(null);

    try {
      const isAvailable = await checkBackendAvailability();

      if (isAvailable) {
        setTestResult("Backend disponible! ✅");
        setErrorCount(0);
      } else {
        setTestResult("Backend indisponible! ❌");
        setErrorCount((prev) => prev + 1);
      }
    } catch (error) {
      setTestResult(`Erreur: ${(error as Error).message}`);
      setErrorCount((prev) => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  const simulateConnectionError = () => {
    window.dispatchEvent(
      new CustomEvent("apollo-network-error", {
        detail: {
          message: "Simulated network error",
          consecutive: errorCount + 1,
        },
      })
    );

    setErrorCount((prev) => prev + 1);
    setTestResult("Erreur réseau simulée");
  };

  const handleResetCache = () => {
    resetApolloCache();
    setTestResult("Cache Apollo réinitialisé");
  };
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Test de connexion au backend</h1>
      {/* Section d'informations de configuration */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Informations de Configuration</CardTitle>
          <CardDescription>
            URLs et paramètres de connexion actuels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>GraphQL URL:</strong>
              <div className="text-muted-foreground break-all mt-1">
                {process.env.NEXT_PUBLIC_GRAPHQL_URL ||
                  "https://messaging-platform-gfnp.onrender.com/graphql"}
              </div>
            </div>
            <div>
              <strong>WebSocket URL:</strong>
              <div className="text-muted-foreground break-all mt-1">
                {process.env.NEXT_PUBLIC_WEBSOCKET_URL ||
                  "https://messaging-platform-gfnp.onrender.com"}
              </div>
            </div>
            <div>
              <strong>Backend URL:</strong>
              <div className="text-muted-foreground break-all mt-1">
                {process.env.NEXT_PUBLIC_BACKEND_URL ||
                  "https://messaging-platform-gfnp.onrender.com"}
              </div>
            </div>
            <div>
              <strong>Environnement:</strong>
              <div className="text-muted-foreground mt-1">
                <Badge variant="outline">
                  {process.env.NODE_ENV || "development"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Nouveau panneau de test API */}
      <div className="mb-8">
        <ApiTestPanel />
      </div>{" "}
      {/* Nouveau panneau de test WebSocket */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Tests WebSocket Avancés</h2>
        <WebSocketTestPanel />
      </div>
      {/* Panel d'informations système */}
      <div className="mb-8">
        <SystemInfoPanel />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>État de la connexion</CardTitle>
            <CardDescription>
              Vérifiez l'état de la connexion au backend GraphQL
            </CardDescription>
          </CardHeader>{" "}
          <CardContent>
            <div className="mb-4">
              <p className="mb-2">Statut actuel:</p>
              <Badge
                variant={isBackendAvailable ? "default" : "destructive"}
                className="text-lg py-2 px-3"
              >
                {isBackendAvailable ? "Connecté" : "Déconnecté"}
              </Badge>
            </div>

            {testResult && (
              <div className="bg-gray-100 p-4 rounded-md mt-4">
                <p>{testResult}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button onClick={testConnection} disabled={isLoading}>
              {isLoading ? "Test en cours..." : "Tester la connexion"}
            </Button>
            <Button variant="outline" onClick={handleResetCache}>
              Réinitialiser le cache
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Outils de test</CardTitle>
            <CardDescription>
              Simulez différents scénarios de connexion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Ces outils vous permettent de tester comment l'application se
              comporte dans différents scénarios de connexion.
            </p>
            <p className="text-sm text-gray-500">
              Nombre d'erreurs simulées: {errorCount}
            </p>
          </CardContent>
          <CardFooter className="flex flex-col items-stretch gap-2">
            <Button onClick={simulateConnectionError} variant="destructive">
              Simuler une erreur réseau
            </Button>
            <Button
              onClick={() => {
                window.dispatchEvent(new CustomEvent("backend-reconnected"));
                setTestResult("Événement de reconnexion déclenché");
                setErrorCount(0);
              }}
              variant="outline"
              className="border-green-500 text-green-600"
            >
              Simuler une reconnexion
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
