import React from "react";
import ReactDOM from "react-dom/client";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { FireAccessProvider, useFireAccess } from "@fireaccess/react-sdk";
import "./style.css";

const firebaseApp = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
});

const auth = getAuth(firebaseApp);

const Demo = () => {
  const { firebaseUser, user, loading, error } = useFireAccess();

  if (loading) {
    return <main>Loading...</main>;
  }

  return (
    <main>
      <h1>FireAccess Demo</h1>
      {firebaseUser ? (
        <>
          <pre>{JSON.stringify(user, null, 2)}</pre>
          <button onClick={() => signOut(auth)}>Sign out</button>
        </>
      ) : (
        <button onClick={() => signInWithPopup(auth, new GoogleAuthProvider())}>
          Sign in with Google
        </button>
      )}
      {error ? <p>{error.message}</p> : null}
    </main>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <FireAccessProvider apiUrl="http://localhost:4100" auth={auth}>
      <Demo />
    </FireAccessProvider>
  </React.StrictMode>,
);
