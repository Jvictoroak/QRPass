# QRPass

Aplicativo de gerenciamento de eventos e controle de entrada por QR Code.
Organizadores criam eventos e compartilham um link público de inscrição;
participantes se inscrevem, confirmam o e-mail por código OTP e recebem um
QR Code individual, validado na entrada pelo app do organizador.

## Stack

- Expo SDK 57 · React Native 0.86 · React 19 · TypeScript 6
- Expo Router (roteamento baseado em arquivos)
- Supabase — autenticação (e-mail/senha + OTP), Postgres, Realtime
- `expo-camera` (leitura de QR) · `react-native-qrcode-svg` (geração de QR)
- `@react-native-community/datetimepicker` (nativo) + implementação própria
  em `.web.tsx` para a versão web
- Fonte: Rubik (`@expo-google-fonts/rubik`)
- Android, iOS e Web

## Rodando o projeto

```bash
npm install
npm start
npm run android
npm run ios
npm run web
npm run lint
```

## Variáveis de ambiente

Crie um arquivo `.env` na raiz com:
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
Pegue os dois valores em Project Settings → API no dashboard do Supabase.

## Estrutura de pastas

│ global.css
│  
├───app
│ │ create-event.tsx
│ │ login.tsx
│ │ scanner.tsx
│ │ \_layout.tsx
│ │  
│ ├───(tabs)
│ │ events.tsx
│ │ index.tsx
│ │ notifications.tsx
│ │ profile.tsx
│ │ \_layout.tsx
│ │  
│ ├───event
│ │ [id].tsx
│ │  
│ ├───profile
│ │ edit.tsx
│ │ notifications-settings.tsx
│ │  
│ └───register
│ [eventId].tsx
│  
├───components
│ │ animated-icon.module.css
│ │ animated-icon.tsx
│ │ animated-icon.web.tsx
│ │ app-tabs.web.tsx
│ │ avatar.tsx
│ │ badge.tsx
│ │ custom-tab-bar.tsx
│ │ date-field.tsx
│ │ date-field.web.tsx
│ │ event-card.tsx
│ │ external-link.tsx
│ │ hint-row.tsx
│ │ themed-text.tsx
│ │ themed-view.tsx
│ │ web-badge.tsx
│ │  
│ └───ui
│ collapsible.tsx
│  
├───constants
│ theme.ts
│  
├───hooks
│ use-color-scheme.ts
│ use-color-scheme.web.ts
│ use-theme.ts
│  
└───lib
auth-context.tsx
supabase-public.js
supabase.js

## Banco de dados

O schema completo (tabelas, RLS, functions) vive em `supabase/schema.sql`.
Sempre que alterar algo direto no SQL Editor do Supabase, gere um novo dump
e commite a diferença:

```bash
npx supabase db dump --schema public -f supabase/schema.sql
```

Tabelas principais: `profiles`, `events`, `registrations`. Toda leitura/escrita
é protegida por Row Level Security — organizadores só editam/apagam os
próprios eventos, participantes só se inscrevem em nome de si mesmos, e o
check-in acontece via a função `check_in(registration_code)`.

## Duas sessões no mesmo app

Organizador e participante usam clientes Supabase separados
(`lib/supabase.js` e `lib/supabase-public.js`, com `storageKey` diferentes),
para que abrir um link de inscrição não derrube a sessão do organizador
logado no mesmo dispositivo.
