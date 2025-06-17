// Test de connectivité avec l'API GraphQL en production
// Utilisation: node test-api-connectivity.js

const API_URL = "https://messaging-platform-gfnp.onrender.com/graphql";
const WEBSOCKET_URL = "https://messaging-platform-gfnp.onrender.com";

console.log("🔍 Test de connectivité API en production...");
console.log("API GraphQL:", API_URL);
console.log("WebSocket:", WEBSOCKET_URL);
console.log(
  "⚠️  Note: L'API peut prendre quelques secondes à se réveiller sur Render.com"
);
console.log("");

// Test 1: Health check GraphQL
async function testHealthCheck() {
  console.log("1️⃣ Test Health Check GraphQL...");

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
          query HealthCheck {
            healthCheck {
              result
            }
          }
        `,
      }),
    });

    const result = await response.json();

    if (response.ok && result.data?.healthCheck?.result) {
      console.log("✅ Health Check: OK");
      console.log("   Résultat:", result.data.healthCheck.result);
    } else {
      console.log("❌ Health Check: Échec");
      console.log("   Erreur:", result.errors || "Réponse inattendue");
    }
  } catch (error) {
    console.log("❌ Health Check: Erreur de connexion");
    console.log("   Détails:", error.message);
  }

  console.log("");
}

// Test 2: Récupération des utilisateurs
async function testGetUsers() {
  console.log("2️⃣ Test récupération utilisateurs...");

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
          query GetUsers {
            users {
              id
              username
              email
              createdAt
            }
          }
        `,
      }),
    });

    const result = await response.json();

    if (response.ok && result.data?.users) {
      console.log("✅ Utilisateurs récupérés:", result.data.users.length);
      if (result.data.users.length > 0) {
        console.log("   Premier utilisateur:", result.data.users[0].username);
      }
    } else {
      console.log("❌ Récupération utilisateurs: Échec");
      console.log("   Erreur:", result.errors || "Réponse inattendue");
    }
  } catch (error) {
    console.log("❌ Récupération utilisateurs: Erreur de connexion");
    console.log("   Détails:", error.message);
  }

  console.log("");
}

// Test 3: Récupération des conversations
async function testGetConversations() {
  console.log("3️⃣ Test récupération conversations...");

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
          query GetConversations {
            conversations {
              id
              title
              lastActivity
              participants {
                id
                username
              }
            }
          }
        `,
      }),
    });

    const result = await response.json();

    if (response.ok && result.data?.conversations) {
      console.log(
        "✅ Conversations récupérées:",
        result.data.conversations.length
      );
      if (result.data.conversations.length > 0) {
        console.log(
          "   Première conversation:",
          result.data.conversations[0].title || "Sans titre"
        );
      }
    } else {
      console.log("❌ Récupération conversations: Échec");
      console.log("   Erreur:", result.errors || "Réponse inattendue");
    }
  } catch (error) {
    console.log("❌ Récupération conversations: Erreur de connexion");
    console.log("   Détails:", error.message);
  }

  console.log("");
}

// Test 4: Test REST endpoint
async function testRestEndpoint() {
  console.log("4️⃣ Test endpoint REST...");

  try {
    const response = await fetch(
      "https://messaging-platform-gfnp.onrender.com/health"
    );

    if (response.ok) {
      const result = await response.json();
      console.log("✅ Endpoint REST: OK");
      console.log("   Réponse:", result);
    } else {
      console.log("❌ Endpoint REST: Échec");
      console.log("   Status:", response.status);
    }
  } catch (error) {
    console.log("❌ Endpoint REST: Erreur de connexion");
    console.log("   Détails:", error.message);
  }

  console.log("");
}

// Test 5: Création d'un utilisateur de test
async function testCreateUser() {
  console.log("5️⃣ Test création utilisateur...");

  const testUser = {
    username: `testuser_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    avatarUrl: "https://via.placeholder.com/150",
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
          mutation CreateUser($createUserInput: CreateUserInput!) {
            createUser(createUserInput: $createUserInput) {
              id
              username
              email
              createdAt
            }
          }
        `,
        variables: {
          createUserInput: testUser,
        },
      }),
    });

    const result = await response.json();

    if (response.ok && result.data?.createUser) {
      console.log("✅ Utilisateur créé:", result.data.createUser.username);
      console.log("   ID:", result.data.createUser.id);
      return result.data.createUser;
    } else {
      console.log("❌ Création utilisateur: Échec");
      console.log("   Erreur:", result.errors || "Réponse inattendue");
    }
  } catch (error) {
    console.log("❌ Création utilisateur: Erreur de connexion");
    console.log("   Détails:", error.message);
  }

  console.log("");
  return null;
}

// Fonction principale
async function runTests() {
  console.log("🚀 Démarrage des tests de connectivité API");
  console.log("========================================");
  console.log("");

  await testHealthCheck();
  await testGetUsers();
  await testGetConversations();
  await testRestEndpoint();
  await testCreateUser();
  console.log("📋 Résumé:");
  console.log(
    "- L'API est hébergée sur Render.com et peut prendre du temps à se réveiller"
  );
  console.log("- La base de données PostgreSQL est en ligne");
  console.log(
    "- Si les tests échouent au premier essai, réessayez dans quelques minutes"
  );
  console.log("- Vérifiez votre connexion internet");
  console.log("");
  console.log("✅ Tests terminés");
}

// Exécution
runTests().catch(console.error);
