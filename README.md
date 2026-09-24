# 🦊 FOXRISE

Bot modular y persistente para administración de servidores Discord, construido con Node.js, discord.js v14 y SQLite.

## Instalación

1. Requiere Node.js 20+ y un bot creado en [Discord Developer Portal](https://discord.com/developers/applications).
2. Copia `.env.example` a `.env` y completa `DISCORD_TOKEN` y `CLIENT_ID`. `GUILD_ID` es opcional para registrar comandos instantáneamente en un servidor durante desarrollo.
3. Instala y registra comandos:

```bash
npm install
npm run deploy
npm start
```

En Railway: crea un servicio desde este repositorio, configura las variables de `.env`, usa el comando `npm start` y añade un volumen persistente montado en `/app/data` (usa `DATABASE_PATH=/app/data/foxrise.sqlite`). El endpoint `/health` responde JSON para health checks.

## Permisos e intents

Invita el bot con `bot` y `applications.commands`. Para la funcionalidad completa habilita en Developer Portal **Server Members Intent**, **Message Content Intent** y **Presence Intent**. Permisos recomendados: Manage Channels, Manage Roles, Manage Messages, Moderate Members, Kick/Ban Members, View Audit Log, Send Messages, Embed Links, Attach Files y Read Message History. FOXRISE nunca contiene tokens ni claves en el código.

## Configuración inicial

Usa `/config view`, `/config logs`, `/welcome setup`, `/ticket setup`, `/autorole add` y `/identity` según tus necesidades. Los ajustes son independientes por servidor y se guardan en SQLite; crear la base de datos no requiere un servicio externo.

## Incluido

- Slash commands modulares para identidad, tickets, bienvenida/despedida, moderación, automod, seguridad, autoroles, logs, niveles, economía, sorteos, encuestas, embeds, aplicaciones, reportes, sugerencias, invitaciones y utilidades.
- Botones y modals funcionales para paneles de tickets, rating, reportes, sugerencias y sorteos.
- Cooldowns, permisos, validación de entradas, serialización de acciones sensibles y manejo centralizado de errores.
- Transcripts HTML de tickets y registro configurable por categoría.

Discord no permite cambiar el nombre, avatar, banner o descripción de una aplicación mediante las APIs normales del bot. `/identity` muestra los valores reales disponibles; los comandos de identidad modifican exclusivamente presencia y configuración local, y explican esa limitación en lugar de fingir éxito.

## Estructura

`index.js` arranca el cliente y HTTP; `deploy-commands.js` registra comandos; `src/commands` contiene comandos; `src/events` eventos; `src/systems` subsistemas; `src/database` persistencia; `src/utils` utilidades.
