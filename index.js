require('dotenv').config();
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const express = require('express');
const fs = require('node:fs');
const path = require('node:path');

const token = String(process.env.DISCORD_TOKEN || '').trim();
const databasePath = String(process.env.DATABASE_PATH || '/app/data/foxrise.sqlite').trim();
const guildId = String(process.env.GUILD_ID || '').trim();

if (!token) {
  console.error('[FOXRISE] ERROR: Falta DISCORD_TOKEN en Railway.');
  process.exit(1);
}

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
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    if (!command.data || typeof command.data.toJSON !== 'function' || typeof command.execute !== 'function') {
      throw new Error(`Comando inválido: ${file}`);
    }
    const name = command.data.name;
    if (client.commands.has(name)) throw new Error(`Comando duplicado: ${name}`);
    client.commands.set(name, command);
  }

  registerEvents(client, db);

  const app = express();
  app.get('/health', (_request, response) => response.status(client.isReady() ? 200 : 503).json({
    status: client.isReady() ? 'ok' : 'starting',
    bot: 'FOXRISE',
    ready: client.isReady(),
    commands: client.commands.size,
    uptime: process.uptime()
  }));
  const port = Number(process.env.PORT || 3000);
  app.listen(port, '0.0.0.0', () => console.log(`[FOXRISE] Health server listening on port ${port}`));

  client.once('ready', async readyClient => {
    try {
      const commandData = [...client.commands.values()].map(command => command.data.toJSON());
      await readyClient.application.commands.set(commandData, guildId || undefined);
      console.log(`[FOXRISE] ${commandData.length} slash commands registered ${guildId ? `in guild ${guildId}` : 'globally'}.`);
      if (!guildId) console.warn('[FOXRISE] GUILD_ID no está configurado; los comandos globales pueden tardar hasta una hora en aparecer.');
    } catch (error) {
      console.error('[FOXRISE] Command registration failed:', error.message);
    }
  });

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
