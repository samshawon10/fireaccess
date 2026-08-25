import { FormEvent, useState } from "react";
import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { KeyRound, LogIn } from "lucide-react";
import { firebaseAuth } from "../services/firebase";

export const SignInPanel = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await signInWithEmailAndPassword(firebaseAuth, email, password);
    } catch (unknownError) {
      setError(
        unknownError instanceof Error ? unknownError.message : "Unable to sign in.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <section className="w-full max-w-md rounded-lg border border-line bg-white p-6 shadow-soft">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-ink text-white">
          <KeyRound className="h-5 w-5" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold text-ink">FireAccess Admin</h1>
        <form className="mt-6 grid gap-4" onSubmit={submit}>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Email
            <input
              className="h-11 rounded-lg border border-line px-3 outline-none ring-brand/20 focus:ring-4"
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              value={email}
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Password
            <input
              className="h-11 rounded-lg border border-line px-3 outline-none ring-brand/20 focus:ring-4"
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              value={password}
            />
          </label>
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-ink px-4 text-sm font-medium text-white disabled:opacity-60"
            disabled={submitting}
            type="submit"
          >
            <LogIn className="h-4 w-4" />
            Sign in
          </button>
        </form>
        <button
          className="mt-3 h-11 w-full rounded-lg border border-line text-sm font-medium text-slate-700 hover:bg-slate-50"
          onClick={() => signInWithPopup(firebaseAuth, new GoogleAuthProvider())}
        >
          Continue with Google
        </button>
      </section>
    </main>
  );
};
