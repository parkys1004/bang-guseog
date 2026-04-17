import fs from 'fs';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function test() {
  try {
    const d = await getDoc(doc(db, "config", "globalConfig"));
    console.log("EXISTS:", d.exists());
    if (d.exists()) {
      console.log("DATA:", d.data());
    } else {
        console.log("Document does not exist in db:", config.firestoreDatabaseId);
    }
  } catch(e) {
    console.error("ERROR:", e);
  }
}
test();
