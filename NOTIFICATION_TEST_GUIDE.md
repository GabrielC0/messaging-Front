# 🔔 Guide de Test des Notifications WebSocket

## ✅ Étapes de Test

### 1. Démarrer l'application

```bash
npm run dev
```

### 2. Aller sur la page de test

Naviguez vers : `http://localhost:3000/test`

### 3. Tests de notifications (ordre recommandé)

#### A. Test des permissions

1. Dans la section "Système de Notifications"
2. Cliquer sur "Activer" si les permissions ne sont pas accordées
3. Vérifier que le statut passe à "✅ Autorisées"

#### B. Test Direct (Navigateur)

1. Cliquer sur "Test Direct (Navigateur)"
2. **ATTENDU** : Notification immédiate "🧪 Test WebSocket"
3. Vérifier les logs dans la console

#### C. Test Service

1. Cliquer sur "Test Service"
2. **ATTENDU** : Notification "Ceci est une notification de test ! 🧪"
3. Vérifier les logs dans la console

#### D. Test Message

1. Cliquer sur "Test Message"
2. **ATTENDU** : Notification avec "Test User: Ceci est un message de test..."

#### E. Simuler WebSocket

1. Cliquer sur "Simuler WebSocket"
2. **ATTENDU** :
   - Message apparaît dans "Messages Reçus"
   - Notification s'affiche
   - Logs dans la console

### 4. Test WebSocket Réel

#### A. Connexion WebSocket

1. Vérifier que le statut montre "🟢 Connecté"
2. Si déconnecté, cliquer "Reconnecter"

#### B. Test d'émission

1. Entrer un ID de conversation (ex: "test-123")
2. Taper un message dans "Test d'émission"
3. Cliquer "Envoyer"
4. **ATTENDU** : Message envoyé visible dans les logs

#### C. Test de réception

1. Ouvrir un autre onglet sur `/test`
2. Dans le premier onglet, envoyer un message
3. **ATTENDU** : Le second onglet reçoit une notification

## 🔧 Dépannage

### Notifications ne s'affichent pas

1. **Vérifier la console** : logs détaillés disponibles
2. **Permissions** : Doivent être "granted"
3. **Paramètres** : "Notifications activées" doit être ON
4. **Navigateur** : Chrome, Firefox, Edge récents

### Logs utiles

```javascript
// Dans la console du navigateur
console.log("Permission:", Notification.permission);
console.log("Support:", "Notification" in window);

// Tester manuellement
if (Notification.permission === "granted") {
  new Notification("Test manuel", { body: "Ça marche !" });
}
```

### Notifications bloquées

1. Vérifier les paramètres du navigateur (icône 🔒 dans l'URL)
2. Réinitialiser les permissions du site
3. Essayer en navigation privée

## 📱 Comportements Attendus

### ✅ Tests qui doivent fonctionner

- Test Direct → Notification immédiate
- Test Service → Notification via service
- Test Message → Notification structurée
- Simuler WebSocket → Notification + ajout message

### ⚠️ Conditions requises

- Permission = "granted"
- Support navigateur = true
- Notifications activées = true
- Pas en heures silencieuses

### 🎯 Résultat final

Quand tout fonctionne :

1. Tests manuels → notifications visibles
2. WebSocket réel → notifications automatiques
3. Messages dans l'interface → notifications correspondantes
4. Logs détaillés dans la console

## 🐛 Problèmes Courants

1. **"Conditions non remplies"** → Vérifier permissions et paramètres
2. **"Notification bloquée"** → Réinitialiser permissions site
3. **Pas de support** → Navigateur trop ancien
4. **WebSocket déconnecté** → Vérifier URL backend

---

✨ **Succès** : Quand vous voyez des notifications pour tous les tests, le système fonctionne parfaitement !
