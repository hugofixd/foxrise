# 🦊 FOXRISE

Bot de Discord modular con Node.js 20, discord.js v14, SQLite persistente y health check HTTP.

## Railway: configuración mínima

En Railway crea estas variables, una por una:

```text
DISCORD_TOKEN=el token del bot de Discord
CLIENT_ID=el Application ID de Discord
GUILD_ID=el ID del servidor (recomendado)
DATABASE_PATH=/app/data/foxrise.sqlite
```

Para `npm start`, la única variable imprescindible es `DISCORD_TOKEN`. `CLIENT_ID` solo se necesita para `npm run deploy`.

Añade un volumen Railway montado en `/app/data` para conservar SQLite. El repositorio incluye `Dockerfile`; Railway lo usará automáticamente en el siguiente deploy. El comando de inicio es `npm start`.

Si el log muestra el texto antiguo `Faltan DISCORD_TOKEN o CLIENT_ID en .env`, Railway está usando un deployment anterior. Selecciona el repositorio `hugofixd/foxrise`, rama `main`, y despliega el commit más reciente. El código actual no contiene ese mensaje.

## Local

```bash
cp .env.example .env
npm install
npm run deploy
npm start
```

El health check está en `/health`. En Railway genera un dominio público solo si necesitas consultar ese endpoint; el bot no necesita una URL para conectarse a Discord.

## Discord Developer Portal

Activa Server Members Intent, Message Content Intent y Presence Intent. Invita FOXRISE con los scopes `bot` y `applications.commands`, otorgando los permisos necesarios para las funciones que uses.

No subas `.env`, tokens, la base SQLite ni `node_modules` a GitHub. Todos están excluidos mediante `.gitignore` y `.dockerignore`.

## Arquitectura

- `index.js`: arranque seguro, cliente Discord y HTTP.
- `deploy-commands.js`: registro de comandos.
- `src/commands`: comandos slash.
- `src/events`: eventos Discord.
- `src/systems`: tickets y sistemas interactivos.
- `src/database`: SQLite persistente.
- `src/utils`: utilidades y transcripts.
