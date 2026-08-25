import { FireAccessProvider, useFireAccess } from "@fireaccess/react-sdk";
import { Dashboard } from "./pages/Dashboard";
import { SignInPanel } from "./components/SignInPanel";
import { firebaseAuth } from "./services/firebase";

const apiUrl = import.meta.env.VITE_API_URL as string;

const AuthenticatedApp = () => {
  const { firebaseUser, loading, error } = useFireAccess();

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-100 text-sm text-slate-600">
        Loading FireAccess...
      </main>
    );
  }

  if (!firebaseUser) {
    return <SignInPanel />;
  }

  if (error) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-100 p-6">
        <div className="rounded-lg border border-rose-200 bg-white p-6 text-sm text-rose-700 shadow-soft">
          {error.message}
        </div>
      </main>
    );
  }

  return <Dashboard />;
};

export const App = () => (
  <FireAccessProvider apiUrl={apiUrl} auth={firebaseAuth}>
    <AuthenticatedApp />
  </FireAccessProvider>
);
