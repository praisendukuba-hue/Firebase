const express = require("express");
const admin = require("firebase-admin");

const app = express();

app.use(express.json());


// ==========================================
// FIREBASE ADMIN
// ==========================================

try {

  if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT environment variable is missing"
    );
  }

  const serviceAccount =
    JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  console.log(
    "Firebase Admin initialized successfully"
  );

} catch (error) {

  console.error(
    "Firebase initialization error:",
    error.message
  );

}


// ==========================================
// FIRESTORE
// ==========================================

const db = admin.firestore();


// ==========================================
// HEALTH CHECK
// ==========================================

app.get("/", (req, res) => {

  res.status(200).json({

    ok: true,

    service:
      "DOGS Rewards Firebase API"

  });

});


// ==========================================
// CHECK USER STATUS
// ==========================================

app.get("/checkBan", async (req, res) => {

  try {

    const userId =
      req.query.user_id;


    // ======================================
    // USER ID REQUIRED
    // ======================================

    if (!userId) {

      return res.status(400).json({

        ok: false,

        error:
          "Missing user_id"

      });

    }


    // ======================================
    // FIRESTORE USER DOCUMENT
    // ======================================

    const userRef =
      db
        .collection("dog_users")
        .doc(String(userId));


    const userSnapshot =
      await userRef.get();


    // ======================================
    // USER DOES NOT EXIST
    // ======================================

    if (!userSnapshot.exists) {

      return res.status(200).json({

        ok: true,

        banned: false,

        approved: false

      });

    }


    // ======================================
    // READ USER DATA
    // ======================================

    const userData =
      userSnapshot.data();


    // ======================================
    // BAN STATUS
    // ======================================

    const banned =
      userData.banned === true ||
      String(userData.banned).toLowerCase() === "true";


    // ======================================
    // APPROVAL STATUS
    //
    // Your Mini App uses:
    // verified: true
    //
    // Therefore:
    // verified true = approved
    // ======================================

    const approved =
      userData.verified === true ||
      String(userData.verified).toLowerCase() === "true";


    // ======================================
    // RESPONSE
    // ======================================

    return res.status(200).json({

      ok: true,

      banned: banned,

      approved: approved

    });

  } catch (error) {

    console.error(
      "User status check error:",
      error
    );


    return res.status(500).json({

      ok: false,

      error:
        "User status check failed",

      details:
        error.message

    });

  }

});


// ==========================================
// RENDER SERVER
// ==========================================

const PORT =
  process.env.PORT || 10000;


app.listen(
  PORT,
  "0.0.0.0",
  () => {

    console.log(
      `DOGS Rewards API running on port ${PORT}`
    );

  }
);
