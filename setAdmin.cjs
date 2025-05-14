const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const uid = "tJ2gU3nfidMrWP3R4pspEpwd6Qm1";

admin.auth().setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log("✅ Admin claim set!");
    process.exit();
  })
  .catch((err) => {
    console.error("❌ Failed to set claim:", err);
    process.exit(1);
  });
