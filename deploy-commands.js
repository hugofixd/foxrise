require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

const token = String(process.env.DISCORD_TOKEN || '').trim();
const clientId = String(process.env.CLIENT_ID || '').trim();
const guildId = String(process.env.GUILD_ID || '').trim();

if (!token || !clientId) {
  console.error('[FOXRISE] Para npm run deploy necesitas DISCORD_TOKEN y CLIENT_ID.');
  process.exit(1);
}

const directory = path.join(__dirname, 'src', 'commands');
const commands = fs.readdirSync(directory)
  .filter(file => file.endsWith('.js'))
  .map(file => require(path.join(directory, file)))
  .map(command => command.data.toJSON());

const names = commands.map(command => command.name);
if (new Set(names).size !== names.length) throw new Error('Hay comandos slash duplicados.');

const rest = new REST({ version: '10' }).setToken(token);
const route = guildId
  ? Routes.applicationGuildCommands(clientId, guildId)
  : Routes.applicationCommands(clientId);

(async () => {
  await rest.put(route, { body: commands });
  console.log(`[FOXRISE] ${commands.length} comandos registrados correctamente${guildId ? ` en ${guildId}` : ' globalmente'}.`);
})().catch(error => {
  console.error('[FOXRISE] Command deployment failed:', error.message);
  process.exit(1);
});
