# Fix CORS - Résolution des Erreurs Cross-Origin

## 🚨 Problème Identifié

L'erreur CORS suivante était bloquante :

```
Access to fetch at 'https://messaging-platform-gfnp.onrender.com/graphql' from origin 'http://localhost:3000' has been blocked by CORS policy: Request header field cache-control is not allowed by Access-Control-Allow-Headers in preflight response.
```

## 🔧 Solution Appliquée

### 1. Suppression des Headers Problématiques

Dans `lib/apollo-client.ts`, j'ai supprimé les headers qui causaient l'erreur CORS :

- ❌ `Cache-Control: no-cache`
- ❌ `X-Requested-With: XMLHttpRequest`
- ❌ `Access-Control-Request-Method`
- ❌ `Access-Control-Request-Headers`

### 2. Configuration Simplifiée des Headers

```typescript
// Headers autorisés uniquement
headers: {
  "Content-Type": "application/json",
  "Accept": "application/json",
  authorization: token ? `Bearer ${token}` : "",
}
```

## 📋 Headers Autorisés par le Backend

Le backend NestJS n'autorise actuellement que ces headers :

- `Content-Type`
- `Accept`
- `Authorization`

## 🎯 Recommandations pour l'Équipe

### Frontend (Next.js)

1. **Ne jamais ajouter de headers custom sans vérifier la config CORS backend**
2. **Utiliser uniquement les headers standard** : `Content-Type`, `Accept`, `Authorization`
3. **Tester toujours en local ET en production** car les configurations CORS peuvent différer

### Backend (NestJS)

Si l'équipe backend a besoin d'autoriser plus de headers, modifier la configuration CORS :

```typescript
// Dans main.ts ou app.module.ts
app.enableCors({
  origin: ["http://localhost:3000", "https://votre-frontend.vercel.app"],
  allowedHeaders: [
    "Content-Type",
    "Accept",
    "Authorization",
    "Cache-Control", // ← Ajouter si nécessaire
    "X-Requested-With", // ← Ajouter si nécessaire
  ],
  credentials: true,
});
```

## 🔍 Comment Diagnostiquer les Erreurs CORS

### 1. Vérifier les Headers dans la Console

```bash
# Ouvrir les DevTools → Network → Filtrer par "Fetch/XHR"
# Cliquer sur une requête → Headers → Request Headers
```

### 2. Tester avec curl

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"query":"{ __typename }"}' \
  https://messaging-platform-gfnp.onrender.com/graphql
```

### 3. Utiliser les Outils de Debug Apollo

```typescript
// Dans apollo-client.ts
export const debugApolloRequest = (operation: any) => {
  console.log("🔍 Apollo Request:", {
    operation: operation.operationName,
    variables: operation.variables,
    headers: operation.getContext().headers,
  });
};
```

## ✅ Test de Validation

Après application du fix :

1. **Démarrer le frontend** : `npm run dev`
2. **Ouvrir la console** et vérifier qu'il n'y a plus d'erreurs CORS
3. **Tester une requête GraphQL** depuis l'interface
4. **Vérifier les logs** des composants de monitoring cloud

## 🚀 Déploiement

### Variables d'Environnement Nécessaires

```env
# .env.production
NEXT_PUBLIC_GRAPHQL_URL=https://messaging-platform-gfnp.onrender.com/graphql
NEXT_PUBLIC_WEBSOCKET_URL=https://messaging-platform-gfnp.onrender.com
NEXT_PUBLIC_NODE_ENV=production

# .env.development
NEXT_PUBLIC_GRAPHQL_URL=https://messaging-platform-gfnp.onrender.com/graphql
NEXT_PUBLIC_WEBSOCKET_URL=https://messaging-platform-gfnp.onrender.com
NEXT_PUBLIC_NODE_ENV=development
```

### Scripts npm pour Tester

```bash
# Test en mode développement
npm run dev

# Test en mode production local
npm run build && npm run start

# Test de connectivité (ajouté dans package.json)
npm run test:connectivity
```

## 📚 Ressources

- [MDN - CORS](https://developer.mozilla.org/fr/docs/Web/HTTP/CORS)
- [Apollo Client Headers](https://www.apollographql.com/docs/react/networking/advanced-http-networking/)
- [NestJS CORS Configuration](https://docs.nestjs.com/security/cors)

---

**Status** : ✅ **Résolu** - Les erreurs CORS ont été corrigées en supprimant les headers non autorisés.
