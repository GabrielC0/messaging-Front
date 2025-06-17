# Intégration WebSocket Frontend - Guide d'Implémentation Production

Ce guide explique comment intégrer le système de notifications WebSocket côté frontend avec notre backend NestJS hébergé sur **Render.com**.

## 📋 Architecture

- **Backend NestJS** : `https://messaging-platform-gfnp.onrender.com`
- **WebSocket** : `wss://messaging-platform-gfnp.onrender.com`
- **Frontend** : React/Next.js (localhost:3000)
- **Base de données** : PostgreSQL Render + Redis Upstash

## 🔧 Installation

### Pour React/Next.js (Notre Stack)

```bash
npm install socket.io-client
# Déjà installé dans le projet !
```

### Configuration Variables d'Environnement

```env
# .env.local (déjà configuré)
NEXT_PUBLIC_WEBSOCKET_URL=wss://messaging-platform-gfnp.onrender.com
NEXT_PUBLIC_GRAPHQL_URL=https://messaging-platform-gfnp.onrender.com/graphql
NEXT_PUBLIC_API_URL=https://messaging-platform-gfnp.onrender.com
```

## 🚀 Implémentation (Déjà Intégrée)

### 1. Service WebSocket Production

Notre service WebSocket production (déjà implémenté) :

```typescript
// hooks/use-socket.ts (EXISTANT)
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);

  useEffect(() => {
    // ✅ URL Production Render
    const WEBSOCKET_URL =
      process.env.NEXT_PUBLIC_WEBSOCKET_URL ||
      "wss://messaging-platform-gfnp.onrender.com";

    const newSocket = io(WEBSOCKET_URL, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
      transports: ["websocket", "polling"],
      timeout: 20000,
      forceNew: true,
    });

    newSocket.on("connect", () => {
      console.log("✅ WebSocket connected");
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("❌ WebSocket disconnected");
      setIsConnected(false);
    });

    newSocket.on("newMessage", (message) => {
      console.log("📩 New message received:", message);
      setLastMessage(message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return { socket, isConnected, lastMessage };
};
```

### 2. Hook WebSocket Avancé (Déjà Implémenté)

```typescript
// hooks/use-websocket-advanced.ts (EXISTANT)
import { useEffect, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

interface UseWebSocketAdvancedOptions {
  conversationId?: string;
  autoConnect?: boolean;
  maxReconnectAttempts?: number;
  reconnectInterval?: number;
}

export const useWebSocketAdvanced = (
  options: UseWebSocketAdvancedOptions = {}
) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [isReconnecting, setIsReconnecting] = useState(false);

  const {
    conversationId,
    autoConnect = true,
    maxReconnectAttempts = 5,
    reconnectInterval = 2000,
  } = options;

  const connect = useCallback(() => {
    // ✅ URL Production Render uniquement
    const WEBSOCKET_URL =
      process.env.NEXT_PUBLIC_WEBSOCKET_URL ||
      "wss://messaging-platform-gfnp.onrender.com";

    console.log("🔌 Connecting to WebSocket:", WEBSOCKET_URL);

    const newSocket = io(WEBSOCKET_URL, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
      transports: ["websocket", "polling"],
      timeout: 20000,
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: reconnectInterval,
    });

    // ... rest of implementation
  }, [maxReconnectAttempts, reconnectInterval]);

  // ... rest of the hook implementation
};
```

### 3. Composant de Notification (Déjà Implémenté)

```typescript
// components/websocket-status.tsx (EXISTANT)
"use client";

import { useSocket } from "../hooks/use-socket";
import { Badge } from "./ui/badge";
import { Wifi, WifiOff } from "lucide-react";

export function WebSocketStatus() {
  const { isConnected } = useSocket();

  return (
    <div className="flex items-center gap-2">
      <Badge variant={isConnected ? "default" : "destructive"}>
        {isConnected ? (
          <>
            <Wifi className="h-3 w-3 mr-1" />
            WebSocket Connecté
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3 mr-1" />
            WebSocket Déconnecté
          </>
        )}
      </Badge>
    </div>
  );
}
```

### 4. Chat Temps Réel Avancé (Déjà Implémenté)

```typescript
// components/advanced-chat-example.tsx (EXISTANT)
export function AdvancedChatExample({
  conversationId,
  userId,
}: AdvancedChatExampleProps) {
  // Hook WebSocket avancé avec filtrage par conversation
  const {
    isConnected,
    lastMessage,
    connectionError,
    reconnectAttempts,
    forceReconnect,
    isReconnecting,
  } = useWebSocketAdvanced({
    conversationId,
    autoConnect: true,
    maxReconnectAttempts: 3,
    reconnectInterval: 2000,
  });

  // Hook pour envoyer des messages via GraphQL
  const { sendMessage } = useMessaging();

  // Synchronisation temps réel des messages
  useEffect(() => {
    if (lastMessage && lastMessage.conversation?.id === conversationId) {
      setLocalMessages((prev) => {
        const exists = prev.some((msg) => msg.id === lastMessage.id);
        if (!exists) {
          return [...prev, lastMessage];
        }
        return prev;
      });
    }
  }, [lastMessage, conversationId]);

  // ... rest of implementation
}
```

