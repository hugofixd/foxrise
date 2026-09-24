require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const commands = [];
for (const file of fs.readdirSync(path.join(__dirname, 'src/commands')).filter(f => f.endsWith('.js'))) commands.push(require(path.join(__dirname, 'src/commands', file)).data.toJSON());
if (!process.env.DISCORD_TOKEN || !process.env.CLIENT_ID) throw new Error('Faltan DISCORD_TOKEN o CLIENT_ID');
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
(async () => { const route = process.env.GUILD_ID ? Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID) : Routes.applicationCommands(process.env.CLIENT_ID); await rest.put(route, { body: commands }); console.log(`FOXRISE: ${commands.length} comandos registrados`); })().catch(console.error);
