# Minhas Séries

Aplicativo mobile para catalogar séries assistidas ou em andamento. Os dados ficam persistidos localmente em SQLite, com filtros por status, avaliação pessoal e telas de lista, formulário e detalhe.

## Como rodar

Requisitos: Node.js compatível com Expo SDK 57 e Expo Go atualizado no dispositivo.

Na pasta deste projeto, instale as dependências e inicie o Expo:

```bash
npm install
npx expo start
```

Leia o QR code com o Expo Go no celular. Para abrir diretamente no Android, use `npx expo start --android` com um dispositivo ou emulador configurado.

## Funcionalidades

- Cadastrar e editar título, plataforma, temporadas assistidas e nota de 1 a 5 estrelas.
- Filtrar a coleção entre todas, assistindo e concluídas.
- Consultar os dados completos de uma série, alternar seu status ou excluí-la com confirmação.
- Manter os dados no SQLite após fechar e reabrir o aplicativo.

## Organização

- `app/`: rotas e telas Expo Router.
- `src/types/serie.ts`: entidade e tipos dos dados de entrada.
- `src/database/database.ts`: conexão SQLite singleton e criação da tabela.
- `src/database/serieRepository.ts`: operações SQL parametrizadas do app.

## Verificações

Executadas durante o desenvolvimento:

```bash
npx tsc --noEmit
npx expo export --platform android
```

## Evidência do teste de persistência

**Pendente:** a evidência deve ser gravada no Expo Go em um dispositivo. Cadastre três séries, marque uma como concluída, edite outra, feche o aplicativo completamente e abra-o novamente. Confirme também os filtros e salve um vídeo curto ou capturas de tela em `docs/evidencias/`; depois insira aqui os links ou imagens. Não há vídeo ou capturas anexados ainda.

## Diário do copiloto

### Registro 1 — Etapa 1
**O que eu pedi:** iniciar o Expo para testar a tela de configuração.
**O que a IA sugeriu (resumo):** executou `npx expo start` na raiz do workspace, em vez da pasta `minhas-series`, e recebeu um erro por falta de `package.json`.
**O que eu fiz:** mostrei o erro; a IA corrigiu o comando para apontar explicitamente à pasta do app com `npm --prefix .\minhas-series start`.

### Registro 2 — Etapa 1
**O que eu pedi:** validar se o app empacotava para Android.
**O que a IA sugeriu (resumo):** configurou o Babel com `babel-preset-expo`, mas o scaffold blank não tinha esse pacote instalado; o primeiro bundle falhou com `Cannot find module 'babel-preset-expo'`.
**O que eu fiz:** usei o erro do Metro para identificar a dependência ausente; instalei o preset compatível com `npx expo install babel-preset-expo --dev` e o bundle passou.

### Registro 3 — Etapa 5
**O que eu pedi:** declarar as três rotas do Stack com títulos.
**O que a IA sugeriu (resumo):** declarou `form` e `detalhe`, mas inicialmente omitiu o título de `index` porque o header visual estava oculto.
**O que eu fiz:** percebi a divergência ao revisar o requisito e adicionei `title: 'Minhas séries'` à configuração de `index` antes do commit.

### Registro 4 — Etapa 5
**O que eu pedi:** substituir a tela inicial básica por uma lista com aparência premium.
**O que a IA sugeriu (resumo):** tentou remover e adicionar `app/index.tsx` no mesmo patch; a ferramenta recusou a edição por caminho duplicado.
**O que eu fiz:** adaptei a edição para atualizar o arquivo existente; o patch foi aplicado e as validações passaram.

### Registro 5 — Etapa 7
**O que eu pedi:** carregar os dados da série na tela de detalhe ao abrir e ao retornar para ela.
**O que a IA sugeriu (resumo):** a primeira versão criava uma flag de foco, mas não a consultava antes de atualizar o estado com o resultado assíncrono.
**O que eu fiz:** revisei o fluxo, passei uma verificação de foco ao carregamento e passei a ignorar resultados após a tela perder foco; o TypeScript e o bundle Android passaram.

## Cuidado: a IA erra — e erra de jeitos previsíveis

Fique atento a sugestões que contrariam o que vimos em aula. Exemplos comuns:

- Montar SQL com template string (`` `... WHERE id = ${id}` ``) em vez de `?`.
- Usar `boolean` para `concluida`.
- Mandar instalar pacote do Expo com `npm install` em vez de `npx expo install`.
- Sugerir a API antiga do `expo-sqlite` (`openDatabase`, `transaction`) ou uma versão do NativeWind diferente da 4.
- Colocar chamadas ao banco direto no componente, ignorando o repositório.

Quando pegar um desses, **registre no diário**. Encontrar o erro da IA vale mais do que não ter errado.
