"use client";

import { useState } from "react";
import type { AuthCredential } from "firebase/auth";
import { useAuth, AccountLinkRequiredError } from "@/context/AuthContext";

interface AuthModalProps {
  onClose: () => void;
}

type Mode = "signin" | "signup" | "reset";

interface LinkRequest {
  email: string;
  methods: string[];
  credential: AuthCredential;
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const {
    signInWithGoogle,
    signInWithGithub,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    linkPendingCredential,
  } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [linkRequest, setLinkRequest] = useState<LinkRequest | null>(null);

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    if (linkRequest) {
      setEmail("");
      setPassword("");
    }
    setLinkRequest(null);
  }

  async function handleSocial(provider: "google" | "github") {
    setError(null);
    try {
      if (provider === "google") await signInWithGoogle();
      else await signInWithGithub();
      onClose();
    } catch (e: unknown) {
      if (e instanceof AccountLinkRequiredError) {
        setLinkRequest({ email: e.email, methods: e.existingMethods, credential: e.pendingCredential });
        setEmail(e.email);
        return;
      }
      setError(e instanceof Error ? e.message : "Sign in failed");
    }
  }

  async function handleLinkWithGoogle() {
    if (!linkRequest) return;
    setError(null);
    try {
      await signInWithGoogle();
      await linkPendingCredential(linkRequest.credential);
      setLinkRequest(null);
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Sign in failed");
    }
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "reset") {
        await resetPassword(email);
        setResetSent(true);
      } else if (linkRequest) {
        await signInWithEmail(email, password);
        await linkPendingCredential(linkRequest.credential);
        setLinkRequest(null);
        onClose();
      } else if (mode === "signup") {
        await signUpWithEmail(email, password);
        onClose();
      } else {
        await signInWithEmail(email, password);
        onClose();
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  const showGoogleButton = !linkRequest || linkRequest.methods.includes("google.com");
  const showGithubButton = !linkRequest;
  const showEmailForm = mode === "reset" || !linkRequest || linkRequest.methods.includes("password");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white text-xl leading-none"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold text-white mb-1">
          {linkRequest ? "Link your account" : mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Reset password"}
        </h2>
        <p className="text-slate-400 text-sm mb-6">
          {linkRequest
            ? `${linkRequest.email} already has an account. Sign in below to link it.`
            : mode === "signin"
            ? "Sign in to unlock PDF downloads and resume generation."
            : mode === "signup"
            ? "Free account — unlock all premium features."
            : "We'll send a reset link to your email."}
        </p>

        {linkRequest && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-5 text-sm text-amber-300">
            An account already exists for <span className="font-semibold">{linkRequest.email}</span> using{" "}
            {linkRequest.methods.includes("google.com") ? "Google" : "email & password"}. Sign in with that
            method to link your GitHub account to it.
          </div>
        )}

        {mode !== "reset" && !linkRequest && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-5 space-y-2">
            <p className="text-blue-300 text-xs font-semibold uppercase tracking-wider">What you unlock</p>
            {["Download full PDF report", "AI-generated ATS-friendly resume", "Resume rewritten with your missing keywords"].map(b => (
              <div key={b} className="flex items-center gap-2 text-sm text-slate-300">
                <span className="text-emerald-400 shrink-0">✓</span>
                <span>{b}</span>
              </div>
            ))}
          </div>
        )}

        {mode !== "reset" && (showGoogleButton || showGithubButton) && (
          <>
            {/* Social */}
            <div className="space-y-3 mb-5">
              {showGoogleButton && (
                <button
                  onClick={() => (linkRequest ? handleLinkWithGoogle() : handleSocial("google"))}
                  className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-800 font-medium py-2.5 rounded-xl transition-colors text-sm"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>
              )}
              {showGithubButton && (
                <button
                  onClick={() => handleSocial("github")}
                  className="w-full flex items-center justify-center gap-3 bg-slate-700 hover:bg-slate-600 text-white font-medium py-2.5 rounded-xl transition-colors text-sm border border-slate-600"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  Continue with GitHub
                </button>
              )}
            </div>

            {showEmailForm && (
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-slate-700" />
                <span className="text-slate-500 text-xs">or</span>
                <div className="flex-1 h-px bg-slate-700" />
              </div>
            )}
          </>
        )}

        {/* Email form */}
        {showEmailForm && (
          <form onSubmit={handleEmail} className="space-y-3">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!!linkRequest}
              required
              className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500 disabled:opacity-60"
            />
            {mode !== "reset" && (
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500"
              />
            )}

            {error && (
              <p className="text-red-400 text-xs">{error}</p>
            )}
            {resetSent && (
              <p className="text-emerald-400 text-xs">Reset link sent — check your email.</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
            >
              {loading
                ? "Please wait..."
                : linkRequest
                ? "Sign in & link account"
                : mode === "signin"
                ? "Sign in"
                : mode === "signup"
                ? "Create account"
                : "Send reset link"}
            </button>
          </form>
        )}

        {error && !showEmailForm && (
          <p className="text-red-400 text-xs mt-3">{error}</p>
        )}

        {/* Mode switchers */}
        <div className="mt-4 flex flex-col items-center gap-2 text-xs text-slate-500">
          {linkRequest && (
            <button onClick={() => switchMode("signin")} className="hover:text-slate-300">
              Use a different account
            </button>
          )}
          {!linkRequest && mode === "signin" && (
            <>
              <button onClick={() => switchMode("signup")} className="hover:text-slate-300">
                No account? Sign up free
              </button>
              <button onClick={() => switchMode("reset")} className="hover:text-slate-300">
                Forgot password?
              </button>
            </>
          )}
          {!linkRequest && mode === "signup" && (
            <button onClick={() => switchMode("signin")} className="hover:text-slate-300">
              Already have an account? Sign in
            </button>
          )}
          {!linkRequest && mode === "reset" && (
            <button onClick={() => switchMode("signin")} className="hover:text-slate-300">
              Back to sign in
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
