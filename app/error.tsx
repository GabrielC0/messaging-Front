"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  isBackendAvailable,
  checkBackendAvailability,
} from "@/lib/apollo-client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [backendStatus, setBackendStatus] = useState<
    "available" | "unavailable" | "checking"
  >("checking");
  const [checkingBackend, setCheckingBackend] = useState(false);

  useEffect(() => {
    setBackendStatus(isBackendAvailable ? "available" : "unavailable");
  }, []);

  // Fonction pour vérifier manuellement la disponibilité du backend
  const checkBackend = async () => {
    setCheckingBackend(true);
    try {
      const available = await checkBackendAvailability();
      setBackendStatus(available ? "available" : "unavailable");
    } catch (e) {
      setBackendStatus("unavailable");
    } finally {
      setCheckingBackend(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-red-600">
            Erreur
          </CardTitle>
          <CardDescription>
            Une erreur s'est produite lors du chargement de l'application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-red-50 border-red-200">
            <AlertTitle className="text-red-700">
              Détails de l'erreur
            </AlertTitle>
            <AlertDescription className="text-red-600">
              {error.message || "Une erreur inattendue s'est produite"}
            </AlertDescription>
          </Alert>

          {backendStatus === "unavailable" && (
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertTitle className="text-yellow-800">
                État du serveur
              </AlertTitle>
              <AlertDescription className="text-yellow-700">
                Le serveur backend est actuellement indisponible. L'application
                fonctionne en mode hors-ligne avec des fonctionnalités limitées.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button onClick={reset} className="w-full" variant="default">
            Réessayer
          </Button>

          <Button
            onClick={checkBackend}
            className="w-full"
            variant="outline"
            disabled={checkingBackend}
          >
            {checkingBackend
              ? "Vérification en cours..."
              : "Vérifier la connexion au serveur"}
          </Button>

          <Link href="/auth" className="w-full">
            <Button variant="ghost" className="w-full">
              Retour à la page d'authentification
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
