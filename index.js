require('dotenv').config({ quiet: true });
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const express = require('express');
const fs = require('node:fs');
const path = require('node:path');

const token = String(process.env.DISCORD_TOKEN || '').trim();
if (!token) {
  console.error('[FOXRISE] Falta la variable DISCORD_TOKEN. Configúrala en Railway → Variables y redeploya.');
  process.exit(1);
}

const databasePath = String(process.env.DATABASE_PATH || '/app/data/foxrise.sqlite').trim();
if (!path.isAbsolute(databasePath)) console.warn('[FOXRISE] DATABASE_PATH es relativo; se recomienda /app/data/foxrise.sqlite en Railway.');
fs.mkdirSync(path.dirname(databasePath), { recursive: true });
process.env.DATABASE_PATH = databasePath;

const db = require('./src/database/db');
const { registerEvents } = require('./src/events/register');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildModeration, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildInvites], partials: [Partials.Channel, Partials.Message, Partials.User] });
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'src/commands');
for (const file of fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'))) {
  const command = require(path.join(commandsPath, file));
  if (!command.data?.name || typeof command.execute !== 'function') throw new Error(`Comando inválido: ${file}`);
  client.commands.set(command.data.name, command);
}
registerEvents(client, db);
const app = express();
app.get('/health', (_req, res) => res.status(client.isReady() ? 200 : 503).json({ status: client.isReady() ? 'ok' : 'starting', bot: 'FOXRISE', ready: client.isReady(), uptime: process.uptime() }));
const port = Number(process.env.PORT || 3000);
app.listen(port, '0.0.0.0', () => console.log(`[FOXRISE] Health check escuchando en ${port}`));
client.login(token).catch(error => { console.error('[FOXRISE] No se pudo iniciar sesión en Discord:', error.message); process.exit(1); });
process.on('unhandledRejection', error => console.error('[FOXRISE] unhandled rejection', error));
process.on('uncaughtException', error => { console.error('[FOXRISE] uncaught exception', error); process.exitCode = 1; });
