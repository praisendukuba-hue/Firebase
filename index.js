const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();

exports.checkBan = onRequest(
  {
    region: "us-central1",
  },
  async (req, res) => {
    // Allow GET requests from the Telegram bot
    if (req.method !== "GET") {
      return res.status(405).json({
        error: "Method not allowed",
      });
    }

    const userId = req.query.user_id;

    if (!userId) {
      return res.status(400).json({
        error: "Missing user_id",
      });
    }

    try {
      const telegramUserId = String(userId);

      const userRef = db
        .collection("dog_users")
        .doc(telegramUserId);

      const userSnap = await userRef.get();

      // User does not exist = not banned
      if (!userSnap.exists) {
        return res.status(200).json({
          banned: false,
        });
      }

      const userData = userSnap.data() || {};

      // Accept true or "true"
      const banned =
        userData.banned === true ||
        String(userData.banned).toLowerCase() === "true";

      return res.status(200).json({
        banned: banned,
      });

    } catch (error) {
      console.error("Ban check error:", error);

      // Fail closed.
      // If Firebase cannot verify the user,
      // the bot should NOT grant access.
      return res.status(500).json({
        error: "Ban check failed",
      });
    }
  }
);
