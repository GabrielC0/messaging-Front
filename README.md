# WhatsApp Clone 🚀

Une application de messagerie instantanée moderne construite avec Next.js, GraphQL et TypeScript, maintenant avec une infrastructure cloud complète !

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
- Hébergé sur **Render.com**
- Support WebSocket pour le temps réel

## 🚀 Fonctionnalités

### Implémentées

- ✅ Authentification des utilisateurs (connexion/inscription)
- ✅ Gestion des conversations
- ✅ Messagerie en temps réel
- ✅ Interface responsive (mobile et desktop)
- ✅ Recherche de conversations
- ✅ Gestion des contacts
- ✅ Affichage des dates de création et mise à jour des conversations
- ✅ Profil utilisateur avec avatar
- ✅ **Surveillance de connectivité cloud**
- ✅ **Gestion d'erreurs robuste**
- ✅ **Configuration multi-environnement**
- ✅ **Fix CORS appliqué** - Erreurs de headers résolues

### À venir

- 📝 Statut de lecture des messages
- 📝 Statut en ligne des utilisateurs
- 📝 Notifications

## 🛠 Technologies utilisées

- **Frontend:**

  - Next.js 15
  - TypeScript
  - TailwindCSS
  - Apollo Client
  - Shadcn/ui

- **Backend (Cloud):**
  - NestJS hébergé sur Render.com
  - GraphQL
  - PostgreSQL sur Render.com
  - Redis sur Upstash.io

## 📦 Prérequis

- Node.js (v18 ou supérieur)
- PNPM
- Git

**Note:** Plus besoin de Docker ni de base de données locale ! Tout est maintenant dans le cloud.

## 🚀 Installation

1. **Cloner le projet**

```bash
git clone <votre-repo>
cd whatsapp-clone
```

2. **Installer les dépendances**

```bash
pnpm install
```

3. **Configuration de l'environnement**

⚠️ **Important :** Vous devez d'abord obtenir l'URL de votre backend déployé sur Render.com

```bash
# Pour la production (backend cloud)
cp .env.production .env.local
# Puis éditez .env.local pour mettre la vraie URL du backend

# Pour le développement (backend cloud aussi)
cp .env.development .env.local
# Puis éditez .env.local pour mettre la vraie URL du backend
```

4. **Lancer l'application**

```bash
# Mode production (backend cloud)
pnpm run dev:cloud

# Mode développement (backend cloud)
pnpm run dev:staging

# Ou simplement
pnpm dev
```

L'application sera accessible sur `http://localhost:3000`

**🌐 Note :** Tout fonctionne maintenant avec l'infrastructure cloud ! Plus besoin de Docker ou base de données locale.

```bash
pnpm dev
```

## 📱 Utilisation

1. **Configurer l'URL du backend** dans `.env.local`
2. **Lancer l'application** : `pnpm dev`
3. **Accéder** à `http://localhost:3000`
4. **Créer un compte** ou se connecter
5. **Commencer à discuter !**

## 🔍 Points Importants

- ✅ **Infrastructure entièrement cloud** (PostgreSQL + Redis + Backend)
- ✅ **Pas de setup local requis** - tout fonctionne avec les services en ligne
- ✅ **Surveillance automatique** de la connectivité cloud
- ✅ **Configuration flexible** entre environnements de dev/prod
- ⚠️ **Connexion internet requise** pour accéder aux services cloud

## 🐛 Résolution des Problèmes Courants

### 🚨 Backend non accessible

- **Vérifiez** que l'URL dans `.env.local` est correcte
- **Testez** l'URL directement dans le navigateur
- **Consultez** le dashboard Render.com pour voir si le service est en ligne
- **Regardez** les logs sur Render.com

### 🚨 Erreurs de connectivité

- **Vérifiez** votre connexion internet
- **Consultez** le panneau "Infos Système" dans l'application
- **Utilisez** le bouton "Reconnecter" si affiché
- **Augmentez** le timeout dans la configuration si nécessaire

### 🚨 Erreurs CORS

- **✅ RÉSOLU** : Erreurs de headers `Cache-Control` et `X-Requested-With` non autorisés
- **Test de connectivité** : `npm run test:connectivity`
- **Documentation complète** : Voir [`FIX_CORS.md`](./FIX_CORS.md)
- **Vérifiez** que votre backend autorise les requêtes depuis `localhost:3000`

## � Tests et Validation

### Test de connectivité cloud

```bash
npm run test:connectivity
```

Vérifie que le backend cloud est accessible et répond correctement.

### Scripts de développement

```bash
# Lancer en mode cloud production
npm run dev:cloud

# Lancer en mode cloud développement
npm run dev:staging

# Lancer normalement
npm run dev
```

## 📚 Documentation Avancée

- [`QUICKSTART.md`](./QUICKSTART.md) - Guide de démarrage rapide
- [`ARCHITECTURE_CLOUD.md`](./ARCHITECTURE_CLOUD.md) - Architecture cloud détaillée
- [`EXPLICATION_ENV.md`](./EXPLICATION_ENV.md) - Gestion des variables d'environnement
- [`FIX_CORS.md`](./FIX_CORS.md) - Résolution des erreurs CORS
- [`FIX_PACKAGE_JSON.md`](./FIX_PACKAGE_JSON.md) - Nettoyage du package.json

## �🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Forkez le projet
2. Créez votre branche de fonctionnalité
3. Committez vos changements
4. Poussez vers la branche
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT."
