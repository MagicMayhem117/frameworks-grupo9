import React, { createContext, useState, useContext, useEffect } from "react";
import auth from '@react-native-firebase/auth';

const UserContext = createContext();

/**
 * UserProvider keeps the user's session in sync with Firebase Auth.
 * It listens to auth().onAuthStateChanged so the app restores the
 * signed-in user automatically after the app restarts.
 */
export const UserProvider = ({ children }) => {
  const [email, setEmail] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      setEmail(user ? user.email : null);
      if (initializing) setInitializing(false);
    });
    return unsubscribe;
  }, [initializing]);

  const signOut = async () => {
    try {
      await auth().signOut();
      setEmail(null);
    } catch (err) {
      console.error('signOut failed', err);
    }
  };

  return (
    <UserContext.Provider value={{ email, setEmail, initializing, signOut }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);