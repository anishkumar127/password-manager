import React, { createContext, useState, useEffect, ReactNode } from "react";

interface AuthState {
  isLoading: boolean;
  isSignout: boolean;
  userToken: string | null;
}

interface AuthContextProps {
  state: AuthState;
  signIn: (data: { username: string; password: string }) => Promise<void>;
  signOut: () => void;
  signUp: (data: { username: string; password: string }) => Promise<void>;
}

export const AuthContext = createContext<AuthContextProps>({
  state: { isLoading: true, isSignout: false, userToken: null },
  signIn: async () => {},
  signOut: () => {},
  signUp: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [state, setState] = useState<AuthState>({
    isLoading: true,
    isSignout: false,
    userToken: null,
  });

  // Simulate restoring a token (e.g., from AsyncStorage)
  useEffect(() => {
    setTimeout(() => {
      setState((prev) => ({
        ...prev,
        isLoading: false,
      }));
    }, 1000);
  }, []);

  const signIn = async (data: { username: string; password: string }) => {
    // Replace with your API call
    setState({
      isLoading: false,
      isSignout: false,
      userToken: "dummy-auth-token",
    });
  };

  const signOut = () => {
    setState({
      isLoading: false,
      isSignout: true,
      userToken: null,
    });
  };

  const signUp = async (data: { username: string; password: string }) => {
    // Replace with your API call
    setState({
      isLoading: false,
      isSignout: false,
      userToken: "dummy-auth-token",
    });
  };

  return (
    <AuthContext.Provider value={{ state, signIn, signOut, signUp }}>
      {children}
    </AuthContext.Provider>
  );
};
