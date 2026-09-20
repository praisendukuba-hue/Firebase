const express = require("express");
const admin = require("firebase-admin");

const app = express();

app.use(express.json());

// ==========================================
// FIREBASE INITIALIZATION
// ==========================================

admin.initializeApp();

const db = admin.firestore();

// ==========================================
// HEALTH CHECK
// ==========================================

app.get("/", (req, res) => {
  res.json({
    ok: true,
    service: "DOGS Rewards Firebase API"
  });
});

// ==========================================
// CHECK USER BAN STATUS
// ==========================================

app.get("/checkBan", async (req, res) => {

  try {

    const userId = req.query.user_id;

    if (!userId) {
      return res.status(400).json({
        ok: false,
        error: "Missing user_id"
      });
    }

    const userRef = db
      .collection("dog_users")
      .doc(String(userId));

    const userSnap = await userRef.get();

    // User does not exist
    if (!userSnap.exists) {

      return res.status(200).json({
        ok: true,
        banned: false
      });

    }

    const userData = userSnap.data();

    const banned =
      userData.banned === true ||
      String(userData.banned).toLowerCase() === "true";

    return res.status(200).json({
      ok: true,
      banned: banned
    });

  } catch (error) {

    console.error("Firebase ban check error:", error);

    // FAIL CLOSED
    return res.status(500).json({
      ok: false,
      error: "Ban check failed"
    });

  }

});

// ==========================================
// RENDER SERVER
// ==========================================

const PORT = process.env.PORT || 10000;

app.listen(PORT, "0.0.0.0", () => {

  console.log(
    `DOGS Rewards API running on port ${PORT}`
  );

});
