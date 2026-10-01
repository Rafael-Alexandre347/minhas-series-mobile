import '../global.css';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: '#111511' },
        headerStyle: { backgroundColor: '#111511' },
        headerTintColor: '#f4f4ec',
        headerTitleStyle: { fontFamily: 'serif', fontSize: 18 },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{ title: 'Minhas séries', headerShown: false }}
      />
      <Stack.Screen
        name="form"
        options={{ title: 'Nova série', presentation: 'modal' }}
      />
      <Stack.Screen name="detalhe" options={{ title: 'Detalhe da série' }} />
    </Stack>
  );
}