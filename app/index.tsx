import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getSeries } from '../src/database/serieRepository';
import type { Serie, SerieFilter } from '../src/types/serie';

const filters: Array<{ label: string; value: SerieFilter }> = [
  { label: 'Todas', value: 'todas' },
  { label: 'Assistindo', value: 'assistindo' },
  { label: 'Concluídas', value: 'concluidas' },
];

const coverStyles = [
  { background: 'bg-olive', foreground: 'text-ink', mark: 'text-paper' },
  { background: 'bg-coral', foreground: 'text-ink', mark: 'text-paper' },
  { background: 'bg-gold', foreground: 'text-ink', mark: 'text-paper' },
  { background: 'bg-teal', foreground: 'text-ink', mark: 'text-paper' },
];

function SeriesRow({ serie, onPress }: { serie: Serie; onPress: () => void }) {
  const isCompleted = serie.concluida === 1;
  const cover = coverStyles[Math.abs(serie.id) % coverStyles.length];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Abrir detalhes de ${serie.titulo}`}
      onPress={onPress}
      className={`mb-3 flex-row items-center rounded-2xl border p-3 ${
        isCompleted ? 'border-divider bg-surface/70' : 'border-divider bg-surface'
      }`}
    >
      <View
        className={`h-[112px] w-[82px] items-center justify-between overflow-hidden rounded-xl p-2.5 ${cover.background} ${
          isCompleted ? 'opacity-60' : 'opacity-100'
        }`}
      >
        <Text className={`self-start text-[9px] font-bold tracking-[2px] ${cover.foreground}`}>
          {String(serie.id).padStart(2, '0')}
        </Text>
        <Text className={`font-serif text-4xl ${cover.mark}`}>
          {serie.titulo.trim().charAt(0).toUpperCase() || 'S'}
        </Text>
        <Text className={`text-[8px] font-bold tracking-[1.5px] ${cover.foreground}`}>
          SÉRIE
        </Text>
      </View>

      <View className="ml-4 min-w-0 flex-1 py-1">
        <View className="flex-row items-center justify-between">
          <Text
            numberOfLines={1}
            className="mr-2 flex-1 text-[10px] font-semibold uppercase tracking-[1.5px] text-muted"
          >
            {serie.plataforma}
          </Text>
          <View className={`rounded-full px-2 py-1 ${isCompleted ? 'bg-raised' : 'bg-acid/10'}`}>
            <Text
              className={`text-[8px] font-bold tracking-[1px] ${
                isCompleted ? 'text-muted' : 'text-acid'
              }`}
            >
              {isCompleted ? 'CONCLUÍDA' : 'ASSISTINDO'}
            </Text>
          </View>
        </View>

        <Text
          numberOfLines={1}
          className={`mt-3 font-serif text-[21px] leading-7 ${
            isCompleted ? 'text-muted' : 'text-paper'
          }`}
        >
          {serie.titulo}
        </Text>
        <Text className="mt-1 text-xs text-muted">
          {serie.temporadas} {serie.temporadas === 1 ? 'temporada' : 'temporadas'}
          <Text className="text-divider">  ·  </Text>
          {serie.nota === null ? 'Sem nota' : `${serie.nota} / 5`}
        </Text>
        <View className="mt-3 flex-row items-center">
          <Text className="text-xs text-gold">★</Text>
          <Text className="ml-1 text-[10px] font-semibold uppercase tracking-[1px] text-muted">
            {serie.nota === null ? 'Ainda sem avaliação' : `Sua nota: ${serie.nota} de 5`}
          </Text>
        </View>
      </View>

      <Text className="ml-2 text-2xl text-muted">›</Text>
    </Pressable>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const [series, setSeries] = useState<Serie[]>([]);
  const [filter, setFilter] = useState<SerieFilter>('todas');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let isFocused = true;
      setIsLoading(true);
      setLoadError(false);

      getSeries(filter)
        .then((loadedSeries) => {
          if (isFocused) setSeries(loadedSeries);
        })
        .catch(() => {
          if (isFocused) {
            setSeries([]);
            setLoadError(true);
          }
        })
        .finally(() => {
          if (isFocused) setIsLoading(false);
        });

      return () => {
        isFocused = false;
      };
    }, [filter, reloadKey]),
  );

  const emptyContent = isLoading ? (
    <View className="items-center py-16">
      <ActivityIndicator color="#c8ef70" />
      <Text className="mt-4 text-xs uppercase tracking-[1.5px] text-muted">
        Abrindo sua estante
      </Text>
    </View>
  ) : loadError ? (
    <View className="mt-3 items-center rounded-2xl border border-divider bg-surface px-6 py-8">
      <Text className="font-serif text-2xl text-paper">Não foi possível carregar.</Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => setReloadKey((key) => key + 1)}
        className="mt-5 rounded-full bg-acid px-5 py-3"
      >
        <Text className="text-sm font-bold text-ink">Tentar novamente</Text>
      </Pressable>
    </View>
  ) : (
    <View className="mt-3 rounded-2xl border border-divider bg-surface px-5 py-6">
      <Text className="text-[10px] font-bold uppercase tracking-[2px] text-coral">
        SUA ESTANTE / 01
      </Text>
      <Text className="mt-3 font-serif text-[27px] leading-9 text-paper">
        {filter === 'todas' ? 'Toda boa história começa em algum lugar.' : 'Nada por aqui ainda.'}
      </Text>
      <Text className="mt-2 text-sm leading-6 text-muted">
        {filter === 'todas'
          ? 'Adicione uma série e comece a montar sua coleção.'
          : 'Mude o filtro ou adicione uma série à sua coleção.'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-ink" style={{ flex: 1 }}>
      <StatusBar style="light" />

      <View className="px-5 pb-4 pt-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="mr-2 h-7 w-7 items-center justify-center rounded-full border border-acid">
              <Text className="font-serif text-sm text-acid">S</Text>
            </View>
            <Text className="text-[10px] font-bold uppercase tracking-[2.5px] text-paper">
              MINHAS SÉRIES
            </Text>
          </View>
          <Text className="text-[10px] font-semibold uppercase tracking-[1.5px] text-muted">
            SEU ARQUIVO PESSOAL
          </Text>
        </View>

        <View className="mt-7 flex-row items-end justify-between">
          <View className="flex-1 pr-4">
            <Text className="text-[10px] font-bold uppercase tracking-[2px] text-acid">
              HISTÓRIAS NO SEU RITMO
            </Text>
            <Text className="mt-2 font-serif text-[38px] leading-[44px] text-paper">
              Sua estante.
            </Text>
          </View>
          <View className="items-end pb-1">
            <Text className="font-serif text-4xl leading-10 text-acid">
              {String(series.length).padStart(2, '0')}
            </Text>
            <Text className="text-[9px] font-bold uppercase tracking-[1.5px] text-muted">
              NA SELEÇÃO
            </Text>
          </View>
        </View>
      </View>

      <View className="mx-5 mb-4 flex-row rounded-xl border border-divider bg-surface p-1">
        {filters.map((item) => {
          const isActive = item.value === filter;
          return (
            <Pressable
              key={item.value}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              onPress={() => setFilter(item.value)}
              className={`min-h-10 flex-1 items-center justify-center rounded-lg px-2 ${
                isActive ? 'bg-acid' : 'bg-transparent'
              }`}
            >
              <Text className={`text-[11px] font-semibold ${isActive ? 'text-ink' : 'text-muted'}`}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={series}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <SeriesRow
            serie={item}
            onPress={() =>
              router.push({ pathname: '/detalhe', params: { id: String(item.id) } })
            }
          />
        )}
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingBottom: 16 }}
        ListEmptyComponent={emptyContent}
      />

      <View className="border-t border-divider px-5 pb-3 pt-3">
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/form')}
          className="min-h-14 flex-row items-center justify-center rounded-xl bg-acid px-5"
        >
          <Text className="mr-2 text-xl font-light text-ink">+</Text>
          <Text className="text-sm font-bold text-ink">Nova série</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}