# Instructions d'intégration WebSocket pour le Frontend

## Vue d'ensemble

Cette documentation explique comment intégrer les WebSockets de votre backend NestJS dans votre application frontend pour recevoir les messages en temps réel.

## Configuration Backend (Déjà en place)

Votre backend expose une gateway WebSocket sur **Render.com** avec :

- **URL WebSocket** : `wss://messaging-platform-gfnp.onrender.com`
- **Événement émis** : `newMessage`
- **CORS activé** pour toutes les origines en production
- **Données émises** : Objet message complet avec sender, conversation, contenu, etc.

### Événements WebSocket disponibles

- **`newMessage`** : Nouveau message reçu (déjà implémenté)
- **`connect`** : Connexion établie
- **`disconnect`** : Déconnexion
- **`connect_error`** : Erreur de connexion

## Intégration Frontend

### ✅ État actuel - Déjà configuré dans votre projet

Votre application Next.js utilise **socket.io-client v4.8.1** et est entièrement configurée pour l'architecture cloud.

#### Variables d'environnement (déjà configurées)

```env
NEXT_PUBLIC_WEBSOCKET_URL=https://messaging-platform-gfnp.onrender.com
NEXT_PUBLIC_GRAPHQL_URL=https://messaging-platform-gfnp.onrender.com/graphql
NEXT_PUBLIC_BACKEND_URL=https://messaging-platform-gfnp.onrender.com
```

#### Hooks WebSocket existants

- **`hooks/use-socket.ts`** : Hook de base avec connexion automatique
- **`hooks/use-websocket-advanced.ts`** : Hook avancé avec reconnexion intelligente

#### Composants WebSocket existants

- **`components/websocket-status.tsx`** : Indicateur de statut temps réel
- **`components/websocket-test-panel.tsx`** : Panel de test complet
- **`components/advanced-chat-example.tsx`** : Chat temps réel avancé

### 1. Installation des dépendances

✅ **Déjà installé** dans votre projet :

```json
{
  "socket.io-client": "^4.8.1"
}
```

### 2. Configuration de base

#### ✅ Hook personnalisé (déjà disponible)

**Votre hook existant** (`hooks/use-socket.ts`) utilise la bonne URL :

```typescript
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const WEBSOCKET_URL =
  process.env.NEXT_PUBLIC_WEBSOCKET_URL ||
  "https://messaging-platform-gfnp.onrender.com";

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);

  useEffect(() => {
    const initSocket = async () => {
      try {
        const { io } = await import("socket.io-client");

        const socket = io(WEBSOCKET_URL, {
          withCredentials: false,
          transports: ["websocket", "polling"],
          autoConnect: true,
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        });

        socket.on("connect", () => {
          console.log("✅ WebSocket connected");
          setIsConnected(true);
        });

        socket.on("newMessage", (message) => {
          console.log("📨 New message received:", message);
          setLastMessage(message);
        });
      } catch (error) {
        console.warn("⚠️ Socket.io-client error:", error);
      }
    };

    initSocket();
  }, []);

  return { isConnected, lastMessage };
};
```

## 🔧 Utilisation dans vos composants

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
    w;
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

### 3. Chat avancé exemple

```tsx
import { AdvancedChatExample } from "../components/advanced-chat-example";

<AdvancedChatExample
  conversationId="uuid-conversation"
  userId="uuid-utilisateur"
/>;
// Chat temps réel complet avec WebSocket
```

## 🔄 Gestion automatique des erreurs

Votre configuration inclut déjà :

### ✅ Reconnexion intelligente

- Retry automatique avec backoff exponentiel
- Maximum 5 tentatives par défaut
- Gestion des erreurs réseau
- Indicateurs visuels de reconnexion

### ✅ Gestion des timeouts

- Timeout de connexion : 20 secondes
- Transport fallback : websocket → polling
- Reconnexion automatique en cas de perte réseau

### ✅ Filtrage des messages

