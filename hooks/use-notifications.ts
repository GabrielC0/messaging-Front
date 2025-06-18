import { useState, useEffect, useCallback } from "react";
import { notificationService } from "../lib/notification-service";

export const useNotifications = () => {
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [settings, setSettings] = useState(notificationService.currentSettings);

  useEffect(() => {
    // Vérifier la permission initiale
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
      console.log("🔔 Permission initiale:", Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    console.log("📱 Demande de permission notifications...");
    const newPermission = await notificationService.requestPermission();
    setPermission(newPermission);

    if (newPermission === "granted") {
      console.log("✅ Notifications autorisées !");

      // Notification de bienvenue
      setTimeout(() => {
        try {
          new Notification("🎉 Notifications activées !", {
            body: "Vous recevrez maintenant les messages en temps réel",
            icon: "/placeholder-logo.png",
            tag: "welcome",
          });
        } catch (error) {
          console.warn("Erreur notification de bienvenue:", error);
        }
      }, 500);
    } else {
      console.warn("❌ Permission notifications refusée");
    }

    return newPermission;
  }, []);

  const updateSettings = useCallback(
    (newSettings: any) => {
      console.log("⚙️ Mise à jour paramètres:", newSettings);
      notificationService.saveSettings(newSettings);
      setSettings({ ...settings, ...newSettings });
    },
    [settings]
  );
  const showMessageNotification = useCallback(
    (message: any, options: any = {}) => {
      console.log("📨 Tentative d'affichage notification pour:", message);
      notificationService.showMessageNotification(message, options);
    },
    []
  );

  const showTestNotification = useCallback(() => {
    console.log("🧪 Test notification...");
    notificationService.showTestNotification();
  }, []);

  return {
    permission,
    settings,
    requestPermission,
    updateSettings,
    showMessageNotification,
    showTestNotification,
    isSupported: notificationService.isNotificationSupported,
  };
};
