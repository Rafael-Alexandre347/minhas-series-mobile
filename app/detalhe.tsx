import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import {
  deleteSerie,
  getSerieById,
  toggleSerieConcluida,
} from '../src/database/serieRepository';
import type { Serie } from '../src/types/serie';

function formatCreatedAt(createdAt: string): string {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return createdAt;

  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export default function SerieDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  const id = rawId === undefined ? Number.NaN : Number(rawId);

  const [serie, setSerie] = useState<Serie | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');

  const loadSerie = useCallback(async (isCurrent: () => boolean = () => true) => {
    if (!Number.isInteger(id) || id <= 0) {
      if (isCurrent()) {
        setError('O identificador desta série é inválido.');
        setSerie(null);
        setIsLoading(false);
      }
      return;
    }

    if (isCurrent()) {
      setIsLoading(true);
      setError('');
    }

    try {
      const loadedSerie = await getSerieById(id);
      if (!isCurrent()) return;

      setSerie(loadedSerie);
      if (loadedSerie === null) {
        setError('Esta série não está mais na sua estante.');
      }
    } catch {
      if (isCurrent()) setError('Não foi possível carregar os dados desta série.');
    } finally {
      if (isCurrent()) setIsLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      let isFocused = true;
      void loadSerie(() => isFocused);

      return () => {
        isFocused = false;
      };
    }, [loadSerie]),
  );

  async function handleToggleCompleted() {
    if (serie === null || isUpdating) return;

    setIsUpdating(true);
    setError('');
    try {
      await toggleSerieConcluida(serie.id);
      await loadSerie();
    } catch {
      setError('Não foi possível atualizar o status. Tente novamente.');
    } finally {
      setIsUpdating(false);
    }
  }

  function confirmDelete() {
    if (serie === null || isUpdating) return;

    Alert.alert(
      'Remover da estante?',
      `“${serie.titulo}” será excluída permanentemente.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir série',
          style: 'destructive',
          onPress: () => {
            setIsUpdating(true);
            deleteSerie(serie.id)
              .then(() => router.replace('/'))
              .catch(() => {
                setError('Não foi possível excluir a série. Tente novamente.');
              })
              .finally(() => setIsUpdating(false));
          },
        },
      ],
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-ink">
        <StatusBar style="light" />
        <ActivityIndicator color="#c8ef70" />
        <Text className="mt-4 text-xs uppercase tracking-[1.5px] text-muted">
          Abrindo ficha
        </Text>
      </SafeAreaView>
    );
  }

  if (serie === null) {
    return (
      <SafeAreaView className="flex-1 bg-ink px-5" edges={['bottom']}>
        <StatusBar style="light" />
        <View className="flex-1 justify-center">
          <Text className="text-[10px] font-bold uppercase tracking-[2px] text-coral">
            FICHA INDISPONÍVEL
          </Text>
          <Text className="mt-3 font-serif text-3xl text-paper">
            Não encontramos essa série.
          </Text>
          <Text className="mt-3 text-sm leading-6 text-muted">
            {error || 'Volte à sua estante e escolha outra série.'}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace('/')}
            className="mt-7 min-h-14 items-center justify-center rounded-xl bg-acid"
          >
            <Text className="text-sm font-bold text-ink">Voltar à estante</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const isCompleted = serie.concluida === 1;
  const posterColor = ['bg-olive', 'bg-coral', 'bg-gold', 'bg-teal'][serie.id % 4];

  return (
    <SafeAreaView className="flex-1 bg-ink" edges={['bottom']}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 32 }}>
        <View className="flex-row items-start">
          <View
            className={`h-[190px] w-[138px] items-center justify-between rounded-2xl p-4 ${posterColor}`}
          >
            <Text className="self-start text-[10px] font-bold uppercase tracking-[2px] text-ink">
              FICHA / {String(serie.id).padStart(2, '0')}
            </Text>
            <Text className="font-serif text-7xl text-paper">
              {serie.titulo.trim().charAt(0).toUpperCase() || 'S'}
            </Text>
            <Text className="text-[9px] font-bold uppercase tracking-[2px] text-ink">
              MINHAS SÉRIES
            </Text>
          </View>

          <View className="ml-5 min-w-0 flex-1 pt-1">
            <View
              className={`self-start rounded-full px-3 py-1.5 ${
                isCompleted ? 'bg-raised' : 'bg-acid/10'
              }`}
            >
              <Text
                className={`text-[9px] font-bold uppercase tracking-[1px] ${
                  isCompleted ? 'text-muted' : 'text-acid'
                }`}
              >
                {isCompleted ? 'Concluída' : 'Assistindo'}
              </Text>
            </View>
            <Text className="mt-4 font-serif text-[30px] leading-9 text-paper">
              {serie.titulo}
            </Text>
            <Text className="mt-2 text-sm text-muted">{serie.plataforma}</Text>
            <View className="mt-4 flex-row items-center">
              <Text className="text-xl text-gold">{serie.nota === null ? '☆' : '★'}</Text>
              <Text className="ml-2 text-sm font-semibold text-paper">
                {serie.nota === null ? 'Sem nota' : `${serie.nota} / 5`}
              </Text>
            </View>
          </View>
        </View>

        <View className="mt-7 border-y border-divider py-5">
          <Text className="text-[10px] font-bold uppercase tracking-[2px] text-muted">
            SOBRE ESTA SÉRIE
          </Text>
          <View className="mt-5 flex-row">
            <View className="flex-1 border-r border-divider pr-3">
              <Text className="font-serif text-3xl text-paper">{serie.temporadas}</Text>
              <Text className="mt-1 text-[10px] font-semibold uppercase tracking-[1px] text-muted">
                {serie.temporadas === 1 ? 'Temporada vista' : 'Temporadas vistas'}
              </Text>
            </View>
            <View className="flex-1 pl-5">
              <Text className="font-serif text-3xl text-paper">
                {serie.nota === null ? '—' : `${serie.nota}/5`}
              </Text>
              <Text className="mt-1 text-[10px] font-semibold uppercase tracking-[1px] text-muted">
                Avaliação pessoal
              </Text>
            </View>
          </View>
          <View className="mt-5 border-t border-divider pt-4">
            <Text className="text-[10px] font-semibold uppercase tracking-[1px] text-muted">
              ADICIONADA À ESTANTE
            </Text>
            <Text className="mt-1 text-sm text-paper">{formatCreatedAt(serie.createdAt)}</Text>
          </View>
        </View>

        {error !== '' && (
          <View className="mt-5 rounded-xl border border-coral/40 bg-coral/10 px-4 py-3">
            <Text accessibilityRole="alert" className="text-sm leading-5 text-coral">
              {error}
            </Text>
          </View>
        )}

        <View className="mt-7">
          <Pressable
            accessibilityRole="button"
            onPress={() => void handleToggleCompleted()}
            disabled={isUpdating}
            className={`min-h-14 flex-row items-center justify-center rounded-xl px-4 ${
              isCompleted ? 'border border-divider bg-surface' : 'bg-acid'
            }`}
          >
            {isUpdating ? (
              <ActivityIndicator color={isCompleted ? '#c8ef70' : '#111511'} />
            ) : (
              <Text className={`text-sm font-bold ${isCompleted ? 'text-paper' : 'text-ink'}`}>
                {isCompleted ? 'Voltar para assistindo' : 'Marcar como concluída'}
              </Text>
            )}
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push({ pathname: '/form', params: { id: String(serie.id) } })}
            disabled={isUpdating}
            className="mt-3 min-h-14 items-center justify-center rounded-xl border border-divider bg-surface"
          >
            <Text className="text-sm font-bold text-paper">Editar série</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={confirmDelete}
            disabled={isUpdating}
            className="mt-4 min-h-12 items-center justify-center"
          >
            <Text className="text-sm font-semibold text-coral">Excluir da estante</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}