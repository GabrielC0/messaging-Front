"use client";

import { useEffect } from "react";

/**
 * Composant pour précharger les ressources audio
 * Améliore les performances des notifications
 */
export function AudioPreloader() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const audio = new Audio("/notification-sound.mp3");
      audio.preload = "auto";
      audio.volume = 0;

      audio.addEventListener("error", (error) => {
        console.warn("Erreur lors du préchargement du son:", error);
      });

      audio.load();
    }
  }, []);

  return null;
}
