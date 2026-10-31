import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import { getAuth, signInAnonymously } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';
import { getFirestore, doc, setDoc } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';
import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig, 'solitaire-usage');
const auth = getAuth(app);
const db = getFirestore(app);

/** Record one daily active device; standaloneLaunch becomes true if opened as an installed app. */
export async function recordUsageCounts(standaloneLaunch) {
  let user = auth.currentUser;
  if (!user) {
    const credential = await signInAnonymously(auth);
    user = credential.user;
  }
  if (!user.isAnonymous) throw new Error('Solitaire telemetry requires anonymous authentication.');

  const day = new Date().toISOString().slice(0, 10);
  const usageId = `${user.uid}_${day}`;
  const usageRef = doc(db, 'solitaire_usage', usageId);
  const installedKey = `solitaire_usage_installed_seen_${user.uid}`;
  const wasInstalledLaunch = localStorage.getItem(installedKey) === 'true';
  if (standaloneLaunch) localStorage.setItem(installedKey, 'true');

  // One document per anonymous installation per UTC day. Once an installation has
  // launched standalone, never downgrade that count on a later browser launch.
  await setDoc(usageRef, {
    uid: user.uid,
    day,
    standaloneLaunch: standaloneLaunch || wasInstalledLaunch,
  }, { merge: true });
}
