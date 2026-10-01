import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  createSerie,
  getSerieById,
  updateSerie,
} from '../src/database/serieRepository';

const inputClassName =
  'min-h-14 rounded-xl border border-divider bg-surface px-4 text-base text-paper';

export default function SerieFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  const isEditing = rawId !== undefined;
  const serieId = rawId === undefined ? null : Number(rawId);

  const [titulo, setTitulo] = useState('');
  const [plataforma, setPlataforma] = useState('');
  const [temporadas, setTemporadas] = useState('');
  const [nota, setNota] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;

    async function loadSerie() {
      if (!isEditing) {
        setIsLoading(false);
        return;
      }

      if (serieId === null || !Number.isInteger(serieId) || serieId <= 0) {
        setError('O identificador desta série é inválido.');
        setIsLoading(false);
        return;
      }

      try {
        const serie = await getSerieById(serieId);
        if (!isActive) return;

        if (serie === null) {
          setError('Não encontramos essa série. Volte à estante e tente novamente.');
          return;
        }

        setTitulo(serie.titulo);
        setPlataforma(serie.plataforma);
        setTemporadas(String(serie.temporadas));
        setNota(serie.nota);
      } catch {
        if (isActive) setError('Não foi possível carregar os dados da série.');
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    void loadSerie();
    return () => {
      isActive = false;
    };
  }, [isEditing, serieId]);

  async function handleSave() {
    if (isSaving) return;

    const normalizedTitle = titulo.trim();
    const normalizedPlatform = plataforma.trim();
    const normalizedSeasons = temporadas.trim();
    const seasonCount = Number(normalizedSeasons);

    if (!normalizedTitle) {
      setError('Informe o título da série.');
      return;
    }

    if (!normalizedPlatform) {
      setError('Informe a plataforma onde você assiste.');
      return;
    }

    if (
      !normalizedSeasons ||
      !Number.isFinite(seasonCount) ||
      !Number.isInteger(seasonCount) ||
      seasonCount < 0
    ) {
      setError('Temporadas precisa ser um número inteiro igual ou maior que zero.');
      return;
    }

    if (isEditing && (serieId === null || !Number.isInteger(serieId))) {
      setError('O identificador desta série é inválido.');
      return;
    }

    setError('');
    setIsSaving(true);

    try {
      const input = {
        titulo: normalizedTitle,
        plataforma: normalizedPlatform,
        temporadas: seasonCount,
        nota,
      };

      if (isEditing && serieId !== null) {
        await updateSerie(serieId, input);
      } else {
        await createSerie(input);
      }

      router.back();
    } catch {
      setError('Não foi possível salvar agora. Tente novamente.');
      setIsSaving(false);
    }
  }

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-ink">
      <StatusBar style="light" />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#c8ef70" />
            <Text className="mt-4 text-xs uppercase tracking-[1.5px] text-muted">
              Abrindo ficha
            </Text>
          </View>
        ) : (
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ flexGrow: 1, padding: 20, paddingBottom: 32 }}
          >
            <View className="mb-7 flex-row items-center justify-between">
              <View>
                <Text className="text-[10px] font-bold uppercase tracking-[2px] text-acid">
                  {isEditing ? 'ATUALIZE SUA COLEÇÃO' : 'ADICIONE À SUA COLEÇÃO'}
                </Text>
                <Text className="mt-2 font-serif text-[34px] leading-10 text-paper">
                  {isEditing ? 'Editar série' : 'Nova série'}
                </Text>
              </View>
              <View className="h-12 w-12 items-center justify-center rounded-full border border-divider bg-surface">
                <Text className="font-serif text-2xl text-acid">{isEditing ? '✎' : '+'}</Text>
              </View>
            </View>

            <View className="mb-5">
              <Text className="mb-2 text-[10px] font-bold uppercase tracking-[1.5px] text-muted">
                TÍTULO
              </Text>
              <TextInput
                value={titulo}
                onChangeText={setTitulo}
                placeholder="Ex.: The Bear"
                placeholderTextColor="#68746a"
                autoCapitalize="words"
                returnKeyType="next"
                maxLength={100}
                className={inputClassName}
              />
            </View>

            <View className="mb-5">
              <Text className="mb-2 text-[10px] font-bold uppercase tracking-[1.5px] text-muted">
                PLATAFORMA
              </Text>
              <TextInput
                value={plataforma}
                onChangeText={setPlataforma}
                placeholder="Ex.: Netflix, Max, Prime Video"
                placeholderTextColor="#68746a"
                autoCapitalize="words"
                returnKeyType="next"
                maxLength={60}
                className={inputClassName}
              />
            </View>

            <View className="mb-6">
              <Text className="mb-2 text-[10px] font-bold uppercase tracking-[1.5px] text-muted">
                TEMPORADAS ASSISTIDAS
              </Text>
              <TextInput
                value={temporadas}
                onChangeText={setTemporadas}
                placeholder="0"
                placeholderTextColor="#68746a"
                keyboardType="numeric"
                returnKeyType="done"
                maxLength={3}
                className={inputClassName}
              />
            </View>

            <View className="mb-7 rounded-2xl border border-divider bg-surface p-4">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-[10px] font-bold uppercase tracking-[1.5px] text-muted">
                    SUA NOTA
                  </Text>
                  <Text className="mt-1 text-xs text-muted">Opcional</Text>
                </View>
                {nota !== null && (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Remover nota"
                    onPress={() => setNota(null)}
                    hitSlop={8}
                  >
                    <Text className="text-xs font-semibold text-muted">Limpar</Text>
                  </Pressable>
                )}
              </View>
              <View className="mt-4 flex-row justify-between">
                {[1, 2, 3, 4, 5].map((rating) => {
                  const isSelected = nota !== null && rating <= nota;
                  return (
                    <Pressable
                      key={rating}
                      accessibilityRole="button"
                      accessibilityLabel={`${rating} ${rating === 1 ? 'estrela' : 'estrelas'}`}
                      accessibilityState={{ selected: nota === rating }}
                      onPress={() => setNota(nota === rating ? null : rating)}
                      className="h-12 w-12 items-center justify-center rounded-xl bg-raised"
                    >
                      <Text className={`text-2xl ${isSelected ? 'text-gold' : 'text-divider'}`}>
                        ★
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <Text className="mt-3 text-center text-[10px] uppercase tracking-[1px] text-muted">
                {nota === null ? 'Toque para avaliar' : `${nota} de 5 estrelas`}
              </Text>
            </View>

            {error !== '' && (
              <View className="mb-5 rounded-xl border border-coral/40 bg-coral/10 px-4 py-3">
                <Text accessibilityRole="alert" className="text-sm leading-5 text-coral">
                  {error}
                </Text>
              </View>
            )}

            <View className="mt-auto">
              <Pressable
                accessibilityRole="button"
                onPress={() => void handleSave()}
                disabled={isSaving}
                className={`min-h-14 flex-row items-center justify-center rounded-xl px-5 ${
                  isSaving ? 'bg-acid/60' : 'bg-acid'
                }`}
              >
                {isSaving ? (
                  <ActivityIndicator color="#111511" />
                ) : (
                  <Text className="text-sm font-bold text-ink">
                    {isEditing ? 'Salvar alterações' : 'Adicionar à estante'}
                  </Text>
                )}
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.back()}
                disabled={isSaving}
                className="mt-3 min-h-12 items-center justify-center"
              >
                <Text className="text-sm font-semibold text-muted">Cancelar</Text>
              </Pressable>
            </View>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}