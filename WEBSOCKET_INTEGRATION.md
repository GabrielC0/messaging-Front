# Guide d'Intégration WebSocket - Frontend

## ⚠️ Architecture Production Uniquement

**Ce projet utilise exclusivement un environnement de production hébergé sur Render.com.**

- ✅ **Backend API** : Déployé sur `https://messaging-platform-gfnp.onrender.com`
- ✅ **WebSocket** : Actif sur `wss://messaging-platform-gfnp.onrender.com`
- ✅ **Base de données** : PostgreSQL hébergé sur Render
- ✅ **Cache Redis** : Upstash Cloud

**Aucune configuration locale n'est requise.** Tous les exemples de code et configurations ci-dessous pointent directement vers les services en production.

---

Ce guide explique comment connecter votre application frontend au WebSocket de la plateforme de messagerie pour recevoir les messages en temps réel.

## Configuration du WebSocket

### URL de Connexion (Production)

```
wss://messaging-platform-gfnp.onrender.com
```

> ⚠️ **Important** : Cette application utilise uniquement l'environnement de production hébergé sur Render. Aucune configuration locale n'est nécessaire.

### Événements WebSocket

| Événement    | Direction        | Description          |
| ------------ | ---------------- | -------------------- |
| `newMessage` | Serveur → Client | Nouveau message reçu |
| `connect`    | Client → Serveur | Connexion établie    |
| `disconnect` | Client → Serveur | Déconnexion          |

## Implémentation JavaScript/TypeScript

### 1. Installation des dépendances

#### Pour React/Vue/Angular

```bash
npm install socket.io-client
```

#### Pour vanilla JavaScript

```html
<script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>
```

### 2. Connexion de base

```typescript
import { io, Socket } from "socket.io-client";

class WebSocketService {
  private socket: Socket;
  constructor() {
    this.socket = io("wss://messaging-platform-gfnp.onrender.com", {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.socket.on("connect", () => {
      console.log("✅ Connecté au WebSocket:", this.socket.id);
    });

    this.socket.on("disconnect", () => {
      console.log("❌ Déconnecté du WebSocket");
    });

    this.socket.on("newMessage", (message) => {
      console.log("📨 Nouveau message reçu:", message);
      this.handleNewMessage(message);
    });

    this.socket.on("connect_error", (error) => {
      console.error("❌ Erreur de connexion WebSocket:", error);
    });
  }

  private handleNewMessage(message: any) {
    // Logique pour traiter le nouveau message
    // Par exemple : mettre à jour l'interface utilisateur
  }

  disconnect() {
    this.socket.disconnect();
  }
}

// Utilisation
const wsService = new WebSocketService();
```

## Implémentations spécifiques par framework

### React avec Hooks

```tsx
import React, { useState, useEffect, useCallback } from "react";
import { io, Socket } from "socket.io-client";

interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    username: string;
  };
  conversation: {
    id: string;
  };
  createdAt: string;
}

const useWebSocket = (conversationId?: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  useEffect(() => {
    const newSocket = io("wss://messaging-platform-gfnp.onrender.com");

    newSocket.on("connect", () => {
      console.log("Connecté au WebSocket");
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("Déconnecté du WebSocket");
      setIsConnected(false);
    });

    newSocket.on("newMessage", (message: Message) => {
      // Filtrer les messages par conversation si nécessaire
      if (!conversationId || message.conversation.id === conversationId) {
        setMessages((prev) => [...prev, message]);
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [conversationId]);

  const sendMessage = useCallback((content: string, senderId: string) => {
    // Envoyer via GraphQL, le WebSocket recevra la réponse
    // Cette fonction peut être utilisée avec votre mutation GraphQL
  }, []);

  return {
    socket,
    messages,
    isConnected,
    sendMessage,
  };
};

// Composant React
const ChatComponent: React.FC<{ conversationId: string }> = ({
  conversationId,
}) => {
  const { messages, isConnected } = useWebSocket(conversationId);

  return (
    <div>
      <div>Status: {isConnected ? "🟢 Connecté" : "🔴 Déconnecté"}</div>
      <div>
        {messages.map((message) => (
          <div key={message.id}>
            <strong>{message.sender.username}:</strong> {message.content}
          </div>
        ))}
      </div>
    </div>
  );
};
```

### Vue.js 3 (Composition API)

