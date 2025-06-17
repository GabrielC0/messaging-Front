# Intégration API Backend - WhatsApp Clone

Ce document explique comment le frontend React/Next.js est intégré avec l'API GraphQL/WebSocket du backend.

## Configuration

### Variables d'environnement

Les variables suivantes sont configurées dans `.env.local` :

```bash
NEXT_PUBLIC_GRAPHQL_URL=https://messaging-platform-gfnp.onrender.com/graphql
NEXT_PUBLIC_WEBSOCKET_URL=https://messaging-platform-gfnp.onrender.com
NEXT_PUBLIC_API_TIMEOUT=15000
NEXT_PUBLIC_NODE_ENV=production
NEXT_PUBLIC_RECONNECT_INTERVAL=30000
```

### API Backend (Déjà déployée)

L'API NestJS est déjà déployée sur Render.com avec une base de données PostgreSQL en ligne :

- GraphQL Playground : https://messaging-platform-gfnp.onrender.com/graphql
- Health Check : https://messaging-platform-gfnp.onrender.com/health
- WebSocket : wss://messaging-platform-gfnp.onrender.com

⚠️ **Note** : L'API peut prendre 30-60 secondes à se réveiller (service gratuit).

## Architecture Frontend

### Structure des fichiers

```
├── hooks/
│   ├── use-api.ts          # Hooks pour toutes les opérations GraphQL
│   └── use-socket.ts       # Hook pour WebSocket/Socket.IO
├── graphql/
│   ├── queries.ts          # Requêtes et mutations GraphQL
│   └── types.ts            # Types TypeScript pour GraphQL
├── lib/
│   └── apollo-client.ts    # Configuration Apollo Client
└── components/
    └── api-test-panel.tsx  # Composant de test de l'API
```

### Apollo Client

Le client Apollo est configuré pour :

- Se connecter automatiquement à l'API de production Render
- Gérer les erreurs de connexion
- Retenter les connexions automatiquement
- Mettre en cache les données efficacement

### Hooks personnalisés

#### `use-api.ts`

Fournit des hooks pour toutes les opérations GraphQL :

**Requêtes (Queries) :**

- `useUsers()` - Récupère tous les utilisateurs
- `useUser(id)` - Récupère un utilisateur par ID
- `useConversations()` - Récupère toutes les conversations
- `useConversation(id)` - Récupère une conversation par ID
- `useUserConversations(userId)` - Récupère les conversations d'un utilisateur
- `useMessages()` - Récupère tous les messages
- `useMessage(id)` - Récupère un message par ID
- `useConversationMessages(conversationId)` - Récupère les messages d'une conversation
- `useHealthCheck()` - Vérifie l'état de l'API

**Mutations :**

- `useCreateUser()` - Crée un nouvel utilisateur
- `useCreateConversation()` - Crée une nouvelle conversation
- `useCreateMessage()` - Envoie un nouveau message

**Hooks combinés :**

- `useMessaging()` - Combine WebSocket et GraphQL pour la messagerie
- `useUserOperations()` - Opérations utilisateur haut niveau
- `useConversationOperations()` - Opérations conversation haut niveau

#### `use-socket.ts`

Gère la connexion WebSocket pour les mises à jour en temps réel :

- Connexion automatique au serveur Socket.IO
- Écoute des événements `newMessage`
- Gestion de la reconnexion automatique
- États de connexion

## Utilisation dans les composants

### Exemple 1 : Afficher la liste des utilisateurs

```tsx
import { useUsers } from "../hooks/use-api";

function UsersList() {
  const { data, loading, error } = useUsers();

  if (loading) return <p>Chargement...</p>;
  if (error) return <p>Erreur : {error.message}</p>;

  return (
    <ul>
      {data?.users.map((user) => (
        <li key={user.id}>
          {user.username} - {user.email}
        </li>
      ))}
    </ul>
  );
}
```

### Exemple 2 : Créer un utilisateur

