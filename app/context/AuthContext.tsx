import { useStorageState } from "@/hooks/useStorageState";
import { useContext, createContext, type PropsWithChildren, useEffect } from "react";
import {router} from 'expo-router';
import axios from "axios";
import axiosInstance from "@/config/axiosConfig";

interface User{
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  credits: number | null;
}

interface AuthContextType {
  signIn: (token: string, user: User) => void;
  signOut: () => void;
  session?: string | null;
  user?: User | null;
  isLoading: boolean;
  updateUser: (userData: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  signIn: () => null,
  signOut: () => null,
  session: null,
  user: null,
  isLoading: false,
  updateUser: async () => {},
});

export function useSession() {
  const value = useContext(AuthContext);
  if(process.env.NODE_ENV !== 'production'){
    if(!value){
      throw new Error('useSession must be Wrapped in a <SessionProvider/>');
    }
    return value;
  }
}

export function SessionProvider({ children } : PropsWithChildren){
  const [[isLoading,session],setSession] = useStorageState('session');
  const [[,user],setUser] = useStorageState('user');

  const updateUser = async (userData:any) => {
    await setUser(userData);
  };

  const handleSignOut = async () => {
    try{
      if(session){
        await axiosInstance.post('/api/logout', null, {
          headers: {
            'Authorization': `Bearer ${session}`
          }
        });
        setSession(null);
        setUser(null);
        router.replace('/sign-in');
      }
    } catch (error){
      console.error('Logout error:',error);
    }
  };

  const loadUserInfo = async (token: string) => {
    try{
      const response = await axiosInstance.get('/api/user',{
        headers: {
            'Authorization': `Bearer ${token}`
          }
      });

      setUser(JSON.stringify(response.data));
    } catch (error){
      if(axios.isAxiosError(error)&& error.response?.status === 401){
        setSession(null);
        setUser(null);
        router.replace('/sign-in');
      } else {
        console.error('Error Feteching user Info:',error);
      }
    }
  };

  useEffect(() => {
    if(session){
      loadUserInfo(session);
    }
  },[session]);

  const parsedUser = user ? (() => {
    try{
      return JSON.parse(user);
    } catch (e){
      console.error('Failed to parse user data:',e);
      return null;
    }
  })() : null;

  const handleUpdateUser = async ( userData: any) =>{
    try{
      const userString = JSON.stringify(userData);
      await setUser(userString);
    } catch (e){
      console.error('Failed to update user:',e);
      throw e;
    }
  };

  const handleSignIn = async (token: string, userData: User) => {
    try{
      await setSession(token);
      await setUser(JSON.stringify(userData));
    } catch (e){
      console.error('Failed to sign in:', e);
      throw e;
    }

  };

  return (
    <AuthContext.Provider value={{
      signIn: handleSignIn,
      signOut: handleSignOut,
      session,
      user: parsedUser,
      isLoading,
      updateUser: handleUpdateUser
    }}>
      {children}
    </AuthContext.Provider>

  );
}