- Filtrage automatique par `conversationId`
- Prévention des doublons
- Messages typés avec TypeScript

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

Test WebSocket pur sans React :

- Connexion/déconnexion manuelle
- Envoi de messages de test
- Logs détaillés
- Interface simple

### 3. Console de débogage

```javascript
// Activer les logs Socket.IO détaillés
localStorage.debug = "socket.io-client:socket";
// Puis rechargez la page
```

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

## 🎨 Intégration avec votre UI

### Avec Shadcn/UI (déjà configuré)

```tsx
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { useSocket } from "../hooks/use-socket";

const ChatHeader = () => {
  const { isConnected } = useSocket();

  return (
    <div className="flex items-center justify-between p-4">
      <h1>Chat</h1>
      <Badge variant={isConnected ? "default" : "destructive"}>
        {isConnected ? "🟢 En ligne" : "🔴 Hors ligne"}
      </Badge>
    </div>
  );
};
```

## 📈 Notifications navigateur

### Déjà implémenté dans vos composants

```typescript
// Demande automatique de permission
useEffect(() => {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
}, []);

// Affichage automatique pour nouveaux messages
useEffect(() => {
  if (lastMessage && Notification.permission === "granted") {
    new Notification(`Message de ${lastMessage.sender.username}`, {
      body: lastMessage.content,
      icon: "/placeholder-user.jpg",
    });
  }
}, [lastMessage]);
```

## 🚨 Points d'attention pour votre projet

### ✅ Ce qui fonctionne déjà

- Connexion WebSocket sécurisée (WSS)
- Reconnexion automatique
- Filtrage par conversation
- Interface de test complète
- Gestion d'erreurs robuste
- Components UI modernes

### ⚠️ Optimisations recommandées

1. **Gestion du focus de la page**

```typescript
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.hidden) {
      // Réduire la fréquence de polling
    } else {
      // Reprendre la connexion normale
    }
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);
  return () =>
    document.removeEventListener("visibilitychange", handleVisibilityChange);
}, []);
```

2. **Limitation des notifications**

```typescript
const [lastNotificationTime, setLastNotificationTime] = useState(0);
const NOTIFICATION_COOLDOWN = 3000; // 3 secondes

const showNotification = (message) => {
  const now = Date.now();
  if (now - lastNotificationTime > NOTIFICATION_COOLDOWN) {
    // Afficher notification
    setLastNotificationTime(now);
  }
};
```

## 🎯 Utilisation pratique

### Pour ajouter WebSocket à un nouveau composant :

1. **Import du hook**

```typescript
import { useWebSocketAdvanced } from "../hooks/use-websocket-advanced";
```

2. **Configuration**

```typescript
const { isConnected, lastMessage } = useWebSocketAdvanced({
  conversationId: props.conversationId,
  autoConnect: true,
});
```

3. **Traitement des messages**

```typescript
useEffect(() => {
  if (lastMessage) {
    // Votre logique ici
    updateMessages(lastMessage);
  }
}, [lastMessage]);
```

## 🔗 URLs et ressources

- **Backend API** : https://messaging-platform-gfnp.onrender.com
- **WebSocket** : wss://messaging-platform-gfnp.onrender.com
- **GraphQL Playground** : https://messaging-platform-gfnp.onrender.com/graphql
- **Health Check** : https://messaging-platform-gfnp.onrender.com/health

## 📝 Scripts NPM utiles

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

## 🎉 Conclusion

Votre intégration WebSocket est **déjà opérationnelle et bien configurée** ! Cette documentation actualise les exemples génériques pour correspondre à votre architecture cloud robuste.

**Points forts de votre implémentation :**

- ✅ Architecture cloud complète
- ✅ WebSockets sécurisés (WSS)
- ✅ Reconnexion intelligente
- ✅ Interface de test intégrée
- ✅ Components modernes
- ✅ TypeScript typé
- ✅ Gestion d'erreurs robuste

Votre application est prête pour la messagerie temps réel ! 🚀
