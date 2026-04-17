import fs from 'fs';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const dbDefault = getFirestore(app, '(default)');

async function test() {
  try {
    const d = await getDoc(doc(dbDefault, "config", "globalConfig"));
    console.log("DEFAULT_DB EXISTS:", d.exists());
    if (d.exists()) {
      console.log("DEFAULT_DB DATA:", d.data());
    } else {
      console.log("Document does not exist in db: (default)");
    }
  } catch(e) {
    console.error("ERROR:", e);
  }
}
test();
