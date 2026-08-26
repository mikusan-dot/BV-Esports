const admin = require("firebase-admin");

let db;
let auth;
let storage;

function initializeFirebase() {
  if (admin.apps.length > 0) {
    db = admin.firestore();
    auth = admin.auth();
    storage = admin.storage();
    return;
  }

  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || "{}");

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${process.env.FIREBASE_PROJECT_ID}.appspot.com`,
  });

  db = admin.firestore();
  auth = admin.auth();
  storage = admin.storage();

  console.log("Firebase initialized successfully");
}

module.exports = { admin, initializeFirebase, getDb: () => db, getAuth: () => auth, getStorage: () => storage };
