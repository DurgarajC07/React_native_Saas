import { Redirect, Slot, Stack, usePathname } from "expo-router";
import "../global.css";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { SessionProvider, useSession } from "@/context/AuthContext";
import { StatusBar } from "expo-status-bar";

function Header() {
  const { currentTheme } = useTheme();
  const { session, isLoading } = useSession();
  const pathname = usePathname();

  const isAuthScreen  = pathname === '/' || pathname === '/sign-in' || pathname === '/sign-up';

  if(session && !isLoading && isAuthScreen){
    return (
      <>
        <StatusBar style={currentTheme === 'dark' ? 'light': 'dark'}
        backgroundColor={currentTheme === 'dark' ? '#111827': '#FFFFFF'}
        />
        <Redirect href="/(app)/(tabs)" />
      </>
    );
  }
  return (
    <StatusBar style={currentTheme === 'dark' ? 'light': 'dark'}
        backgroundColor={currentTheme === 'dark' ? '#111827': '#FFFFFF'}
     />
  );
}

export default function RootLayout() {
  return <SessionProvider>
    <ThemeProvider>
    <Header />
    <Slot />
    </ThemeProvider>
  </SessionProvider>;
}
