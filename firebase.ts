import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import firebaseConfig from "./firebase-applet-config.json";

// Add databaseURL if missing
const configWithDb = {
  ...firebaseConfig,
  databaseURL: `https://${firebaseConfig.projectId}-default-rtdb.firebaseio.com`
};

// Initialize Firebase
const app = initializeApp(configWithDb);
export const auth = getAuth(app);
// @ts-ignore
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const rtdb = getDatabase(app);
