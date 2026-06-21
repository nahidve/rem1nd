import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { useEffect } from "react";
import { auth } from "../config/firebase";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { setToken } from "../utils/token";

WebBrowser.maybeCompleteAuthSession();

import * as AuthSession from "expo-auth-session";
import { Platform } from "react-native";

export function useGoogleAuth(onSuccess: () => void) {
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID!,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID!,
    redirectUri: Platform.select({
      android: "com.nahhid.rem1nd:/oauth2redirect",
      default: AuthSession.makeRedirectUri({
        scheme: "rem1nd",
        path: "oauth2redirect",
      }),
    }),
  });

  useEffect(() => {
    const signIn = async () => {
      if (response?.type !== "success") return;

      const id_token = response?.authentication?.idToken;

      if (!id_token) return;

      const credential = GoogleAuthProvider.credential(id_token);

      const userCred = await signInWithCredential(auth, credential);

      const token = await userCred.user.getIdToken();

      await setToken(token);

      onSuccess();
    };

    signIn();
  }, [response]);

  return {
    promptAsync,
    request,
  };
}
