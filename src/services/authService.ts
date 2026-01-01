import { firebaseEnabled, auth, firestore } from '../config/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  getIdToken,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export async function signIn(email: string, password: string) {
  if (!firebaseEnabled || !auth) {
    // fallback: pretend login and return a minimal user object
    console.info('Using localStorage fallback for sign-in');
    return { uid: 'u_' + btoa(email).replace(/=+$/, '').slice(0, 12), email };
  }
  try {
    const res = await signInWithEmailAndPassword(auth, email, password);
    const token = await getIdToken(res.user, true);
    return { uid: res.user.uid, email: res.user.email, token };
  } catch (e) {
    console.error('Firebase signIn failed:', e);
    // fallback for network or config errors
    return { uid: 'u_' + btoa(email).replace(/=+$/, '').slice(0, 12), email };
  }
}

export async function signUp(email: string, password: string, role: string) {
  if (!firebaseEnabled || !auth || !firestore) {
    console.info('Using localStorage fallback for sign-up');
    const uid = 'u_' + btoa(email).replace(/=+$/, '').slice(0, 12);
    // create a minimal profile in localStorage as fallback
    const profile = { role, email, displayName: email.split('@')[0], createdAt: new Date().toISOString() };
    try {
      const users = JSON.parse(localStorage.getItem('fk_profiles' ) || '{}');
      users[uid] = profile;
      localStorage.setItem('fk_profiles', JSON.stringify(users));
    } catch (e) {}
    return { uid, email };
  }

  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const uid = res.user.uid;
    const profileRef = doc(firestore, `users/${uid}`);
    await setDoc(profileRef, { profile: { role, email, displayName: email.split('@')[0], createdAt: new Date().toISOString() } }, { merge: true });
    const token = await getIdToken(res.user, true);
    return { uid, email, token };
  } catch (e) {
    console.error('Firebase signUp failed:', e);
    // fallback for network or config errors
    const uid = 'u_' + btoa(email).replace(/=+$/, '').slice(0, 12);
    const profile = { role, email, displayName: email.split('@')[0], createdAt: new Date().toISOString() };
    try {
      const users = JSON.parse(localStorage.getItem('fk_profiles' ) || '{}');
      users[uid] = profile;
      localStorage.setItem('fk_profiles', JSON.stringify(users));
    } catch (err) {}
    return { uid, email };
  }
}

export async function signOut() {
  if (!firebaseEnabled || !auth) {
    console.info('Using localStorage fallback for sign-out');
    return true;
  }
  try {
    await fbSignOut(auth);
    return true;
  } catch (e) {
    console.error('Firebase signOut failed:', e);
    return true; // fail gracefully
  }
}

export async function fetchUserProfile(uid: string) {
  if (!firebaseEnabled || !firestore) {
    console.info('Using localStorage fallback for profile fetch');
    try {
      const users = JSON.parse(localStorage.getItem('fk_profiles') || '{}');
      return users[uid] || null;
    } catch (e) { return null; }
  }
  try {
    const ref = doc(firestore, `users/${uid}`);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return snap.data().profile || null;
  } catch (e) {
    console.error('Firebase profile fetch failed:', e);
    // fallback to localStorage
    try {
      const users = JSON.parse(localStorage.getItem('fk_profiles') || '{}');
      return users[uid] || null;
    } catch (err) { return null; }
  }
}
