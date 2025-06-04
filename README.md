"# WhatsApp Clone

Une application de messagerie instantanée moderne construite avec Next.js, GraphQL et TypeScript.

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

### À venir

- 📝 Statut de lecture des messages
- 📝 Statut en ligne des utilisateurs
- 📝 Notifications

## 🛠 Technologies utilisées

- **Frontend:**

  - Next.js 14
  - TypeScript
  - TailwindCSS
  - Apollo Client
  - Shadcn/ui

- **Backend:**
  - NestJS
  - GraphQL
  - PostgreSQL
  - Docker

## 📦 Prérequis

- Node.js (v18 ou supérieur)
- PNPM
- Docker & Docker Compose
- Git

## 🚀 Installation

1. Clonez le dépôt :

```bash
git clone <votre-repo>
cd whatsapp-clone
```

2. Installez les dépendances :

```bash
pnpm install
```

3. Copiez le fichier d'environnement :

```bash
cp .env.example .env
```

4. Démarrez le backend (important !) :

```bash
# Dans un terminal séparé
docker-compose up -d   # Lance PostgreSQL
cd ../whatsapp-clone-backend
pnpm install
pnpm start:dev        # Lance le serveur NestJS sur le port 3002
```

5. Démarrez l'application :

```bash
pnpm dev
```

## 📱 Utilisation

1. Accédez à `http://localhost:3000`
2. Créez un compte ou connectez-vous
3. Commencez à discuter !

## 🔍 Points importants

- Le backend doit être lancé sur le port 3002
- PostgreSQL doit être accessible via Docker
- La première utilisation nécessite une connexion internet pour charger les dépendances
- L'application peut fonctionner en mode hors-ligne avec des fonctionnalités limitées

## 🐛 Résolution des problèmes courants

1. Si le backend n'est pas accessible :

   - Vérifiez que le serveur NestJS est lancé sur le port 3002
   - Vérifiez que Docker est en cours d'exécution
   - Vérifiez les logs du backend

2. Si la base de données n'est pas accessible :
   - Vérifiez que Docker est en cours d'exécution
   - Vérifiez les variables d'environnement

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Forkez le projet
2. Créez votre branche de fonctionnalité
3. Committez vos changements
4. Poussez vers la branche
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT."
