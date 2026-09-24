# 🦊 FOXRISE · Railway

## Variables exactas

En Railway abre **Service → Variables → New Variable** y crea estas variables. No las pegues como un bloque `.env`; cada nombre y valor debe ser una variable separada:

| Nombre | Valor | Obligatoria |
|---|---|---|
| `DISCORD_TOKEN` | Token del bot, sin espacios ni backticks | Sí |
| `CLIENT_ID` | Application ID de Discord | Para `npm run deploy` |
| `GUILD_ID` | ID de tu servidor Discord | Recomendado |
| `DATABASE_PATH` | `/app/data/foxrise.sqlite` | Recomendado |
| `PORT` | `3000` | No, Railway la inyecta |

`AI_API_KEY` y `AI_MODEL` son opcionales y no son necesarios para arrancar la versión actual.

## Volumen persistente

Crea un Volume en Railway con mount path `/app/data`. Sin volumen, el bot arranca, pero SQLite puede perderse en cada redeploy.

## Comandos

- Build: `npm install`
- Start: `npm start`
- Opcional, una sola vez para registrar comandos: `npm run deploy`

No uses `npm run deploy` como Start Command.

## Error `Faltan DISCORD_TOKEN o CLIENT_ID`

El proceso normal del bot solo necesita `DISCORD_TOKEN`. `CLIENT_ID` solo se necesita al ejecutar `npm run deploy`. Si aparece este error con una versión anterior, haz redeploy después de crear `DISCORD_TOKEN`; el código actualizado muestra exactamente qué variable falta.

Comprueba que:

1. El nombre sea exactamente `DISCORD_TOKEN` (no `TOKEN`, `DISCORD-TOKEN` ni `DISCORD_TOKEN `).
2. El valor sea el token regenerado en Developer Portal → Bot → Reset Token.
3. No incluyas `DISCORD_TOKEN=` dentro del valor.
4. No uses comillas, backticks o espacios al principio/final.
5. Después de guardarlo, pulsa **Deploy/Redeploy**.

## Registro local de comandos

Crea `.env` localmente:

```env
DISCORD_TOKEN=tu_token
CLIENT_ID=tu_application_id
GUILD_ID=tu_server_id
DATABASE_PATH=./data/foxrise.sqlite
```

Luego ejecuta:

```bash
npm install
npm run deploy
```

En Railway puedes añadir `npm run deploy` como Pre-deploy Command, pero no es necesario en cada reinicio. Si cambiaste comandos, ejecútalo otra vez.

## Discord

Activa Server Members Intent, Message Content Intent y Presence Intent en Developer Portal. Invita la aplicación con los scopes `bot` y `applications.commands`.

El health check es `/health`; devuelve `503` mientras Discord está conectando y `200` cuando FOXRISE está listo.
