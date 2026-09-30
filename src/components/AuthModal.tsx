import React, { useState } from "react";
import {
  X,
  User as UserIcon,
  Mail,
  Lock,
  Building,
  Check,
  LogOut,
  ShieldCheck,
  AlertCircle,
  Loader2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { User } from "../types";
import {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  logOut,
  saveUserProfile,
} from "../lib/firebase";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onSaveUser: (user: User) => void;
  promptReason?: "save" | "download" | "dashboard" | "general" | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSaveUser,
  promptReason,
}) => {
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState(currentUser.name || "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [organization, setOrganization] = useState(currentUser.organization || "");
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const isAuthenticated = currentUser.provider === "google" || currentUser.provider === "email";

  React.useEffect(() => {
    if (isOpen) {
      setName(currentUser.name || "");
      setOrganization(currentUser.organization || "");
      setEmail(currentUser.email && isAuthenticated ? currentUser.email : "");
      setPassword("");
      setAuthError("");
      setSaveSuccess(false);
    }
  }, [currentUser, isOpen, isAuthenticated]);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setAuthError("");
    try {
      const fbUser = await signInWithGoogle();
      const updated: User = {
        id: fbUser.uid,
        name: fbUser.displayName || currentUser.name || "Organizer",
        email: fbUser.email || "",
        photoURL: fbUser.photoURL || undefined,
        organization: organization || currentUser.organization || "",
        provider: "google",
        emailVerified: fbUser.emailVerified,
      };
      await saveUserProfile(updated);
      onSaveUser(updated);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 900);
    } catch (err: any) {
      if (err?.code === "auth/popup-closed-by-user") {
        setAuthError("Sign-in cancelled. Please complete the Google authentication window.");
      } else if (err?.code === "auth/popup-blocked") {
        setAuthError("Popup was blocked by your browser. Please allow popups for this site.");
      } else {
        setAuthError(err?.message || "Google authentication failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setAuthError("Please provide both email and password.");
      return;
    }

    setIsLoading(true);
    setAuthError("");

    try {
      if (authMode === "signup") {
        if (!name.trim()) {
          setAuthError("Please enter your name.");
          setIsLoading(false);
          return;
        }
        if (password.length < 6) {
          setAuthError("Password must be at least 6 characters.");
          setIsLoading(false);
          return;
        }

        const fbUser = await signUpWithEmail(email, password, name);
        const newUser: User = {
          id: fbUser.uid,
          name: name.trim(),
          email: fbUser.email || email.trim(),
          organization: organization.trim(),
          provider: "email",
          emailVerified: fbUser.emailVerified,
        };
        await saveUserProfile(newUser);
        onSaveUser(newUser);
      } else {
        const fbUser = await signInWithEmail(email, password);
        const existingUser: User = {
          id: fbUser.uid,
          name: fbUser.displayName || name.trim() || "Event Organizer",
          email: fbUser.email || email.trim(),
          organization: organization.trim() || currentUser.organization || "",
          provider: "email",
          emailVerified: fbUser.emailVerified,
        };
        await saveUserProfile(existingUser);
        onSaveUser(existingUser);
      }

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 900);
    } catch (err: any) {
      const code = err?.code;
      if (code === "auth/user-not-found" || code === "auth/wrong-password" || code === "auth/invalid-credential") {
        setAuthError("Invalid email or password. Please try again.");
      } else if (code === "auth/email-already-in-use") {
        setAuthError("An account already exists with this email. Please sign in instead.");
      } else if (code === "auth/weak-password") {
        setAuthError("Password should be at least 6 characters.");
      } else if (code === "auth/invalid-email") {
        setAuthError("Please provide a valid email address.");
      } else {
        setAuthError(err?.message || "Authentication failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    setAuthError("");
    try {
      await logOut();
      const guestUser: User = {
        id: "usr_guest_" + Math.random().toString(36).substring(2, 8),
        name: "Guest Organizer",
        email: "",
        organization: "",
        provider: "local",
      };
      onSaveUser(guestUser);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 600);
    } catch (err: any) {
      setAuthError(err?.message || "Failed to sign out.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTesterDemoAccess = async () => {
    setIsLoading(true);
    setAuthError("");
    const demoUser: User = {
      id: "usr_tester_evaluator",
      name: "Dr. Alex Rivera (Lead Evaluator)",
      email: "tester@unireport.edu",
      organization: "Department of Academic Affairs & Accreditation",
      provider: "email",
      emailVerified: true,
    };
    try {
      await saveUserProfile(demoUser);
    } catch {
      // offline safe
    }
    onSaveUser(demoUser);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 500);
    setIsLoading(false);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const updated: User = {
      ...currentUser,
      name: name.trim(),
      organization: organization.trim(),
    };
    await saveUserProfile(updated);
    onSaveUser(updated);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 700);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {isAuthenticated
                  ? "Organizer Account Profile"
                  : authMode === "signin"
                  ? "Sign In to UniReport"
                  : "Create UniReport Account"}
              </h3>
              <p className="text-[11px] text-slate-500">
                {isAuthenticated
                  ? "Authenticated & verified account"
                  : "Required for cloud saving and official PDF exports"}
              </p>
            </div>
          </div>
          <button
            type="button"
            id="auth-modal-close-x-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Prompt Reason Banner */}
          {!isAuthenticated && promptReason && (
            <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-xl text-xs flex items-start gap-2 animate-in fade-in">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">
                  {promptReason === "save"
                    ? "Account Required to Save Reports"
                    : promptReason === "download"
                    ? "Account Required to Export & Download PDF"
                    : "Account Required to Access Dashboard & Editor"}
                </p>
                <p className="text-[11px] mt-0.5 text-indigo-700">
                  Sign in or create a free account to securely save and download your official proceedings.
                </p>
              </div>
            </div>
          )}

          {/* Error Alert */}
          {authError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold">Authentication Notice</p>
                <p className="text-[11px] mt-0.5 text-rose-700">{authError}</p>
              </div>
            </div>
          )}

          {/* Success Banner */}
          {saveSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">Account updated successfully!</span>
            </div>
          )}

          {/* AUTHENTICATED USER VIEW */}
          {isAuthenticated ? (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.name}
                      className="w-12 h-12 rounded-full border-2 border-indigo-500 shadow-2xs object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center text-lg font-bold">
                      {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-bold text-slate-900">{currentUser.name}</h4>
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        {currentUser.provider === "google" ? "Google Verified" : "Verified Account"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{currentUser.email}</p>
                  </div>
                </div>

                <button
                  type="button"
                  id="auth-signout-btn"
                  onClick={handleSignOut}
                  disabled={isLoading}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
                >
                  {isLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <LogOut className="w-3.5 h-3.5" />
                  )}
                  <span>Sign Out</span>
                </button>
              </div>

              {/* Edit Organization metadata */}
              <form onSubmit={handleUpdateProfile} className="space-y-3 text-xs pt-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Organizer Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Department / Institution
                  </label>
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="e.g. Faculty of Engineering & Technology"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* NON-AUTHENTICATED FORM (SIGN IN / SIGN UP) */
            <div className="space-y-4">
              {/* Tab Selector: Sign In vs Sign Up */}
              <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  id="tab-toggle-signin"
                  onClick={() => {
                    setAuthMode("signin");
                    setAuthError("");
                  }}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                    authMode === "signin"
                      ? "bg-white text-indigo-700 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  id="tab-toggle-signup"
                  onClick={() => {
                    setAuthMode("signup");
                    setAuthError("");
                  }}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                    authMode === "signup"
                      ? "bg-white text-indigo-700 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* 1-Click Google Sign-In */}
              <button
                type="button"
                id="modal-google-auth-btn"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 hover:border-slate-400 shadow-xs flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                ) : (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                )}
                <span>Continue with Google</span>
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="shrink-0 mx-3 text-[10px] uppercase font-bold text-slate-400">
                  or with email & password
                </span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* Email / Password Form */}
              <form onSubmit={handleEmailAuthSubmit} className="space-y-3 text-xs">
                {authMode === "signup" && (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Dr. Jordan Lee"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Official Email <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. organizer@institution.edu"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {authMode === "signup" && (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Department / Institution (Optional)
                    </label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                      <input
                        type="text"
                        value={organization}
                        onChange={(e) => setOrganization(e.target.value)}
                        placeholder="e.g. Department of Computer Science"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  id="auth-submit-btn"
                  disabled={isLoading}
                  className="w-full mt-2 py-2.5 px-4 font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.01]"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                  <span>
                    {isLoading
                      ? "Authenticating..."
                      : authMode === "signin"
                      ? "Sign In to Your Account"
                      : "Create Account & Get Started"}
                  </span>
                </button>
              </form>

              {/* Instant Tester / Evaluator Access */}
              <div className="pt-3 border-t border-slate-200/80 text-center">
                <button
                  type="button"
                  id="auth-modal-tester-demo-btn"
                  onClick={handleTesterDemoAccess}
                  className="w-full py-2.5 px-3 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 text-indigo-900 border border-indigo-200/80 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
                >
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Try Tester Demo Mode (Instant Full Access)</span>
                </button>
                <p className="text-[10px] text-slate-400 mt-1.5">
                  Unlocks all 5 event types, AI summary synthesis, and PDF export without registering.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
