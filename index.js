require('dotenv').config();
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const express = require('express');
const fs = require('node:fs');
const path = require('node:path');
const db = require('./src/database/db');
const { registerEvents } = require('./src/events/register');

if (!process.env.DISCORD_TOKEN || !process.env.CLIENT_ID) throw new Error('Faltan DISCORD_TOKEN o CLIENT_ID en .env');
fs.mkdirSync(path.dirname(process.env.DATABASE_PATH || './data/foxrise.sqlite'), { recursive: true });
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildModeration, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildInvites], partials: [Partials.Channel, Partials.Message, Partials.User] });
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'src/commands');
for (const file of fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'))) { const command = require(path.join(commandsPath, file)); client.commands.set(command.data.name, command); }
registerEvents(client, db);
const app = express();
app.get('/health', (_req, res) => res.json({ status: 'ok', bot: 'FOXRISE', ready: client.isReady(), uptime: process.uptime() }));
app.listen(Number(process.env.PORT || 3000), () => console.log(`FOXRISE health listening on ${process.env.PORT || 3000}`));
client.login(process.env.DISCORD_TOKEN);
process.on('unhandledRejection', e => console.error('[FOXRISE] unhandled rejection', e));
process.on('uncaughtException', e => console.error('[FOXRISE] uncaught exception', e));
