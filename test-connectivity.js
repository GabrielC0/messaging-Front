// Script de test de connectivité pour Windows
const https = require("https");

const BACKEND_URL = "https://messaging-platform-gfnp.onrender.com/graphql";

console.log("🔄 Test de connectivité avec le backend cloud...");
console.log(`URL: ${BACKEND_URL}`);

const testQuery = JSON.stringify({
  query: "{ __typename }",
});

const options = {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "Content-Length": Buffer.byteLength(testQuery),
  },
};

const req = https.request(BACKEND_URL, options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);

  let data = "";
  res.on("data", (chunk) => {
    data += chunk;
  });

  res.on("end", () => {
    if (res.statusCode === 200) {
      console.log("✅ Backend accessible !");
      console.log("Response:", data);
    } else {
      console.log("❌ Backend retourne une erreur");
      console.log("Response:", data);
    }
  });
});

req.on("error", (error) => {
  console.log("❌ Erreur de connexion:");
  console.log(error.message);
});

req.setTimeout(10000, () => {
  console.log("❌ Timeout - Le backend ne répond pas");
  req.destroy();
});

req.write(testQuery);
req.end();
