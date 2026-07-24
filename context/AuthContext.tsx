"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  User,
  AuthCredential,
  AuthError,
  AuthProvider as FirebaseAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut,
  GoogleAuthProvider,
  GithubAuthProvider,
  fetchSignInMethodsForEmail,
  linkWithCredential,
} from "firebase/auth";
import { getFirebaseAuth, googleProvider, githubProvider } from "@/lib/firebase";

// Thrown when a social sign-in hits Firebase's "one account per email"
// rule — the email is already registered via a different provider. Carries
// what the UI needs to prompt the user to sign in with the existing
// provider and link this credential to it.
export class AccountLinkRequiredError extends Error {
  constructor(
    public email: string,
    public existingMethods: string[],
    public pendingCredential: AuthCredential
  ) {
    super(`An account already exists for ${email} using a different sign-in method.`);
    this.name = "AccountLinkRequiredError";
  }
}

function pendingCredentialFrom(error: AuthError): AuthCredential | null {
  return (
    GithubAuthProvider.credentialFromError(error) ??
    GoogleAuthProvider.credentialFromError(error)
  );
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  getToken: () => Promise<string | null>;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  linkPendingCredential: (credential: AuthCredential) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  const popupSignIn = async (provider: FirebaseAuthProvider) => {
    try {
      await signInWithPopup(getFirebaseAuth(), provider);
    } catch (e) {
      const error = e as AuthError;
      if (error.code === "auth/account-exists-with-different-credential") {
        const pendingCredential = pendingCredentialFrom(error);
        const email = error.customData?.email as string | undefined;
        if (pendingCredential && email) {
          const methods = await fetchSignInMethodsForEmail(getFirebaseAuth(), email);
          throw new AccountLinkRequiredError(email, methods, pendingCredential);
        }
      }
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    await popupSignIn(googleProvider);
  };

  const signInWithGithub = async () => {
    await popupSignIn(githubProvider);
  };

  const signInWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
  };

  const signUpWithEmail = async (email: string, password: string) => {
    const check = await fetch("/api/validate-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const { allowed, reason } = await check.json();
    if (!allowed) throw new Error(reason);
    const cred = await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
    await sendEmailVerification(cred.user);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(getFirebaseAuth(), email);
  };

  const linkPendingCredential = async (credential: AuthCredential) => {
    const auth = getFirebaseAuth();
    if (!auth.currentUser) throw new Error("Must be signed in to link a credential");
    await linkWithCredential(auth.currentUser, credential);
  };

  const getToken = async (): Promise<string | null> => {
    const auth = getFirebaseAuth();
    return auth.currentUser ? auth.currentUser.getIdToken() : null;
  };

  const logout = async () => {
    await signOut(getFirebaseAuth());
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        getToken,
        signInWithGoogle,
        signInWithGithub,
        signInWithEmail,
        signUpWithEmail,
        resetPassword,
        linkPendingCredential,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
