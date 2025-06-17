# WhatsApp Clone 🚀

Une application de messagerie instantanée moderne construite avec Next.js, GraphQL et TypeScript, avec une **infrastructure cloud complète** et **WebSocket temps réel** !

## 🎯 Démo en Direct

- **Application** : http://localhost:3000 (après `npm run dev`)
- **Page de Test** : http://localhost:3000/test 🧪
- **Test WebSocket** : http://localhost:3000/websocket-test.html
- **API GraphQL** : https://messaging-platform-gfnp.onrender.com/graphql
- **Backend Health** : https://messaging-platform-gfnp.onrender.com/health

## ✨ Nouvelles Fonctionnalités

### 🧪 Page de Test Complète (`/test`)

Une interface de test interactive pour valider toutes les fonctionnalités :

- **🔌 Tests de Connectivité API**

  - Health Check avec bouton de rafraîchissement
  - Test WebSocket en temps réel
  - Vérification des requêtes utilisateurs (5 utilisateurs)
  - Vérification des conversations (5 conversations)

- **🔧 Tests de Mutations**

  - Création d'utilisateurs de test
  - Création de conversations de test
  - Interface interactive avec boutons

- **📊 Monitoring en Temps Réel**
  - Statut de connexion WebSocket
  - Indicateurs visuels (badges colorés)
  - Messages d'erreur détaillés
  - Logs de débogage

### 🚀 WebSocket Avancé

- **Connexion temps réel** : `wss://messaging-platform-gfnp.onrender.com`
- **Reconnexion automatique** avec retry intelligent
- **Filtrage par conversation** pour optimiser les performances
- **Gestion d'erreurs robuste** avec fallback
- **Hooks avancés** : `useWebSocketAdvanced`, `useSocket`

### 📱 Composants Interactifs

- **`AdvancedChatExample`** : Chat temps réel complet avec UI moderne
- **`ApiTestPanel`** : Panel de test avec indicateurs de statut
- **`WebSocketTestPanel`** : Tests WebSocket avancés
- **`WebSocketStatus`** : Indicateur de connexion temps réel

## 🌐 Infrastructure Cloud

### Base de données

- **PostgreSQL** hébergé sur **Render.com**
- **URL**: `dpg-d17tma3uibrs7384okvg-a.oregon-postgres.render.com`
- **Base de données**: `nestjs_db_uce4`
- **Utilisateur**: `nestjs`

### Cache et Files d'attente

- **Redis** hébergé sur **Upstash.io**
- Gestion des files d'attente et mise en cache

### Backend API

- **NestJS** avec GraphQL
- Hébergé sur **Render.com** : `https://messaging-platform-gfnp.onrender.com`
- Support WebSocket pour le temps réel : `wss://messaging-platform-gfnp.onrender.com`
- GraphQL Playground : `https://messaging-platform-gfnp.onrender.com/graphql`

## 🚀 Fonctionnalités

### ✅ Implémentées et Testées

**Interface et Navigation**

- ✅ Interface responsive (mobile et desktop)
- ✅ Navigation moderne avec sidebar
- ✅ Page de test interactive (`/test`)
- ✅ Thème sombre/clair avec persistance

**Gestion des Utilisateurs**

- ✅ Authentification complète (connexion/inscription)
- ✅ Profil utilisateur avec avatar
- ✅ Création d'utilisateurs de test
- ✅ 5 utilisateurs pré-chargés en base

**Messagerie Temps Réel**

- ✅ WebSocket stable : `wss://messaging-platform-gfnp.onrender.com`
- ✅ Messages temps réel avec Socket.IO
- ✅ Chat avancé avec filtrage par conversation
- ✅ Reconnexion automatique intelligente
- ✅ Gestion des déconnexions réseau

**Conversations**

- ✅ Création et gestion des conversations
- ✅ 5 conversations pré-chargées en base
- ✅ Messages groupés par conversation
- ✅ Historique persistant
- ✅ Interface de chat moderne

**API et Backend**

- ✅ GraphQL complet avec Apollo Client
- ✅ Backend NestJS hébergé sur Render.com
- ✅ Base de données PostgreSQL cloud
- ✅ Cache Redis via Upstash
- ✅ Health checks automatiques

**Tests et Monitoring**

- ✅ Page de test complète (`/test`)
- ✅ Scripts de validation automatique
- ✅ Monitoring WebSocket en temps réel
- ✅ Tests de connectivité API
- ✅ Interface de débogage avancée

### 🔜 À Venir

- 📝 Statut de lecture des messages
- 📝 Notifications push web
- 📝 Upload d'images et fichiers
- 📝 Statut en ligne des utilisateurs
- 📝 Recherche dans les messages

## 🛠 Technologies utilisées

**Frontend :**

- **Next.js 15** avec App Router
- **TypeScript** pour le typage strict
- **TailwindCSS** pour le styling moderne
- **Apollo Client** pour GraphQL
- **Shadcn/ui** pour les composants UI
- **Socket.IO Client** pour WebSocket
- **Lucide React** pour les icônes