```typescript
import { ref, onMounted, onUnmounted } from "vue";
import { io, Socket } from "socket.io-client";

export const useWebSocket = () => {
  const socket = ref<Socket | null>(null);
  const messages = ref<any[]>([]);
  const isConnected = ref(false);
  onMounted(() => {
    socket.value = io("wss://messaging-platform-gfnp.onrender.com");

    socket.value.on("connect", () => {
      isConnected.value = true;
    });

    socket.value.on("disconnect", () => {
      isConnected.value = false;
    });

    socket.value.on("newMessage", (message: any) => {
      messages.value.push(message);
    });
  });

  onUnmounted(() => {
    socket.value?.disconnect();
  });

  return {
    socket: socket.value,
    messages,
    isConnected,
  };
};
```

### Angular avec Service

```typescript
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { io, Socket } from "socket.io-client";

@Injectable({
  providedIn: "root",
})
export class WebSocketService {
  private socket: Socket;
  private messagesSubject = new BehaviorSubject<any[]>([]);
  private isConnectedSubject = new BehaviorSubject<boolean>(false);
  constructor() {
    this.socket = io("wss://messaging-platform-gfnp.onrender.com");
    this.setupSocketEvents();
  }

  private setupSocketEvents() {
    this.socket.on("connect", () => {
      this.isConnectedSubject.next(true);
    });

    this.socket.on("disconnect", () => {
      this.isConnectedSubject.next(false);
    });

    this.socket.on("newMessage", (message: any) => {
      const currentMessages = this.messagesSubject.value;
      this.messagesSubject.next([...currentMessages, message]);
    });
  }

  getMessages(): Observable<any[]> {
    return this.messagesSubject.asObservable();
  }

  getConnectionStatus(): Observable<boolean> {
    return this.isConnectedSubject.asObservable();
  }

  disconnect() {
    this.socket.disconnect();
  }
}
```

## Intégration avec GraphQL

### Exemple avec Apollo Client (React)

```tsx
import { useMutation } from "@apollo/client";
import { CREATE_MESSAGE } from "./graphql/mutations";

const ChatInput: React.FC<{ conversationId: string; senderId: string }> = ({
  conversationId,
  senderId,
}) => {
  const [createMessage] = useMutation(CREATE_MESSAGE);
  const [content, setContent] = useState("");

  const handleSendMessage = async () => {
    try {
      await createMessage({
        variables: {
          createMessageInput: {
            content,
            conversationId,
          },
          senderId,
        },
      });

      setContent("");
      // Le message sera reçu via WebSocket automatiquement
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
    }
  };

  return (
    <div>
      <input
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
      />
      <button onClick={handleSendMessage}>Envoyer</button>
    </div>
  );
};
```

## Gestion des erreurs et reconnexion

```typescript
class RobustWebSocketService {
  private socket: Socket;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 1000;

  constructor() {
    this.connect();
  }
  private connect() {
    this.socket = io("wss://messaging-platform-gfnp.onrender.com", {
      timeout: 20000,
      forceNew: true,
    });

    this.socket.on("connect", () => {
      console.log("✅ WebSocket connecté");
      this.reconnectAttempts = 0;
    });

    this.socket.on("disconnect", (reason) => {
      console.log("❌ WebSocket déconnecté:", reason);

      if (reason === "io server disconnect") {
        // Reconnexion manuelle nécessaire
        this.handleReconnect();
      }
    });

    this.socket.on("connect_error", (error) => {
      console.error("❌ Erreur de connexion:", error);
      this.handleReconnect();
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `🔄 Tentative de reconnexion ${this.reconnectAttempts}/${this.maxReconnectAttempts}`
      );

      setTimeout(() => {
        this.socket.connect();
      }, this.reconnectInterval * this.reconnectAttempts);
    } else {
      console.error(
        "❌ Impossible de se reconnecter après",
        this.maxReconnectAttempts,
        "tentatives"
      );
    }
  }
}
```

## Variables d'environnement

Créez un fichier `.env.local` dans votre frontend :

```env
# .env.local - Configuration Production Render
NEXT_PUBLIC_WEBSOCKET_URL=wss://messaging-platform-gfnp.onrender.com
NEXT_PUBLIC_GRAPHQL_URL=https://messaging-platform-gfnp.onrender.com/graphql
NEXT_PUBLIC_API_URL=https://messaging-platform-gfnp.onrender.com
```

Utilisez-les dans votre code :

```typescript
const WEBSOCKET_URL =
  process.env.NEXT_PUBLIC_WEBSOCKET_URL ||
  "wss://messaging-platform-gfnp.onrender.com";
const socket = io(WEBSOCKET_URL);
```

## Tests du WebSocket

