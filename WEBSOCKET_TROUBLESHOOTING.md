# Guide de Résolution des Problèmes WebSocket

## 🚨 Problèmes courants et solutions

### 1. "localStorage.debug = 'socket.io-client:socket'" ne marche pas

**Problème :** L'ancienne syntaxe de débogage Socket.IO ne fonctionne plus.

**Solutions :**

```javascript
// ✅ Nouvelle syntaxe (recommandée)
localStorage.setItem("debug", "socket.io-client:*");
// Puis actualisez la page

// ✅ Alternative pour logs spécifiques
localStorage.setItem("debug", "socket.io-client:socket");

// ✅ Utiliser les boutons dans l'interface
// Cliquez sur "Activer Logs" dans la section "Informations de Débogage"
```

**Vérification :**

- Ouvrez la console (F12)
- Actualisez la page après avoir activé les logs
- Vous devriez voir des logs détaillés commençant par `socket.io-client:`

### 2. WebSocket se déconnecte fréquemment

**Causes possibles :**

- Connexion réseau instable
- Serveur Render.com en mode "sleep" (première connexion)
- Proxy ou firewall bloquant les WebSockets

**Solutions :**

```javascript
// Dans la console, vérifiez l'état
console.log("État socket:", window.socket?.connected);
console.log("Transport utilisé:", window.socket?.io?.engine?.transport?.name);

// Forcer la reconnexion
window.socket?.connect();
```

**Actions dans l'interface :**

1. Cliquez sur "Forcer Reconnexion"
2. Vérifiez que l'URL WebSocket est correcte
3. Attendez 30-60 secondes pour le réveil du serveur

### 3. Messages non reçus en temps réel

**Diagnostic :**

```javascript
// Vérifier les événements écoutés
console.log("Événements:", window.socket?.listeners("newMessage"));

// Tester l'émission manuelle
window.socket?.emit("ping", { test: true });

// Vérifier le filtrage par conversation
// Si vous testez avec un conversationId spécifique
```

**Solutions :**

1. Vérifiez que le WebSocket est connecté (badge vert)
2. Testez sans filtrage de conversation d'abord
3. Utilisez "Test Complet" pour diagnostiquer

### 4. Erreur CORS ou connexion refusée

**Message d'erreur typique :**

```
Access to XMLHttpRequest at 'https://messaging-platform-gfnp.onrender.com/socket.io/' from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Solutions :**

- ✅ Normal en développement, le backend gère automatiquement les CORS
- Attendez que le serveur se réveille (services gratuits Render)
- Vérifiez l'URL dans les variables d'environnement

### 5. Console vide ou logs manquants

**Étapes de diagnostic :**

1. Ouvrez les Developer Tools (F12)
2. Allez dans l'onglet "Console"
3. Activez les logs via le bouton "Activer Logs"
4. Actualisez la page
5. Reconnectez-vous au WebSocket

**Commandes utiles :**

```javascript
// Vérifier si les logs sont activés
console.log("Debug activé:", localStorage.getItem("debug"));

// Nettoyer les logs
console.clear();

// Voir l'objet socket complet
console.log("Socket object:", window.socket);
```

## 🔧 Outils de débogage avancés

### Inspect WebSocket dans DevTools

1. **Onglet Network :**

   - Filtrez par "WS" (WebSocket)
   - Voyez les messages en temps réel
   - Vérifiez les headers de connexion

2. **Onglet Application :**

   - Vérifiez les variables localStorage
   - Inspectez les données stockées

3. **Onglet Console :**
   - Tapez `window.socket` pour inspecter l'objet
   - Utilisez `window.socket.emit()` pour tester

### Commandes utiles

```javascript
// État détaillé de la connexion
console.table({
  Connecté: window.socket?.connected,
  "Socket ID": window.socket?.id,
  Transport: window.socket?.io?.engine?.transport?.name,
  URL: window.socket?.io?.uri,
});

// Écouter tous les événements
window.socket?.onAny((event, ...args) => {
  console.log(`📡 Événement reçu: ${event}`, args);
});

// Historique des tentatives de connexion
console.log("Manager:", window.socket?.io);
```

## 📊 Métriques de performance

### Temps de connexion normal

- **Première connexion :** 30-60 secondes (réveil serveur Render)
- **Reconnexions :** 1-3 secondes
- **Latency ping :** < 200ms (Europe vers US)

### Signaux d'alerte

- Reconnexions > 5 par minute
- Timeouts fréquents
- Messages perdus
- Erreurs CORS persistantes

## 🆘 Support et ressources

### Logs à fournir en cas de problème

1. Exportez les diagnostics (bouton "Export Diagnostics")
2. Copiez les logs de la console
3. Notez l'heure et les actions effectuées
4. Vérifiez le statut du serveur : https://messaging-platform-gfnp.onrender.com/health

### URLs de test

- **API Health :** https://messaging-platform-gfnp.onrender.com/health
- **GraphQL Playground :** https://messaging-platform-gfnp.onrender.com/graphql
- **Test WebSocket local :** http://localhost:3000/test
- **Test HTML standalone :** http://localhost:3000/websocket-test.html

### Variables d'environnement à vérifier

```env
NEXT_PUBLIC_WEBSOCKET_URL=https://messaging-platform-gfnp.onrender.com
NEXT_PUBLIC_GRAPHQL_URL=https://messaging-platform-gfnp.onrender.com/graphql
NEXT_PUBLIC_BACKEND_URL=https://messaging-platform-gfnp.onrender.com
```

---

**💡 Astuce :** Gardez toujours la console ouverte pendant les tests pour voir les messages en temps réel !
