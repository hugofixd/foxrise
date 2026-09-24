require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

const token = String(process.env.DISCORD_TOKEN || '').trim();
const clientId = String(process.env.CLIENT_ID || '').trim();
if (!token || !clientId) {
  console.error('[FOXRISE] npm run deploy requires DISCORD_TOKEN and CLIENT_ID.');
  process.exit(1);
}

const commands = fs.readdirSync(path.join(__dirname, 'src', 'commands'))
  .filter(file => file.endsWith('.js'))
  .map(file => require(path.join(__dirname, 'src', 'commands', file)).data.toJSON());
const rest = new REST({ version: '10' }).setToken(token);
const guildId = String(process.env.GUILD_ID || '').trim();
const route = guildId ? Routes.applicationGuildCommands(clientId, guildId) : Routes.applicationCommands(clientId);
rest.put(route, { body: commands })
  .then(() => console.log(`[FOXRISE] ${commands.length} comandos registrados correctamente.`))
  .catch(error => { console.error('[FOXRISE] Command deployment failed:', error); process.exit(1); });