### Test de connexion simple

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Test WebSocket</title>
  </head>
  <body>
    <div id="status">Déconnecté</div>
    <div id="messages"></div>

    <script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>
    <script>
      const socket = io("wss://messaging-platform-gfnp.onrender.com");
      const statusDiv = document.getElementById("status");
      const messagesDiv = document.getElementById("messages");

      socket.on("connect", () => {
        statusDiv.textContent = "✅ Connecté: " + socket.id;
      });

      socket.on("disconnect", () => {
        statusDiv.textContent = "❌ Déconnecté";
      });

      socket.on("newMessage", (message) => {
        const messageElement = document.createElement("div");
        messageElement.textContent = `${message.sender.username}: ${message.content}`;
        messagesDiv.appendChild(messageElement);
      });
    </script>
  </body>
</html>
```

## Bonnes pratiques

1. **Gestion des états** : Maintenez l'état de connexion dans votre store global (Redux, Zustand, etc.)

2. **Filtrage des messages** : Filtrez les messages par conversation côté client

3. **Optimisation** : Déconnectez le WebSocket quand l'utilisateur quitte la page de chat

4. **Sécurité** : En production, utilisez HTTPS/WSS et implémentez l'authentification

5. **Performance** : Limitez le nombre de messages gardés en mémoire côté client

---

## 🔧 Configuration Spécifique à ce Projet

### Architecture Déployée

Cette application WhatsApp Clone est configurée pour fonctionner entièrement avec des services cloud :

```typescript
// Configuration recommandée pour ce projet
const config = {
  WEBSOCKET_URL: "wss://messaging-platform-gfnp.onrender.com",
  GRAPHQL_URL: "https://messaging-platform-gfnp.onrender.com/graphql",
  API_URL: "https://messaging-platform-gfnp.onrender.com",
};
```

### Variables d'Environnement `.env.local`

```env
# Configuration Production - Render.com
NEXT_PUBLIC_WEBSOCKET_URL=wss://messaging-platform-gfnp.onrender.com
NEXT_PUBLIC_GRAPHQL_URL=https://messaging-platform-gfnp.onrender.com/graphql
NEXT_PUBLIC_API_URL=https://messaging-platform-gfnp.onrender.com

# Configuration optionnelle
NEXT_PUBLIC_API_TIMEOUT=15000
NEXT_PUBLIC_RECONNECT_INTERVAL=30000
NEXT_PUBLIC_NODE_ENV=production
```

### Avantages de cette Configuration

1. **🚀 Démarrage rapide** : Aucune installation de base de données locale
2. **☁️ Toujours à jour** : Backend maintenu et mis à jour automatiquement
3. **🔒 Sécurisé** : HTTPS/WSS en production
4. **📊 Monitoring** : Logs et métriques disponibles sur Render
5. **🌍 Accessible** : Testable depuis n'importe où

### Temps de Réponse

⏱️ **Première connexion** : 30-60 secondes (réveil du service gratuit Render)
⏱️ **Connexions suivantes** : 1-3 secondes
⏱️ **WebSocket** : Temps réel une fois connecté

### Support et Dépannage

- **Status API** : https://messaging-platform-gfnp.onrender.com/health
- **GraphQL Playground** : https://messaging-platform-gfnp.onrender.com/graphql
- **Test WebSocket** : Utilisez `public/websocket-test.html`
- **Page de test complète** : http://localhost:3000/test

---

## 📋 Voir Aussi

### 📚 Guides Complémentaires

- **`WEBSOCKET_FRONTEND_GUIDE.md`** ⭐ : Guide détaillé d'implémentation frontend avec exemples concrets
- **`API_INTEGRATION.md`** : Documentation complète de l'API GraphQL
- **`QUICKSTART.md`** : Guide de démarrage rapide
- **`ARCHITECTURE_SUMMARY.md`** : Vue d'ensemble de l'architecture

### 🧪 Tests et Validation

- **Page `/test`** : Interface de test interactive (http://localhost:3000/test)
- **WebSocket Test** : Page standalone (http://localhost:3000/websocket-test.html)
- **Scripts** : `npm run validate:config`, `npm run test:api`

### 🔧 Composants Prêts à l'Emploi

- **`AdvancedChatExample`** : Chat temps réel complet
- **`WebSocketStatus`** : Indicateur de connexion
- **`ApiTestPanel`** : Panel de test avec monitoring
- **`WebSocketTestPanel`** : Tests WebSocket avancés

---

Avec ce guide et l'implémentation existante, votre frontend est parfaitement connecté au WebSocket ! 🚀
