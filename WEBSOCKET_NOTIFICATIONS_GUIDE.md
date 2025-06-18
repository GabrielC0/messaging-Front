# Documentation WebSocket Complète - Frontend avec Notifications Avancées

## 🎯 Vue d'ensemble de votre projet

Votre application utilise **une architecture entièrement cloud** avec WebSockets déjà fonctionnels ! Cette documentation met à jour les instructions et ajoute un système de notifications avancé.

## 📊 Configuration Backend (DÉJÀ OPÉRATIONNELLE)

✅ **Backend NestJS déployé** : `https://messaging-platform-gfnp.onrender.com`  
✅ **WebSocket Gateway** : `wss://messaging-platform-gfnp.onrender.com`  
✅ **Base de données** : PostgreSQL sur Render  
✅ **Cache Redis** : Upstash Cloud  
✅ **CORS configuré** : Pour toutes les origines en production

### Événements WebSocket disponibles

- **`newMessage`** : Nouveau message reçu (déjà implémenté)
- **`connect`** : Connexion établie
- **`disconnect`** : Déconnexion
- **`connect_error`** : Erreur de connexion

## 🚀 État actuel de votre Frontend

### ✅ Déjà installé et configuré

```json
{
  "socket.io-client": "^4.8.1"
}
```

### ✅ Hooks existants

- **`hooks/use-socket.ts`** : Hook de base avec connexion automatique
- **`hooks/use-websocket-advanced.ts`** : Hook avancé avec reconnexion intelligente

### ✅ Composants existants

- **`components/websocket-status.tsx`** : Indicateur de statut
- **`components/websocket-test-panel.tsx`** : Panel de test complet
- **`components/advanced-chat-example.tsx`** : Chat temps réel

### ✅ Configuration d'environnement

```env
NEXT_PUBLIC_WEBSOCKET_URL=https://messaging-platform-gfnp.onrender.com
NEXT_PUBLIC_GRAPHQL_URL=https://messaging-platform-gfnp.onrender.com/graphql
NEXT_PUBLIC_BACKEND_URL=https://messaging-platform-gfnp.onrender.com
```

## 🔧 Utilisation de base

### 1. Hook simple (déjà disponible)

```typescript
import { useSocket } from "../hooks/use-socket";

const ChatComponent = ({ conversationId }) => {
  const { isConnected, lastMessage, sendMessage } = useSocket();

  // Messages reçus automatiquement via lastMessage
  useEffect(() => {
    if (lastMessage) {
      console.log("📨 Nouveau message:", lastMessage);
      // Traiter le message...
    }
  }, [lastMessage]);

  return (
    <div>
      <div className="status">
        {isConnected ? "🟢 Connecté" : "🔴 Déconnecté"}
      </div>
    </div>
  );
};
```

### 2. Hook avancé avec filtrage (déjà disponible)

```typescript
import { useWebSocketAdvanced } from "../hooks/use-websocket-advanced";

const AdvancedChat = ({ conversationId, userId }) => {
  const {
    isConnected,
    lastMessage,
    connectionError,
    reconnectAttempts,
    forceReconnect,
    emit,
  } = useWebSocketAdvanced({
    conversationId, // Filtre automatiquement les messages
    autoConnect: true,
    maxReconnectAttempts: 5,
    reconnectInterval: 2000,
  });

  // Messages déjà filtrés par conversation !
  useEffect(() => {
    if (lastMessage && lastMessage.conversation?.id === conversationId) {
      // Message pour cette conversation spécifique
      handleNewMessage(lastMessage);
    }
  }, [lastMessage, conversationId]);

  return (
    <div>
      {connectionError && (
        <div className="error">
          Erreur: {connectionError}
          <button onClick={forceReconnect}>Reconnecter</button>
        </div>
      )}

      {isReconnecting && (
        <div>Reconnexion... (tentative {reconnectAttempts}/5)</div>
      )}
    </div>
  );
};
```

## 📱 Composants prêts à l'emploi

### 1. Indicateur de statut WebSocket