```tsx
import { useUserOperations } from "../hooks/use-api";

function CreateUserForm() {
  const { registerUser } = useUserOperations();

  const handleSubmit = async (formData: CreateUserInput) => {
    try {
      const user = await registerUser(formData);
      console.log("Utilisateur créé:", user);
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  // ... reste du composant
}
```

### Exemple 3 : Chat en temps réel

```tsx
import { useConversationMessages, useMessaging } from "../hooks/use-api";

function ChatWindow({ conversationId }: { conversationId: string }) {
  const { data: messages, loading } = useConversationMessages(conversationId);
  const { sendMessage, isConnected } = useMessaging();

  const handleSendMessage = async (content: string, senderId: string) => {
    try {
      await sendMessage({ content, conversationId }, senderId);
    } catch (error) {
      console.error("Erreur envoi message:", error);
    }
  };

  // ... reste du composant
}
```

## Types GraphQL

Tous les types sont définis dans `graphql/types.ts` et correspondent exactement au schéma de l'API :

```typescript
interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface Message {
  id: string;
  content: string;
  sender: User;
  conversation: Conversation;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Conversation {
  id: string;
  title?: string;
  participants: User[];
  messages: Message[];
  lastActivity: string;
  createdAt: string;
  updatedAt: string;
}
```

## Test et Débogage

### Page de test

Accédez à `/test` pour tester l'intégration :

- Tests de connectivité GraphQL
- Tests WebSocket
- Création d'utilisateurs et conversations de test
- Monitoring de l'état de l'API

### Console du navigateur

Les logs sont activés pour :

- Connexions/déconnexions WebSocket
- Requêtes GraphQL
- Erreurs de l'API
- États de cache Apollo

## Gestion des erreurs

### Stratégies implémentées :

1. **Retry automatique** pour les requêtes échouées
2. **Fallback gracieux** en cas de déconnexion
3. **Cache local** Apollo pour la persistance
4. **Notifications d'erreur** à l'utilisateur
5. **Reconnexion automatique** WebSocket

### Types d'erreurs gérées :

- Erreurs réseau (timeout, connexion)
- Erreurs GraphQL (validation, serveur)
- Erreurs WebSocket (déconnexion)
- Erreurs de cache Apollo

## Performance

### Optimisations :

- **Cache Apollo** pour éviter les requêtes redondantes
- **Polling intelligent** pour les données critiques
- **Lazy loading** des requêtes non essentielles
- **Mise à jour locale** du cache via WebSocket
- **Debouncing** pour les requêtes utilisateur

## Évolutions futures

### Fonctionnalités à implémenter :

1. **Authentification JWT** (quand supportée par l'API)
2. **Pagination** des messages et conversations
3. **Upload de fichiers** (avatars, médias)
4. **Statuts de lecture** des messages
5. **Notifications push** web
6. **Mode hors ligne** avec synchronisation

### Améliorations techniques :

1. **Service Worker** pour le cache
2. **Optimistic updates** pour la réactivité
3. **GraphQL Subscriptions** (si supporté)
4. **Bundle splitting** pour les performances
5. **Tests automatisés** E2E

## Dépannage

### Problèmes courants :

**1. Erreur de connexion GraphQL**

- Vérifiez que le backend fonctionne sur le port 3002
- Vérifiez les variables d'environnement
- Testez l'endpoint manuellement : https://messaging-platform-gfnp.onrender.com/graphql

**2. WebSocket ne se connecte pas**

- Vérifiez les logs du navigateur
- Testez la connexion Socket.IO directement
- Vérifiez les ports et CORS

**3. Cache Apollo corrompu**

- Utilisez le bouton "Réinitialiser le cache" sur la page `/test`
- Ou exécutez `client.clearStore()` dans la console

**4. Types TypeScript incorrects**

- Régénérez les types depuis le schéma GraphQL
- Vérifiez la synchronisation avec l'API backend
