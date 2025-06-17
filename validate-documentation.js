#!/usr/bin/env node

/**
 * Script de validation de la documentation
 * Vérifie la cohérence de tous les guides et la configuration
 */

const fs = require("fs");
const path = require("path");

console.log("📚 Validation de la Documentation - WhatsApp Clone");
console.log("=".repeat(55));

// Fichiers de documentation à vérifier
const docFiles = [
  "README.md",
  "QUICKSTART.md",
  "WEBSOCKET_INTEGRATION.md",
  "WEBSOCKET_FRONTEND_GUIDE.md",
  "API_INTEGRATION.md",
  "ARCHITECTURE_SUMMARY.md",
  "MISE_A_JOUR_TERMINEE.md",
  "DOCUMENTATION_INDEX.md",
];

// URLs qui doivent être présentes (production uniquement)
const expectedUrls = [
  "wss://messaging-platform-gfnp.onrender.com",
  "https://messaging-platform-gfnp.onrender.com/graphql",
  "https://messaging-platform-gfnp.onrender.com/health",
  "https://messaging-platform-gfnp.onrender.com",
];

// URLs qui ne doivent PAS être présentes (localhost backend)
// Exceptions: localhost:3000 (frontend), ou lignes avec ❌ (marquées comme supprimées)
const forbiddenUrls = ["http://localhost:3002", "ws://localhost:3002"];

const checkForbiddenUrls = (content, filename) => {
  const lines = content.split("\n");
  let violations = 0;

  lines.forEach((line, index) => {
    // Ignorer les lignes qui montrent ce qui a été supprimé (avec ❌)
    if (line.includes("❌")) return;

    forbiddenUrls.forEach((url) => {
      if (line.includes(url)) {
        console.log(`     ❌ Ligne ${index + 1}: ${line.trim()}`);
        violations++;
      }
    });
  });

  return violations;
};

console.log("\n1️⃣ Vérification de la présence des fichiers...");

let allFilesExist = true;
docFiles.forEach((file) => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - MANQUANT`);
    allFilesExist = false;
  }
});

console.log("\n2️⃣ Vérification des URLs de production...");

let urlValidation = { found: 0, missing: 0 };
docFiles.forEach((file) => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, "utf8");

    let hasExpectedUrls = 0;
    expectedUrls.forEach((url) => {
      if (content.includes(url)) {
        hasExpectedUrls++;
      }
    });

    if (hasExpectedUrls > 0) {
      console.log(
        `   ✅ ${file}: ${hasExpectedUrls} URL(s) production trouvées`
      );
      urlValidation.found++;
    } else {
      console.log(`   ⚠️  ${file}: Aucune URL production trouvée`);
      urlValidation.missing++;
    }
  }
});

console.log("\n3️⃣ Vérification des URLs interdites (localhost backend)...");

let forbiddenCount = 0;
docFiles.forEach((file) => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, "utf8");

    const violations = checkForbiddenUrls(content, file);

    if (violations > 0) {
      console.log(`   ❌ ${file}: ${violations} violation(s) trouvée(s)`);
      forbiddenCount++;
    } else {
      console.log(`   ✅ ${file}: Aucune URL localhost backend inappropriée`);
    }
  }
});

console.log("\n4️⃣ Vérification des références croisées...");

// Vérifier que les fichiers se référencent correctement
const references = {
  "README.md": [
    "QUICKSTART.md",
    "WEBSOCKET_FRONTEND_GUIDE.md",
    "DOCUMENTATION_INDEX.md",
  ],
  "WEBSOCKET_INTEGRATION.md": ["WEBSOCKET_FRONTEND_GUIDE.md"],
  "DOCUMENTATION_INDEX.md": [
    "README.md",
    "QUICKSTART.md",
    "API_INTEGRATION.md",
  ],
};

let referencesValid = true;
Object.entries(references).forEach(([file, refs]) => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, "utf8");

    refs.forEach((ref) => {
      if (content.includes(ref)) {
        console.log(`   ✅ ${file} → ${ref}`);
      } else {
        console.log(`   ❌ ${file} → ${ref} : RÉFÉRENCE MANQUANTE`);
        referencesValid = false;
      }
    });
  }
});

console.log("\n5️⃣ Vérification des pages et composants...");

// Vérifier que les pages mentionnées existent
const pages = [
  "app/test/page.tsx",
  "public/websocket-test.html",
  "components/advanced-chat-example.tsx",
  "hooks/use-websocket-advanced.ts",
];

let pagesExist = true;
pages.forEach((page) => {
  const pagePath = path.join(__dirname, page);
  if (fs.existsSync(pagePath)) {
    console.log(`   ✅ ${page}`);
  } else {
    console.log(`   ❌ ${page} - MANQUANT`);
    pagesExist = false;
  }
});

console.log("\n6️⃣ Résumé de la validation...");

const summary = {
  files: allFilesExist,
  urls: forbiddenCount === 0 && urlValidation.found > 0,
  references: referencesValid,
  pages: pagesExist,
};

console.log(`
📋 Résultats:
   • Fichiers documentation: ${summary.files ? "✅" : "❌"}
   • URLs production: ${summary.urls ? "✅" : "❌"}
   • Références croisées: ${summary.references ? "✅" : "❌"}
   • Pages/Composants: ${summary.pages ? "✅" : "❌"}

🎯 Cohérence de la documentation:
   • ${docFiles.length} guides disponibles
   • ${urlValidation.found} fichiers avec URLs production
   • ${
     forbiddenCount === 0 ? "Aucune" : forbiddenCount
   } référence localhost backend
   
🚀 Architecture validée:
   • Backend: messaging-platform-gfnp.onrender.com
   • WebSocket: wss://messaging-platform-gfnp.onrender.com
   • Frontend: localhost:3000 (page /test)
`);

const allValid = Object.values(summary).every(Boolean);

if (allValid) {
  console.log("🎉 Documentation entièrement validée et cohérente !");
  process.exit(0);
} else {
  console.log("⚠️  Quelques corrections nécessaires dans la documentation.");
  process.exit(1);
}