```tsx
import { WebSocketStatus } from "../components/websocket-status";

// Dans votre layout ou header
<WebSocketStatus />;
// Affiche automatiquement: 🟢 Connecté / 🔴 Déconnecté
```

### 2. Panel de test complet

```tsx
import { WebSocketTestPanel } from "../components/websocket-test-panel";

// Page de test (/test)
<WebSocketTestPanel />;
// Interface complète pour tester les WebSockets
```

## 🔔 Système de Notifications Avancé

### A. Service de gestion des notifications

Créez le fichier `lib/notification-service.ts` :

```typescript
// lib/notification-service.ts
class NotificationService {
  private isSupported: boolean;
  private permission: NotificationPermission;
  private settings: NotificationSettings;

  constructor() {
    this.isSupported = 'Notification' in window;
    this.permission = this.isSupported ? Notification.permission : 'denied';
    this.settings = this.loadSettings();
  }

  // Interface des paramètres
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

  // Charger les préférences utilisateur
  loadSettings(): NotificationSettings {
    const saved = localStorage.getItem('notificationSettings');
    return saved ? JSON.parse(saved) : {
      enabled: true,
      sound: true,
      desktop: true,
      showPreview: true,
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00'
      }
    };
  }

  // Sauvegarder les préférences
  saveSettings(newSettings: Partial<NotificationSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    localStorage.setItem('notificationSettings', JSON.stringify(this.settings));
  }

  // Vérifier si on est en heures silencieuses
  isQuietTime(): boolean {
    if (!this.settings.quietHours.enabled) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const [startHour, startMin] = this.settings.quietHours.start.split(':').map(Number);
    const [endHour, endMin] = this.settings.quietHours.end.split(':').map(Number);

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
    if (!this.canShowNotification()) return;

    const notificationOptions = {
      body: this.settings.showPreview ? message.content : 'Nouveau message',
      icon: message.sender.avatarUrl || '/placeholder-user.jpg',
      badge: '/placeholder-logo.png',
      tag: `message-${message.conversation.id}`,
      data: {
        messageId: message.id,
        conversationId: message.conversation.id,
        senderId: message.sender.id
      },
      requireInteraction: false,
      silent: !this.settings.sound,
      ...options
    };

    try {
      const notification = new Notification(
        `💬 ${message.sender.username}`,
        notificationOptions
      );

      // Gestion des clics
      notification.onclick = () => {
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
      console.error('Erreur affichage notification:', error);
    }
  }

  // Vérifier si on peut afficher une notification
  canShowNotification(): boolean {
    return this.isSupported &&
           this.permission === 'granted' &&
           this.settings.enabled &&
           this.settings.desktop &&
           !this.isQuietTime() &&
           document.visibilityState === 'hidden'; // Seulement si la page n'est pas visible
  }

  // Gérer le clic sur notification
  handleNotificationClick(message: any) {
    // Amener la fenêtre au premier plan
    window.focus();

    // Émettre un événement personnalisé
    window.dispatchEvent(new CustomEvent('notificationClick', {
      detail: { message }
    }));
  }

  // Jouer un son de notification
  playNotificationSound() {
    try {
      const audio = new Audio('/notification-sound.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {
        console.warn('Impossible de jouer le son de notification');
      });
    } catch (error) {
      console.warn('Erreur son notification:', error);
    }
  }

  // Demander la permission
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) return 'denied';

    try {
      this.permission = await Notification.requestPermission();
      return this.permission;
    } catch (error) {
      console.error('Erreur permission:', error);
      return 'denied';
    }
  }
}

// Export singleton
export const notificationService = new NotificationService();
```

### B. Hook de gestion des notifications

Créez le fichier `hooks/use-notifications.ts` :

