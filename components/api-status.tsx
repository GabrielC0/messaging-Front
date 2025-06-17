"use client";

import { useHealthCheck } from "../hooks/use-api";
import { Badge } from "./ui/badge";
import { Server, AlertTriangle, CheckCircle } from "lucide-react";

export function ApiStatus() {
  const { data, loading, error } = useHealthCheck();

  const getStatusInfo = () => {
    if (loading) {
      return {
        variant: "secondary" as const,
        icon: <Server className="h-3 w-3 animate-pulse" />,
        text: "Connexion...",
        subtext: "L'API peut prendre du temps à se réveiller",
      };
    }

    if (error) {
      return {
        variant: "destructive" as const,
        icon: <AlertTriangle className="h-3 w-3" />,
        text: "API Hors ligne",
        subtext: "Vérifiez votre connexion internet",
      };
    }

    if (data?.healthCheck?.result === "OK") {
      return {
        variant: "default" as const,
        icon: <CheckCircle className="h-3 w-3" />,
        text: "API En ligne",
        subtext: "Base de données connectée",
      };
    }

    return {
      variant: "destructive" as const,
      icon: <AlertTriangle className="h-3 w-3" />,
      text: "Statut inconnu",
      subtext: "Réponse inattendue",
    };
  };

  const status = getStatusInfo();

  return (
    <div className="flex items-center gap-2">
      <Badge
        variant={status.variant}
        className={`flex items-center gap-1 ${
          status.variant === "default" ? "bg-green-500" : ""
        }`}
      >
        {status.icon}
        {status.text}
      </Badge>
      <span className="text-xs text-muted-foreground">{status.subtext}</span>
    </div>
  );
}
