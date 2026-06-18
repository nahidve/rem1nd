import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
  signOut,
} from "firebase/auth";
import { auth } from "../config/firebase";
import { api } from "./axios";
import { setToken, deleteToken } from "../utils/token";

export async function register(email: string, password: string) {
  const userCred = await createUserWithEmailAndPassword(auth, email, password);
  const token = await userCred.user.getIdToken();
  await setToken(token);
  const res = await api.get("/auth/me");
  return res.data;
}

export async function login(email: string, password: string) {
  const userCred = await signInWithEmailAndPassword(auth, email, password);
  const token = await userCred.user.getIdToken();
  await setToken(token);
  const res = await api.get("/auth/me");
  return res.data;
}

export async function logout() {
  await signOut(auth);
  await deleteToken();
}

export async function loginWithGoogle(idToken: string) {
  const credential = GoogleAuthProvider.credential(idToken);
  const userCred = await signInWithCredential(auth, credential);
  const token = await userCred.user.getIdToken();
  await setToken(token);
  const res = await api.get("/auth/me");
  return res.data;
}
