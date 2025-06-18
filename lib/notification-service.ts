interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  desktop: boolean;
  showPreview: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

class NotificationService {
  private isSupported: boolean;
  private permission: NotificationPermission;
  private settings: NotificationSettings;

  constructor() {
    this.isSupported =
      typeof window !== "undefined" && "Notification" in window;
    this.permission = this.isSupported ? Notification.permission : "denied";
    this.settings = this.loadSettings();
  }

  // Charger les préférences utilisateur
  loadSettings(): NotificationSettings {
    if (typeof window === "undefined") {
      return this.getDefaultSettings();
    }

    try {
      const saved = localStorage.getItem("notificationSettings");
      return saved ? JSON.parse(saved) : this.getDefaultSettings();
    } catch (error) {
      console.warn("Erreur chargement paramètres notifications:", error);
      return this.getDefaultSettings();
    }
  }

  private getDefaultSettings(): NotificationSettings {
    return {
      enabled: true,
      sound: true,
      desktop: true,
      showPreview: true,
      quietHours: {
        enabled: false,
        start: "22:00",
        end: "08:00",
      },
    };
  }

  // Sauvegarder les préférences
  saveSettings(newSettings: Partial<NotificationSettings>) {
    this.settings = { ...this.settings, ...newSettings };

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          "notificationSettings",
          JSON.stringify(this.settings)
        );
      } catch (error) {
        console.warn("Erreur sauvegarde paramètres notifications:", error);
      }
    }
  }

  // Vérifier si on est en heures silencieuses
  isQuietTime(): boolean {
    if (!this.settings.quietHours.enabled) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const [startHour, startMin] = this.settings.quietHours.start
      .split(":")
      .map(Number);
    const [endHour, endMin] = this.settings.quietHours.end
      .split(":")
      .map(Number);

    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      return currentTime >= startTime || currentTime <= endTime;
    }
  }
  // Afficher une notification de message
  async showMessageNotification(message: any, options: any = {}) {
    const forceShow = options.forceShow || false;

    if (!this.canShowNotification(forceShow)) {
      console.log("🔕 Notification bloquée par les paramètres utilisateur");
      return;
    }

    const notificationOptions = {
      body: this.settings.showPreview ? message.content : "Nouveau message",
      icon: message.sender?.avatarUrl || "/placeholder-user.jpg",
      badge: "/placeholder-logo.png",
      tag: `message-${message.conversation?.id || "unknown"}`,
      data: {
        messageId: message.id,
        conversationId: message.conversation?.id,
        senderId: message.sender?.id,
      },
      requireInteraction: false,
      silent: !this.settings.sound,
      ...options,
    };

    try {
      console.log(
        "🔔 Affichage notification:",
        message.sender?.username || "Utilisateur"
      );

      const notification = new Notification(
        `💬 ${message.sender?.username || "Nouveau message"}`,
        notificationOptions
      );

      // Gestion des clics
      notification.onclick = () => {
        console.log("👆 Clic sur notification");
        this.handleNotificationClick(message);
        notification.close();
      };

      // Auto-fermeture après 5 secondes
      setTimeout(() => {
        notification.close();
      }, 5000);

      // Son personnalisé si activé
      if (this.settings.sound) {
        this.playNotificationSound();
      }
    } catch (error) {
      console.error("❌ Erreur affichage notification:", error);
    }
  }
  // Vérifier si on peut afficher une notification
  canShowNotification(forceShow = false): boolean {
    const checks = {
      isSupported: this.isSupported,
      hasPermission: this.permission === "granted",
      isEnabled: this.settings.enabled,
      isDesktopEnabled: this.settings.desktop,
      isNotQuietTime: !this.isQuietTime(),
      isPageHidden:
        typeof document !== "undefined"
          ? document.visibilityState === "hidden"
          : true,
    };
    console.log("🔍 Vérification notifications:", checks);

    // Si forceShow est vrai (pour les tests), ignorer la condition de visibilité
    const canShow =
      checks.isSupported &&
      checks.hasPermission &&
      checks.isEnabled &&
      checks.isDesktopEnabled &&
      checks.isNotQuietTime &&
      (forceShow || checks.isPageHidden);

    // Log spécifique pour permission 'default'
    if (
      checks.isSupported &&
      !checks.hasPermission &&
      this.permission === "default"
    ) {
      console.warn(
        '⚠️ Permission notifications = "default" - L\'utilisateur doit autoriser les notifications'
      );
      console.log(
        '💡 Action requise: Cliquer sur "Autoriser" dans la popup du navigateur'
      );
    }

    console.log(
      "✅ Peut afficher notification:",
      canShow,
      forceShow ? "(forcé)" : ""
    );
    return canShow;
  }

  // Gérer le clic sur notification
  handleNotificationClick(message: any) {
    console.log("🔗 Gestion clic notification");

    // Amener la fenêtre au premier plan
    if (typeof window !== "undefined") {
      window.focus();

      // Émettre un événement personnalisé
      window.dispatchEvent(
        new CustomEvent("notificationClick", {
          detail: { message },
        })
      );
    }
  }

  // Jouer un son de notification
  playNotificationSound() {
    if (typeof window === "undefined") return;

    try {
      const audio = new Audio("/notification-sound.mp3");
      audio.volume = 0.3;
      audio.play().catch(() => {
        console.warn("⚠️ Impossible de jouer le son de notification");
      });
    } catch (error) {
      console.warn("⚠️ Erreur son notification:", error);
    }
  }

  // Demander la permission
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) {
      console.warn("❌ Notifications non supportées");
      return "denied";
    }

    try {
      console.log("🔐 Demande permission notifications...");
      this.permission = await Notification.requestPermission();
      console.log("🔐 Permission accordée:", this.permission);
      return this.permission;
    } catch (error) {
      console.error("❌ Erreur permission:", error);
      return "denied";
    }
  }
  // Test simple de notification
  showTestNotification() {
    console.log("🧪 Test de notification...");
    this.showMessageNotification(
      {
        id: "test-" + Date.now(),
        content: "Ceci est une notification de test ! 🧪",
        sender: {
          id: "test-user",
          username: "Système de Test",
          avatarUrl: "/placeholder-logo.png",
        },
        conversation: {
          id: "test-conversation",
        },
      },
      { forceShow: true }
    ); // Force l'affichage même si la page est visible
  }

  // Getters
  get currentPermission() {
    return this.permission;
  }

  get currentSettings() {
    return { ...this.settings };
  }

  get isNotificationSupported() {
    return this.isSupported;
  }
}

// Export singleton
export const notificationService = new NotificationService();
