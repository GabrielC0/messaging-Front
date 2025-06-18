# 🔔 Guide Rapide: Activer les Notifications

## ❌ Problème: "Permission: 'default'"

Cela signifie que les notifications ne sont pas encore autorisées par l'utilisateur.

## ✅ Solution (3 étapes simples):

### 1. Aller à la section "Système de Notifications"

Dans la page `/test`, scrollez jusqu'à la section avec l'icône 🔔

### 2. Cliquer sur "👆 Activer"

Le bouton orange qui clignote

### 3. Autoriser dans la popup du navigateur

- Une popup du navigateur apparaît
- Cliquer sur "Autoriser" ou "Allow"
- NE PAS cliquer sur "Bloquer" ou "Block"

## 🎯 Résultat attendu:

```
permission: 'granted' ✅
```

## 🔧 Si ça ne marche pas:

### Popup bloquée?

- Regarder l'icône 🚫 dans la barre d'adresse
- Cliquer dessus et autoriser les popups

### Déjà bloqué par erreur?

- Cliquer sur l'icône 🔒 dans la barre d'adresse
- Chercher "Notifications"
- Changer de "Bloquer" à "Autoriser"
- Recharger la page

### Navigation privée?

- Les notifications peuvent être bloquées en mode incognito
- Essayer en navigation normale

## 🧪 Test rapide:

```javascript
// Dans la console:
console.log("Permission:", Notification.permission);
// Doit afficher: 'granted'
```

---

💡 **Astuce**: Une fois autorisées, les notifications fonctionnent pour toujours sur ce site !