```typescript
// hooks/use-notifications.ts
import { useState, useEffect } from "react";
import { notificationService } from "../lib/notification-service";

export const useNotifications = () => {
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [settings, setSettings] = useState(notificationService.settings);

  useEffect(() => {
    // Vérifier la permission initiale
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    const newPermission = await notificationService.requestPermission();
    setPermission(newPermission);

    if (newPermission === "granted") {
      // Notification de bienvenue
      new Notification("Notifications activées !", {
        body: "Vous recevrez maintenant les messages en temps réel",
        icon: "/placeholder-logo.png",
      });
    }

    return newPermission;
  };

  const updateSettings = (newSettings: any) => {
    notificationService.saveSettings(newSettings);
    setSettings({ ...settings, ...newSettings });
  };

  const showMessageNotification = (message: any) => {
    notificationService.showMessageNotification(message);
  };

  return {
    permission,
    settings,
    requestPermission,
    updateSettings,
    showMessageNotification,
    isSupported: "Notification" in window,
  };
};
```

### C. Composant de paramètres de notifications

Créez le fichier `components/notification-settings.tsx` :

```tsx
// components/notification-settings.tsx
"use client";

import { useState } from "react";
import { useNotifications } from "../hooks/use-notifications";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";

export function NotificationSettings() {
  const {
    permission,
    settings,
    requestPermission,
    updateSettings,
    showMessageNotification,
    isSupported,
  } = useNotifications();

  const handleSettingChange = (key: string, value: any) => {
    updateSettings({ [key]: value });
  };

  const handleQuietHoursChange = (key: string, value: any) => {
    updateSettings({
      quietHours: { ...settings.quietHours, [key]: value },
    });
  };

  const testNotification = () => {
    showMessageNotification({
      id: "test",
      content: "Ceci est une notification de test !",
      sender: {
        id: "test-user",
        username: "Système de test",
        avatarUrl: "/placeholder-logo.png",
      },
      conversation: {
        id: "test-conv",
      },
    });
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notifications non supportées</CardTitle>
          <CardDescription>
            Votre navigateur ne supporte pas les notifications
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Paramètres de Notification</CardTitle>
          <CardDescription>
            Configurez comment vous voulez recevoir les notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status des permissions */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label className="text-base font-medium">
                Permissions du navigateur
              </Label>
              <p className="text-sm text-muted-foreground">
                {permission === "granted"
                  ? "Les notifications sont autorisées"
                  : "Autorisez les notifications pour recevoir les alertes"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={permission === "granted" ? "default" : "destructive"}
              >
                {permission === "granted" ? "✅ Autorisées" : "❌ Bloquées"}
              </Badge>
              {permission !== "granted" && (
                <Button onClick={requestPermission} size="sm">
                  Activer
                </Button>
              )}
            </div>
          </div>

          {/* Paramètres généraux */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Notifications activées</Label>
                <p className="text-sm text-muted-foreground">
                  Recevoir des notifications pour les nouveaux messages
                </p>
              </div>
              <Switch
                checked={settings.enabled}
                onCheckedChange={(checked) =>
                  handleSettingChange("enabled", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Notifications bureau</Label>
                <p className="text-sm text-muted-foreground">
                  Afficher les notifications sur votre bureau
                </p>
              </div>
              <Switch
                checked={settings.desktop}
                onCheckedChange={(checked) =>
                  handleSettingChange("desktop", checked)
                }
                disabled={!settings.enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Son de notification</Label>
                <p className="text-sm text-muted-foreground">
                  Jouer un son quand vous recevez un message
                </p>
              </div>
              <Switch
                checked={settings.sound}
                onCheckedChange={(checked) =>
                  handleSettingChange("sound", checked)
                }
                disabled={!settings.enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Aperçu du message</Label>
                <p className="text-sm text-muted-foreground">
                  Afficher le contenu du message dans la notification
                </p>
              </div>
              <Switch
                checked={settings.showPreview}
                onCheckedChange={(checked) =>
                  handleSettingChange("showPreview", checked)
                }
                disabled={!settings.enabled}
              />
            </div>
          </div>

          {/* Heures silencieuses */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Heures silencieuses</CardTitle>
              <CardDescription>
                Désactiver les notifications pendant certaines heures
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base">
                  Activer les heures silencieuses
                </Label>
                <Switch
                  checked={settings.quietHours.enabled}
                  onCheckedChange={(checked) =>
                    handleQuietHoursChange("enabled", checked)
                  }
                  disabled={!settings.enabled}
                />
              </div>

              {settings.quietHours.enabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-time">Début</Label>
                    <Input
                      id="start-time"
                      type="time"
                      value={settings.quietHours.start}
                      onChange={(e) =>
                        handleQuietHoursChange("start", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-time">Fin</Label>
                    <Input
                      id="end-time"
                      type="time"
                      value={settings.quietHours.end}
                      onChange={(e) =>
                        handleQuietHoursChange("end", e.target.value)
                      }
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Test */}
          <div className="pt-4 border-t">
            <Button
              onClick={testNotification}
              className="w-full"
              disabled={permission !== "granted" || !settings.enabled}
            >
              Tester les notifications
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### D. Intégration dans votre Chat avec notifications

Modifiez vos composants de chat pour utiliser les notifications :

```tsx
// components/enhanced-chat.tsx
"use client";

