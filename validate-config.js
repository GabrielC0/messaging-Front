#!/usr/bin/env node

/**
 * Script de validation de la configuration Production
 * Vérifie que tous les services sont accessibles avec les bonnes URLs
 */

const fs = require("fs");
const path = require("path");

const RENDER_API_URL = "https://messaging-platform-gfnp.onrender.com";
const RENDER_WEBSOCKET_URL = "wss://messaging-platform-gfnp.onrender.com";
const RENDER_GRAPHQL_URL =
  "https://messaging-platform-gfnp.onrender.com/graphql";

console.log("🔍 Validation de la Configuration Production - WhatsApp Clone");
console.log("=".repeat(70));

// 1. Vérifier les variables d'environnement
console.log("\n1️⃣ Vérification du fichier .env.local...");

const envPath = path.join(__dirname, ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");

  const checks = [
    { key: "NEXT_PUBLIC_WEBSOCKET_URL", expected: RENDER_WEBSOCKET_URL },
    { key: "NEXT_PUBLIC_GRAPHQL_URL", expected: RENDER_GRAPHQL_URL },
    { key: "NEXT_PUBLIC_API_URL", expected: RENDER_API_URL },
  ];

  let allValid = true;

  checks.forEach(({ key, expected }) => {
    const regex = new RegExp(`${key}=(.+)`);
    const match = envContent.match(regex);

    if (match) {
      const value = match[1].trim();
      if (value === expected) {
        console.log(`   ✅ ${key}: ${value}`);
      } else {
        console.log(`   ❌ ${key}: ${value} (attendu: ${expected})`);
        allValid = false;
      }
    } else {
      console.log(`   ❌ ${key}: manquant`);
      allValid = false;
    }
  });

  if (allValid) {
    console.log("   🎉 Toutes les variables d'environnement sont correctes !");
  } else {
    console.log(
      "   🚨 Certaines variables d'environnement nécessitent une correction."
    );
  }
} else {
  console.log("   ❌ Fichier .env.local non trouvé");
}

// 2. Vérifier les hooks
console.log("\n2️⃣ Vérification des hooks...");

const hooksToCheck = [
  "hooks/use-socket.ts",
  "hooks/use-api.ts",
  "hooks/use-websocket-advanced.ts",
];

hooksToCheck.forEach((hookPath) => {
  const fullPath = path.join(__dirname, hookPath);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, "utf8");

    // Chercher les URLs localhost
    const hasLocalhost =
      content.includes("localhost") || content.includes("127.0.0.1");
    const hasRenderUrl = content.includes(
      "messaging-platform-gfnp.onrender.com"
    );

    if (hasRenderUrl && !hasLocalhost) {
      console.log(`   ✅ ${hookPath}: Configuration Production OK`);
    } else if (hasLocalhost) {
      console.log(
        `   ⚠️  ${hookPath}: Contient encore des références localhost`
      );
    } else {
      console.log(`   ❓ ${hookPath}: URLs non détectées`);
    }
  } else {
    console.log(`   ❌ ${hookPath}: Fichier non trouvé`);
  }
});

// 3. Vérifier Apollo Client
console.log("\n3️⃣ Vérification d'Apollo Client...");

const apolloPath = path.join(__dirname, "lib/apollo-client.ts");
if (fs.existsSync(apolloPath)) {
  const content = fs.readFileSync(apolloPath, "utf8");

  if (content.includes("messaging-platform-gfnp.onrender.com")) {
    console.log("   ✅ Apollo Client: Configuration Production OK");
  } else if (content.includes("localhost")) {
    console.log(
      "   ⚠️  Apollo Client: Contient encore des références localhost"
    );
  } else {
    console.log("   ❓ Apollo Client: Configuration à vérifier manuellement");
  }
} else {
  console.log("   ❌ lib/apollo-client.ts: Fichier non trouvé");
}

// 4. Vérifier les scripts de test
console.log("\n4️⃣ Vérification des scripts de test...");

const testFiles = ["test-api-connectivity.js", "public/websocket-test.html"];

testFiles.forEach((testFile) => {
  const fullPath = path.join(__dirname, testFile);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, "utf8");

    if (content.includes("messaging-platform-gfnp.onrender.com")) {
      console.log(`   ✅ ${testFile}: Configuration Production OK`);
    } else {
      console.log(`   ⚠️  ${testFile}: URLs de production manquantes`);
    }
  } else {
    console.log(`   ❌ ${testFile}: Fichier non trouvé`);
  }
});

// 5. Test de connectivité API
console.log("\n5️⃣ Test de connectivité API...");

async function testConnectivity() {
  try {
    console.log("   🔌 Test du Health Check...");

    const healthResponse = await fetch(`${RENDER_API_URL}/health`);
    if (healthResponse.ok) {
      console.log("   ✅ Health Check: API accessible");
    } else {
      console.log(`   ❌ Health Check: Erreur ${healthResponse.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Health Check: ${error.message}`);
    console.log(
      "   ⏱️  L'API peut prendre du temps à se réveiller (service gratuit Render)"
    );
  }

  try {
    console.log("   🔌 Test GraphQL...");

    const graphqlResponse = await fetch(RENDER_GRAPHQL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: "{ healthCheck { result } }",
      }),
    });

    if (graphqlResponse.ok) {
      const data = await graphqlResponse.json();
      console.log("   ✅ GraphQL: API accessible");
      console.log(`   📊 Résultat: ${JSON.stringify(data, null, 2)}`);
    } else {
      console.log(`   ❌ GraphQL: Erreur ${graphqlResponse.status}`);
    }
  } catch (error) {
    console.log(`   ❌ GraphQL: ${error.message}`);
  }
}

// 6. Résumé final
console.log("\n6️⃣ Résumé de la Configuration...");

console.log(`
📋 Configuration validée:
   • API URL: ${RENDER_API_URL}
   • GraphQL: ${RENDER_GRAPHQL_URL}
   • WebSocket: ${RENDER_WEBSOCKET_URL}

🚀 Pour tester l'application:
   • npm run dev (démarre le frontend)
   • npm run test:api (teste l'API)
   • Ouvrir http://localhost:3000/test

📚 Documentation:
   • WEBSOCKET_INTEGRATION.md - Guide WebSocket complet
   • QUICKSTART.md - Démarrage rapide
   • ARCHITECTURE_SUMMARY.md - Résumé de l'architecture
`);

// Exécuter le test de connectivité
testConnectivity()
  .then(() => {
    console.log("\n✨ Validation terminée !");
  })
  .catch(console.error);
