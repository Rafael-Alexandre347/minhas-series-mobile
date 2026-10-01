import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-neutral-950 px-6">
      <StatusBar style="light" />
      <Text className="text-3xl font-bold text-emerald-400">
        Configuração OK
      </Text>
    </View>
  );
}