import { useEffect, useState } from "react";
import { useWebSocketAdvanced } from "../hooks/use-websocket-advanced";
import { useNotifications } from "../hooks/use-notifications";

interface EnhancedChatProps {
  conversationId: string;
  currentUserId: string;
}

export function EnhancedChat({
  conversationId,
  currentUserId,
}: EnhancedChatProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isPageVisible, setIsPageVisible] = useState(!document.hidden);

  const {
    isConnected,
    lastMessage,
    connectionError,
    reconnectAttempts,
    forceReconnect,
  } = useWebSocketAdvanced({
    conversationId,
    autoConnect: true,
  });

  const { showMessageNotification } = useNotifications();

  // Gestion de la visibilité de la page
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden);

      if (!document.hidden) {
        // L'utilisateur revient sur la page
        setUnreadCount(0);
        updatePageTitle();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Gestion des nouveaux messages
  useEffect(() => {
    if (lastMessage && lastMessage.sender.id !== currentUserId) {
      // Ajouter le message à la liste
      setMessages((prev) => [...prev, lastMessage]);

      // Si la page n'est pas visible, afficher notification et compter
      if (!isPageVisible) {
        setUnreadCount((prev) => prev + 1);
        showMessageNotification(lastMessage);
        updatePageTitle();
        startFaviconBlink();
      }
    }
  }, [lastMessage, currentUserId, isPageVisible, showMessageNotification]);

  // Mettre à jour le titre de la page
  const updatePageTitle = () => {
    const originalTitle = document.title.replace(/ \(\d+\)/, "");
    document.title =
      unreadCount > 0 ? `${originalTitle} (${unreadCount})` : originalTitle;
  };

  // Faire clignoter le favicon
  const startFaviconBlink = () => {
    let isOriginal = true;
    const originalFavicon = document
      .querySelector('link[rel="icon"]')
      ?.getAttribute("href");

    const interval = setInterval(() => {
      const favicon = document.querySelector(
        'link[rel="icon"]'
      ) as HTMLLinkElement;
      if (favicon) {
        favicon.href = isOriginal
          ? "/notification-favicon.ico"
          : originalFavicon || "/favicon.ico";
        isOriginal = !isOriginal;
      }
    }, 1000);

    // Arrêter le clignotement quand l'utilisateur revient
    const stopBlink = () => {
      clearInterval(interval);
      const favicon = document.querySelector(
        'link[rel="icon"]'
      ) as HTMLLinkElement;
      if (favicon && originalFavicon) favicon.href = originalFavicon;
    };

    setTimeout(stopBlink, 10000); // Arrêter après 10 secondes

    // Arrêter aussi si l'utilisateur revient
    const visibilityHandler = () => {
      if (!document.hidden) {
        stopBlink();
        document.removeEventListener("visibilitychange", visibilityHandler);
      }
    };
    document.addEventListener("visibilitychange", visibilityHandler);
  };

  // Écouter les clics sur notifications
  useEffect(() => {
    const handleNotificationClick = (event: CustomEvent) => {
      const { message } = event.detail;
      // Scroller vers le message, le marquer comme lu, etc.
      console.log("Clic sur notification:", message);
    };

    window.addEventListener(
      "notificationClick",
      handleNotificationClick as EventListener
    );
    return () =>
      window.removeEventListener(
        "notificationClick",
        handleNotificationClick as EventListener
      );
  }, []);

  return (
    <div className="chat-container">
      {/* Header avec indicateurs */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="font-semibold">Chat</h2>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              {unreadCount} nouveau{unreadCount > 1 ? "x" : ""}
            </Badge>
          )}
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? "🟢 En ligne" : "🔴 Hors ligne"}
          </Badge>
        </div>
      </div>

      {/* Messages */}
      <div className="messages-container p-4 space-y-2">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message p-2 rounded ${
              message.sender.id === currentUserId
                ? "bg-blue-100 ml-8"
                : "bg-gray-100 mr-8"
            }`}
          >
            <div className="font-medium text-sm">{message.sender.username}</div>
            <div>{message.content}</div>
            <div className="text-xs text-gray-500 mt-1">
              {new Date(message.createdAt).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>

      {/* Erreurs de connexion */}
      {connectionError && (
        <div className="p-4 bg-red-50 border-t border-red-200">
          <div className="flex items-center justify-between">
            <span className="text-red-700">Erreur: {connectionError}</span>
            <Button onClick={forceReconnect} size="sm" variant="outline">
              Reconnecter
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
```