**Backend (Cloud) :**

- **NestJS** hébergé sur Render.com
- **GraphQL** avec Apollo Server
- **Socket.IO** pour le temps réel
- **PostgreSQL** sur Render.com
- **Redis** sur Upstash.io
- **JWT** pour l'authentification

**Outils de Développement :**

- **ESLint & Prettier** pour la qualité du code
- **Scripts de test** automatisés
- **Validation TypeScript** complète
- **Hot reload** pour le développement

## � Installation et Démarrage Rapide

### Prérequis

- **Node.js** (v18 ou supérieur)
- **npm** ou **pnpm**
- **Connexion Internet** (pour l'API cloud)

### 1. Cloner et Installer

```bash
git clone <votre-repo>
cd whatsapp-clone
npm install
```

### 2. Configuration (Déjà Prête !)

```bash
# ✅ La configuration est déjà optimisée !
# Le fichier .env.local pointe vers l'API de production Render.com
# Aucune configuration supplémentaire requise
```

### 3. Lancer l'Application

```bash
# Démarrer l'application
npm run dev

# OU valider la configuration d'abord
npm run validate:config
```

### 4. Accéder à l'Application

- **🏠 Application principale** : http://localhost:3000
- **🧪 Page de test complète** : http://localhost:3000/test
- **📡 Test WebSocket** : http://localhost:3000/websocket-test.html

## 🧪 Page de Test (`/test`) - Nouvelle !

La page `/test` est votre tableau de bord pour valider toutes les fonctionnalités :

### Tests de Connectivité

```
✅ Health Check      [Bouton Refresh]
✅ WebSocket         wss://messaging-platform-gfnp.onrender.com
✅ Utilisateurs      5 utilisateur(s) trouvé(s)
✅ Conversations     5 conversation(s) trouvée(s)
```

### Tests de Mutations

- **Créer un utilisateur de test** : Génère un utilisateur avec données aléatoires
- **Créer une conversation de test** : Crée une nouvelle conversation
- **Test WebSocket avancé** : Panel de test temps réel

### Monitoring Temps Réel

- Statut de connexion WebSocket live
- Logs de débogage dans la console
- Indicateurs visuels de santé de l'API
- Messages d'erreur détaillés si problème

## 📱 Utilisation

### Démarrage Simple

1. **Lancer** : `npm run dev`
2. **Tester** : Aller sur http://localhost:3000/test
3. **Valider** : Vérifier que tous les indicateurs sont verts ✅
4. **Chatter** : Utiliser l'interface principale pour créer des conversations

### Créer des Données de Test

```bash
# Via l'interface /test
1. Cliquer sur "Créer un utilisateur de test"
2. Cliquer sur "Créer une conversation de test"
3. Tester le chat temps réel

# Via les scripts
npm run test:api        # Test complet de l'API
npm run validate:config # Validation de la configuration
```

## � Scripts Disponibles

```bash
# 🚀 Développement
npm run dev                 # Démarrer l'application
npm run build              # Build de production
npm run start              # Démarrer en mode production

# 🧪 Tests et Validation
npm run test:api           # Test complet de l'API
npm run test:websocket     # Test WebSocket standalone
npm run validate:config    # Validation complète de la config

# 🛠 Développement Avancé
npm run dev:cloud          # Mode cloud production
npm run dev:staging        # Mode cloud développement
npm run lint              # Vérification du code
```

## 🔍 Architecture et Composants

### Hooks Personnalisés

- **`useSocket()`** : WebSocket de base avec reconnexion
- **`useWebSocketAdvanced()`** : WebSocket avancé avec filtrage
- **`useHealthCheck()`** : Monitoring de l'API avec retry
- **`useMessaging()`** : Envoi de messages avec cache Apollo
- **`useApi()`** : Hooks GraphQL complets (users, conversations, messages)

### Composants UI

- **`AdvancedChatExample`** : Chat temps réel complet
- **`ApiTestPanel`** : Tests de connectivité
- **`WebSocketTestPanel`** : Tests WebSocket avancés
- **`WebSocketStatus`** : Indicateur de connexion
- **`ChatWindow`** : Interface de chat principale
- **`ChatSidebar`** : Barre latérale des conversations

### Pages

- **`/`** : Interface principale de chat
- **`/test`** : Page de test et monitoring ⭐ **NOUVEAU**
- **`/auth`** : Authentification
- **`/websocket-test.html`** : Test WebSocket standalone

## 📊 Monitoring et Débogage

### Console du Navigateur

L'application fournit des logs détaillés :

```
✅ WebSocket connecté: CN0WX7F3soQ6EDQDAAAU
✅ Backend status: Available
✅ Environment: Production
📊 usersData changed: {users: Array(5)}
```

### Outils Intégrés

- **Page /test** : Dashboard complet de monitoring
- **DevTools Apollo** : Extension Chrome/Firefox recommandée
- **WebSocket Test** : Page HTML standalone pour tests
- **Scripts de validation** : Vérification automatique de la config

### URLs de Débogage

- **API Health** : https://messaging-platform-gfnp.onrender.com/health
- **GraphQL Playground** : https://messaging-platform-gfnp.onrender.com/graphql
- **Interface Test** : http://localhost:3000/test

## 🐛 Dépannage

### ✅ Configuration Validée

Cette application est **pré-configurée** et **testée** ! Si vous rencontrez des problèmes :

```bash
# 1. Valider la configuration
npm run validate:config

# 2. Tester l'API
npm run test:api

# 3. Vérifier dans l'interface
# Aller sur http://localhost:3000/test
```

### 🚨 Problèmes Courants

**WebSocket ne se connecte pas**

- ✅ **Solution** : L'URL est correcte `wss://messaging-platform-gfnp.onrender.com`
- 🔍 **Vérifier** : Page /test, section WebSocket
- 🔄 **Action** : La reconnexion est automatique, patientez

**Health Check en erreur**

- ✅ **Solution** : API peut prendre 30-60s à se réveiller (service gratuit)
- 🔍 **Vérifier** : Cliquer sur le bouton 🔄 à côté de "Health Check"
- 🔄 **Action** : Rafraîchir la page après quelques minutes

**Pas d'utilisateurs/conversations**

- ✅ **Solution** : 5 utilisateurs et 5 conversations sont pré-chargés
- 🔍 **Vérifier** : Page /test, vérifier les compteurs
- 🔄 **Action** : Utiliser les boutons "Créer un utilisateur/conversation de test"

**Erreurs CORS**

- ✅ **Solution** : CORS configuré pour `localhost:3000`
- 🔍 **Vérifier** : L'application doit tourner sur le port 3000
- 📚 **Documentation** : Voir [`FIX_CORS.md`](./FIX_CORS.md)

### 🛠 Outils de Diagnostic

**Scripts de Test**

```bash
npm run validate:config  # Validation complète
npm run test:api         # Test de l'API
```

**Interface de Test**

- 🧪 **Page /test** : Dashboard complet
- 📡 **WebSocket test** : http://localhost:3000/websocket-test.html
- 🔍 **Console** : Logs détaillés dans F12

## 📚 Documentation Complète

**📋 [`DOCUMENTATION_INDEX.md`](./DOCUMENTATION_INDEX.md)** - Index complet de toute la documentation

| Fichier                              | Description                              |
| ------------------------------------ | ---------------------------------------- |
| 📖 **`QUICKSTART.md`**               | Guide de démarrage rapide                |
| 🏗️ **`ARCHITECTURE_SUMMARY.md`**     | Architecture complète                    |
| 📡 **`WEBSOCKET_INTEGRATION.md`**    | Guide WebSocket complet                  |
| 🔌 **`WEBSOCKET_FRONTEND_GUIDE.md`** | **Implémentation WebSocket Frontend** ⭐ |
| 🔗 **`API_INTEGRATION.md`**          | Documentation API GraphQL                |
| ⚙️ **`MISE_A_JOUR_TERMINEE.md`**     | Changelog des améliorations              |
| 🔧 **`validate-config.js`**          | Script de validation                     |

## 🎯 Statut du Projet

### ✅ Fonctionnel à 100%

- **Backend Cloud** : ✅ Opérationnel sur Render.com
- **WebSocket** : ✅ Temps réel stable
- **Base de données** : ✅ PostgreSQL + 5 users + 5 conversations
- **API GraphQL** : ✅ Toutes les requêtes/mutations
- **Interface** : ✅ Tests interactifs sur /test
- **Documentation** : ✅ Guides complets

### 🚀 Prêt pour le Développement

L'application est maintenant une **base solide** pour développer de nouvelles fonctionnalités :

- Architecture cloud stable
- WebSocket temps réel fonctionnel
- Interface de test complète
- Documentation à jour
- Scripts de validation automatique

**🎉 L'intégration WebSocket est un succès complet !**

## 🤝 Contribution

Les contributions sont les bienvenues ! Cette application est une **base solide** pour développer de nouvelles fonctionnalités.

### Structure pour Contribuer

1. **Fork** le projet
2. **Tester** avec `npm run validate:config`
3. **Développer** votre fonctionnalité
4. **Tester** sur la page `/test`
5. **Commit** et **Push**
6. **Pull Request** avec description détaillée

### Fonctionnalités Suggérées

- 📱 **App mobile** avec React Native
- 🔔 **Notifications push** web
- 📷 **Upload d'images** et fichiers
- 🔍 **Recherche** dans les messages
- 🌍 **Internationalisation** (i18n)
- 🎨 **Thèmes** personnalisés
- 🔐 **Chiffrement** end-to-end

## 📄 Licence

Ce projet est sous licence MIT.

---

## 🎉 Merci !

**WhatsApp Clone** est maintenant une application de messagerie temps réel complète avec :

- ✅ Infrastructure cloud professionnelle
- ✅ WebSocket stable et performant
- ✅ Interface moderne et responsive
- ✅ Tests automatisés et monitoring
- ✅ Documentation complète

**Prêt pour le développement et la production ! 🚀**
