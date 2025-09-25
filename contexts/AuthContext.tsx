import React, { createContext, useState, ReactNode } from 'react';
import { User } from '../types';
import { signInUser, signUpUser } from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password_unused: string) => Promise<User | null>;
  logout: () => void;
  signup: (
    name: string,
    email: string,
    password_unused: string,
    role: 'student' | 'recruiter',
    companyName?: string
  ) => Promise<User | null>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password_unused: string) => {
    const signedInUser = await signInUser(email, password_unused);
    if (signedInUser) {
      setUser(signedInUser);
    }
    return signedInUser;
  };

  const signup = async (
    name: string,
    email: string,
    password_unused: string,
    role: 'student' | 'recruiter',
    companyName?: string
  ) => {
    const signedUpUser = await signUpUser(name, email, password_unused, role, companyName);
    if (signedUpUser) {
        setUser(signedUpUser);
    }
    return signedUpUser;
  }

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
};