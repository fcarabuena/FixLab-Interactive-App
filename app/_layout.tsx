import { BarlowCondensed_700Bold, useFonts } from '@expo-google-fonts/barlow-condensed';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { t } from '@/i18n';
import { DisclaimerProvider, useDisclaimer } from '@/state/disclaimer';
import { LanguageProvider, useLanguage } from '@/state/language';
import { ProgressProvider, useProgress } from '@/state/progress';
import { colors, fonts } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

function RootStack({ fontsReady }: { fontsReady: boolean }) {
  const { ready: disclaimerReady, accepted } = useDisclaimer();
  const { ready: languageReady, locale } = useLanguage();
  const { ready: progressReady } = useProgress();
  const appReady = disclaimerReady && languageReady && progressReady && fontsReady;

  useEffect(() => {
    if (appReady) SplashScreen.hideAsync().catch(() => {});
  }, [appReady]);

  if (!appReady) return null;

  return (
    <>
      <StatusBar style="dark" />
      {/* The key redraws every screen in the new language when it changes. */}
      <Stack
        key={locale}
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontFamily: fonts.heading, fontSize: 24 },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
        }}>
        <Stack.Protected guard={accepted}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="models/index" options={{ title: t('models.title') }} />
          <Stack.Screen name="models/[id]" options={{ title: t('model.title') }} />
          <Stack.Screen name="explore" options={{ title: t('explore.title') }} />
          <Stack.Screen name="guides/[id]" options={{ title: t('guide.title') }} />
          <Stack.Screen name="lessons/index" options={{ title: t('lessons.title') }} />
          <Stack.Screen name="lessons/[id]" options={{ title: t('lesson.title') }} />
          <Stack.Screen name="identify" options={{ title: t('identify.title') }} />
          <Stack.Screen name="tools-safety" options={{ title: t('tools.title') }} />
          <Stack.Screen name="about" options={{ title: t('about.title') }} />
        </Stack.Protected>
        <Stack.Protected guard={!accepted}>
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        </Stack.Protected>
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ BarlowCondensed_700Bold });

  return (
    <GestureHandlerRootView style={styles.root}>
      <LanguageProvider>
        <DisclaimerProvider>
          <ProgressProvider>
            {/* If the font fails to load, carry on with the system font. */}
            <RootStack fontsReady={fontsLoaded || fontError !== null} />
          </ProgressProvider>
        </DisclaimerProvider>
      </LanguageProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
});
