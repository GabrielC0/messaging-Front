"use client";

import { useEffect } from "react";
import {
  startBackendMonitoring,
  checkBackendAvailability,
} from "@/lib/apollo-client";

export function BackendMonitor() {
  useEffect(() => {
    // Vérifier immédiatement la disponibilité du backend au chargement
    checkBackendAvailability();

    // Démarrer la surveillance périodique
    const cleanup = startBackendMonitoring(30000); // Vérification toutes les 30 secondes

    return cleanup;
  }, []);

  // Ce composant ne rend rien visuellement
  return null;
}
