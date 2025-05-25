// functions/index.js
import { onRequest } from "firebase-functions/v2/https";
import admin from "firebase-admin";
import corsLib from "cors";

admin.initializeApp();

const cors = corsLib({ origin: true }); // or specify "http://localhost:5173" for stricter control

export const getUserCount = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const listUsers = await admin.auth().listUsers();
      const users = listUsers.users;

      const count = users.filter(
        (user) => !(user.customClaims && user.customClaims.admin)
      ).length;

      res.status(200).json({ userCount: count });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "error" });
    }
  });
});
