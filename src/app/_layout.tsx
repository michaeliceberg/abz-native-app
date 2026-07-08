// src/app/_layout.tsx
import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "Главная", headerShown: false }}
      />
      <Stack.Screen name="compact" options={{ title: "Компактно" }} />
      <Stack.Screen
        name="login"
        options={{ title: "Вход", headerShown: false }}
      />
    </Stack>
  );
}

// import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
// import * as SplashScreen from 'expo-splash-screen';
// import { useColorScheme } from 'react-native';

// import { AnimatedSplashOverlay } from '@/components/animated-icon';
// import AppTabs from '@/components/app-tabs';

// SplashScreen.preventAutoHideAsync();

// export default function TabLayout() {
//   const colorScheme = useColorScheme();
//   return (
//     <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
//       <AnimatedSplashOverlay />
//       <AppTabs />
//     </ThemeProvider>
//   );
// }
