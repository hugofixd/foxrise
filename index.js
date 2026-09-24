require('dotenv').config();
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const express = require('express');
const fs = require('node:fs');
const path = require('node:path');

// Discord needs only the bot token to start. CLIENT_ID is used by deploy-commands.js.
const token = String(process.env.DISCORD_TOKEN || '').trim();
const clientId = String(process.env.CLIENT_ID || '').trim();
const databasePath = String(process.env.DATABASE_PATH || '/app/data/foxrise.sqlite').trim();

if (!token) {
  console.error('[FOXRISE] ERROR: Railway variable DISCORD_TOKEN is missing.');
  console.error('[FOXRISE] Add a variable named exactly DISCORD_TOKEN, paste your Discord bot token, save it, and redeploy.');
  console.error('[FOXRISE] CLIENT_ID is not required for npm start.');
  process.exit(1);
}

if (!clientId) console.warn('[FOXRISE] WARNING: CLIENT_ID is missing. The bot can start, but npm run deploy will require it.');

try {
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });
  process.env.DATABASE_PATH = databasePath;
  const db = require('./src/database/db');
  const { registerEvents } = require('./src/events/register');
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildModeration,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildPresences,
      GatewayIntentBits.GuildInvites
    ],
    partials: [Partials.Channel, Partials.Message, Partials.User]
  });

  client.commands = new Collection();
  const commandsPath = path.join(__dirname, 'src', 'commands');
  for (const file of fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))) {
    const command = require(path.join(commandsPath, file));
    if (!command.data?.name || typeof command.execute !== 'function') {
      throw new Error(`Comando inválido: ${file}`);
    }
    client.commands.set(command.data.name, command);
  }
  registerEvents(client, db);

  const app = express();
  app.get('/health', (_request, response) => response.status(client.isReady() ? 200 : 503).json({
    status: client.isReady() ? 'ok' : 'starting',
    bot: 'FOXRISE',
    ready: client.isReady(),
    uptime: process.uptime()
  }));
  const port = Number(process.env.PORT || 3000);
  app.listen(port, '0.0.0.0', () => console.log(`[FOXRISE] Health server listening on port ${port}`));

  client.login(token).catch(error => {
    console.error(`[FOXRISE] Discord login failed: ${error.message}`);
    process.exit(1);
  });
} catch (error) {
  console.error('[FOXRISE] Startup failed:', error);
  process.exit(1);
}

process.on('unhandledRejection', error => console.error('[FOXRISE] Unhandled rejection:', error));
process.on('uncaughtException', error => console.error('[FOXRISE] Uncaught exception:', error));
