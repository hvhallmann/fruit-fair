import { getAuth, signInAnonymously } from "firebase/auth";
import {
  deleteDoc,
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import app from "../firebase.js";

const profileCollection = "userProfiles";

async function getProfileDocument() {
  const auth = getAuth(app);
  await auth.authStateReady();
  const user = auth.currentUser ?? (await signInAnonymously(auth)).user;
  const database = getFirestore(app);

  return {
    database,
    reference: doc(database, profileCollection, user.uid),
  };
}

export async function loadCloudUserProfile() {
  const { reference } = await getProfileDocument();
  const snapshot = await getDoc(reference);

  if (!snapshot.exists()) return null;

  const profile = snapshot.data();
  delete profile.updatedAt;
  return profile;
}

export async function saveCloudUserProfile(profile) {
  const { reference } = await getProfileDocument();
  await setDoc(reference, { ...profile, updatedAt: serverTimestamp() });
}

export async function deleteCloudUserProfile() {
  const { reference } = await getProfileDocument();
  await deleteDoc(reference);
}