## 🧪 Tests et validation

### 1. Page de test intégrée

Visitez : `http://localhost:3000/test`

Fonctionnalités disponibles :

- ✅ Statut de connexion en temps réel
- ✅ Test d'émission de messages
- ✅ Monitoring des messages reçus
- ✅ Informations de débogage
- ✅ Boutons de reconnexion manuelle

### 2. Test HTML standalone

Ouvrez : `http://localhost:3000/websocket-test.html`

### 3. Test des notifications

1. Accédez aux paramètres de notification
2. Activez les permissions
3. Testez avec le bouton de test
4. Ouvrez deux onglets pour tester les vrais messages

## 📊 Structure des messages reçus

```typescript
interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    username: string;
    email: string;
    avatarUrl?: string;
  };
  conversation: {
    id: string;
    title?: string;
  };
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}
```

## 🎨 Styles CSS pour notifications

Ajoutez dans votre `globals.css` :

```css
/* Animations pour notifications */
@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.notification-badge {
  animation: pulse 2s infinite;
}

.message-unread {
  background: linear-gradient(90deg, #fef3c7 0%, transparent 100%);
  border-left: 3px solid #f59e0b;
}

.chat-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

/* Badge de compteur */
.unread-badge {
  animation: fadeInScale 0.3s ease-out;
}
```

## 📱 Fichiers à ajouter

Placez ces fichiers dans votre dossier `public/` :

```
public/
├── notification-sound.mp3      # Son agréable (1-2 secondes)
├── notification-favicon.ico    # Favicon rouge pour alertes
└── placeholder-logo.png        # Logo pour notifications
```

## 🚀 Scripts NPM utiles

```bash
# Démarrer le frontend avec WebSocket
npm run dev

# Valider la configuration
npm run validate:config

# Tests de connectivité
npm run test:api

# Afficher les fonctionnalités
npm run features
```

## 🎉 Fonctionnalités complètes

### ✅ WebSocket

- Connexion automatique sécurisée (WSS)
- Reconnexion intelligente
- Filtrage par conversation
- Gestion d'erreurs robuste

### ✅ Notifications

- Permissions automatiques
- Paramètres utilisateur
- Heures silencieuses
- Sons personnalisés
- Notifications riches
- Clics interactifs

### ✅ Interface utilisateur

- Badges de nouveaux messages
- Clignotement du favicon
- Titre de page dynamique
- Indicateurs visuels
- Interface moderne

### ✅ Expérience utilisateur

- Respect des préférences
- Mode silencieux
- Aperçu configurable
- Tests intégrés
- Accessibilité

Votre application est maintenant équipée d'un système de notifications complet et professionnel ! 🚀