## 🧪 Tests de l'Intégration (Déjà Disponibles)

### Page de Test Interactive : `/test`

Notre application inclut une page de test complète :

```typescript
// app/test/page.tsx (EXISTANT)
export default function TestPage() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Test de connexion au backend</h1>

      {/* ✅ Tests de Connectivité API */}
      <ApiTestPanel />

      {/* ✅ Status WebSocket */}
      <WebSocketStatus />

      {/* ✅ Tests WebSocket Avancés */}
      <WebSocketTestPanel />

      {/* ✅ Exemple de Chat Temps Réel */}
      <AdvancedChatExample conversationId="exemple" userId="user-test" />
    </div>
  );
}
```

### Test WebSocket Standalone : `/websocket-test.html`

Page HTML dédiée au test WebSocket :

```html
<!-- public/websocket-test.html (EXISTANT) -->
<script>
  const socket = io("wss://messaging-platform-gfnp.onrender.com");

  socket.on("connect", () => {
    console.log("✅ Connecté au WebSocket:", socket.id);
    document.getElementById("status").textContent = "✅ Connecté: " + socket.id;
  });

  socket.on("newMessage", (message) => {
    console.log("📩 Nouveau message:", message);
    // Affichage dans l'interface
  });
</script>
```

## 🔧 Scripts de Validation (Déjà Disponibles)

```bash
# Validation complète de la configuration
npm run validate:config

# Test de l'API et WebSocket
npm run test:api

# Affichage des fonctionnalités
npm run features
```

## 📊 Monitoring en Temps Réel

### Console Logs (Automatiques)

```
✅ WebSocket connecté: CN0WX7F3soQ6EDQDAAAU
✅ Backend status: Available
✅ Environment: Production
📊 usersData changed: {users: Array(5)}
```

### Interface de Test (`/test`)

- **Health Check** avec bouton refresh
- **WebSocket Status** en temps réel
- **Compteurs** : 5 utilisateurs, 5 conversations
- **Tests de mutation** interactifs

## 🎨 Styles et UI (Déjà Intégrés)

Notre application utilise **Shadcn/UI** et **TailwindCSS** :

```tsx
// Composants UI déjà stylés
<Badge variant={isConnected ? "default" : "destructive"}>
  <Wifi className="h-3 w-3 mr-1" />
  WebSocket Connecté
</Badge>
```

## 🔄 Gestion de Reconnexion (Déjà Implémentée)

```typescript
// Reconnexion automatique intelligente
const handleReconnect = () => {
  if (reconnectAttempts < maxReconnectAttempts) {
    setReconnectAttempts((prev) => prev + 1);
    setIsReconnecting(true);

    setTimeout(() => {
      connect();
    }, reconnectInterval * reconnectAttempts);
  }
};
```

## 🚀 Utilisation de l'Intégration

### 1. Démarrer l'Application

```bash
npm run dev
# Application sur http://localhost:3000
```

### 2. Tester la Connectivité

```bash
# Aller sur http://localhost:3000/test
# Vérifier que tous les indicateurs sont verts ✅
```

### 3. Tester le Chat Temps Réel

1. Créer un utilisateur de test (bouton sur `/test`)
2. Créer une conversation de test (bouton sur `/test`)
3. Utiliser le composant `AdvancedChatExample`
4. Observer les messages en temps réel

### 4. Monitoring

- **Logs console** : Messages détaillés
- **Interface /test** : Monitoring visuel
- **WebSocket status** : Indicateur temps réel

## ✅ Statut de l'Intégration

### 🎉 Fonctionnel à 100%

- **✅ WebSocket Production** : `wss://messaging-platform-gfnp.onrender.com`
- **✅ Reconnexion Automatique** : Intelligente avec retry
- **✅ Filtrage par Conversation** : Messages ciblés
- **✅ Interface de Test** : Page `/test` complète
- **✅ Monitoring Temps Réel** : Logs et indicateurs
- **✅ Hooks Avancés** : `useSocket`, `useWebSocketAdvanced`
- **✅ Composants UI** : Modernes et responsives

### 🔧 Hooks Disponibles

```typescript
// Hook simple
const { isConnected, lastMessage } = useSocket();

// Hook avancé avec options
const { isConnected, lastMessage, reconnectAttempts, forceReconnect } =
  useWebSocketAdvanced({
    conversationId: "123",
    maxReconnectAttempts: 5,
  });

// Hook pour messaging
const { sendMessage } = useMessaging();
```

### 🧪 Tests Intégrés

- **Page /test** : Interface complète de validation
- **Scripts NPM** : `validate:config`, `test:api`
- **HTML standalone** : `/websocket-test.html`
- **Logs détaillés** : Console du navigateur

## 📚 Documentation Complète

- **`WEBSOCKET_INTEGRATION.md`** : Guide WebSocket complet
- **`API_INTEGRATION.md`** : Documentation API GraphQL
- **`QUICKSTART.md`** : Démarrage rapide
- **`README.md`** : Guide principal avec page `/test`

---

## 🎊 Félicitations !

**L'intégration WebSocket est complètement fonctionnelle** avec notre architecture cloud Render !

Aucune configuration supplémentaire n'est nécessaire - tout est déjà opérationnel et testé. 🚀
