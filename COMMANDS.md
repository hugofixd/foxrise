## Comandos slash no visibles

FOXRISE ahora registra automáticamente todos los comandos cuando el bot inicia. Para que aparezcan inmediatamente en tu servidor, configura en Railway:

```text
DISCORD_TOKEN=token del bot
GUILD_ID=ID de tu servidor
DATABASE_PATH=/app/data/foxrise.sqlite
```

`CLIENT_ID` solo es necesario si ejecutas `npm run deploy` manualmente; el arranque normal obtiene el Application ID directamente de Discord.

Después de guardar `GUILD_ID`, haz un redeploy. En los logs debes ver:

```text
[FOXRISE] X slash commands registered in guild ID_DEL_SERVIDOR.
```

Si no configuras `GUILD_ID`, los comandos se registran globalmente y Discord puede tardar hasta una hora en mostrarlos. No necesitas ejecutar `npm run deploy` para el arranque automático nuevo.
