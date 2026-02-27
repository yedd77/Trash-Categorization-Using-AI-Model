//ESModule syntax for Firebase Functions
import { onRequest } from "firebase-functions/v2/https";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import * as logger from "firebase-functions/logger";
import admin from "firebase-admin";
import corsLib from "cors";

admin.initializeApp();
const cors = corsLib({ origin: true });

// REST endpoint to get user count
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
      logger.error("Error fetching users:", error);
      res.status(500).json({ error: "error" });
    }
  });
});

// Callable function to verify scan
export const verifyScan = onCall(async (request) => {
  const { tagUID, binID } = request.data;
  const uid = request.auth?.uid;

  if (!uid) {
    throw new HttpsError("unauthenticated", "User must be logged in.");
  }

  if (!tagUID || !binID) {
    throw new HttpsError("invalid-argument", "Missing tagUID or binID.");
  }

  const stationQuery = await admin.firestore()
    .collection("Station")
    .where("tagUID", "==", tagUID)
    .where("binID", "==", binID)
    .limit(1)
    .get();

  if (stationQuery.empty) {
    throw new HttpsError("not-found", "Invalid tag or bin.");
  }

  const userRef = admin.firestore().collection("users").doc(uid);

  const update = {
    points: admin.firestore.FieldValue.increment(10),
    [`lastScans.${tagUID}`]: Date.now(),
  };

  await userRef.set(update, { merge: true });

  return {
    success: true,
    message: "Scan verified. 10 points awarded.",
  };
});

export const checkAndMarkExpiredPoints = onSchedule("every 60 minutes", async () => {
  const db = admin.firestore();
  const now = admin.firestore.Timestamp.now();

  try {
    const snapshot = await db
      .collection("Points")
      .where("expiresAt", "<=", now)
      .where("isClaimed", "==", false)
      .where("isExpired", "==", false)
      .get();

    if (snapshot.empty) {
      logger.info("No expired points to update.");
      return;
    }

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, {
        isExpired: true,
        expiredAt: now,
      });
    });

    await batch.commit();
    logger.info(`Marked ${snapshot.size} points as expired.`);
  } catch (err) {
    logger.error("Error updating expired points:", err);
  }
});