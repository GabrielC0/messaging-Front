# Guide de Démarrage Rapide - API Integration

## 🚀 Configuration du Backend

✅ **Le backend est déjà déployé** sur Render.com :

- GraphQL Playground : https://messaging-platform-gfnp.onrender.com/graphql
- Health Check : https://messaging-platform-gfnp.onrender.com/health
- WebSocket : wss://messaging-platform-gfnp.onrender.com

⚠️ **Note importante** : L'API peut prendre 30-60 secondes à se réveiller lors du premier accès (service gratuit Render.com).

## 🔧 Configuration du Frontend

1. **Vérifiez les variables d'environnement** dans `.env.local` :

   ```bash
   NEXT_PUBLIC_GRAPHQL_URL=https://messaging-platform-gfnp.onrender.com/graphql
   NEXT_PUBLIC_WEBSOCKET_URL=https://messaging-platform-gfnp.onrender.com
   ```

2. **Installez les dépendances** (si pas encore fait) :

   ```bash
   npm install
   ```

3. **Démarrez le frontend** :
   ```bash
   npm run dev
   ```

## 🧪 Tests de Connectivité

### Test automatique de l'API

```bash
npm run test:api
```

### Test WebSocket simple

Ouvrez http://localhost:3000/websocket-test.html dans votre navigateur

### Test dans l'interface complète

1. Accédez à http://localhost:3000/test
2. Vérifiez tous les indicateurs de statut
3. Testez la création d'utilisateurs et de conversations
4. Utilisez le panel WebSocket avancé pour tester la connexion temps réel

## 📋 Fonctionnalités Disponibles

### ✅ Fonctionnalités Implémentées

- **Requêtes GraphQL** : Utilisateurs, conversations, messages
- **Mutations GraphQL** : Création d'utilisateurs, conversations, messages
- **WebSocket** : Connexion en temps réel (Socket.IO)
- **Cache Apollo** : Mise en cache automatique des données
- **Gestion d'erreurs** : Retry automatique et fallback
- **Types TypeScript** : Typage complet de l'API

### 🔄 Hooks Disponibles

#### Requêtes (Queries)

```typescript
// Utilisateurs
const { data, loading, error } = useUsers();
const { data } = useUser(userId);

// Conversations
const { data } = useConversations();
const { data } = useConversation(conversationId);
const { data } = useUserConversations(userId);

// Messages
const { data } = useMessages();
const { data } = useMessage(messageId);
const { data } = useConversationMessages(conversationId);

// Health Check
const { data } = useHealthCheck();
```

#### Mutations

```typescript
// Créer un utilisateur
const { registerUser } = useUserOperations();
await registerUser({
  username: "john",
  email: "john@example.com",
});

// Créer une conversation
const { startConversation } = useConversationOperations();
await startConversation({
  participantIds: ["user1", "user2"],
  title: "Ma conversation",
});

// Envoyer un message
const { sendMessage } = useMessaging();
await sendMessage({ content: "Hello!", conversationId: "conv1" }, "userId");
```

### 🌐 WebSocket

```typescript
// État de connexion
const { isConnected, lastMessage } = useSocket();

// Le hook useMessaging gère automatiquement
// les nouveaux messages reçus via WebSocket
```

## 🎯 Composants d'Exemple

### Chat Window

```typescript
import { ChatWindow } from "../components/chat-window";

<ChatWindow conversationId="123" onBack={() => {}} showBackButton={true} />;
```

### Chat Sidebar

```typescript
import { ChatSidebar } from "../components/chat-sidebar";

<ChatSidebar
  selectedConversation="123"
  onSelectConversation={setSelected}
  onShowProfile={() => {}}
  onShowSettings={() => {}}
  onShowContacts={() => {}}
  onNewConversation={() => {}}
/>;
```

### API Test Panel

```typescript
import { ApiTestPanel } from "../components/api-test-panel";

<ApiTestPanel />;
```

### WebSocket Status

```typescript
import { WebSocketStatus } from "../components/websocket-status";

<WebSocketStatus />;
```

## 🔍 Débogage

### Logs dans la Console

Les opérations GraphQL et WebSocket sont loggées dans la console du navigateur :

- ✅ Succès des requêtes
- ❌ Erreurs de connexion
- 🔄 Tentatives de reconnexion
- 📡 Messages WebSocket

### Outils de Développement

1. **Apollo Client DevTools** : Extension pour Chrome/Firefox
2. **GraphQL Playground** : https://messaging-platform-gfnp.onrender.com/graphql
3. **Page de test** : http://localhost:3000/test

## 🚨 Dépannage

### Problème : "Cannot connect to GraphQL"

1. **Première connexion** : Attendez 1-2 minutes que l'API se réveille
2. Testez manuellement : `curl https://messaging-platform-gfnp.onrender.com/health`
3. Vérifiez votre connexion internet
4. Vérifiez les variables d'environnement

### Problème : "WebSocket connection failed"

1. L'API peut prendre du temps à démarrer les WebSockets
2. Actualisez la page après quelques minutes
3. Vérifiez que vous n'êtes pas derrière un proxy/firewall qui bloque les WebSockets

### Problème : "Apollo cache errors"

1. Utilisez le bouton "Réinitialiser le cache" sur `/test`
2. Ou exécutez `client.clearStore()` dans la console
3. Redémarrez l'application

### Problème : "Slow response times"

1. **Normal** : L'API gratuite Render.com peut être lente
2. Les premières requêtes prennent plus de temps
3. Le cache Apollo améliore les performances après la première charge

## 📚 Ressources

- **Documentation API** : Voir le fichier fourni avec les endpoints
- **Code Examples** : `hooks/use-api.ts` et `components/api-test-panel.tsx`
- **Types GraphQL** : `graphql/types.ts`
- **Configuration Apollo** : `lib/apollo-client.ts`

## 🎉 Prochaines Étapes

1. **Authentification** : Implémenter JWT quand supporté par l'API
2. **Pagination** : Ajouter le support de la pagination des messages
3. **Upload de fichiers** : Images et documents
4. **Notifications** : Push notifications web
5. **Mode hors ligne** : Cache persistant et synchronisation
