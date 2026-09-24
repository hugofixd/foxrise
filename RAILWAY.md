# Solución del error de Railway

Si los logs todavía muestran literalmente:

```text
if (!process.env.DISCORD_TOKEN || !process.env.CLIENT_ID) throw new Error('Faltan DISCORD_TOKEN o CLIENT_ID en .env');
```

Railway está ejecutando una versión antigua de `index.js`. Esa línea ya no debe existir en `main` después del commit de corrección.

Configura en Railway, cada una como variable separada:

```text
DISCORD_TOKEN = token real del bot
CLIENT_ID = Application ID de Discord
GUILD_ID = ID del servidor (recomendado)
DATABASE_PATH = /app/data/foxrise.sqlite
```

`DISCORD_TOKEN` es la única obligatoria para `npm start`; `CLIENT_ID` solo es necesario para `npm run deploy`.

Después:

1. Verifica Source: `hugofixd/foxrise`, branch `main`.
2. Guarda las variables.
3. Pulsa **Redeploy** usando el commit más reciente.
4. Comprueba que los logs ya no contienen la validación antigua.

El aviso `npm warn config production` no causa el fallo.
