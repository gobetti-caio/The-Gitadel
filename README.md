# Quasar App (c3-po)

A Quasar Project

## Install the dependencies

```bash
yarn
# or
npm install
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)

```bash
quasar dev
```

### Lint the files

```bash
yarn lint
# or
npm run lint
```

### Format the files

```bash
yarn format
# or
npm run format
```

### Build the app for production

```bash
quasar build
```

## Carga inicial no Directus

Para carregar as casas, personagens e arquivos (brasoes/figuras) no Directus:

1. No Directus, gere um Access Token do seu usuario.
2. No terminal, rode o seed com o token:

```bash
DIRECTUS_URL=http://localhost:8056 DIRECTUS_TOKEN=SEU_TOKEN pnpm seed:all
```

Notas:

- O script faz upsert por nome (cria ou atualiza).
- Ele usa os arquivos locais em public/brasoes e public/personagens.
- Nao cole tokens em chats; use somente no terminal.

### Customize the configuration

See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js).
