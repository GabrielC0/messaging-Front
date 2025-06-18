import { useState, useEffect, useCallback } from "react";
import { notificationService } from "../lib/notification-service";

export const useNotifications = () => {
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [settings, setSettings] = useState(notificationService.currentSettings);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
      setIsReady(true);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    const newPermission = await notificationService.requestPermission();
    setPermission(newPermission);
    if (newPermission === "granted") {
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
    }

    return newPermission;
  }, []);
  const updateSettings = useCallback(
    (newSettings: any) => {
      notificationService.saveSettings(newSettings);
      setSettings({ ...settings, ...newSettings });
    },
    [settings]
  );
  const showMessageNotification = useCallback(
    (message: any, options: any = {}) => {
      notificationService.showMessageNotification(message, options);
    },
    []
  );
  const showTestNotification = useCallback(() => {
    notificationService.showTestNotification();
  }, []);
  const testNotificationSound = useCallback(() => {
    notificationService.testNotificationSound();
  }, []);

  const getPermissionStatus = useCallback(() => {
    return notificationService.getPermissionStatus();
  }, []);
  return {
    permission,
    settings,
    isReady,
    requestPermission,
    updateSettings,
    showMessageNotification,
    showTestNotification,
    testNotificationSound,
    getPermissionStatus,
    isSupported: notificationService.isNotificationSupported,
  };
};
