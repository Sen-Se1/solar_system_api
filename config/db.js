const { initializeApp } = require('firebase/app');
const { getFirestore, collection } = require('firebase/firestore');
const { getStorage } = require('firebase/storage');
const {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIL,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID
} = process.env;

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIL,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);
const solarCollection = collection(db, "solar");

module.exports = { firebaseApp, db, storage, solarCollection };
